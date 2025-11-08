<script lang="ts">
  //   import { auth } from "$lib/stores/auth";
  let auth = $state({
    isAuthenticated: false,
    user: {
      username: null,
      avatar: null,
    },
    logout: () => {},
    login: async () => {},
  });

  let { mode = "login" } = $props<{ mode?: "login" | "signup" }>();

  let email = $state("");
  let password = $state("");
  let username = $state("");
  let loading = $state(false);
  let error = $state("");
  let success = $state("");

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    error = "";
    success = "";
    loading = true;

    // try {
    //   if (mode === "login") {
    //     if (!email || !password) {
    //       error = "Please fill in all fields";
    //       return;
    //     }
    //     const result = await auth.login({ email, password });
    //     if (result.success) {
    //       success = "Login successful! Redirecting...";
    //       setTimeout(() => {
    //         window.location.href = "/";
    //       }, 1000);
    //     } else {
    //       error = result.error || "Login failed";
    //     }
    //   } else {
    //     if (!email || !password || !username) {
    //       error = "Please fill in all fields";
    //       return;
    //     }
    //     if (username.length < 3) {
    //       error = "Username must be at least 3 characters";
    //       return;
    //     }
    //     const result = await auth.signup(email, username, password);
    //     if (result.success) {
    //       success = "Signup successful! Redirecting...";
    //       setTimeout(() => {
    //         window.location.href = "/";
    //       }, 1000);
    //     } else {
    //       error = result.error || "Signup failed";
    //     }
    //   }
    // } finally {
    //   loading = false;
    // }
  }
</script>

<form onsubmit={handleSubmit} class="space-y-4">
  {#if mode === "signup"}
    <div>
      <label
        for="username"
        class="block text-sm font-medium text-foreground mb-1"
      >
        Username
      </label>
      <input
        type="text"
        id="username"
        bind:value={username}
        placeholder="Choose a username"
        class="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
      />
    </div>
  {/if}

  <div>
    <label for="email" class="block text-sm font-medium text-foreground mb-1">
      Email
    </label>
    <input
      type="email"
      id="email"
      bind:value={email}
      placeholder="your@email.com"
      class="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
    />
  </div>

  <div>
    <label
      for="password"
      class="block text-sm font-medium text-foreground mb-1"
    >
      Password
    </label>
    <input
      type="password"
      id="password"
      bind:value={password}
      placeholder="Enter your password"
      class="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
    />
  </div>

  {#if error}
    <div class="p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
      <p class="text-sm text-destructive">{error}</p>
    </div>
  {/if}

  {#if success}
    <div
      class="p-3 bg-green-100 border border-green-300 rounded-lg dark:bg-green-900 dark:border-green-700"
    >
      <p class="text-sm text-green-800 dark:text-green-200">{success}</p>
    </div>
  {/if}

  <button
    type="submit"
    disabled={loading}
    class="w-full bg-primary text-primary-foreground py-2 rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition"
  >
    {loading ? "Loading..." : mode === "login" ? "Sign In" : "Create Account"}
  </button>
</form>
