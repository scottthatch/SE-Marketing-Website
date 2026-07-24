# True Partner Tech Website

The static marketing website for **True Partner Tech**, a public brand of **SE Marketing Consulting LLC**. The canonical production URL is `https://truepartnertech.com`.

## Architecture

- Static HTML routes: `/`, `/pricing.html`, `/preview.html`, `/privacy.html`, `/terms.html`
- Shared CSS and dependency-free browser JavaScript
- Cloudflare Pages Function at `/api/contact`
- Node's built-in test runner and repository validation scripts

## Local development

Requires Python for the convenience server and Node.js 20 or newer for checks.

```bash
npm start
npm run check
```

Static pages work locally. The contact form requires the Cloudflare Pages runtime and configured email variables; use a Cloudflare preview to test delivery.

## Contact-form configuration

The form delivers through Resend and requires:

- `RESEND_API_KEY` (secret)
- `CONTACT_TO_EMAIL` (normally `hello@truepartnertech.com`)
- `CONTACT_FROM_EMAIL` (a sender on a verified domain)

See [`docs/cloudflare-deployment.md`](docs/cloudflare-deployment.md) for Cloudflare setup, the apex-domain preference, `www` redirect guidance, old-domain redirects, and email prerequisites.

## Quality checks

```bash
npm run format:check
npm run lint
npm test
npm run check:links
npm run build
```

The checks validate public branding and canonicals, contact-form success/failure behavior, local links and assets, JSON/XML syntax, and the static production file set.

## Deployment safety

Do not commit, push, merge, deploy, change DNS, or remove old hosting until the corresponding review and approval step is complete.
