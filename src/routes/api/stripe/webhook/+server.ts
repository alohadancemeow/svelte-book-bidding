import type { RequestHandler } from './$types'
import { env } from '$env/dynamic/private'
import { stripe } from '$lib/stripe'
import { db } from '$lib/server/db'
import { payments } from '$lib/server/db/schema'
import { eq } from 'drizzle-orm'

export const POST: RequestHandler = async ({ request }) => {
  const sig = request.headers.get('stripe-signature')
  if (!sig) return new Response('Missing signature', { status: 400 })
  if (!env.SECRET_STRIPE_WEBHOOK_SECRET) return new Response('Webhook secret not set', { status: 500 })

  const body = await request.text()
  let event: any

  try {
    event = stripe.webhooks.constructEvent(body, sig, env.SECRET_STRIPE_WEBHOOK_SECRET)
  } catch {
    return new Response('Invalid signature', { status: 400 })
  }

  // Handle checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any
    const auctionId = session?.metadata?.auctionId
    if (!auctionId) return new Response('ok')

    const amount = Number(session?.amount_total || 0)
    const currency = String(session?.currency || 'usd')
    const paymentIntentId = session?.payment_intent ? String(session.payment_intent) : null
    const invoiceId = session?.invoice ? String(session.invoice) : null
    const stripeSessionId = String(session?.id)
    const receiptUrl = session?.charges?.data?.[0]?.receipt_url || null

    let userId: string | null = null
    const email = session?.customer_details?.email || null
    if (email) {
      const u = await db.query.user.findFirst({ where: (t, { eq }) => eq(t.email, email) })
      userId = u?.id ?? null
    }

    await db.insert(payments).values({
      id: crypto.randomUUID(),
      userId,
      itemId: String(auctionId),
      stripeSessionId,
      paymentIntentId,
      invoiceId,
      amount,
      currency,
      status: 'paid',
      receiptUrl,
    })
  }

  // Handle invoice.payment_succeeded event
  if (event.type === 'invoice.payment_succeeded') {
    const invoice = event.data.object as any
    const invoiceId = String(invoice?.id)
    const hostedUrlRaw = invoice?.hosted_invoice_url || null
    const hostedInvoiceUrl = typeof hostedUrlRaw === 'string' ? hostedUrlRaw.trim().replace(/`/g, '') : null
    const amount = Number(invoice?.amount_paid || 0)
    const currency = String(invoice?.currency || 'usd')

    if (!invoiceId) return new Response('ok')

    const existing = await db.query.payments.findFirst({ where: (p, { eq }) => eq(p.invoiceId, invoiceId) })

    if (existing) {
      await db.update(payments)
        .set({ hostedInvoiceUrl, amount, currency, status: 'paid' })
        .where(eq(payments.invoiceId, invoiceId))
    }
  }

  return new Response('ok')
}
