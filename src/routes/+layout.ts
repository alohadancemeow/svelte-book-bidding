import { browser } from '$app/environment'
import type { LayoutLoad } from './$types'
import { authClient } from '$lib/auth-client'

export const prerender = false;

export const load: LayoutLoad = async ({ }) => {
    // Only get session on client side to prevent server-side fetch issues
    let sessionId = null;
    let user = null;

    if (browser) {
        try {
            const session = await authClient.getSession();
            sessionId = session?.data?.session?.id || null;
            user = session?.data?.user || null;
        } catch (error) {
            console.warn('Failed to get session:', error);
            sessionId = null;
            user = null;
        }
    }

    return { sessionId, user }
}