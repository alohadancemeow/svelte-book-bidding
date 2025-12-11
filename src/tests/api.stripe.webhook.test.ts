import { describe, it, expect, vi, beforeEach } from 'vitest'

// Env and app mocks to use JSON.parse path
vi.mock('$app/environment', () => ({ dev: true }))
vi.mock('$env/dynamic/private', () => ({ env: { STRIPE_WEBHOOK_SECRET: undefined } }))

// Mock Supabase image util path indirectly used
vi.mock('../routes/helpers', async (orig) => {
    const mod: any = await orig()
    return { ...mod, getImage: vi.fn(() => 'https://cdn.example.com/public/img.png') }
})

// Mock email sender
vi.mock('../routes/api/stripe/webhook/email-send', () => ({
    sendPurchaseConfirmationEmail: vi.fn(async () => { }),
}))

// Mock DB and Stripe
const dbUpdateWhere = vi.fn(async () => { })
const dbInsertValues = vi.fn(async () => { })
const db = {
    query: {
        payments: { findFirst: vi.fn(async () => null) },
        user: { findFirst: vi.fn(async () => ({ name: 'Alice' })) },
        books: { findFirst: vi.fn(async () => ({ name: 'Book', fileKey: 'bucket/file.jpg' })) },
    },
    update: vi.fn(() => ({ set: vi.fn(() => ({ where: dbUpdateWhere })) })),
    insert: vi.fn(() => ({ values: dbInsertValues })),
} as any

vi.mock('$lib/server/db', () => ({ db }))

vi.mock('$lib/stripe', () => ({
    stripe: {
        webhooks: { constructEvent: vi.fn((b: string) => JSON.parse(b)) },
        paymentIntents: { retrieve: vi.fn(async () => ({ latest_charge: { receipt_url: 'https://receipt' } })) },
    },
}))

let POST: any
beforeEach(async () => {
    dbUpdateWhere.mockClear()
    dbInsertValues.mockClear()
    db.query.payments.findFirst.mockReset()
    const mod = await import('../routes/api/stripe/webhook/+server')
    POST = mod.POST
})

describe('api/stripe/webhook POST', () => {
    // Verifies that a request without the required Stripe signature header is rejected
    // with HTTP 400, preventing unauthenticated webhook calls from being processed.
    it('returns 400 when missing signature', async () => {
        const req = new Request('http://test/webhook', { method: 'POST' })
        const res = await POST({ request: req, locals: {} } as any)
        expect(res.status).toBe(400)
    })

    // Simulates a checkout.session.completed event. Ensures that a new payment record
    // is inserted (via db.insert(...).values(...)) and the handler responds with 200.
    it('handles checkout.session.completed and inserts payment', async () => {
        const event = {
            type: 'checkout.session.completed',
            data: { object: { id: 'cs_1', amount_total: 5000, currency: 'usd', payment_intent: 'pi_1', invoice: 'in_1', metadata: { auctionId: 'a1', userId: 'u1', image: 'https://img' }, customer_details: { email: 'a@example.com' } } },
        }
        const req = new Request('http://test/webhook', { method: 'POST', headers: { 'stripe-signature': 'sig' }, body: JSON.stringify(event) })
        const res = await POST({ request: req, locals: { user: { id: 'u1' } } } as any)
        expect(res.status).toBe(200)
        expect(dbInsertValues).toHaveBeenCalled()
    })

    // Simulates a charge.succeeded event. Verifies that the receipt URL (and amount/currency)
    // update path is taken by asserting an update with a where-clause was issued.
    it('handles charge.succeeded and updates receipt url', async () => {
        const event = { type: 'charge.succeeded', data: { object: { payment_intent: 'pi_2', receipt_url: 'https://receipt', amount: 5000, currency: 'usd' } } }
        const req = new Request('http://test/webhook', { method: 'POST', headers: { 'stripe-signature': 'sig' }, body: JSON.stringify(event) })
        const res = await POST({ request: req, locals: {} } as any)
        expect(res.status).toBe(200)
        expect(dbUpdateWhere).toHaveBeenCalled()
    })

    // Simulates an invoice.payment_succeeded event. When an existing payment with the
    // invoice ID is found, the handler should update the hosted invoice URL and status.
    it('handles invoice.payment_succeeded and updates invoice url', async () => {
        db.query.payments.findFirst.mockResolvedValueOnce({ id: 'p1' })
        const event = { type: 'invoice.payment_succeeded', data: { object: { id: 'in_2', hosted_invoice_url: 'https://invoice', amount_paid: 5000, currency: 'usd' } } }
        const req = new Request('http://test/webhook', { method: 'POST', headers: { 'stripe-signature': 'sig' }, body: JSON.stringify(event) })
        const res = await POST({ request: req, locals: {} } as any)
        expect(res.status).toBe(200)
        expect(dbUpdateWhere).toHaveBeenCalled()
    })
})
