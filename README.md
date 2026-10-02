# Tryb3 Objects

Tryb3 is an HNG15 Lesson 2 individual shop: a small, editorial storefront for useful everyday objects. It includes a product catalogue, a local cart, Google sign-in, a protected checkout, persistent orders in Supabase, order history, and Mailgun confirmation emails.

## Stack

- React, TypeScript, Vite, Tailwind CSS, React Router
- Supabase Auth and PostgreSQL
- Supabase Edge Functions and Mailgun
- Vercel deployment

## Run locally

1. Install the dependencies:

   ```bash
   npm install
   ```

2. Create a Supabase project and copy `.env.example` to `.env.local`. Set:

   ```dotenv
   VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
   ```

   Only the Supabase project URL and publishable key belong in browser environment variables. Never put a service-role key, OAuth client secret, or Mailgun key in frontend code.

3. Run `supabase/schema.sql` in the Supabase SQL Editor. It creates the products, orders, order items, RLS policies, the atomic `create_order` function, and inserts any missing sample products. It is safe to re-run: existing product rows are not overwritten.

4. Configure email/password authentication in Supabase under **Authentication → Providers → Email**. Keep email/password enabled. Set the Site URL to your local or deployed origin, and allow these Redirect URLs:
   - `http://localhost:5173/login`
   - `https://YOUR_DEPLOYED_DOMAIN/login`

   Customers can create an account from the Tryb3 sign-in page. If email confirmations are enabled, they must confirm the signup message before they can sign in. Supabase's default email sender is rate-limited for testing; configure custom SMTP in Supabase before production signup traffic.

5. Configure Google sign-in (optional alternative to email/password):
   - In Google Cloud Console, create an OAuth client and add `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback` as an authorized redirect URI.
   - In Supabase, enable Google under **Authentication → Providers → Google** and enter the Google client ID and client secret there. Save the settings and ensure the provider toggle is enabled.

   The OAuth client secret remains in Supabase and is never exposed to the browser.

6. Configure Mailgun confirmation delivery:
   - In Mailgun, add and verify a sending domain. Publish the DNS records Mailgun provides (typically SPF, DKIM, and tracking CNAME) at your domain registrar and wait for verification.
   - Use a sender address on that verified domain, for example `Tryb3 Orders <orders@mg.yourdomain.com>`. On a Mailgun sandbox domain, only Mailgun-authorized recipient addresses can receive test messages.
   - Create or copy a **private API key** from Mailgun. Never put it in `.env.local`, Vercel frontend variables, source code, Git, or chat. Only set it as a Supabase Edge Function secret.
   - Install the Supabase CLI, run `supabase login`, and link the project with `supabase link --project-ref YOUR_PROJECT_REF`.
   - Set the function secrets (replace the examples locally; do not commit them):

     ```bash
     supabase secrets set MAILGUN_API_KEY=YOUR_PRIVATE_MAILGUN_API_KEY MAILGUN_DOMAIN=YOUR_VERIFIED_MAILGUN_DOMAIN MAILGUN_FROM="Tryb3 Orders <orders@YOUR_VERIFIED_MAILGUN_DOMAIN>" MAILGUN_API_BASE_URL=https://api.mailgun.net
     ```

     For Mailgun EU, use `MAILGUN_API_BASE_URL=https://api.eu.mailgun.net` instead.
   - Deploy the function:

     ```bash
     supabase functions deploy send-confirmation
     ```

   The function reads `SUPABASE_URL` and `SUPABASE_ANON_KEY` from the Supabase runtime, verifies the caller's JWT and order ownership, then sends through Mailgun. It does not need the service-role key.

7. Start Vite:

   ```bash
   npm run dev
   ```

## Order integrity

Checkout sends product IDs and quantities only. The `create_order` PostgreSQL function obtains the signed-in user from the auth context, reads current database prices and stock, calculates the total, decrements stock, and creates the order and its items in one transaction. RLS remains enabled; customers can only read their own orders and order items. No payment processing is implemented.

After the database confirms an order, the browser invokes `send-confirmation`. The Edge Function verifies the user's access to that order and sends its confirmation through Mailgun. If email delivery is unavailable, the order remains saved and the success page tells the customer the email could not be sent.

## Checks and deploy

```bash
npm run lint
npm run build
```

For Vercel, set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in the project's environment settings, then deploy the Vite app. Keep Mailgun secrets in Supabase Edge Function secrets, not Vercel's browser-exposed variables.
