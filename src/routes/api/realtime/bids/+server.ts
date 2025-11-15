import type { RequestHandler } from './$types'
import { addWriter } from '$lib/server/realtime'

export const GET: RequestHandler = async ({ locals }) => {
  const userId = await locals.session?.userId
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const ts = new TransformStream()
  const writer = ts.writable.getWriter()
  addWriter(writer)

  return new Response(ts.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}