# Axoli

Axoli is a Next.js study app that turns notes, PDFs, and videos into flashcards, summaries, and quizzes — with a study pet, coins, and groups to keep you consistent.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create your env file:

```bash
cp .env.example .env.local
```

3. Fill in `.env.local` with your Supabase, Stripe, and API keys.

4. Run the app:

```bash
npm run dev
```

Open http://localhost:3000

## Environment variables

- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- ANTHROPIC_API_KEY
- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET
- STRIPE_PREMIUM_MONTHLY_PRICE_ID
- STRIPE_PREMIUM_YEARLY_PRICE_ID
- STRIPE_COINS_50_PRICE_ID
- STRIPE_COINS_150_PRICE_ID
- STRIPE_COINS_400_PRICE_ID
- STRIPE_COINS_1000_PRICE_ID
- NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
- YOUTUBE_API_KEY
- NEXT_PUBLIC_APP_URL

## Run locally

```bash
npm run dev
```

## Lint and typecheck

```bash
npm run lint
npm run typecheck
```

## Deploy to Vercel

1. Push this repo to GitHub.
2. Import it in Vercel.
3. Add the environment variables from `.env.example` in the Vercel project settings.
4. Set `NEXT_PUBLIC_APP_URL` to your production URL (for example `https://your-app.vercel.app`).
5. In Stripe, set your webhook endpoint to:
   - `https://your-domain.com/api/stripe/webhook`
