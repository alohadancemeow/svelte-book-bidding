<script lang="ts">
  import { goto } from "$app/navigation";

  let { title, description } = $props();
</script>

<div
  class="bg-linear-to-r from-primary/10 to-accent/10 border-b border-border py-8"
>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-4xl font-bold text-foreground">{title}</h1>
        <p class="text-muted-foreground mt-2">{description}</p>
      </div>
      <button
        onclick={() => goto("/dashboard")}
        class="px-6 py-2 cursor-pointer bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition font-medium"
      >
        Back to Dashboard
      </button>
    </div>
  </div>
</div>
