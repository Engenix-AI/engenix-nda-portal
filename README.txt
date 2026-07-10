ENGENIX STATIC WEBSITE

DEPLOY
Upload the contents of this folder to the existing Cloudflare Pages project.
Do not upload the outer "engenix-site" folder itself unless Cloudflare is configured to use it as the build output directory.

FILES
index.html            New public sales homepage
nda.html              Preserved NDA portal
ingenix-logo.jpeg     Logo used by the NDA page
_headers              Cloudflare response security headers
robots.txt            Search crawler instructions
sitemap.xml           Basic sitemap for ENGENIX.co

DEMO EMAIL
The demo form opens the visitor's email application and sends to:
sales@engenix.co

To change it, open index.html and edit this line near the bottom:
salesEmail: 'sales@engenix.co'

No build command or framework is required.
