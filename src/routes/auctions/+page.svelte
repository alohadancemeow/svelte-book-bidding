<script lang="ts">
  import AuctionCard from "$lib/components/auction-card.svelte";
  import HeaderSection from "$lib/components/Header.svelte";
  import { mapBooksToAuctions } from "../helpers";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();

  let auctions = $state(mapBooksToAuctions(data.books));

  // Recompute auctions when `data.books` updates after actions
  $effect(() => {
    auctions = mapBooksToAuctions(data.books);
  });

  let searchQuery = $state("");
  let selectedStatus = $state("all");
  let sortBy = $state("newest");
  let itemsPerPage = 8;
  let currentPage = $state(1);

  const filteredAuctions = () => {
    let result = auctions.filter((auction) => {
      const matchesSearch =
        auction.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        auction.author.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        selectedStatus === "all" || auction.status === selectedStatus;
      return matchesSearch && matchesStatus;
    });

    // Sort auctions
    switch (sortBy) {
      case "price-low":
        result.sort((a, b) => a.currentPrice - b.currentPrice);
        break;
      case "price-high":
        result.sort((a, b) => b.currentPrice - a.currentPrice);
        break;
      case "ending-soon":
        result.sort((a, b) => {
          const timeMap = {
            Ended: 999,
            "5 hours": 5,
            "12 hours": 12,
            "1 day": 24,
            "2 days": 48,
            "3 days": 72,
            "6 days": 144,
          };
          return (
            (timeMap[a.status as keyof typeof timeMap] || 999) -
            (timeMap[b.status as keyof typeof timeMap] || 999)
          );
        });
        break;
      default: // newest
        break;
    }

    return result;
  };

  // Pagination
  const totalPages = () => Math.ceil(filteredAuctions().length / itemsPerPage);
  const startIndex = () => (currentPage - 1) * itemsPerPage;
  const endIndex = () => startIndex() + itemsPerPage;
  const paginatedAuctions = () =>
    filteredAuctions().slice(startIndex(), endIndex());

  $effect(() => {
    if (searchQuery) currentPage = 1;
  });

  $effect(() => {
    if (selectedStatus) currentPage = 1;
  });

  $effect(() => {
    if (sortBy) currentPage = 1;
  });
</script>

<svelte:head>
  <title>Browse Auctions - Book Bidding</title>
</svelte:head>

<div class="bg-background">
  <!-- Header -->
  <HeaderSection
    title="Browse Auctions"
    description="Explore {paginatedAuctions()
      .length} available auctions. Use filters to narrow down your search."
  />

  <!-- Main Content -->
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {@render sidebarFilters()}
      {@render auctionsGrid()}
    </div>
  </div>
</div>

<!-- Sidebar Filters -->
{#snippet sidebarFilters()}
  <div class="lg:col-span-1">
    <div class="bg-card border border-border rounded-lg p-6 sticky top-24">
      <h2 class="text-lg font-bold text-foreground mb-6">Filters</h2>

      <!-- Search -->
      <div class="mb-6">
        <label
          class="block text-sm font-medium text-foreground mb-2"
          for="search">Search</label
        >
        <input
          type="text"
          id="search"
          placeholder="Search by title or author"
          bind:value={searchQuery}
          class="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
        />
      </div>

      <!-- Status Filter -->
      <div class="mb-6">
        <label
          class="block text-sm font-medium text-foreground mb-3"
          for="status">Status</label
        >
        <div class="space-y-2">
          {#each ["all", "active", "ending-soon", "ended"] as status}
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="status"
                value={status}
                bind:group={selectedStatus}
                class="w-4 h-4 accent-primary"
              />
              <span class="text-sm text-foreground capitalize">
                {status === "all"
                  ? "All Auctions"
                  : status === "ending-soon"
                    ? "Ending Soon"
                    : status.charAt(0).toUpperCase() + status.slice(1)}
              </span>
            </label>
          {/each}
        </div>
      </div>

      <!-- Sort By -->
      <div>
        <label
          class="block text-sm font-medium text-foreground mb-2"
          for="sortBy">Sort By</label
        >
        <select
          id="sortBy"
          bind:value={sortBy}
          class="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
        >
          <option value="newest">Newest</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="ending-soon">Ending Soon</option>
        </select>
      </div>
    </div>
  </div>
{/snippet}

<!-- Auctions Grid -->
{#snippet auctionsGrid()}
  <div class="lg:col-span-3">
    {#if paginatedAuctions().length > 0}
      <div
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 auto-rows-fr gap-6 mb-8"
      >
        {#each paginatedAuctions() as auction (auction.id)}
          <div class="h-full">
            <AuctionCard {auction} />
          </div>
        {/each}
      </div>

      <!-- Pagination -->
      {#if totalPages() > 1}
        <div class="flex justify-center items-center gap-2 mt-12">
          <button
            disabled={currentPage === 1}
            onclick={() => currentPage--}
            class="px-4 py-2 border border-border rounded-lg bg-card text-foreground hover:bg-accent/10 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            ← Previous
          </button>

          <div class="flex gap-1">
            {#each { length: totalPages() } as _, i}
              <button
                onclick={() => (currentPage = i + 1)}
                class={`px-3 py-2 rounded-lg transition ${
                  currentPage === i + 1
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border text-foreground hover:bg-accent/10"
                }`}
              >
                {i + 1}
              </button>
            {/each}
          </div>

          <button
            disabled={currentPage === totalPages()}
            onclick={() => currentPage++}
            class="px-4 py-2 border border-border rounded-lg bg-card text-foreground hover:bg-accent/10 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Next →
          </button>
        </div>
      {/if}
    {:else}
      <div class="text-center py-16">
        <p class="text-lg text-muted-foreground mb-4 font-koulen">
          No auctions found
        </p>
        <p class="text-sm text-muted-foreground">
          Try adjusting your filters or search terms
        </p>
      </div>
    {/if}
  </div>
{/snippet}
