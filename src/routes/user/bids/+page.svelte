<script lang="ts">
  import { FALLBACK_IMAGE } from "../../dashboard/shared/constants";
  import { formatDate } from "../../helpers";
  import HeaderSection from "$lib/components/Header.svelte";
  import type { PageProps } from "./$types";
  import { ChevronDoubleRightOutline } from "flowbite-svelte-icons";

  let { data }: PageProps = $props();

  // function isEnded(endDate?: number | Date) {
  //   if (!endDate) return false;
  //   const d = typeof endDate === "number" ? new Date(endDate) : endDate;
  //   return d.getTime() <= Date.now();
  // }

  // check if user won the bid
  function isWinner(bid: (typeof data.activeBids)[0]) {
    return (
      bid.item?.currentBid &&
      bid.amount >= bid.item.currentBid &&
      bid.userId === data.user?.id
    );
  }

  // Handle checkout
  const onCheckout = async (bid: (typeof data.activeBids)[0]) => {
    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: bid.item?.currentBid,
        currency: "usd",
        name: bid.item?.name || "Auction",
        mode: "payment",
        metadata: {
          auctionId: bid.item?.id,
          userId: bid.userId,
          image: bid.item?.fileKey || FALLBACK_IMAGE,
        },
      }),
    });

    const { sessionId, url } = await response.json();
    // console.log(sessionId, "sessionId");
    window.location = url;
  };
</script>

<svelte:head>
  <title>My Bids - Book Bidding</title>
</svelte:head>

<div class="bg-background min-h-screen">
  <HeaderSection
    title="My Bids"
    description="Your bidding activity across auctions"
    cta={{ text: "Browse Auctions", href: "/auctions" }}
  />

  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
    {#if (data.activeBids && data.activeBids.length > 0) || (data.endedBids && data.endedBids.length > 0)}
      {#if data.endedBids && data.endedBids.length > 0}
        <h2 class="text-xl font-semibold text-foreground mb-4">Ended</h2>
        <div class="space-y-4 mb-8">
          {#each data.endedBids as bid (bid.id)}
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
                    <span class="text-sm text-muted-foreground">
                      by {bid.item.author}
                    </span>
                  {/if}
                </div>
                <div class="mt-2 text-sm text-muted-foreground">
                  Placed: {formatDate(bid.createdAt)} · Your bid:
                  <span class="font-semibold text-foreground">
                    ${bid.amount.toLocaleString()}
                  </span>
                  {#if bid.item?.currentBid}
                    · Final: <span class="font-semibold text-accent">
                      ${bid.item.currentBid.toLocaleString()}
                    </span>
                  {/if}
                  <br />
                  <!-- won bid -->
                  {#if isWinner(bid)}
                    <span
                      class="font-semibold text-green-600 dark:text-green-400"
                    >
                      Won:
                    </span>
                    <span class="ml-1">
                      Congratulations! You've won this item. 🎉
                    </span>
                  {/if}
                </div>
                <div class="mt-1">
                  <span
                    class="inline-block bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 px-2 py-0.5 rounded text-xs"
                  >
                    Ended
                  </span>
                </div>
              </div>
              {#if isWinner(bid)}
                <button
                  onclick={() => onCheckout(bid)}
                  class="group font-koulen flex items-center gap-1 px-4 py-2 cursor-pointer bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition text-sm"
                >
                  <span class="transition-transform group-hover:translate-x-0">
                    Checkout
                  </span>
                  <ChevronDoubleRightOutline
                    class="shrink-0 h-5 w-5 transition-transform group-hover:translate-x-1 group-hover:scale-110"
                  />
                </button>
              {:else}
                <a
                  href={`/auctions/${bid.item?.id}`}
                  class="px-4 py-2 cursor-pointer font-koulen bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition text-sm"
                >
                  View Detail
                </a>
              {/if}
            </div>
          {/each}
        </div>
      {/if}

      {#if data.activeBids && data.activeBids.length > 0}
        <h2 class="text-xl font-semibold text-foreground mb-4">Active</h2>
        <div class="space-y-4">
          {#each data.activeBids as bid (bid.id)}
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
                    <span class="text-sm text-muted-foreground">
                      by {bid.item.author}
                    </span>
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
                  {#if bid.item?.currentBid && bid.amount < bid.item.currentBid}
                    <span class="font-semibold text-red-600 dark:text-red-400">
                      Outbid:
                    </span>
                    <span class="ml-1">
                      Increase your bid to secure this item!
                    </span>
                  {/if}
                </div>
                <div class="mt-1">
                  <span
                    class="inline-block bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-0.5 rounded text-xs"
                  >
                    Active
                  </span>
                </div>
              </div>
              <a
                href={`/auctions/${bid.item?.id}`}
                class="px-4 py-2 cursor-pointer font-koulen bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition text-sm"
              >
                Bid Now
              </a>
            </div>
          {/each}
        </div>
      {/if}
    {:else}
      <div class="bg-card border border-border rounded-lg p-8 text-center">
        <p class="text-lg font-medium text-foreground mb-2">No bids yet</p>
        <p class="text-muted-foreground mb-6">
          Browse auctions and place your first bid.
        </p>
        <a
          href="/auctions"
          class="inline-block font-koulen px-6 py-2 cursor-pointer bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition"
        >
          Place Bid
        </a>
      </div>
    {/if}
  </div>
</div>
