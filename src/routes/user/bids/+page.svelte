<script lang="ts">
  import { FALLBACK_IMAGE } from "../../dashboard/shared/constants";

  let { data } = $props();

  function formatDate(ms?: number | Date) {
    if (!ms) return "";

    const d = typeof ms === "number" ? new Date(ms) : ms;
    return d.toLocaleString("en-GB", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function isEnded(endDate?: number | Date) {
    if (!endDate) return false;
    const d = typeof endDate === "number" ? new Date(endDate) : endDate;
    return d.getTime() <= Date.now();
  }
</script>

<svelte:head>
  <title>My Bids - Book Bidding</title>
</svelte:head>

<div class="bg-background min-h-screen">
  <div
    class="bg-linear-to-r from-primary/10 to-accent/10 border-b border-border py-8"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-4xl font-bold text-foreground">My Bids</h1>
          <p class="text-muted-foreground mt-2">
            Your bidding activity across auctions
          </p>
        </div>
        <a
          href="/auctions"
          class="px-6 py-2 cursor-pointer bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition font-medium"
        >
          View Auctions
        </a>
      </div>
    </div>
  </div>

  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
    {#if data.bids && data.bids.length > 0}
      <div class="space-y-4">
        {#each data.bids as bid (bid.id)}
          <div
            class="flex items-center gap-4 bg-card border border-border rounded-lg p-4"
          >
            <img
              src={bid.item?.fileKey || FALLBACK_IMAGE}
              alt={bid.item?.name || "Auction"}
              class="w-20 h-20 rounded object-cover border border-border"
            />
            <div class="flex-1">
              <div class="flex flex-wrap items-center gap-2">
                <a
                  href={`/auctions/${bid.item?.id}`}
                  class="font-semibold text-foreground hover:underline"
                >
                  {bid.item?.name}
                </a>
                {#if bid.item?.author}
                  <span class="text-sm text-muted-foreground"
                    >by {bid.item.author}</span
                  >
                {/if}
              </div>
              <div class="mt-2 text-sm text-muted-foreground">
                Placed: {formatDate(bid.createdAt)} · Your bid:
                <span class="font-semibold text-foreground">
                  ${bid.amount.toLocaleString()}
                </span>
                {#if bid.item?.currentBid}
                  · Current: <span class="font-semibold text-accent">
                    ${bid.item.currentBid.toLocaleString()}
                  </span>
                {/if}
                <br />
                {#if bid.item?.currentBid && bid.amount < bid.item.currentBid && !isEnded(bid.item.endDate)}
                  <span class="font-semibold text-red-600 dark:text-red-400">
                    Outbid:
                  </span>
                  <span class="ml-1">
                    Increase your bid to secure this item!
                  </span>
                {/if}
              </div>
              <div class="mt-1">
                {#if isEnded(bid.item?.endDate)}
                  <span
                    class="inline-block bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 px-2 py-0.5 rounded text-xs"
                  >
                    Ended
                  </span>
                {:else}
                  <span
                    class="inline-block bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-0.5 rounded text-xs"
                  >
                    Active
                  </span>
                {/if}
              </div>
            </div>
            {#if isEnded(bid.item?.endDate)}
              <a
                href={`/auctions/${bid.item?.id}`}
                class="px-4 py-2 cursor-pointer bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition text-sm"
              >
                View Detail
              </a>
            {:else}
              <a
                href={`/auctions/${bid.item?.id}`}
                class="px-4 py-2 cursor-pointer bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition text-sm"
              >
                Bid Now
              </a>
            {/if}
          </div>
        {/each}
      </div>
    {:else}
      <div class="bg-card border border-border rounded-lg p-8 text-center">
        <p class="text-lg font-medium text-foreground mb-2">No bids yet</p>
        <p class="text-muted-foreground mb-6">
          Browse auctions and place your first bid.
        </p>
        <a
          href="/auctions"
          class="inline-block px-6 py-2 cursor-pointer bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition"
        >
          Place Bid
        </a>
      </div>
    {/if}
  </div>
</div>
