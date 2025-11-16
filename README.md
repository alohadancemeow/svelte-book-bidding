# Book Bidding (SvelteKit)

A simple auction platform built with SvelteKit 5. Users can create book auctions, upload cover images, and place real-time bids.

## Stack
- SvelteKit 5, Svelte Runes
- Better Auth with Drizzle adapter (LibSQL/Turso)
- Supabase Storage for images
- Flowbite Svelte UI
- Tailwind v4
- Vitest for tests

## Features
- Email/password authentication
- Create/edit auctions with image upload
- Real-time bid updates via Server-Sent Events

## Setup
```sh
# install
npm install

# dev
npm run dev

# type check
npm run check

# tests
npm run test

# build & preview
npm run build && npm run preview
```

## Environment
Set these in `.env` (private) or `.env.local`:
- `BETTER_AUTH_SECRET`: long random secret
- `BETTER_AUTH_URL`: app base URL (e.g. http://localhost:5173)
- `DATABASE_URL`: Turso/LibSQL URL
- `DATABASE_AUTH_TOKEN`: Turso auth token
- `PUBLIC_SUPABASE_URL`: Supabase project URL
- `PUBLIC_SUPABASE_PUBLISHABLE_KEY`: Supabase anon key
- Optional for email: `RESEND_API_KEY`, `EMAIL_FROM`

## Database
Drizzle with LibSQL/Turso.
```sh
npm run db:generate   # generate SQL
npm run db:migrate    # apply migrations
npm run db:studio     # inspect
```
Schema is in `src/lib/server/db/schema.ts`.

## Auth & Cookies
`src/lib/auth.ts` configures Better Auth with `sveltekitCookies(getRequestEvent)`. `src/hooks.server.ts` mounts the handler and populates `event.locals.user`/`session`. Client uses `src/lib/auth-client.ts`.

## Email Verification
- Server: `emailVerification.sendVerificationEmail` sends the verification link using your `sendEmail` utility.
- Client: trigger via
```ts
await authClient.sendVerificationEmail({
  email: userEmail,
  callbackURL: "/"
});
```
- Clicking the link verifies the email and redirects to `callbackURL`; invalid tokens redirect with `?error=invalid_token`.
- To require verification on login, enable:
  - `emailAndPassword.requireEmailVerification: true`
  - `emailVerification.sendOnSignIn: true`

## Image Upload
Images are uploaded to Supabase. Preview shows the selected file; if none selected, it shows the existing stored image via a public URL.

## Realtime Bids
SSE endpoint at `routes/api/realtime/bids` streams bid updates. Client store in `src/lib/stores/realtime.ts` handles connection and broadcasts.

## Deployment
- Set `BETTER_AUTH_URL` to your domain.
- Choose and configure a SvelteKit adapter for your target.
- Ensure env vars are set on the host.
