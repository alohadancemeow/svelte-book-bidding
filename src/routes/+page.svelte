<script lang="ts">
  import { page } from "$app/state";
  import type { PageProps } from "./$types";
  import { FALLBACK_IMAGE } from "./dashboard/shared/constants";
  import Icon from "$lib/components/Icon.svelte";
  import AuctionCard from "$lib/components/AuctionCard.svelte";

  let { data }: PageProps = $props();

  const stats = {
    transactions: data.transactionCount,
    rareBooks: data.books.length,
    happyCollectors: data.userCount,
    totalSales: data.books.reduce(
      (acc, book) => acc + (book.currentBid || 0),
      0,
    ),
  };

  const activeBooks = data.books
    .filter((b) => {
      const end = new Date(b.endDate).getTime();
      const now = Date.now();
      return end > now;
    })
    .sort((a, b) => {
      const endA = new Date(a.endDate).getTime();
      const endB = new Date(b.endDate).getTime();
      return endA - endB;
    })
    .slice(0, 3);
</script>

<svelte:head>
  <title>Book Bidding | Rare Literary Treasures</title>
</svelte:head>

<div class="bg-background overflow-hidden">
  {@render hero()}
  {@render statistics()}
  {@render activeCollections()}
  {@render howItWorks()}
  {@render cta()}
</div>

{#snippet hero()}
  <section class="relative pt-20 pb-32 px-4 md:px-8 max-w-screen-2xl mx-auto">
    <!-- Decorative background elements -->
    <div class="absolute top-0 right-0 -z-10 opacity-10">
      <span
        class="font-headline text-[30rem] leading-none text-primary italic select-none pointer-events-none"
        >"</span
      >
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
      <div class="lg:col-span-7 space-y-8">
        <div class="space-y-4">
          <div class="flex items-center gap-3">
            <div class="h-[2px] w-12 bg-secondary"></div>
            <span
              class="font-label font-bold text-xs uppercase tracking-[0.3em] text-secondary"
              >Est. 2024</span
            >
          </div>
          <h1
            class="text-6xl md:text-8xl font-headline font-black text-primary leading-[0.9] tracking-tighter"
          >
            DISCOVER RARE <br /> <span class="text-secondary">BOOKS</span>, WIN
            <br /> TREASURES.
          </h1>
        </div>

        <p
          class="text-xl font-body text-on-surface-variant max-w-xl leading-relaxed"
        >
          Join thousands of collectors bidding on the world's most sought-after
          first editions, signed copies, and literary treasures.
        </p>

        <div class="flex flex-wrap gap-4 pt-4">
          <a
            href="/auctions"
            class="px-10 py-4 bg-primary text-on-primary rounded-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 font-headline font-bold uppercase tracking-widest text-sm"
          >
            Browse Auctions
          </a>
          <a
            href={page.data.sessionId ? "/dashboard" : "/auth/login"}
            class="px-10 py-4 border-2 border-primary text-primary rounded-lg hover:bg-primary hover:text-on-primary transition-all duration-500 font-headline font-bold uppercase tracking-widest text-sm"
          >
            Join Now
          </a>
        </div>
      </div>

      <div class="lg:col-span-5 relative">
        <!-- Main Hero Image -->
        <div
          class="relative z-10 transform -rotate-3 hover:rotate-0 transition-transform duration-700"
        >
          <div
            class="aspect-[4/5] rounded-2xl overflow-hidden book-shadow border-b-4 border-secondary"
          >
            <img
              src={FALLBACK_IMAGE}
              alt="Rare book collection"
              class="w-full h-full object-cover"
            />
          </div>

          <!-- Glassmorphism Detail Card -->
          <div
            class="absolute -bottom-8 -left-8 glass-overlay p-6 rounded-xl border border-white/20 shadow-2xl max-w-[240px] hidden md:block"
          >
            <div class="flex items-center gap-2 mb-3">
              <div class="w-2 h-2 rounded-full bg-secondary"></div>
              <span
                class="font-label font-bold text-[10px] uppercase tracking-widest text-secondary"
                >Live Auction</span
              >
            </div>
            <h3
              class="font-headline font-bold text-lg text-primary leading-tight mb-2"
            >
              The Great Gatsby
            </h3>
            <div class="flex justify-between items-end">
              <div class="flex flex-col">
                <span
                  class="text-[9px] font-label font-bold text-outline uppercase"
                  >Current Bid</span
                >
                <span class="font-headline font-black text-xl text-primary"
                  >$12,450</span
                >
              </div>
              <Icon icon="trending_up" class="text-secondary text-xl" />
            </div>
          </div>
        </div>

        <!-- Decorative elements -->
        <div
          class="absolute -top-12 -right-12 w-64 h-64 bg-secondary/5 rounded-full blur-3xl -z-10"
        ></div>
        <div
          class="absolute -bottom-12 -left-12 w-48 h-48 bg-primary/5 rounded-full blur-3xl -z-10"
        ></div>
      </div>
    </div>
  </section>
{/snippet}

{#snippet statistics()}
  <section
    class="py-12 border-y border-outline-variant/10 bg-surface-container-lowest"
  >
    <div class="max-w-screen-2xl mx-auto px-4 md:px-8">
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-8">
        {#each [{ label: "Rare Books", value: stats.rareBooks }, { label: "Transactions", value: stats.transactions }, { label: "Happy Collectors", value: stats.happyCollectors }, { label: "Total Value", value: `$${(stats.totalSales / 1000).toFixed(1)}k+` }] as item}
          <div class="flex flex-col items-center text-center">
            <span class="font-headline font-black text-4xl text-primary mb-1"
              >{item.value}</span
            >
            <span
              class="font-label font-bold text-[10px] uppercase tracking-[0.2em] text-outline"
              >{item.label}</span
            >
          </div>
        {/each}
      </div>
    </div>
  </section>
{/snippet}

{#snippet activeCollections()}
  <section class="py-24 px-4 md:px-8 max-w-screen-2xl mx-auto">
    <div
      class="flex flex-col md:flex-row justify-between items-end gap-8 mb-16"
    >
      <div class="space-y-4">
        <div class="flex items-center gap-3">
          <div class="h-[2px] w-8 bg-secondary"></div>
          <span
            class="font-label font-bold text-xs uppercase tracking-widest text-secondary"
            >Curated</span
          >
        </div>
        <h2
          class="text-5xl font-headline font-black text-primary tracking-tighter"
        >
          ACTIVE COLLECTIONS
        </h2>
      </div>
      <a
        href="/auctions"
        class="group flex items-center gap-3 font-headline font-bold text-sm uppercase tracking-widest text-primary hover:text-secondary transition-colors"
      >
        View All Archives
        <Icon
          icon="arrow_forward"
          class="group-hover:translate-x-2 transition-transform"
        />
      </a>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {#each activeBooks as book, i (book.id)}
        <div class={i === 1 ? "lg:translate-y-12" : ""}>
          <AuctionCard auction={book as any} />
        </div>
      {/each}
    </div>
  </section>
{/snippet}

{#snippet howItWorks()}
  <section class="py-32 bg-surface-container-low" id="how-it-works">
    <div class="max-w-screen-2xl mx-auto px-4 md:px-8">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-4">
            <div
              class="aspect-[3/4] rounded-xl overflow-hidden shadow-lg transform translate-y-8"
            >
              <img
                src={FALLBACK_IMAGE}
                alt="Process 1"
                class="w-full h-full object-cover"
              />
            </div>
            <div class="aspect-square rounded-xl overflow-hidden shadow-lg">
              <img
                src={FALLBACK_IMAGE}
                alt="Process 2"
                class="w-full h-full object-cover"
              />
            </div>
          </div>
          <div class="space-y-4">
            <div class="aspect-square rounded-xl overflow-hidden shadow-lg">
              <img
                src={FALLBACK_IMAGE}
                alt="Process 3"
                class="w-full h-full object-cover"
              />
            </div>
            <div
              class="aspect-[3/4] rounded-xl overflow-hidden shadow-lg transform -translate-y-8"
            >
              <img
                src={FALLBACK_IMAGE}
                alt="Process 4"
                class="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        <div class="space-y-12">
          <div class="space-y-4">
            <div class="flex items-center gap-3">
              <div class="h-[2px] w-8 bg-secondary"></div>
              <span
                class="font-label font-bold text-xs uppercase tracking-widest text-secondary"
                >Guide</span
              >
            </div>
            <h2
              class="text-5xl font-headline font-black text-primary tracking-tighter leading-none"
            >
              HOW TO ACQUIRE <br /> A MASTERPIECE
            </h2>
          </div>

          <div class="space-y-8">
            {#each [{ num: "01", title: "Curated Search", desc: "Browse our expertly verified selection of rare first editions and manuscripts." }, { num: "02", title: "Strategic Bidding", desc: "Place your bid in real-time and monitor competitive activity through our dashboard." }, { num: "03", title: "Secure Acquisition", desc: "Upon winning, complete your transaction through our encrypted Stripe integration." }] as step}
              <div class="flex gap-6">
                <span class="font-headline font-black text-3xl text-primary/20"
                  >{step.num}</span
                >
                <div class="space-y-1">
                  <h3 class="font-headline font-bold text-xl text-primary">
                    {step.title}
                  </h3>
                  <p class="font-body text-on-surface-variant leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            {/each}
          </div>
        </div>
      </div>
    </div>
  </section>
{/snippet}

{#snippet cta()}
  <section class="relative py-24 bg-primary overflow-hidden">
    <div class="absolute inset-0 opacity-10">
      <div
        class="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]"
      ></div>
    </div>

    <div class="relative max-w-4xl mx-auto px-4 text-center space-y-8">
      <h2
        class="text-5xl md:text-7xl font-headline font-black text-on-primary tracking-tighter leading-none"
      >
        READY TO START YOUR <br /> <span class="text-secondary">LEGACY</span> COLLECTION?
      </h2>
      <p class="text-xl font-body text-on-primary/60 max-w-xl mx-auto italic">
        "Every book has two stories — the one written on its pages, and the one
        of its journey through time."
      </p>
      <div class="flex gap-4 items-center justify-center pt-4">
        <a
          href={page.data.sessionId ? "/dashboard/create" : "/auth/login"}
          class="px-10 py-4 bg-secondary text-on-secondary rounded-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 font-headline font-bold uppercase tracking-widest text-sm"
        >
          {page.data.sessionId ? "Create Listing" : "Join the Archive"}
        </a>
      </div>
    </div>
  </section>
{/snippet}
