import { describe, it, expect, vi } from 'vitest'
import { realtime } from '../lib/stores/realtime'
import { get } from 'svelte/store'

class MockEventSource {
    url: string
    onmessage: ((e: MessageEvent) => void) | null = null
    onerror: (() => void) | null = null
    constructor(url: string) { this.url = url }
    close() { }
}

// Provide EventSource in Node env
// @ts-ignore
global.EventSource = MockEventSource as any

describe('realtime store', () => {
    // Verifies that calling connect transitions status from "connecting" to
    // "connected" after the internal timeout completes.
    it('connects and updates connection status', () => {
        vi.useFakeTimers()
        realtime.connect()
        expect(get(realtime.connectionStatus)).toBe('connecting')
        vi.advanceTimersByTime(500)
        expect(get(realtime.connectionStatus)).toBe('connected')
        vi.useRealTimers()
    })

    // Ensures broadcastBid emits updates to subscribers of the matching auctionId
    // and appends the update to the public updates store.
    it('broadcasts bids and notifies subscribers', () => {
        const received: any[] = []
        const unsub = realtime.subscribe('a1', (u) => received.push(u))
        realtime.broadcastBid('a1', 'bob', 100, 'Auction 1')
        expect(received.length).toBe(1)
        const updates = get(realtime.updates)
        expect(updates.length).toBeGreaterThan(0)
        unsub()
    })

    // Confirms disconnect resets connection status and clears any stored updates
    // and listeners.
    it('disconnect resets state', () => {
        realtime.disconnect()
        expect(get(realtime.connectionStatus)).toBe('disconnected')
        expect(get(realtime.updates).length).toBe(0)
    })
})
