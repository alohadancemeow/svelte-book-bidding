<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/state";

  interface Auction {
    id: string;
    title: string;
    author: string;
    description: string;
    currentPrice: number;
    startingPrice: number;
    status: "active" | "ending-soon" | "ended";
    bidsCount: number;
    endDate: string;
  }

  let auctions: Auction[] = $state([
    {
      id: "1",
      title: "First Edition Harry Potter",
      author: "J.K. Rowling",
      description: "A classic book about a young wizard.",
      currentPrice: 1200,
      startingPrice: 1000,
      status: "active",
      bidsCount: 3,
      endDate: "2025-11-06",
    },
    {
      id: "2",
      title: "Vintage Shakespeare Collection",
      author: "William Shakespeare",
      description: "A collection of Shakespeare's plays and tragedies.",
      currentPrice: 850,
      startingPrice: 750,
      status: "ending-soon",
      bidsCount: 2,
      endDate: "2025-11-05",
    },
    {
      id: "3",
      title: "Rare Science Fiction",
      author: "Isaac Asimov",
      description: "A collection of Asimov's science fiction works.",
      currentPrice: 450,
      startingPrice: 400,
      status: "ended",
      bidsCount: 0,
      endDate: "2025-11-01",
    },
  ]);

  let selectedTab = $state("overview");

  function deleteAuction(id: string) {
    if (confirm("Are you sure you want to delete this auction?")) {
      auctions = auctions.filter((a) => a.id !== id);
    }
  }

  let activeCount: number = $state(0);
  let endedCount: number = $state(0);
  let totalBids: number = $state(0);
  let totalRevenue: number = $state(0);

  $effect(() => {
    activeCount = auctions.filter((a) => a.status === "active").length;
    endedCount = auctions.filter((a) => a.status === "ended").length;
    totalBids = auctions.reduce((sum, a) => sum + a.bidsCount, 0);
    totalRevenue = auctions
      .filter((a) => a.status === "ended")
      .reduce((sum, a) => sum + a.currentPrice, 0);
  });
</script>

<svelte:head>
  <title>Admin Dashboard - Book Bidding</title>
</svelte:head>

{#if !page.data.sessionId}
  <div class="min-h-screen flex items-center justify-center bg-background">
    <div class="text-center">
      <h1 class="text-2xl font-bold text-foreground mb-4">
        Admin Access Required
      </h1>
      <p class="text-muted-foreground mb-6">
        Please sign in to access the admin dashboard.
      </p>
      <a
        href="/auth/login"
        class="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
      >
        Sign In
      </a>
    </div>
  </div>
{:else}
  <div class="bg-background">
    <!-- Header -->
    <div
      class="bg-linear-to-r from-primary/10 to-accent/10 border-b border-border py-8"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-4xl font-bold text-foreground">Admin Dashboard</h1>
            <p class="text-muted-foreground mt-2">
              Manage your auctions and monitor activity
            </p>
          </div>
          <button
            onclick={() => goto("/dashboard/create")}
            class="px-6 py-2 cursor-pointer bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition font-medium"
          >
            Create Auction
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div
      class="flex flex-col max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 gap-8"
    >
      <!-- Stats Grid -->
      {@render stats()}

      <!-- Tabs -->
      {@render tabs()}
    </div>
  </div>
{/if}

<!-- Stats Snippet -->
{#snippet stats()}
  <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
    <div class="bg-card border border-border rounded-lg p-6">
      <p class="text-sm text-muted-foreground mb-2">Active Auctions</p>
      <p class="text-3xl font-bold text-foreground">{activeCount}</p>
    </div>
    <div class="bg-card border border-border rounded-lg p-6">
      <p class="text-sm text-muted-foreground mb-2">Total Auctions</p>
      <p class="text-3xl font-bold text-foreground">{auctions.length}</p>
    </div>
    <div class="bg-card border border-border rounded-lg p-6">
      <p class="text-sm text-muted-foreground mb-2">Total Bids</p>
      <p class="text-3xl font-bold text-accent">{totalBids}</p>
    </div>
    <div class="bg-card border border-border rounded-lg p-6">
      <p class="text-sm text-muted-foreground mb-2">Completed Revenue</p>
      <p class="text-3xl font-bold text-foreground">
        ${totalRevenue.toLocaleString()}
      </p>
    </div>
  </div>
{/snippet}

<!-- Tabs Snippet -->
{#snippet tabs()}
  <div class="bg-card border border-border rounded-lg overflow-hidden">
    <div class="flex border-b border-border">
      {#each ["overview", "active", "ended"] as tab}
        <button
          onclick={() => (selectedTab = tab)}
          class={`flex-1 px-6 py-4 font-medium transition ${
            selectedTab === tab
              ? "bg-primary text-primary-foreground"
              : "bg-card text-foreground hover:bg-muted"
          }`}
        >
          {tab === "overview"
            ? "All Auctions"
            : tab === "active"
              ? "Active"
              : "Ended"}
        </button>
      {/each}
    </div>

    <!-- Table -->
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead>
          <tr class="border-b border-border">
            <th
              class="px-6 py-3 text-left text-sm font-semibold text-foreground"
              >Title</th
            >
            <th
              class="px-6 py-3 text-left text-sm font-semibold text-foreground"
              >Author</th
            >
            <th
              class="px-6 py-3 text-left text-sm font-semibold text-foreground"
              >Starting Price</th
            >
            <th
              class="px-6 py-3 text-left text-sm font-semibold text-foreground"
              >Current Price</th
            >
            <th
              class="px-6 py-3 text-left text-sm font-semibold text-foreground"
              >Status</th
            >
            <th
              class="px-6 py-3 text-left text-sm font-semibold text-foreground"
              >Bids</th
            >
            <th
              class="px-6 py-3 text-left text-sm font-semibold text-foreground"
              >Actions</th
            >
          </tr>
        </thead>
        <tbody>
          {#each auctions.filter((a) => {
            if (selectedTab === "overview") return true;
            if (selectedTab === "active") return a.status === "active";
            return a.status === "ended";
          }) as auction (auction.id)}
            <tr class="border-b border-border hover:bg-muted/50 transition">
              <td class="px-6 py-4 text-sm text-foreground font-medium"
                >{auction.title}</td
              >
              <td class="px-6 py-4 text-sm text-muted-foreground"
                >{auction.author}</td
              >
              <td class="px-6 py-4 text-sm text-foreground"
                >${auction.startingPrice.toLocaleString()}</td
              >
              <td class="px-6 py-4 text-sm text-accent font-semibold"
                >${auction.currentPrice.toLocaleString()}</td
              >
              <td class="px-6 py-4 text-sm">
                <span
                  class={`px-3 py-1 rounded-full text-xs font-medium ${
                    auction.status === "active"
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : auction.status === "ending-soon"
                        ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                  }`}
                >
                  {auction.status === "ending-soon"
                    ? "Ending Soon"
                    : auction.status.charAt(0).toUpperCase() +
                      auction.status.slice(1)}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-foreground"
                >{auction.bidsCount}</td
              >
              <td class="px-6 py-4 text-sm">
                <div class="flex gap-2">
                  <button
                    onclick={() => goto(`/dashboard/edit/${auction.id}`)}
                    class="px-3 py-1 bg-primary text-primary-foreground rounded text-xs hover:opacity-90"
                  >
                    Edit
                  </button>
                  <button
                    onclick={() => deleteAuction(auction.id)}
                    class="px-3 py-1 bg-destructive text-destructive-foreground rounded text-xs hover:opacity-90"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
{/snippet}
