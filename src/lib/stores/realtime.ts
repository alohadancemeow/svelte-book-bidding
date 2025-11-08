import { writable, derived } from "svelte/store"

interface BidUpdate {
    auctionId: string
    bidder: string
    amount: number
    timestamp: string
}

interface ActiveListener {
    auctionId: string
    callback: (update: BidUpdate) => void
}

let listeners: ActiveListener[] = []
let broadcastInterval: number | null = null

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

            if (!broadcastInterval) {
                broadcastInterval = setInterval(simulateBidBroadcast, 5000) as any
            }
        }, 500)
    }

    function disconnect() {
        isConnected.set(false)
        connectionStatus.set("disconnected")

        if (broadcastInterval) {
            clearInterval(broadcastInterval)
            broadcastInterval = null
        }

        listeners = []
        updates.set([])
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

    function broadcastBid(auctionId: string, bidder: string, amount: number) {
        const update: BidUpdate = {
            auctionId,
            bidder,
            amount,
            timestamp: new Date().toLocaleTimeString(),
        }

        updates.update((u) => [update, ...u].slice(0, 50))

        listeners.filter((l) => l.auctionId === auctionId).forEach((l) => l.callback(update))

        console.log("[v0] Bid broadcast:", update)
    }

    function simulateBidBroadcast() {
        const mockBidders = ["CollectorPro", "VintageFind", "BookLover45", "RareBooks", "AuctionKing"]
        const activeAuctions = ["1", "2", "4", "5", "6"]

        if (Math.random() > 0.7 && listeners.length > 0) {
            const randomAuction = activeAuctions[Math.floor(Math.random() * activeAuctions.length)]
            const randomBidder = mockBidders[Math.floor(Math.random() * mockBidders.length)]
            const randomAmount = Math.floor(Math.random() * 5000) + 500

            broadcastBid(randomAuction, randomBidder, randomAmount)
        }
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
