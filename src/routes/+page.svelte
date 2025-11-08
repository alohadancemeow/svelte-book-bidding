<script lang="ts">
  let featuredAuctions = $state([
    {
      id: 1,
      title: "First Edition: The Great Gatsby",
      author: "F. Scott Fitzgerald",
      condition: "Excellent",
      currentBid: 2500,
      endsIn: "2 days",
      image:
        "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=687",
    },
    {
      id: 2,
      title: "Signed Copy: To Kill a Mockingbird",
      author: "Harper Lee",
      condition: "Fine",
      currentBid: 1800,
      endsIn: "1 day",
      image:
        "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=687",
    },
    {
      id: 3,
      title: "Rare: The Hobbit First Edition",
      author: "J.R.R. Tolkien",
      condition: "Very Good",
      currentBid: 3200,
      endsIn: "3 days",
      image:
        "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=687",
    },
    {
      id: 4,
      title: "Vintage: Pride and Prejudice 1894",
      author: "Jane Austen",
      condition: "Good",
      currentBid: 1200,
      endsIn: "5 hours",
      image:
        "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=687",
    },
  ]);

  let stats = [
    { label: "Active Auctions", value: "2,847" },
    { label: "Rare Books", value: "12,500+" },
    { label: "Happy Collectors", value: "8,900+" },
    { label: "Total Sales", value: "$2.3M" },
  ];
</script>

<div class="bg-background">
  <!-- Hero Section -->
  <section
    class="relative overflow-hidden bg-linear-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground pt-20 pb-32"
  >
    <div class="absolute inset-0 overflow-hidden">
      <div
        class="absolute -top-40 -right-40 w-80 h-80 bg-primary-foreground/5 rounded-full blur-3xl"
      ></div>
      <div
        class="absolute -bottom-20 -left-40 w-96 h-96 bg-primary-foreground/5 rounded-full blur-3xl"
      ></div>
    </div>

    <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <h1 class="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Discover Rare Books, Win Treasures
          </h1>
          <p
            class="text-xl text-primary-foreground/90 mb-8 max-w-lg leading-relaxed"
          >
            Join thousands of collectors bidding on the world's most
            sought-after first editions, signed copies, and literary treasures.
          </p>
          <div class="flex gap-4 font-koulen tracking-wider items-center">
            <a
              href="/auctions"
              class="px-8 py-3 bg-primary-foreground text-primary rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              Browse Auctions
            </a>
            <a
              href="/auth/signup"
              class="px-8 py-3 border-2 border-primary-foreground text-primary-foreground rounded-lg hover:bg-primary-foreground/10 transition-all duration-300"
            >
              Join Now
            </a>
          </div>
        </div>

        <div class="relative h-96 hidden lg:block">
          <div
            class="absolute inset-0 bg-linear-to-br from-primary-foreground/10 to-transparent rounded-2xl"
          ></div>
          <img
            src="https://images.unsplash.com/photo-1543002588-bfa74002ed7e?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=687"
            alt="Rare book collection"
            class="w-full h-full object-cover rounded-2xl shadow-2xl"
          />
        </div>
      </div>
    </div>
  </section>

  <!-- Stats Section -->
  <section class="py-16 bg-card border-b border-border">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
        {#each stats as stat (stat.label)}
          <div class="text-center">
            <div
              class="text-3xl md:text-4xl font-bold text-primary mb-2 font-koulen tracking-wider"
            >
              {stat.value}
            </div>
            <div class="text-sm md:text-base text-muted-foreground">
              {stat.label}
            </div>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- Featured Auctions -->
  <section class="py-20 px-4 sm:px-6 lg:px-8">
    <div class="max-w-7xl mx-auto">
      <div class="text-center mb-16">
        <h2 class="text-4xl md:text-5xl font-bold text-foreground mb-4">
          Featured Auctions
        </h2>
        <p class="text-lg text-muted-foreground max-w-2xl mx-auto">
          Handpicked collection of the finest books currently up for auction
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {#each featuredAuctions as auction (auction.id)}
          <a href={`/auctions/${auction.id}`} class="group">
            <div
              class="bg-card rounded-xl overflow-hidden border border-border hover:border-primary transition-all duration-300 hover:shadow-xl"
            >
              <!-- Image -->
              <div class="relative h-64 overflow-hidden bg-muted">
                <img
                  src={auction.image ||
                    "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=687"}
                  alt={auction.title}
                  class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div
                  class="absolute top-3 right-3 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold"
                >
                  {auction.condition}
                </div>
                <div
                  class="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/60 to-transparent p-4 text-white"
                >
                  <p class="text-sm opacity-90">{auction.endsIn}</p>
                </div>
              </div>

              <!-- Content -->
              <div class="p-4">
                <h3
                  class="font-medium text-lg text-foreground mb-1 line-clamp-2 group-hover:text-primary transition-colors"
                >
                  {auction.title}
                </h3>
                <p class="text-sm text-muted-foreground mb-4">
                  {auction.author}
                </p>

                <div class="flex items-center justify-between">
                  <div class="flex flex-col gap-1.5">
                    <p class="text-xs text-muted-foreground">Current Bid</p>
                    <p class="text-2xl tracking-wider font-koulen">
                      ${auction.currentBid.toLocaleString()}
                    </p>
                  </div>
                  <div
                    class="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all"
                  >
                    →
                  </div>
                </div>
              </div>
            </div>
          </a>
        {/each}
      </div>

      <div class="text-center mt-12">
        <a
          href="/auctions"
          class="inline-block font-koulen tracking-wider px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105"
        >
          View All Auctions
        </a>
      </div>
    </div>
  </section>

  <!-- How It Works -->
  <section class="py-20 px-4 sm:px-6 lg:px-8 bg-muted/50">
    <div class="max-w-7xl mx-auto">
      <h2
        class="text-4xl md:text-5xl font-bold text-foreground text-center mb-16"
      >
        How It Works
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        {#each [{ num: "01", title: "Browse", desc: "Explore our curated collection of rare and collectible books" }, { num: "02", title: "Bid", desc: "Place your bid and compete with collectors worldwide" }, { num: "03", title: "Win", desc: "Secure your treasure with the highest bid" }, { num: "04", title: "Receive", desc: "Get your book safely shipped to your door" }] as step (step.num)}
          <div class="text-center">
            <div class="text-5xl font-bold text-primary/30 mb-4 font-koulen">
              {step.num}
            </div>
            <h3 class="text-xl font-semibold text-foreground mb-2">
              {step.title}
            </h3>
            <p class="text-muted-foreground">{step.desc}</p>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- CTA Section -->
  <section
    class="py-16 px-4 sm:px-6 lg:px-8 bg-primary text-primary-foreground"
  >
    <div class="max-w-2xl mx-auto text-center">
      <h2 class="text-3xl md:text-4xl font-bold mb-4">
        Ready to Start Collecting?
      </h2>
      <p class="text-lg opacity-90 mb-8">
        Sign up today and get access to exclusive auctions and rare finds.
      </p>
      <div
        class="flex gap-4 items-center justify-center flex-wrap font-koulen tracking-wider"
      >
        <a
          href="/auth/signup"
          class="px-6 py-2 bg-primary-foreground text-primary rounded-lg hover:shadow-lg transition-all"
        >
          Create Account
        </a>
        <a
          href="/auctions"
          class="px-6 py-2 border-2 border-primary-foreground rounded-lg hover:bg-primary-foreground/10 transition-all"
        >
          Browse Auctions
        </a>
      </div>
    </div>
  </section>
</div>
