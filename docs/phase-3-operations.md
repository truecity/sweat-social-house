# Phase 3 operations

This guide supersedes the historical static/demo-only instructions. The public website retains its existing branding, artwork, navigation, mobile layout, and decorative animations. There are no paid tickets, payments, or memberships.

## Architecture and exact commands

The landing page remains HTML/CSS/vanilla JavaScript. Same-origin Node 24 Vercel Functions use `pg` (Neon Postgres), `@clerk/backend` (administrator verification), `resend` (transactional links) and `@vercel/functions` (connection-pool lifecycle). Versions are exact in package.json and package-lock.json. Clerk's browser UI is loaded only on admin.html from its own Frontend API.

From the repository root:

```sh
npm --prefix sweat-social-house ci
npm --prefix sweat-social-house test
python3 scripts/check_site.py
npm --prefix sweat-social-house run build
npm --prefix sweat-social-house run dev
```

Development URL: http://127.0.0.1:4175. Stop the server with Ctrl+C. The server serves only the generated `public/` directory and the explicit API routes. A Python server over the source directory is no longer appropriate: it could expose server files or local credentials.

Pull **development** settings from the correctly linked Vercel project into ignored `sweat-social-house/.env.local`; never copy production credentials into local testing. Add a local random `RATE_LIMIT_SECRET`, `APP_ORIGIN=http://127.0.0.1:4175`, `WAITLIST_ENABLED=false`, and `EMAIL_DOMAIN_VERIFIED=false`. No emails are sent by the integration tests; the mail transport is injected only by tests at the service boundary. There is no fake email mode in the application.

With verified development credentials:

```sh
npm --prefix sweat-social-house run db:migrate
cd sweat-social-house
SSH_DATABASE_TESTS=development-only npm run test:database
```

The database suite creates uniquely named synthetic addresses at example.invalid, tests transactions and token flows against the real development database, and removes its subscriber records. Never run it against production. Migration SQL is repeatable for schema initialization; future schema changes need explicit migrations.

## Files and deployment boundary

- `index.html`: existing landing page, main styles, policies and animation; the new form starts disabled.
- `client/waitlist.js`: configuration check and signup request.
- `admin.html`, `client/admin.js`: private dashboard shell, Clerk sign-in, search, pagination, consent history and subscriber management.
- `preferences.html`, `client/preferences.js`: confirmation, opt-out and removal using expiring emailed links.
- `client/portal.css`: shared styling for the two new pages.
- `api/`: config, signup, preferences, admin, and authenticated daily cleanup handlers.
- `server/`: validation, database access, authentication, email and subscriber transactions.
- `db/001_waitlist.sql`: private schema, unique email, consent records, hashed tokens, rate limits and pinned administrator identity.
- `tools/build.mjs`: allowlists public assets into generated `public/`; no secrets, SQL, server source or package files.
- `tools/dev.mjs`: local same-origin page/API server with security headers.
- `tools/stage-release.mjs`: stages only deployment source and approved assets in a temporary folder, excluding credentials and historical images.
- `test/`: security, build and database tests.

After changing either inline script, run `python3 scripts/check_site.py --update-csp`. Never enable unsafe-inline for JavaScript. Landing/preferences CSP permits only same-origin connections; admin has its own Clerk policy. If the production Clerk Frontend API hostname differs from `clerk.sweatsocialhouse.com`, update the exact admin CSP host before deployment. The local server derives its development host from the publishable key.

## Actual resources

Vercel team: truecitys-projects-07c65883 (`team_w3bnu59qAXU1AgHAKAfv0bTp`). Project: sweat-social-house (`prj_7Ttx2JtcqQ9HDC4V2nyLF0CyFKTc`). Never deploy to thisisthefirstone.

- Development Neon: sweat-social-house-subscribers, `store_4tf08RIyhh5tLy6C`.
- Separate production Neon: sweat-social-house-production, `store_nkozFbr4DM4DBc1q`.
- Clerk: sweat-social-house-dashboard, `ir_Ahft8chRSustH8ex`, app `app_3L0mA59OLRRUIgjOmWmj9NKPevC`. Existing production instance ins_3L0mA22weeXUD1tkwGGe3XP8bdb now uses sweatsocialhouse.com. Production and Development project connections are saved with owner approval, live keys synchronized, and invite-only access selected. Five production DNS CNAMEs/certificates and April’s verified first session remain pending; see clerk-dns-setup.md. Do not create a replacement app or grant access to an unverified user.
- Resend: sweat-social-house-email, `ir_DDPGXPUVaJ9aB4Nz`, connected to development and production. Sender domain `send.sweatsocialhouse.com`, ID `73f79f6e-948f-416d-90ba-6851381c6b1b`. Click/open tracking are off.

Required server settings: `DATABASE_URL`, direct migration `DATABASE_URL_UNPOOLED`, `RESEND_API_KEY`, `RATE_LIMIT_SECRET`, `CRON_SECRET`, `APP_ORIGIN`, `WAITLIST_ENABLED`, `EMAIL_DOMAIN_VERIFIED`; admin additionally needs `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`. Production rejects Clerk development keys. Never print or commit values. Database URLs explicitly use TLS certificate/hostname verification.

## Required activation steps

1. **Completed 2026-10-21:** all three existing records in [email-dns-setup.md](email-dns-setup.md) exactly match public DNS and Resend reports the domain and records verified. Do not add duplicate records. Working Namecheap Private Email MX/SPF/DKIM/DMARC remain intact. Automated delivery and the full confirmation flow require separate testing; mailbox functionality alone is not the verification criterion. The new sender is `Sweat Social House <updates@send.sweatsocialhouse.com>`, with replies directed to `hello@sweatsocialhouse.com`.
2. Open the existing Clerk app through Vercel integration SSO. Create/configure its production instance for sweatsocialhouse.com. Restrict signup to the authorized business email where supported. Configure email ownership verification and production login; email code sign-in avoids a shared password. Complete Clerk's actual domain records/certificates; do not invent DNS values. Disable unused social providers or supply their own production configuration. Sync its live keys into the existing Vercel project's production environment. Do not paste secret keys or verification codes into chat.
3. Have April sign in with `hello@sweatsocialhouse.com` and complete the provider's verification. Every admin request checks a valid Clerk session, the verified **primary** email, not banned/locked, and the pinned Clerk user ID. First eligible verified access pins the account. Never mark an email verified by API to bypass this step. Account replacement requires a separately reviewed administrative recovery; do not delete the pin casually.
4. Verify the real confirmation email using a designated test address, follow the link and explicitly confirm, inspect the consent record in April's dashboard, then verify preference withdrawal and removal. An email API acceptance is not proof of inbox delivery. Links open without changing anything; POST confirms each action.
5. Only after sender verification, set `EMAIL_DOMAIN_VERIFIED=true` and `WAITLIST_ENABLED=true` and deploy. For a controlled prelaunch test, use a staged production deployment and the canonical origin with appropriate protection; never temporarily grant broad admin access. Keep the public form closed until the intended end-to-end checks pass.

The site currently fails closed. Database setup, tests and a published page do **not** establish that real email delivery or April's identity verification succeeded.

## Data handling and limits

Email is trimmed/lowercased with a database unique constraint, including concurrent submissions. Existing confirmed/unsubscribed records cannot be overwritten by unauthenticated repeat signups. Optional marketing is initially unchecked and cannot be turned on by the admin dashboard. Exact consent text, version, choice and confirmation time are recorded.

Confirmation tokens expire in 24 hours; management tokens in 30 minutes. Only hashes are stored, and tokens are consumed transactionally. Links put tokens in the fragment, which is removed from the address bar immediately; no cookies/localStorage store subscriber information. Users can stop marketing, stop all emails, or delete their active record and cascading consent/token rows. Provider backups and delivery logs are not erased by this action.

Persistent HMAC-based IP/email limits, a honeypot, JSON/body validation, same-origin mutation checks, parameterized SQL, no-store responses and minimal error logging protect the routes. Vercel's trusted forwarding header supplies the client address. Cleanup runs daily at 09:00 UTC and during requests; pending records become eligible after 7 days, admin actions after 90 days, and rate-limit keys after 1 hour. Backups/log retention and the confirmed-list retention policy still need owner/legal review. No bulk email/marketing campaign sender is implemented; any future sender must filter confirmed state and the appropriate permission, and include required unsubscribe/contact information.

Event/refund/waiver documents remain drafts. Signup does not accept the waiver or book capacity. The public Privacy Notice describes the implemented conditional collection and deletion behavior; it is not a certification of legal compliance. Age/guardian rules, legal review, exact event date, venue and pricing remain open.

## Release workflow

```sh
node sweat-social-house/tools/stage-release.mjs
```

Use its printed directory with Vercel CLI 65.0.0. Link with the exact team/project above; inspect them before continuing. Stage with `vercel deploy --prod --skip-domain --yes --scope truecitys-projects-07c65883 --cwd RELEASE_DIRECTORY`. Test the staged deployment, then `vercel promote DEPLOYMENT_URL --yes --scope truecitys-projects-07c65883 --cwd RELEASE_DIRECTORY`. Verify the canonical public domain, API access controls, all images, source-file exclusions and availability state after promotion. No Git auto-deployment is configured. The old static ZIP packaging command is obsolete.

References: [Clerk production setup](https://clerk.com/docs/guides/development/deployment/production), [Clerk JavaScript quickstart](https://clerk.com/docs/js-frontend/getting-started/quickstart), [Clerk CSP](https://clerk.com/docs/guides/secure/best-practices/csp-headers), [Vercel request headers](https://vercel.com/docs/headers/request-headers), [Resend send-email API](https://resend.com/docs/api-reference/emails/send-email).
