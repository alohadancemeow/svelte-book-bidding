<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import {
    Button,
    Datepicker,
    Dropzone,
    Heading,
    Label,
    Modal,
    P,
    Timepicker,
    type DateOrRange,
  } from "flowbite-svelte";
  import { ClockSolid } from "flowbite-svelte-icons";

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

  const CONDITIONS = ["Excellent", "Good", "Fine"];

  let open = $state(false);
  let modalSelectedDate = $state(new Date());
  let modalTimeSelection = $state({ time: "10:00", endTime: "11:00" });

  let formData = $state({
    title: "",
    author: "",
    description: "",
    startingPrice: 0,
    endDate: "",
    condition: CONDITIONS[1],
    pages: 0,
    yearPublished: 2000,
  });

  const timeIntervals = [
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "12:00",
    "12:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
  ];

  //   function resetForm() {
  //     formData = {
  //       title: "",
  //       author: "",
  //       startingPrice: 0,
  //       description: "",
  //       endDate: "",
  //     };
  //     selectedDate = new Date();
  //     selectedInlineTime = { time: "12:00" };
  //     // editingAuction = null;
  //     // showCreateModal = false;
  //   }

  //   function handleCreateAuction() {
  //     if (!formData.title || !formData.author || formData.startingPrice <= 0) {
  //       alert("Please fill in all required fields");
  //       return;
  //     }

  //     if (!formData.endDate || !selectedInlineTime.time) {
  //       alert("Please select an end date and time");
  //       return;
  //     }

  //     if (editingAuction) {
  //       // Update existing
  //       auctions = auctions.map((a) => {
  //         if (a.id === editingAuction!.id) {
  //           return {
  //             ...a,
  //             title: formData.title,
  //             author: formData.author,
  //             startingPrice: formData.startingPrice,
  //             endDate: formData.endDate,
  //           };
  //         }
  //         return a;
  //       });
  //     } else {
  //       // Create new
  //       const newAuction: Auction = {
  //         id: String(Math.max(...auctions.map((a) => parseInt(a.id)), 0) + 1),
  //         title: formData.title,
  //         author: formData.author,
  //         description: formData.description,
  //         startingPrice: formData.startingPrice,
  //         currentPrice: formData.startingPrice,
  //         status: "active",
  //         bidsCount: 0,
  //         endDate: formData.endDate,
  //       };
  //       auctions = [newAuction, ...auctions];
  //     }
  //     resetForm();
  //   }

  let filesInDropzone: FileList | null = $state(null);

  function handleOnChange(event: Event) {
    console.log("handleOnChange fired.");
    const target = event.target as HTMLInputElement;
    filesInDropzone = target.files;
  }

  function handleOnDrop(event: DragEvent) {
    console.log("handleOnDrop fired.");
    event.preventDefault();
    filesInDropzone = event.dataTransfer?.files ?? null;
  }

  function showFiles(files: FileList | null): string {
    console.log("showFiles fired.");
    if (!files || files.length === 0) return "No files selected.";
    return Array.from(files)
      .map((file) => file.name)
      .join(", ");
  }

  function handleModalDateSelect(selectedDate: DateOrRange): void {
    if (selectedDate instanceof Date) {
      modalSelectedDate = selectedDate;
    } else if (selectedDate && typeof selectedDate === "object") {
      // Handle range case if needed
      if (selectedDate.from) {
        modalSelectedDate = selectedDate.from;
      }
    }
  }

  function handleModalTimeSelect(data?: {
    time: string;
    endTime: string;
    [key: string]: string;
  }): void {
    if (data) {
      modalTimeSelection = {
        time: data.time,
        endTime: data.endTime,
      };
    }
  }

  function handleSave(): void {
    open = false;
  }
</script>

<svelte:head>
  <title>Create New Auction - Book Bidding</title>
</svelte:head>

{#if !page.data.sessionId}
  <div class="min-h-screen flex items-center justify-center bg-background">
    <div class="text-center">
      <h1 class="text-2xl font-bold text-foreground mb-4">
        Admin Access Required
      </h1>
      <p class="text-muted-foreground mb-6">
        Please sign in to access the create new auction page.
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
            <h1 class="text-4xl font-bold text-foreground">
              Create New Auction
            </h1>
            <p class="text-muted-foreground mt-2">
              Create a new auction to start a bid on a book.
            </p>
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

    <!-- Main Content -->
    <div>
      <div class="p-8 w-full overflow-auto">
        <form
          onsubmit={(e) => {
            e.preventDefault();
            // handleCreateAuction();
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
              required
              type="text"
              id="title"
              placeholder="Book title"
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
              placeholder="Book author"
              bind:value={formData.author}
              class="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label
              for="description"
              class="block text-sm font-medium text-foreground mb-1"
            >
              Description *
            </label>
            <textarea
              required
              id="description"
              placeholder="Book description"
              bind:value={formData.description}
              class="w-full h-24 px-4 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            ></textarea>
          </div>
          <div class="flex gap-4 items-center justify-between w-full flex-wrap">
            <div>
              <label
                for="condition"
                class="block text-sm font-medium text-foreground mb-1"
              >
                Condition *
              </label>
              <select
                id="condition"
                required
                bind:value={formData.condition}
                class="w-full px-8 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {#each CONDITIONS as condition}
                  <option value={condition}>{condition}</option>
                {/each}
              </select>
            </div>
            <div>
              <label
                for="pages"
                class="block text-sm font-medium text-foreground mb-1"
              >
                Pages *
              </label>
              <input
                required
                type="number"
                id="pages"
                placeholder="Number of pages"
                bind:value={formData.pages}
                class="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label
                for="yearPublished"
                class="block text-sm font-medium text-foreground mb-1"
              >
                Year Published *
              </label>
              <input
                required
                type="number"
                id="yearPublished"
                placeholder="Year published"
                bind:value={formData.yearPublished}
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
                required
                type="number"
                id="startingPrice"
                bind:value={formData.startingPrice}
                min="0"
                step="50"
                class="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {@render imageDropzone()}

          <div class="flex gap-4 items-center w-full">
            <Button class="cursor-pointer" onclick={() => (open = true)}>
              <ClockSolid class="me-2 h-4 w-4" />
              Set Auction End Time
            </Button>

            {#if modalTimeSelection}
              <P>
                Auction end time set for
                <span class="font-semibold">
                  {modalSelectedDate.toDateString()} at {modalTimeSelection.time}
                </span>
              </P>
            {/if}
          </div>

          {@render modal()}

          <div class="flex gap-3 pt-4">
            <button
              type="submit"
              class="flex-1 cursor-pointer px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition font-medium"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
{/if}

<!-- Modal for setting auction end time -->
{#snippet modal()}
  <Modal bind:open class="w-full max-w-sm">
    {#snippet header()}
      <Heading
        tag="h5"
        class="flex mx-auto font-medium text-gray-900 dark:text-white font-koulen"
      >
        Set Auction End Time
      </Heading>
    {/snippet}
    <div class="p-4 sm:p-5">
      <div class="mb-4">
        <Label class="mb-2 block">Pick date</Label>
        <Datepicker
          bind:value={modalSelectedDate}
          onselect={handleModalDateSelect}
          inline
          class="mx-auto [&_div>button]:bg-gray-50 [&>div>div]:bg-gray-50 [&>div>div]:shadow-none"
        />
      </div>
      <div class="mb-4">
        <Label class="mb-2 block">Pick time</Label>
        <Timepicker
          type="inline-buttons"
          value={modalTimeSelection.time}
          {timeIntervals}
          onselect={handleModalTimeSelect}
          columns={3}
        />
      </div>
      <div class="flex items-center space-x-4">
        <Button color="primary" class="w-full" onclick={handleSave}>Save</Button
        >
        <Button
          color="alternative"
          class="w-full"
          onclick={() => (open = false)}>Discard</Button
        >
      </div>
    </div>
  </Modal>
{/snippet}

<!-- Snippet for image dropzone -->
{#snippet imageDropzone()}
  <Dropzone
    required
    id="my-awesome-dropzone"
    bind:files={filesInDropzone}
    onChange={handleOnChange}
    onDrop={handleOnDrop}
    multiple
    accept=".jpg,.png,.gif"
  >
    <svg
      aria-hidden="true"
      class="mb-3 h-10 w-10 text-gray-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
      />
    </svg>

    {#if !filesInDropzone || filesInDropzone.length === 0}
      <p class="mb-2 text-sm text-gray-500 dark:text-gray-400">
        <span class="font-semibold">Click to upload</span>
        or drag and drop
      </p>
      <p class="text-xs text-gray-500 dark:text-gray-400">
        SVG, PNG, JPG or GIF (MAX. 800x400px)
      </p>
    {:else}
      <p class="text-sm text-green-600">{showFiles(filesInDropzone)}</p>
      <button
        class="mt-2 text-sm text-red-500 hover:underline"
        onclick={() => (filesInDropzone = null)}>Clear Files</button
      >
    {/if}
  </Dropzone>
{/snippet}
