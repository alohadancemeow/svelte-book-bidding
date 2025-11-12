<script lang="ts">
  import { page } from "$app/state";
  import HeaderSection from "../shared/Header.svelte";
  import FormField from "../shared/FormField.svelte";
  import Unauthentication from "../shared/Unauthentication.svelte";
</script>

<svelte:head>
  <title>Create New Auction - Book Bidding</title>
</svelte:head>

{#if !page.data.sessionId}
  <Unauthentication />
{:else}
  <div class="bg-background">
    <!-- Header -->
    <HeaderSection
      title="Create New Auction"
      description="Create a new auction to start a bid on a book."
    />

    <!-- Main Content -->
    <div>
      <div class="p-8 w-full overflow-auto">
        <FormField mode="create" />
      </div>
    </div>
  </div>
{/if}
