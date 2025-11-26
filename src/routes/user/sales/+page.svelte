<script lang="ts">
  import { FALLBACK_IMAGE } from "../../dashboard/shared/constants";
  import type { PageProps } from "./$types";
  let { data }: PageProps = $props();

  function formatCurrency(n?: number) {
    return `$${(n || 0).toLocaleString()}`;
  }

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

  function statusFor(endDate?: number | Date) {
    if (!endDate) return "active";
    const d = typeof endDate === "number" ? new Date(endDate) : endDate;
    const diff = d.getTime() - Date.now();
    if (diff <= 0) return "ended";
    if (diff < 5 * 60 * 60 * 1000) return "ending-soon";
    return "active";
  }
</script>

<svelte:head>
  <title>My Sales - Book Bidding</title>
</svelte:head>

<div class="bg-background min-h-screen">
  <div
    class="bg-linear-to-r from-primary/10 to-accent/10 border-b border-border py-8"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-4xl font-bold text-foreground">My Sales</h1>
          <p class="text-muted-foreground mt-2">
            Your auctions and sales performance
          </p>
        </div>
        <a
          href="/dashboard"
          class="px-6 py-2 cursor-pointer bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition font-medium"
        >
          Manage Auctions
        </a>
      </div>
    </div>
  </div>

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
                  >{book.name}</a
                >
                {#if book.author}<span class="text-sm text-muted-foreground"
                    >by {book.author}</span
                  >{/if}
              </div>
              <div class="mt-2 text-sm text-muted-foreground">
                Ended: {formatDate(book.endDate)} · Final:
                <span class="font-semibold text-foreground"
                  >{formatCurrency(book.currentBid)}</span
                >
                {#if book.bids?.length}
                  · Bids: <span class="font-semibold">{book.bids.length}</span
                  >{/if}
              </div>
              <div class="mt-1 flex gap-2 items-center">
                <span
                  class="inline-block bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 px-2 py-0.5 rounded text-xs"
                  >Awaiting Payment</span
                >
              </div>
            </div>
            <a
              href={`/auctions/${book.id}`}
              class="px-4 py-2 cursor-pointer bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition text-sm text-center"
              >View</a
            >
          </div>
        {/each}
      </div>
    {/if}

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
                <span class="font-semibold text-foreground"
                  >{formatCurrency(book.currentBid)}</span
                >
              </div>
              <div class="mt-1 flex gap-2 items-center">
                <span
                  class="inline-block bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-0.5 rounded text-xs"
                  >Won</span
                >
              </div>
            </div>
            <a
              href={`/auctions/${book.id}`}
              class="px-4 py-2 cursor-pointer bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition text-sm text-center"
              >Checkout</a
            >
          </div>
        {/each}
      </div>
    {/if}

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
          >Create Auction</a
        >
      </div>
    {/if}
  </div>
</div>
