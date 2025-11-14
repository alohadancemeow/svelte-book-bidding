export type BidEvent = {
  auctionId: string
  auctionName: string
  bidder: string
  amount: number
  timestamp: string
}

let writers = new Set<WritableStreamDefaultWriter<Uint8Array>>()

export function addWriter(writer: WritableStreamDefaultWriter<Uint8Array>) {
  writers.add(writer)
}

export function removeWriter(writer: WritableStreamDefaultWriter<Uint8Array>) {
  writers.delete(writer)
}

export function publishBid(event: BidEvent) {
  const payload = `data:${JSON.stringify(event)}\n\n`
  const chunk = new TextEncoder().encode(payload)
  writers.forEach((w) => {
    w.write(chunk).catch(() => {})
  })
}