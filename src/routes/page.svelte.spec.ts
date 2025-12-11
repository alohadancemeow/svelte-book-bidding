import { page } from '@vitest/browser/context';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Page from './+page.svelte';

describe('/+page.svelte', () => {
	// Renders the home page component with minimal props and ensures the
	// top-level heading (h1) is present in the DOM.
	it('should render h1', async () => {
		render(Page, { props: { data: { books: [], transactionCount: 0, userCount: 0 } } });
		
		const heading = page.getByRole('heading', { level: 1 });
		await expect.element(heading).toBeInTheDocument();
	});
});
