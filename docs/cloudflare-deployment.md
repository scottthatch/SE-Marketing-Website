# Cloudflare Pages deployment

This repository is prepared for a Cloudflare Pages static deployment with one Pages Function at `/api/contact`.

## Build settings

- Production branch: `main` (do not change until the rebrand branch is reviewed and merged)
- Build command: `npm run build`
- Build output directory: `dist`
- Root directory: leave blank (repository root)
- Framework preset: None

The build recreates `dist` from an explicit public-file allowlist. Internal documentation, tests, scripts, package metadata, source-control files, secrets, and `functions/` are not copied into the static output.

`functions/api/contact.js` remains under the repository-root `functions/` directory. Cloudflare Pages discovers and deploys that Function separately from the static `dist` directory, exposing it at `/api/contact`.

Do not put secret values in this repository. Configure these under **Workers & Pages → project → Settings → Variables and Secrets**:

| Name | Type | Purpose | Suggested production value |
| --- | --- | --- | --- |
| `RESEND_API_KEY` | Secret | Authenticates email delivery through Resend | Create in Resend after verifying a sending domain |
| `CONTACT_TO_EMAIL` | Variable | Receives contact-form inquiries | `hello@truepartnertech.com` |
| `CONTACT_FROM_EMAIL` | Variable | Verified sender used by the form | For example, `True Partner Tech <website@truepartnertech.com>` |

Set the same names separately for preview and production environments. The form intentionally returns an error if any value is missing or if the provider rejects delivery.

The implementation uses Resend's HTTPS API. Before publication:

1. Confirm `truepartnertech.com` in Resend and add the provider's required DNS records.
2. Confirm `hello@truepartnertech.com` receives mail.
3. Submit successful and forced-failure form tests from the Cloudflare preview.
4. Review logs without copying personal inquiry content into tickets or public logs.

## Preferred hostname

The canonical hostname is `https://truepartnertech.com`. After adding both custom domains to Cloudflare Pages, create a Cloudflare **Redirect Rule**:

- If hostname equals `www.truepartnertech.com`
- Dynamic redirect target: `concat("https://truepartnertech.com", http.request.uri.path)`
- Status code: `301`
- Preserve query string: enabled

Do not configure this rule until the apex domain and HTTPS are working.

## Previous URLs

Configure permanent redirects only after verifying ownership and traffic:

- `https://semarketingconsulting.com/*` → `https://truepartnertech.com/$1`
- `https://www.semarketingconsulting.com/*` → `https://truepartnertech.com/$1`
- `https://scottthatch.github.io/SE-Marketing-Website/*` → the matching path on `https://truepartnertech.com/`

GitHub Pages redirects may require keeping the old project available with a redirect page. Do not remove old hosting until production and redirects are verified.

## Email setup is separate

The public `hello@`, `sales@`, and `support@` addresses are website copy only. Mailboxes or forwarding, MX records, SPF, DKIM, and DMARC must be configured separately and tested before launch.
