<script lang="ts">
  import "../app.css";
  import favicon from "$lib/assets/favicon.svg";
  import type { Snippet } from "svelte";
  import type { LayoutData } from "./$types";
  import { authClient } from "$lib/auth-client";
  import { goto } from "$app/navigation";

  let { children, data }: { children: Snippet; data: LayoutData } = $props();
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

<div
  class="min-h-screen flex flex-col bg-background mx-8 lg:px-4 lg:mx-auto max-w-7xl"
>
  <!-- Navigation -->
  {@render navigation()}
  <!-- Main Content -->
  <main class="flex-1">
    {@render children?.()}
  </main>
  <!-- Footer -->
  {@render footer()}
</div>

<!-- Navigation Snippet -->
{#snippet navigation()}
  <nav class="bg-card border-b border-border sticky top-0 z-50">
    <div class="max-w-7xl mx-auto">
      <div class="flex justify-between items-center h-16">
        <a href="/" class="flex items-center gap-2">
          <div
            class="w-8 h-8 bg-primary rounded flex items-center justify-center"
          >
            <span class="text-primary-foreground font-bold">📚</span>
          </div>
          <span
            class="font-koulen text-xl font-semibold text-foreground tracking-wider"
          >
            Book Bidding
          </span>
        </a>

        <div class="hidden md:flex items-center gap-8">
          {#if data.sessionId}
            <a
              href="/admin"
              class="text-foreground hover:text-primary transition font-koulen"
              >Dashboard</a
            >
            <a
              href="/my-bids"
              class="text-foreground hover:text-primary transition font-koulen"
              >My Bids</a
            >
            <a
              href="/my-sales"
              class="text-foreground hover:text-primary transition font-koulen"
              >My Sales</a
            >
          {/if}
        </div>

        <div class="flex items-center gap-4 font-koulen">
          {#if data.sessionId && data.user}
            <div class="flex items-center gap-3">
              <img
                src={data.user.image ||
                  "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=687"}
                alt={data.user?.name || "Username"}
                class="w-8 h-8 rounded-full border border-border"
              />
              <span class="text-sm font-medium text-foreground hidden sm:inline"
                >{data.user?.name || "Username"}</span
              >
            </div>
            <button
              onclick={async () => {
                await authClient.signOut();
                goto("/auth/login", { invalidateAll: true });
              }}
              class="px-4 font-koulen cursor-pointer py-2 text-foreground hover:bg-muted rounded-lg transition"
            >
              Sign Out
            </button>
          {:else}
            <a
              href="/auth/login"
              class="px-4 py-2 cursor-pointer font-koulen bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition"
            >
              Sign In
            </a>
          {/if}
        </div>
      </div>
    </div>
  </nav>
{/snippet}

<!-- Footer Snippet -->
{#snippet footer()}
  <footer class="text-secondary-foreground border-t border-border mt-16">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 class=" font-bold mb-4">About</h3>
          <p class="text-sm opacity-75">
            Premium book auction platform for collectors.
          </p>
        </div>
        <div>
          <h3 class=" font-bold mb-4">Auctions</h3>
          <ul class="text-sm space-y-2 opacity-75">
            <li>
              <a href="/auctions" class="hover:opacity-100">All Auctions</a>
            </li>
            <li>
              <a href="/auctions?status=ending-soon" class="hover:opacity-100"
                >Ending Soon</a
              >
            </li>
          </ul>
        </div>
        <div>
          <h3 class=" font-bold mb-4">Help</h3>
          <ul class="text-sm space-y-2 opacity-75">
            <li>
              <a href="/" class="hover:opacity-100">How to Bid</a>
            </li>
            <li>
              <a href="/" class="hover:opacity-100">Contact</a>
            </li>
          </ul>
        </div>
        <div>
          <h3 class=" font-bold mb-4">Legal</h3>
          <ul class="text-sm space-y-2 opacity-75">
            <li>
              <a href="/" class="hover:opacity-100">Terms</a>
            </li>
            <li>
              <a href="/" class="hover:opacity-100">Privacy</a>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div
      class="border-t mb-8 border-secondary-foreground/20 pt-8 text-center text-sm opacity-60"
    >
      <p>&copy; 2025 Book Bidding. All rights reserved.</p>
    </div>
  </footer>
{/snippet}
