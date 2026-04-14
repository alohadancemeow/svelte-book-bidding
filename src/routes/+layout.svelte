<script lang="ts">
	import '../app.css';
	import type { Snippet } from 'svelte';
	import { authClient } from '$lib/auth-client';
	import { goto } from '$app/navigation';
	import { FALLBACK_IMAGE } from './dashboard/shared/constants';
	import TopBar from '$lib/components/TopBar.svelte';
	import AppFooter from '$lib/components/AppFooter.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import Icon from '$lib/components/Icon.svelte';

	interface Props {
		children: Snippet;
		data: {
			user: any;
			sessionId: string | null;
		};
	}

	let { children, data }: Props = $props();
	let termsOpen = $state(false);

	const siteName = 'Book Bidding';
	const siteDesc = 'Premium book auction platform for collectors.';
</script>

<svelte:head>
	<link rel="canonical" href="https://bookbidding.com" />
	<meta name="robots" content="index,follow" />
	<meta name="description" content={siteDesc} />
	<meta property="og:type" content="website" />
	<meta property="og:title" content={siteName} />
	<meta property="og:description" content={siteDesc} />
	<meta property="og:image" content={FALLBACK_IMAGE} />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={siteName} />
	<meta name="twitter:description" content={siteDesc} />
	<meta name="twitter:image" content={FALLBACK_IMAGE} />
</svelte:head>

<div class="min-h-screen flex flex-col bg-background">
	<TopBar session={data.sessionId} user={data.user} />
	<main class="flex-1">
		{@render children()}
	</main>
	<AppFooter />

	<Modal bind:open={termsOpen} title="Terms of Service">
		<p class="text-on-surface-variant font-body leading-relaxed">
			By using Book Bidding you agree to bid honestly, pay for won items, and follow all auction rules.
			We may suspend accounts for violations. We are not liable for listing errors or disputes between users.
			Use at your own risk.
		</p>

		{#snippet footer()}
			<button
				class="px-6 py-2 bg-secondary text-on-secondary font-headline font-bold rounded-md hover:opacity-90 transition cursor-pointer"
				onclick={() => (termsOpen = false)}
			>
				I accept
			</button>
			<button
				class="px-6 py-2 bg-surface-container-high text-on-surface font-body font-medium rounded-md hover:bg-surface-container-highest transition cursor-pointer"
				onclick={() => (termsOpen = false)}
			>
				Decline
			</button>
		{/snippet}
	</Modal>
</div>