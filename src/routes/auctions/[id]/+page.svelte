<script lang="ts">
  import { page } from "$app/state";
  import BidNotification from "$lib/components/bid-notification.svelte";
  import { realtime } from "$lib/stores/realtime";

  interface Bid {
    id: string;
    bidder: string;
    amount: number;
    timestamp: string;
  }

  interface Auction {
    id: string;
    title: string;
    author: string;
    description: string;
    currentPrice: number;
    highestBid: number;
    timeRemaining: string;
    image: string;
    status: "active" | "ending-soon" | "ended";
    seller: string;
    startingPrice: number;
    bids: Bid[];
    condition: string;
    year: number;
    pages: number;
  }

  // Sample auction data - In a real app, this would come from a database
  const allAuctions: Record<string, Auction> = {
    "1": {
      id: "1",
      title: "First Edition Harry Potter",
      author: "J.K. Rowling",
      description:
        "A pristine first edition of Harry Potter and the Philosopher's Stone in excellent condition with original dust jacket. This is a highly sought-after collectible.",
      currentPrice: 1200,
      highestBid: 1500,
      timeRemaining: "2 days",
      image:
        "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=687",
      status: "active",
      seller: "BookCollector99",
      startingPrice: 1000,
      condition: "Like New",
      year: 1997,
      pages: 309,
      bids: [
        {
          id: "1",
          bidder: "BookLover45",
          amount: 1500,
          timestamp: "2 hours ago",
        },
        {
          id: "2",
          bidder: "VintageFind",
          amount: 1300,
          timestamp: "4 hours ago",
        },
        {
          id: "3",
          bidder: "CollectorPro",
          amount: 1100,
          timestamp: "1 day ago",
        },
      ],
    },
    "2": {
      id: "2",
      title: "Vintage Shakespeare Collection",
      author: "William Shakespeare",
      description:
        "Complete works of Shakespeare in a beautiful vintage leather-bound collection from 1920s. Includes all 37 plays and 154 sonnets.",
      currentPrice: 850,
      highestBid: 950,
      timeRemaining: "5 hours",
      image:
        "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=687",
      status: "ending-soon",
      seller: "AntiquesExpert",
      startingPrice: 750,
      condition: "Good",
      year: 1925,
      pages: 1200,
      bids: [
        {
          id: "1",
          bidder: "ClassicReader",
          amount: 950,
          timestamp: "30 mins ago",
        },
        {
          id: "2",
          bidder: "LiteraryFan",
          amount: 800,
          timestamp: "3 hours ago",
        },
      ],
    },
  };

  const auctionId = $derived.by(() => page.params.id);
  let auction = $state<Auction | null>(null);
  let newBidAmount = $state("");
  let bidError = $state("");
  let bidSuccess = $state(false);

  $effect(() => {
    realtime.connect();

    const unsubscribe = realtime.subscribe(auctionId!, (update) => {
      if (auction && update.auctionId === auction.id) {
        console.log("[v0] Received real-time bid update:", update);

        const newBid: Bid = {
          id: String(auction.bids.length + 1),
          bidder: update.bidder,
          amount: update.amount,
          timestamp: "just now",
        };

        auction = {
          ...auction,
          bids: [newBid, ...auction.bids],
          currentPrice: Math.max(auction.currentPrice, update.amount),
          highestBid: Math.max(auction.highestBid, update.amount),
        };
      }
    });

    return () => {
      unsubscribe();
      realtime.disconnect();
    };
  });

  $effect(() => {
    auction = allAuctions[auctionId!] || null;
  });

  function placeBid() {
    bidError = "";
    bidSuccess = false;

    if (!newBidAmount) {
      bidError = "Please enter a bid amount";
      return;
    }

    const bidAmount = parseFloat(newBidAmount);
    if (isNaN(bidAmount)) {
      bidError = "Please enter a valid amount";
      return;
    }

    const minBid = auction
      ? Math.max(auction.currentPrice + 50, auction.startingPrice)
      : 0;
    if (bidAmount < minBid) {
      bidError = `Bid must be at least $${minBid.toLocaleString()}`;
      return;
    }

    if (auction) {
      const newBid: Bid = {
        id: String(auction.bids.length + 1),
        bidder: "CurrentUser",
        amount: bidAmount,
        timestamp: "just now",
      };

      auction = {
        ...auction,
        bids: [newBid, ...auction.bids],
        currentPrice: bidAmount,
        highestBid: bidAmount,
      };

      // Simulate broadcasting to other users
      realtime.broadcastBid(auction.id, "CurrentUser", bidAmount);

      bidSuccess = true;
      newBidAmount = "";

      setTimeout(() => {
        bidSuccess = false;
      }, 3000);
    }
  }
</script>

<svelte:head>
  <title>{auction?.title || "Auction"} - Book Bidding</title>
</svelte:head>

<!-- Real-time notifications -->
<BidNotification />

{#if auction}
  <div class="bg-background">
    <!-- Header -->
    <div
      class="bg-linear-to-r from-primary/10 to-accent/10 border-b border-border py-8"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <a
          href="/auctions"
          class="text-primary hover:text-accent mb-4 inline-block"
          >← Back to Auctions</a
        >
        <div class="flex justify-between items-start gap-4">
          <div>
            <h1 class="text-4xl md:text-5xl font-bold text-foreground">
              {auction.title}
            </h1>
            <p class="text-muted-foreground mt-2">by {auction.author}</p>
          </div>
          <div
            class="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-sm font-medium"
          >
            <span class="w-2 h-2 bg-current rounded-full animate-pulse"></span>
            {realtime.isConnected ? "Live" : "Offline"}
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Left Column: Image -->
        <div class="lg:col-span-2">
          <div
            class="bg-card border border-border rounded-lg overflow-hidden mb-8"
          >
            <img
              src={auction.image || "/placeholder.svg"}
              alt={auction.title}
              class="w-full h-96 object-cover"
            />
          </div>

          <!-- Description -->
          <div class="bg-card border border-border rounded-lg p-6 mb-8">
            <h2 class="text-2xl font-bold text-foreground mb-4">Description</h2>
            <p class="text-foreground leading-relaxed mb-6">
              {auction.description}
            </p>

            <!-- Details Grid -->
            <div
              class="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-border"
            >
              <div>
                <p class="text-sm text-muted-foreground mb-1">Condition</p>
                <p class="font-semibold text-foreground">{auction.condition}</p>
              </div>
              <div>
                <p class="text-sm text-muted-foreground mb-1">Year Published</p>
                <p class="font-semibold text-foreground">{auction.year}</p>
              </div>
              <div>
                <p class="text-sm text-muted-foreground mb-1">Pages</p>
                <p class="font-semibold text-foreground">{auction.pages}</p>
              </div>
              <div>
                <p class="text-sm text-muted-foreground mb-1">Seller</p>
                <p class="font-semibold text-foreground">{auction.seller}</p>
              </div>
            </div>
          </div>

          <!-- Bid History -->
          <div class="bg-card border border-border rounded-lg p-6">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-2xl font-bold text-foreground">Bid History</h2>
              <span class="text-sm text-muted-foreground"
                >{auction.bids.length} bids</span
              >
            </div>
            {#if auction.bids.length > 0}
              <div class="space-y-3">
                {#each auction.bids as bid (bid.id)}
                  <div
                    class="flex justify-between items-center p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition"
                  >
                    <div>
                      <p class="font-medium text-foreground">{bid.bidder}</p>
                      <p class="text-xs text-muted-foreground">
                        {bid.timestamp}
                      </p>
                    </div>
                    <p class="font-bold text-accent text-lg">
                      ${bid.amount.toLocaleString()}
                    </p>
                  </div>
                {/each}
              </div>
            {:else}
              <p class="text-muted-foreground">
                No bids yet. Be the first to bid!
              </p>
            {/if}
          </div>
        </div>

        <!-- Right Column: Bidding Panel -->
        <div class="lg:col-span-1">
          <div
            class="bg-card border border-border rounded-lg p-6 sticky top-24"
          >
            <!-- Status Badge -->
            <div class="mb-6">
              {#if auction.status === "active"}
                <span
                  class="inline-block bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-3 py-1 rounded-full text-sm font-medium"
                >
                  Active Auction
                </span>
              {:else if auction.status === "ending-soon"}
                <span
                  class="inline-block bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 px-3 py-1 rounded-full text-sm font-medium"
                >
                  Ending Soon
                </span>
              {:else}
                <span
                  class="inline-block bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 px-3 py-1 rounded-full text-sm font-medium"
                >
                  Auction Ended
                </span>
              {/if}
            </div>

            <!-- Price Information -->
            <div class="space-y-4 mb-6 pb-6 border-b border-border">
              <div>
                <p class="text-sm text-muted-foreground mb-1">Starting Price</p>
                <p class="text-2xl font-bold text-foreground">
                  ${auction.startingPrice.toLocaleString()}
                </p>
              </div>
              <div>
                <p class="text-sm text-muted-foreground mb-1">Current Bid</p>
                <p class="text-3xl font-bold text-accent">
                  ${auction.currentPrice.toLocaleString()}
                </p>
              </div>
              <div>
                <p class="text-sm text-muted-foreground mb-1">Time Remaining</p>
                <p class="text-lg font-semibold text-foreground">
                  {auction.timeRemaining}
                </p>
              </div>
            </div>

            <!-- Bidding Form -->
            {#if auction.status !== "ended"}
              <div class="space-y-4">
                <div>
                  <label
                    for="bid-amount"
                    class="block text-sm font-medium text-foreground mb-2"
                  >
                    Your Bid
                  </label>
                  <div class="flex gap-2">
                    <span
                      class="inline-flex items-center px-3 bg-muted rounded-lg text-foreground"
                      >$</span
                    >
                    <input
                      type="text"
                      id="bid-amount"
                      bind:value={newBidAmount}
                      placeholder={Math.max(
                        auction.currentPrice + 50,
                        auction.startingPrice
                      ).toString()}
                      class="flex-1 px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <p class="text-xs text-muted-foreground mt-2">
                    Minimum bid: ${Math.max(
                      auction.currentPrice + 50,
                      auction.startingPrice
                    ).toLocaleString()}
                  </p>
                </div>

                {#if bidError}
                  <div
                    class="p-3 bg-destructive/10 border border-destructive/30 rounded-lg"
                  >
                    <p class="text-sm text-destructive">{bidError}</p>
                  </div>
                {/if}

                {#if bidSuccess}
                  <div
                    class="p-3 bg-green-100 border border-green-300 rounded-lg dark:bg-green-900 dark:border-green-700"
                  >
                    <p class="text-sm text-green-800 dark:text-green-200">
                      Bid placed successfully!
                    </p>
                  </div>
                {/if}

                <button
                  onclick={placeBid}
                  class="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:opacity-90 transition"
                >
                  Place Bid
                </button>

                <button
                  class="w-full border border-border text-foreground py-2 rounded-lg hover:bg-muted/50 transition"
                >
                  Watch This Auction
                </button>
              </div>
            {:else}
              <div class="p-4 bg-muted/30 rounded-lg text-center">
                <p class="text-foreground font-medium mb-2">
                  This auction has ended
                </p>
                <p class="text-sm text-muted-foreground">
                  {auction.highestBid > 0
                    ? `Won by ${auction.seller}`
                    : "No bids were placed"}
                </p>
              </div>
            {/if}
          </div>
        </div>
      </div>
    </div>
  </div>
{:else}
  <div class="bg-background min-h-screen flex items-center justify-center">
    <div class="text-center">
      <p class="text-lg text-muted-foreground mb-4">Auction not found</p>
      <a href="/auctions" class="text-primary hover:text-accent"
        >← Back to Auctions</a
      >
    </div>
  </div>
{/if}
