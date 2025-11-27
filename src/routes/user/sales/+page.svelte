<script lang="ts">
  import { FALLBACK_IMAGE } from "../../dashboard/shared/constants";
  import { formatDate, type BookRow } from "../../helpers";
  import type { PageProps } from "./$types";
  import HeaderSection from "$lib/components/Header.svelte";

  let { data }: PageProps = $props();

  function formatCurrency(n?: number) {
    return `$${(n || 0).toLocaleString()}`;
  }

  // Handle checkout
  const onCheckout = async (book: BookRow) => {
    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: book.currentBid,
        currency: "usd",
        name: book.name,
        mode: "payment",
        metadata: {
          auctionId: book.id,
          userId: book.userId,
          image: book.fileKey || FALLBACK_IMAGE,
        },
      }),
    });

    const { sessionId, url } = await response.json();
    // console.log(sessionId, "sessionId");
    window.location = url;
  };
</script>

<svelte:head>
  <title>My Sales - Book Bidding</title>
</svelte:head>

<div class="bg-background min-h-screen">
  <HeaderSection
    title="My Sales"
    description="Your auctions and sales performance"
    cta={{ text: "Manage Auctions", href: "/dashboard" }}
  />

  <!-- Stats -->
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="bg-card border border-border rounded-lg p-4">
        <p class="text-sm text-muted-foreground">Ended Auctions</p>
        <p class="text-2xl font-koulen">{data.stats.endedCount || 0}</p>
      </div>
      <div class="bg-card border border-border rounded-lg p-4">
        <p class="text-sm text-muted-foreground">Won Items</p>
        <p class="text-2xl font-koulen">{data.stats.wonCount || 0}</p>
      </div>
      <div class="bg-card border border-border rounded-lg p-4">
        <p class="text-sm text-muted-foreground">Pending Payment Value</p>
        <p class="text-2xl font-koulen">
          {formatCurrency(data.stats.pendingPaymentValue)}
        </p>
      </div>
    </div>

    <!-- Awaiting Payment -->
    {#if data.awaitingPayment && data.awaitingPayment.length > 0}
      <h2 class="text-xl font-semibold text-foreground">Awaiting Payment</h2>
      <div class="space-y-4">
        {#each data.awaitingPayment as book (book.id)}
          <div
            class="flex items-center gap-4 bg-card border border-border rounded-lg p-4"
          >
            <img
              src={book.fileKey || FALLBACK_IMAGE}
              alt={book.name || "Auction"}
              class="w-20 h-20 rounded object-cover border border-border"
            />
            <div class="flex-1">
              <div class="flex flex-wrap items-center gap-2">
                <a
                  href={`/auctions/${book.id}`}
                  class="font-semibold text-foreground hover:underline"
                >
                  {book.name}
                </a>
                {#if book.author}<span class="text-sm text-muted-foreground">
                    by {book.author}
                  </span>
                {/if}
              </div>
              <div class="mt-2 text-sm text-muted-foreground">
                Ended: {formatDate(book.endDate)} · Final:
                <span class="font-semibold text-foreground">
                  {formatCurrency(book.currentBid)}
                </span>
                {#if book.bids?.length}
                  · Bids: <span class="font-semibold">{book.bids.length}</span>
                {/if}
              </div>
              <div class="mt-1 flex gap-2 items-center">
                <span
                  class="inline-block bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 px-2 py-0.5 rounded text-xs"
                >
                  Awaiting Payment
                </span>
              </div>
            </div>
            <a
              href={`/auctions/${book.id}`}
              class="px-4 py-2 cursor-pointer bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition text-sm text-center"
            >
              View
            </a>
          </div>
        {/each}
      </div>
    {/if}

    <!-- Won Items -->
    {#if data.myWonItems && data.myWonItems.length > 0}
      <h2 class="text-xl font-semibold text-foreground mt-8">
        You Won (Checkout)
      </h2>
      <div class="space-y-4">
        {#each data.myWonItems as book (book.id)}
          <div
            class="flex items-center gap-4 bg-card border border-border rounded-lg p-4"
          >
            <img
              src={book.fileKey || FALLBACK_IMAGE}
              alt={book.name || "Auction"}
              class="w-20 h-20 rounded object-cover border border-border"
            />
            <div class="flex-1">
              <div class="flex flex-wrap items-center gap-2">
                <a
                  href={`/auctions/${book.id}`}
                  class="font-semibold text-foreground hover:underline"
                  >{book.name}</a
                >
                {#if book.author}<span class="text-sm text-muted-foreground"
                    >by {book.author}</span
                  >{/if}
              </div>
              <div class="mt-2 text-sm text-muted-foreground">
                Ended: {formatDate(book.endDate)} · Your final:
                <span class="font-semibold text-foreground">
                  {formatCurrency(book.currentBid)}
                </span>
              </div>
              <div class="mt-1 flex gap-2 items-center">
                <span
                  class="inline-block bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-0.5 rounded text-xs"
                >
                  Won
                </span>
              </div>
            </div>
            <!-- href={`/auctions/${book.id}`} -->
            <button
              onclick={() => onCheckout(book)}
              class="px-4 py-2 cursor-pointer bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition text-sm text-center"
            >
              Checkout
            </button>
          </div>
        {/each}
      </div>
    {/if}

    <!-- No items -->
    {#if (!data.awaitingPayment || data.awaitingPayment.length === 0) && (!data.myWonItems || data.myWonItems.length === 0)}
      <div class="bg-card border border-border rounded-lg p-8 text-center">
        <p class="text-lg font-medium text-foreground mb-2">
          No ended activity
        </p>
        <p class="text-muted-foreground mb-6">
          When auctions end, you'll see pending payments and won items here.
        </p>
        <a
          href="/dashboard"
          class="inline-block px-6 py-2 cursor-pointer bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition"
        >
          Create Auction
        </a>
      </div>
    {/if}
  </div>
</div>
