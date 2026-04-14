import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Page from './+page.svelte';

describe('/+page.svelte', () => {
	it('should render h1', async () => {
		// Using type assertion to bypass strict type checking for test setup
		const result = render(Page as any, {
			props: {}
		});
		
		const heading = result.getByRole('heading', { level: 1 });
		await expect.element(heading).toBeInTheDocument();
	});
});