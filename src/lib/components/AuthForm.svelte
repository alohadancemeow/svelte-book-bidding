<script lang="ts">
  import { goto } from "$app/navigation";
  import { authClient } from "$lib/auth-client";

  let email = $state("");
  let password = $state("");
  let loading = $state(false);
  let error = $state("");
  let success = $state("");

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    error = "";
    success = "";
    loading = true;

    try {
      if (!email || !password) {
        error = "Please fill in all fields";
        return;
      }

      await authClient.signIn.email(
        {
          email,
          password,
        },
        {
          onSuccess: () => {
            success = "Login successful! Redirecting...";
            goto("/", { invalidateAll: true });
          },
          onError: (err) => {
            error = err.error.message || "Login failed";
          },
        }
      );
    } catch (e) {
      error = "Login failed, Please check your email and password";
    } finally {
      loading = false;
    }
  };
</script>

<form onsubmit={handleSubmit} class="space-y-5">
  {#if error}
    <div class="p-4 bg-red-100 border border-red-300 rounded-lg dark:bg-red-900/30 dark:border-red-700">
      <p class="text-sm text-red-800 dark:text-red-200">{error}</p>
    </div>
  {/if}

  <div>
    <label for="email" class="block text-sm font-medium text-on-surface mb-2">
      Email
    </label>
    <input
      required
      type="email"
      id="email"
      bind:value={email}
      placeholder="your@email.com"
      class="w-full px-4 py-3 border border-outline/30 rounded-lg bg-surface-container-lowest text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
    />
  </div>

  <div>
    <label
      for="password"
      class="block text-sm font-medium text-on-surface mb-2"
    >
      Password
    </label>
    <input
      required
      type="password"
      id="password"
      bind:value={password}
      placeholder="Enter your password"
      class="w-full px-4 py-3 border border-outline/30 rounded-lg bg-surface-container-lowest text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
    />
  </div>

  {#if success}
    <div class="p-4 bg-green-100 border border-green-300 rounded-lg dark:bg-green-900/30 dark:border-green-700">
      <p class="text-sm text-green-800 dark:text-green-200">{success}</p>
    </div>
  {/if}

  <button
    type="submit"
    disabled={loading}
    class="w-full mt-2 cursor-pointer bg-primary text-on-primary py-3 rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition"
  >
    {loading ? "Signing in..." : "Sign In"}
  </button>
</form>