import { describe, it, expect, vi } from 'vitest'
import { POST } from '../routes/api/checkout/+server'

vi.mock('$lib/stripe', () => {
  return {
    stripe: {
      checkout: {
        sessions: {
          create: vi.fn(async () => ({ id: 'sess_123', url: 'https://checkout.example.com' })),
        },
      },
    },
  }
})

// Avoid accessing real public env in tests
vi.mock('$app/environment', () => ({ dev: true }))
vi.mock('$env/static/public', () => ({ PUBLIC_BASE_URL: 'http://localhost:5173', PUBLIC_FRONTEND_URL: 'http://localhost:5173' }))

describe('api/checkout POST', () => {
  // Validates that a Stripe Checkout session is created and the handler
  // responds with a JSON body containing both sessionId and a redirect url.
  it('creates Stripe session and returns url', async () => {
    const body = {
      amount: 12.34,
      currency: 'usd',
      name: 'Auction',
      mode: 'payment',
      metadata: { image: 'https://img' },
    }

    const req = new Request('http://test/checkout', { method: 'POST', body: JSON.stringify(body) })
    const res = await POST({ request: req } as any)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.sessionId).toBe('sess_123')
    expect(data.url).toBe('https://checkout.example.com')
  })

  // Confirms that the handler throws an error when Stripe returns a session
  // object without a URL, preventing a redirect with missing target.
  it('throws when Stripe returns no url', async () => {
    const mod = await import('$lib/stripe');
    (mod as any).stripe.checkout.sessions.create.mockResolvedValueOnce({ id: 'sess_456' })
    const req = new Request('http://test/checkout', { method: 'POST', body: JSON.stringify({ amount: 1 }) })
    await expect(POST({ request: req } as any)).rejects.toThrow('No checkout URL returned from Stripe')
  })
})
