# Sweat Social House contributor guide

## Project and workspace

Sweat Social House is April’s responsive women-centered fitness/community website. First event: May 2027, 15–20 guests; exact date/venue/pricing TBD. Production: https://sweatsocialhouse.com. Business/contact/admin email: hello@sweatsocialhouse.com. Preserve existing burgundy/blush/cream branding, typography, approved photography, header, navigation, animations and mobile layout. Do not add tickets, payments or memberships in Phase 3. Refund/waiver/event documents remain drafts.

This directory is a local mirror of the ChatGPT project “Business ideas/App ideas”. Treat `sources/`, if present, as read-only reference material. Do not edit, rename, move or delete synced project files. Synced references may be replaced when another task is created. Application files live in `sweat-social-house/`.

## Current architecture

Plain HTML/CSS/vanilla browser JavaScript with Node 24 Vercel Functions. `pg` connects to private Neon Postgres; `resend` sends requested email links; `@clerk/backend` verifies administrator sessions; `@vercel/functions` manages database pool lifecycle. Exact dependencies and lockfile are in the app directory. No framework or external fonts. Main landing styles/policies/animation remain inline; new form/dashboard/preferences logic lives in `client/`.

Phase 3 is implemented but registration must remain disabled until sending-domain DNS, live Clerk setup, April's verified identity and real end-to-end checks pass. Read HANDOFF.md and docs/phase-3-operations.md for the current activation state. Never infer success from a READY deployment or a successful mock/injected-mail test.

## Install, run, test and build

From the repository root:

```sh
npm --prefix sweat-social-house ci
npm --prefix sweat-social-house test
python3 scripts/check_site.py
npm --prefix sweat-social-house run build
npm --prefix sweat-social-house run dev
```

The dev server runs at http://127.0.0.1:4175 and serves the public build plus API routes. Stop with Ctrl+C; do not kill unrelated servers. **Do not use a Python file server over the source directory now that it contains server code and ignored credentials.**

Before migrations/development database tests, verify the Vercel project and pull development-only settings into ignored `sweat-social-house/.env.local`. Follow docs/phase-3-operations.md. Never run the integration suite against production:

```sh
npm --prefix sweat-social-house run db:migrate
cd sweat-social-house
SSH_DATABASE_TESTS=development-only npm run test:database
```

Security/build tests require no provider credentials. Integration tests use the actual development database and synthetic addresses, inject email delivery only at the test boundary, and remove their subscriber records. They do not prove real inbox delivery or an authenticated admin journey. Browser checks: all images, desktop/390px without overflow, keyboard dialogs, correct availability, unchecked optional marketing, preferences, and no unauthorized subscriber access. Decorations retain pointer-events:none, fewer mobile marks and reduced-motion support.

Changing either inline script requires `python3 scripts/check_site.py --update-csp`, then normal validation. Do not add unsafe-inline to script-src. Admin CSP is separate and must match the actual Clerk production host.

## Structure

- `AGENTS.md`: shared guide; `CLAUDE.md` contains only `@AGENTS.md`.
- `HANDOFF.md`: latest status first, historical notes below.
- `docs/phase-3-operations.md`: exact resource IDs, activation/release steps, security decisions and limits.
- `docs/email-dns-setup.md`: three additional Resend DNS records; preserve existing Namecheap Private Email settings.
- `sweat-social-house/index.html`: landing page, main styles, policy dialogs and animation.
- `admin.html`, `preferences.html`: private dashboard shell and subscriber preferences pages.
- `client/`: public browser scripts and portal styles; `assets/`: approved/current plus historical images.
- `api/`: same-origin config/signup/preferences/admin/cleanup functions.
- `server/`: database, authentication, validation, email and transactional business logic.
- `db/`: private SQL schema; `test/`: unit/build/database tests.
- `tools/`: public build, API dev server, migration and clean-release staging.
- `public/`: generated/ignored public files only. Never make the project root the static output directory again.
- `style.css` and `script.js`: unused early drafts. `imported-preview/`, old ZIPs: historical, not source of truth.

## Conventions and security

Keep focused edits and semantic accessible HTML; use relative local image paths. Avoid incidental reformatting of the inherited compact landing page or accumulated CSS overrides. Do not alter April's appearance or delete historical imagery without a request.

Validate on the server, parameterize SQL, and never trust a browser-provided email/role for authorization. Every dashboard request verifies the Clerk session and intended verified primary email, then matches the pinned user ID. Never mark an administrator verified to bypass mailbox ownership or casually reset the pin. Production must reject development keys.

Unique normalized email prevents duplicates; do not strip provider-specific dots/plus aliases. Repeated unauthenticated submissions must not change confirmed consent. Optional marketing stays unchecked and cannot be enabled by an administrator. Store exact consent text/version/time. Only hashes of expiring confirmation/removal tokens belong in the database; don't log emails, bodies, bearer tokens, credentials or provider error payloads. Tokens in URL fragments must be cleared from browser history. GET must never delete/confirm records.

Do not commit/print/upload `.env*`, `.vercel/`, credentials, browser state or generated release folders. Build/stage allowlists are the public/private boundary. Public signup remains closed when required configuration is missing. Do not claim a registration, delivery, reservation or dashboard login happened unless verified.

## Deployment and collaboration

Git origin: https://github.com/truecity/sweat-social-house.git. Pull/check status before changes; use `codex/` branches. No Vercel Git auto-deployment is configured. Preserve others' work.

Vercel CLI 65.0.0 authenticated as owner truecity works; the connector had creation 403/user-lookup 404 and was not repaired. Exact scope: `truecitys-projects-07c65883` / team `team_w3bnu59qAXU1AgHAKAfv0bTp`; project `sweat-social-house` / `prj_7Ttx2JtcqQ9HDC4V2nyLF0CyFKTc`. Never overwrite `thisisthefirstone`.

Stage only approved deployment files:

```sh
node sweat-social-house/tools/stage-release.mjs
```

Link and inspect that printed directory with the explicit scope/project, stage production using `--prod --skip-domain`, verify it using authenticated `vercel curl` where protected, then promote the tested deployment. Full commands are in docs/phase-3-operations.md. Keep `.env*` excluded: linking creates an OIDC credential. Do not disable deployment protection to test. Verify canonical public URL, images, headers, actual availability and unauthorized API behavior after promotion. The old static ZIP workflow is obsolete.
