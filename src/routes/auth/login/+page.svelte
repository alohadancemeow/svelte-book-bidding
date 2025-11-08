<script lang="ts">
  import AuthForm from "$lib/components/auth-form.svelte";
</script>

<svelte:head>
  <title>Sign In - Book Bidding</title>
</svelte:head>

<div
  class="min-h-screen bg-linear-to-b from-primary/10 to-background flex items-center justify-center px-4"
>
  <div class="w-full max-w-md">
    <div class="bg-card border border-border rounded-lg p-8 shadow-lg">
      <div class="text-center mb-8">
        <div
          class="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4"
        >
          <span class="text-primary-foreground font-bold text-xl">📚</span>
        </div>
        <h1 class="text-3xl font-bold text-foreground mb-2">Sign In</h1>
        <p class="text-muted-foreground">Welcome back to Book Bidding</p>
      </div>

      <AuthForm mode="login" />

      <div class="mt-6 text-center">
        <p class="text-muted-foreground text-sm">
          Don't have an account?
          <a
            href="/auth/signup"
            class="text-primary hover:text-accent font-medium">Create one</a
          >
        </p>
      </div>
    </div>
  </div>
</div>
