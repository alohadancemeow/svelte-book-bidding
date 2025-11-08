<script lang="ts">
  import { auth } from "$lib/stores/auth";

  interface Auction {
    id: string;
    title: string;
    author: string;
    currentPrice: number;
    startingPrice: number;
    status: "active" | "ending-soon" | "ended";
    bidsCount: number;
    createdAt: string;
  }

  let auctions: Auction[] = $state([
    {
      id: "1",
      title: "First Edition Harry Potter",
      author: "J.K. Rowling",
      currentPrice: 1200,
      startingPrice: 1000,
      status: "active",
      bidsCount: 3,
      createdAt: "2025-11-06",
    },
    {
      id: "2",
      title: "Vintage Shakespeare Collection",
      author: "William Shakespeare",
      currentPrice: 850,
      startingPrice: 750,
      status: "ending-soon",
      bidsCount: 2,
      createdAt: "2025-11-05",
    },
    {
      id: "3",
      title: "Rare Science Fiction",
      author: "Isaac Asimov",
      currentPrice: 450,
      startingPrice: 400,
      status: "ended",
      bidsCount: 0,
      createdAt: "2025-11-01",
    },
  ]);

  let selectedTab = $state("overview");
  let showCreateModal = $state(false);
  let editingAuction: Auction | null = $state(null);

  let formData = $state({
    title: "",
    author: "",
    startingPrice: 0,
    description: "",
  });

  function resetForm() {
    formData = { title: "", author: "", startingPrice: 0, description: "" };
    editingAuction = null;
    showCreateModal = false;
  }

  function handleCreateAuction() {
    if (!formData.title || !formData.author || formData.startingPrice <= 0) {
      alert("Please fill in all required fields");
      return;
    }

    if (editingAuction) {
      // Update existing
      auctions = auctions.map((a) => {
        if (a.id === editingAuction!.id) {
          return {
            ...a,
            title: formData.title,
            author: formData.author,
            startingPrice: formData.startingPrice,
          };
        }
        return a;
      });
    } else {
      // Create new
      const newAuction: Auction = {
        id: String(Math.max(...auctions.map((a) => parseInt(a.id)), 0) + 1),
        title: formData.title,
        author: formData.author,
        startingPrice: formData.startingPrice,
        currentPrice: formData.startingPrice,
        status: "active",
        bidsCount: 0,
        createdAt: new Date().toISOString().split("T")[0],
      };
      auctions = [newAuction, ...auctions];
    }
    resetForm();
  }

  function startEdit(auction: Auction) {
    editingAuction = auction;
    formData = {
      title: auction.title,
      author: auction.author,
      startingPrice: auction.startingPrice,
      description: "",
    };
    showCreateModal = true;
  }

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

{#if !$auth.isAuthenticated}
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
            onclick={() => {
              resetForm();
              showCreateModal = true;
            }}
            class="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition font-medium"
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

      <!-- Tabs -->
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
                        onclick={() => startEdit(auction)}
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
    </div>
  </div>

  <!-- Create/Edit Modal -->
  {#if showCreateModal}
    <div
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    >
      <div class="bg-card border border-border rounded-lg p-8 max-w-md w-full">
        <h2 class="text-2xl font-bold text-foreground mb-6">
          {editingAuction ? "Edit Auction" : "Create New Auction"}
        </h2>

        <form
          onsubmit={(e) => {
            e.preventDefault();
            handleCreateAuction();
          }}
          class="space-y-4"
        >
          <div>
            <label
              for="title"
              class="block text-sm font-medium text-foreground mb-1"
            >
              Title *
            </label>
            <input
              type="text"
              id="title"
              bind:value={formData.title}
              class="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label
              for="author"
              class="block text-sm font-medium text-foreground mb-1"
            >
              Author *
            </label>
            <input
              type="text"
              id="author"
              bind:value={formData.author}
              class="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label
              for="startingPrice"
              class="block text-sm font-medium text-foreground mb-1"
            >
              Starting Price *
            </label>
            <input
              type="number"
              id="startingPrice"
              bind:value={formData.startingPrice}
              min="0"
              step="50"
              class="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div class="flex gap-3 pt-4">
            <button
              type="button"
              onclick={resetForm}
              class="flex-1 px-4 py-2 border border-border text-foreground rounded-lg hover:bg-muted transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition font-medium"
            >
              {editingAuction ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  {/if}
{/if}
