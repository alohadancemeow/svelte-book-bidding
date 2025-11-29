import type { RequestHandler } from './$types'
import { env } from '$env/dynamic/private'
import { dev } from '$app/environment'
import { stripe } from '$lib/stripe'
import { db } from '$lib/server/db'
import { payments } from '$lib/server/db/schema'
import { eq } from 'drizzle-orm'
import { getImage } from '../../../helpers'
import { FALLBACK_IMAGE } from '../../../dashboard/shared/constants'
import { sendPurchaseConfirmationEmail } from './email-send'

function sanitizeUrl(raw: unknown): string | null {
  if (typeof raw !== 'string') return null
  return raw.trim().replace(/`/g, '')
}

// Handle checkout.session.completed event
async function handleCheckoutSessionCompleted(event: any, userId: string) {
  const session = event.data.object as any
  const auctionId = session?.metadata?.auctionId
  if (!auctionId) return

  const amount = Number(session?.amount_total || 0)
  const currency = String(session?.currency || 'usd')
  const paymentIntentId = session?.payment_intent ? String(session.payment_intent) : null
  const invoiceId = session?.invoice ? String(session.invoice) : null
  const stripeSessionId = String(session?.id)
  let receiptUrl: string | null = null

  // Email for sending purchase confirmation email
  const email = session?.customer_details?.email || null

  // Get receipt url from payment intent
  if (paymentIntentId) {
    try {
      const pi = await stripe.paymentIntents.retrieve(paymentIntentId, { expand: ['latest_charge'] })
      const latestCharge: any = (pi as any)?.latest_charge
      receiptUrl = sanitizeUrl(latestCharge?.receipt_url || null)
    } catch (error) {
      console.error(error)
    }
  }

  // Check if payment intent already exists, 
  // confirm that receipt url won't be overwritten
  const existingByPi = paymentIntentId
    ? await db.query.payments.findFirst({ where: (p, { eq }) => eq(p.paymentIntentId, paymentIntentId) })
    : null

  if (existingByPi && paymentIntentId) {
    await db.update(payments)
      .set({
        itemId: String(auctionId),
        stripeSessionId,
        invoiceId,
        amount,
        currency,
        status: 'paid',
        ...(receiptUrl ? { receiptUrl } : {}),
      })
      .where(eq(payments.paymentIntentId, paymentIntentId))

    // Send purchase confirmation email with image and links
    if (email) {
      const usr = await db.query.user.findFirst({ where: (t, { eq }) => eq(t.email, email) })
      const book = await db.query.books.findFirst({ where: (b, { eq }) => eq(b.id, String(auctionId)) })
      const imageUrl = book?.fileKey ? getImage({ filekey: book.fileKey }) : FALLBACK_IMAGE
      const payment = await db.query.payments.findFirst({ where: (p, { eq }) => eq(p.paymentIntentId, paymentIntentId) })

      await sendPurchaseConfirmationEmail(
        email,
        usr?.name || 'Customer',
        book?.name || 'Auction',
        imageUrl,
        receiptUrl || payment?.receiptUrl || null,
        payment?.hostedInvoiceUrl || null,
      )
    }
    return
  }

  await db.insert(payments).values({
    id: crypto.randomUUID(),
    userId, // Current user who won the auction
    itemId: String(auctionId),
    stripeSessionId,
    paymentIntentId,
    invoiceId,
    amount,
    currency,
    status: 'paid',
    receiptUrl,
  })

  // handle purchase confirmation email (new record)
  if (email) {
    const usr = await db.query.user.findFirst({ where: (t, { eq }) => eq(t.email, email) })
    const book = await db.query.books.findFirst({ where: (b, { eq }) => eq(b.id, String(auctionId)) })
    const imageUrl = book?.fileKey ? getImage({ filekey: book.fileKey }) : FALLBACK_IMAGE
    const payment = paymentIntentId ? await db.query.payments.findFirst({ where: (p, { eq }) => eq(p.paymentIntentId, paymentIntentId) }) : null
    await sendPurchaseConfirmationEmail(
      email,
      usr?.name || 'Customer',
      book?.name || 'Auction',
      imageUrl,
      receiptUrl || payment?.receiptUrl || null,
      payment?.hostedInvoiceUrl || null,
    )
  }
}

// Handle charge.succeeded event
async function handleChargeSucceeded(event: any) {
  const charge = event.data.object as any
  const paymentIntentId = charge?.payment_intent ? String(charge.payment_intent) : null
  const receiptUrl = sanitizeUrl(charge?.receipt_url || null)
  const amount = Number(charge?.amount || 0)
  const currency = String(charge?.currency || 'usd')

  if (paymentIntentId && receiptUrl) {
    await db.update(payments)
      .set({ receiptUrl, amount, currency, status: 'paid' })
      .where(eq(payments.paymentIntentId, paymentIntentId))
  }
}

// Handle invoice.payment_succeeded event
async function handleInvoicePaymentSucceeded(event: any) {
  const invoice = event.data.object as any
  const invoiceId = String(invoice?.id)
  const hostedInvoiceUrl = sanitizeUrl(invoice?.hosted_invoice_url || null)
  const amount = Number(invoice?.amount_paid || 0)
  const currency = String(invoice?.currency || 'usd')

  if (!invoiceId) return

  const existing = await db.query.payments.findFirst({ where: (p, { eq }) => eq(p.invoiceId, invoiceId) })

  if (existing) {
    await db.update(payments)
      .set({ hostedInvoiceUrl, amount, currency, status: 'paid' })
      .where(eq(payments.invoiceId, invoiceId))
  }
}

// Handle Stripe webhook events, (checkout - charge - invoice)
export const POST: RequestHandler = async ({ request, locals }) => {
  const sig = request.headers.get('stripe-signature')
  if (!sig) return new Response('Missing signature', { status: 400 })

  const webhookSecret = env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret && !dev) return new Response('Webhook secret not set', { status: 500 })

  const body = await request.text()
  let event: any

  try {
    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
    } else {
      event = JSON.parse(body)
    }
  } catch {
    return new Response('Invalid signature', { status: 400 })
  }

  // Handle checkout.session.completed event --> create payment record
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any
    const userId = session?.metadata?.userId || locals.user?.id || null
    await handleCheckoutSessionCompleted(event, userId)
  }

  // Handle charge.succeeded event --> update receipt url
  if (event.type === 'charge.succeeded') {
    await handleChargeSucceeded(event)
  }

  // Handle invoice.payment_succeeded event --> update Invoice url
  if (event.type === 'invoice.payment_succeeded') {
    await handleInvoicePaymentSucceeded(event)
  }

  return new Response('Payment processed successfully', { status: 200 })
}
