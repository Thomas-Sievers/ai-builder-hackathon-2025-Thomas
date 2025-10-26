# Environment Variables Setup for Vercel

## Required Environment Variables

You need to set up these environment variables in Vercel for the app to work:

### 1. Supabase Configuration (REQUIRED)
```bash
# Add these using: npx vercel env add
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 2. App Configuration
```bash
NEXT_PUBLIC_APP_URL=https://esports-connect.vercel.app
```

## How to Add Environment Variables

Run these commands one by one:

```bash
# 1. Add Supabase URL
npx vercel env add NEXT_PUBLIC_SUPABASE_URL

# 2. Add Supabase Anon Key
npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY

# 3. Add Supabase Service Role Key
npx vercel env add SUPABASE_SERVICE_ROLE_KEY

# 4. Add App URL
npx vercel env add NEXT_PUBLIC_APP_URL
```

For each command:
1. Select "Production" environment
2. Enter the value when prompted
3. Repeat for Preview and Development if needed

## After Setting Environment Variables

Once you've added all the environment variables, redeploy:

```bash
npx vercel --prod
```

## Getting Your Supabase Values

1. Go to your Supabase project dashboard
2. Go to Settings > API
3. Copy the values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

## Optional Environment Variables

You can also add these for additional features:

```bash
# OAuth Providers (optional)
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Stripe (for premium features - optional)
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
```

## Verification

After deployment, you can verify the environment variables are set:

```bash
npx vercel env ls
```

This should show all the environment variables you've added.
