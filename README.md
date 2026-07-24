# True Partner Tech Website

The static marketing website for **True Partner Tech**, the public-facing brand of **SE Marketing Consulting LLC**. The canonical production URL is `https://truepartnertech.com`.

## Architecture

- Static HTML routes: `/`, `/pricing.html`, `/preview.html`, `/privacy.html`, `/terms.html`
- Custom static error page: `/404.html` (excluded from the sitemap)
- Shared CSS and dependency-free browser JavaScript
- Cloudflare Pages Function at `/api/contact`
- Allowlisted static production output in `dist/`
- Node's built-in test runner and repository validation scripts

## Local development

Requires Python for the convenience server and Node.js 20 or newer for checks.

```bash
npm start
npm run check
```

Static pages work locally. The contact form requires the Cloudflare Pages runtime and configured email variables; use a Cloudflare preview to test delivery.

## Production build

```bash
npm run build
```

The build deletes and recreates `dist/`, then copies only deployable HTML, CSS, JavaScript, images, assets, and Pages metadata. Generated `dist/` files are ignored by Git. Internal documentation, tests, scripts, package metadata, the root `functions/` directory, and secrets are not copied.

Cloudflare Pages should use:

- Framework preset: None
- Root directory: leave blank
- Build command: `npm run build`
- Build output directory: `dist`
- Production branch: `main`

The Pages Function remains at `functions/api/contact.js` in the repository root. Cloudflare discovers that directory separately from the static `dist` output.

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

The checks validate public branding and canonicals, contact-form success/failure behavior, built links and assets, JSON/XML syntax, and the allowlisted production output.

## Deployment safety

Do not commit, push, merge, deploy, change DNS, or remove old hosting until the corresponding review and approval step is complete.
