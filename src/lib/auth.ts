import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./server/db";
import { getRequestEvent } from "$app/server";
import { sveltekitCookies } from "better-auth/svelte-kit";
import { env } from "$env/dynamic/private";
import { PUBLIC_BASE_URL, PUBLIC_FRONTEND_URL } from "$env/static/public";
import { dev } from "$app/environment";

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "sqlite", // or "mysql", "sqlite"
    }),

    // Configure base URL for dev vs production
    baseURL: dev ? (PUBLIC_BASE_URL || env.BETTER_AUTH_URL) : PUBLIC_FRONTEND_URL,

    // Add trusted origins for dev and production
    trustedOrigins: [
        dev ? (PUBLIC_BASE_URL || env.BETTER_AUTH_URL) : PUBLIC_FRONTEND_URL,
        PUBLIC_BASE_URL,
        PUBLIC_FRONTEND_URL,
    ].filter(Boolean),

    emailAndPassword: {
        enabled: true,
    },
    socialProviders: {
        google: {
            prompt: "select_account",
            clientId: env.GOOGLE_CLIENT_ID as string,
            clientSecret: env.GOOGLE_CLIENT_SECRET as string,
        },

        github: {
            clientId: env.GITHUB_CLIENT_ID as string,
            clientSecret: env.GITHUB_CLIENT_SECRET as string,
        },
    },

    // Configure secret for session security
    secret: env.BETTER_AUTH_SECRET,

    plugins: [sveltekitCookies(getRequestEvent)], // make sure this is the last plugin in the array
});
