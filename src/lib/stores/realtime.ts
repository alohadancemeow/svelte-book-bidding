import { writable, derived } from "svelte/store"

interface BidUpdate {
    auctionId: string
    auctionName: string
    bidder: string
    amount: number
    timestamp: string
}

interface ActiveListener {
    auctionId: string
    callback: (update: BidUpdate) => void
}

let listeners: ActiveListener[] = []
let eventSource: EventSource | null = null

function createRealtimeStore() {
    const updates = writable<BidUpdate[]>([])
    const isConnected = writable(false)
    const connectionStatus = writable<"connecting" | "connected" | "disconnected">("disconnected")

    function connect() {
        connectionStatus.set("connecting")

        setTimeout(() => {
            isConnected.set(true)
            connectionStatus.set("connected")
            console.log("[v0] Real-time connection established")

            // Set up event source for bid updates
            if (!eventSource) {
                eventSource = new EventSource("/realtime/bids")
                eventSource.onmessage = (e) => {
                    try {
                        const data = JSON.parse(e.data) as BidUpdate
                        broadcastBid(data.auctionId, data.bidder, data.amount, data.auctionName)
                    } catch (error) {
                        console.error("Error processing bid update:", error)
                    }
                }
                eventSource.onerror = () => {
                    connectionStatus.set("disconnected")
                }
            }
        }, 500)
    }

    function disconnect() {
        isConnected.set(false)
        connectionStatus.set("disconnected")

        listeners = []
        updates.set([])

        // Close event source if it exists
        if (eventSource) {
            eventSource.close()
            eventSource = null
        }
        console.log("[v0] Real-time connection closed")
    }

    function subscribe(auctionId: string, callback: (update: BidUpdate) => void) {
        listeners.push({ auctionId, callback })

        return () => {
            listeners = listeners.filter(
                (l) => l !== listeners.find((x) => x.auctionId === auctionId && x.callback === callback),
            )
        }
    }

    function broadcastBid(auctionId: string, bidder: string, amount: number, auctionName: string) {
        const update: BidUpdate = {
            auctionId,
            auctionName,
            bidder,
            amount,
            timestamp: new Date().toLocaleTimeString(),
        }

        updates.update((u) => [update, ...u].slice(0, 50))

        listeners.filter((l) => l.auctionId === auctionId).forEach((l) => l.callback(update))

        console.log("[v0] Bid broadcast:", update)
    }

    return {
        updates: derived(updates, ($updates) => $updates),
        isConnected: derived(isConnected, ($connected) => $connected),
        connectionStatus: derived(connectionStatus, ($status) => $status),
        connect,
        disconnect,
        subscribe,
        broadcastBid,
    }
}

export const realtime = createRealtimeStore()
