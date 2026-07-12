ENGENIX — PRODUCT REVEAL + CONVERSION SYSTEM

Included
- Custom ENGENIX editorial SVG library:
  - assets/showroom-dawn.svg
  - assets/finance-desk.svg
  - assets/service-lane.svg
  - assets/product-reveal.svg
- New cinematic dealership story chapter
- New product reveal chapter
- Real demo submission endpoint
- Supabase lead storage
- CTA and conversion event tracking
- Spam honeypot and server-side validation
- Success confirmation state
- Mobile-first image and layout behavior

Cloudflare Pages environment variables
Add these under Settings → Environment variables:

SUPABASE_URL
https://YOUR_PROJECT.supabase.co

SUPABASE_SERVICE_ROLE_KEY
Your Supabase service role key. Keep this secret and never place it in index.html.

Supabase setup
Run supabase/schema.sql in the Supabase SQL editor.

Deployment
1. Upload the CONTENTS of this folder to the repository root.
2. Commit and push to the branch Cloudflare deploys.
3. Confirm the Cloudflare environment variables are configured.
4. Submit one test demo request.
5. Confirm the row appears in public.demo_requests.
6. Click several demo CTAs and confirm events appear in public.site_events.

Security
- The service role key is used only inside Cloudflare Pages Functions.
- Public browser code never receives the service role key.
- Row Level Security blocks public direct table access.
