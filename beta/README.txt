ENGENIX multi-page website

Pages:
- index.html
- platform.html
- compliance.html
- security.html
- company.html
- demo.html

Private demo form:
The included Cloudflare Pages Function is at functions/api/demo-request.js and sends requests using Resend.
Set these Cloudflare environment variables before production use:
- RESEND_API_KEY
- DEMO_TO_EMAIL (where leads should arrive)
- DEMO_FROM_EMAIL (optional, e.g. ENGENIX Website <demo@engenix.co>)

Your sending domain must be verified in Resend. Until configured, the form displays a direct email fallback.
