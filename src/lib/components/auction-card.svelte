<script lang="ts">
  interface Auction {
    id: string;
    title: string;
    author: string;
    currentPrice: number;
    highestBid: number;
    timeRemaining: string;
    image: string;
    status: "active" | "ending-soon" | "ended";
  }

  let { auction } = $props<{ auction: Auction }>();

  const getBadgeClass = (status: string) => {
    switch (status) {
      case "ending-soon":
        return "auction-badge bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "ended":
        return "auction-badge bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
      default:
        return "auction-badge auction-badge-active";
    }
  };

  const getTimeColor = (status: string) => {
    return status === "ending-soon"
      ? "text-orange-600"
      : "text-muted-foreground";
  };
</script>

<a href={`/auctions/${auction.id}`} class="auction-card">
  <!-- Image -->
  <div class="relative mb-4 overflow-hidden rounded-md bg-muted h-48">
    <img
      src={auction.image || "/placeholder.svg"}
      alt={auction.title}
      class="w-full h-full object-cover hover:scale-105 transition-transform"
    />
    <div class="absolute top-2 right-2">
      <span class={getBadgeClass(auction.status)}>
        {auction.status === "ending-soon"
          ? "⏰ Ending Soon"
          : auction.status === "ended"
            ? "Ended"
            : "Active"}
      </span>
    </div>
  </div>

  <!-- Content -->
  <div class="space-y-3">
    <div>
      <h3 class="font-bold text-foreground line-clamp-2 text-sm">
        {auction.title}
      </h3>
      <p class="text-xs text-muted-foreground">by {auction.author}</p>
    </div>

    <!-- Pricing -->
    <div class="space-y-1 border-t border-border pt-3">
      <div class="flex justify-between items-center text-sm">
        <span class="text-muted-foreground">Current Bid</span>
        <span class="font-bold text-accent text-lg"
          >${auction.currentPrice.toLocaleString()}</span
        >
      </div>
      {#if auction.highestBid > 0}
        <div
          class="flex justify-between items-center text-xs text-muted-foreground"
        >
          <span>Highest Bid</span>
          <span>${auction.highestBid.toLocaleString()}</span>
        </div>
      {/if}
    </div>

    <!-- Time Remaining -->
    <div
      class={`text-center font-medium text-sm py-2 bg-accent/5 rounded ${getTimeColor(auction.status)}`}
    >
      {auction.timeRemaining}
    </div>

    <!-- CTA Button -->
    <button
      class="w-full bg-primary text-primary-foreground py-2 rounded-lg font-medium hover:opacity-90 transition text-sm"
    >
      {auction.status === "ended" ? "View Details" : "Place Bid"}
    </button>
  </div>
</a>
