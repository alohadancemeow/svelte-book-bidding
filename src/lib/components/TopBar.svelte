<script lang="ts">
	import { page } from '$app/stores';
	import Icon from './Icon.svelte';

	let { session, user } = $props<{
		session: any;
		user: any;
	}>();

	let mobileMenuOpen = $state(false);

	const navLinks = [
		{ href: '/', label: 'Browse' },
		{ href: '/auctions', label: 'Live Auctions' },
		{ href: '/auctions', label: 'Collections' }
	];

	function isActive(href: string, exact = false) {
		const path = $page.url.pathname;
		if (exact) return path === href;
		return path.startsWith(href);
	}
</script>

<header class="bg-surface/80 backdrop-blur-md shadow-sm dark:shadow-none docked full-width top-0 sticky z-50 border-b border-outline-variant/15">
	<div class="flex justify-between items-center w-full px-8 py-4 max-w-screen-2xl mx-auto">
		<div class="md:hidden">
			<a href="/" class="text-2xl font-black font-headline text-primary uppercase tracking-tighter">
				Book Bidding
			</a>
		</div>
		<nav class="hidden md:flex gap-8 items-center">
			{#each navLinks as link}
				<a
					href={link.href}
					class="font-headline font-bold tracking-tight transition-all duration-300 hover:opacity-80
						{isActive(link.href) ? 'text-secondary border-b-2 border-secondary' : 'text-on-surface-variant hover:text-primary'}"
				>
					{link.label}
				</a>
			{/each}
		</nav>
		<div class="flex items-center gap-6">
			<div class="hidden lg:flex items-center bg-surface-container-high px-4 py-2 rounded-lg gap-2">
				<Icon icon="search" class="text-outline text-sm" />
				<input
					class="bg-transparent border-none focus:ring-0 text-sm font-label w-48"
					placeholder="Search archives..."
					type="search"
				/>
			</div>
			<div class="flex items-center gap-4">
				<button class="text-on-surface-variant hover:text-primary transition-colors">
					<Icon icon="notifications" />
				</button>
				{#if user}
					<a href="/dashboard" class="text-on-surface-variant hover:text-primary transition-colors">
						<Icon icon="account_circle" />
					</a>
				{:else}
					<a href="/auth/login" class="text-on-surface-variant hover:text-primary transition-colors">
						<Icon icon="account_circle" />
					</a>
				{/if}
				<a
					href="/auctions"
					class="bg-secondary text-on-secondary px-6 py-2 text-sm font-headline font-bold rounded-md scale-95 active:duration-75 transition-all hover:opacity-90"
				>
					Place Bid
				</a>
			</div>
		</div>
	</div>
	<div class="bg-surface-container-low dark:bg-surface-container h-[1px]"></div>
</header>