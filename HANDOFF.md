# Sweat Social House handoff

## Two-track Summer 2027 status — 2026-10-27

User superseded August/May timing: say **Summer 2027**, with no specific month. Public `index.html` is now a minimalist branded fitness/wellness coming-soon page. Full original site is preserved in `full-site.html`; artwork, header, navigation, mobile layout, policies and animation remain. Both tracks use locally hosted Playfair Display and Montserrat (OFL licenses included). Consent and confirmation email wording use Summer 2027; new consent version `waitlist-2026-10-26` does not rewrite stored history.

**Not yet promoted. Public signup remains disabled.** Existing live domain still serves the previous release. New staged production deployment `dpl_9BtMXVbBAHJwmRgpfqLCWGxHL7wS`, https://sweat-social-house-phou89631-truecitys-projects-07c65883.vercel.app, is READY but failed three Clerk DNS checks; do not bypass them. Staged HTML exactly matches new source and has all five security headers. Config returns enabled:false/authEnabled:true, live Clerk key and new consent wording; unsigned admin request returns Please sign in. Production stage directory: `/var/folders/1v/k0mk5l5d2y560rk0vwmmpdp00000gn/T/ssh-phase3-release-39PAvV` (contains ignored local credentials after linking; never upload these).

**Full-site protected preview:** https://sweat-social-house-bx0zpsbii-truecitys-projects-07c65883.vercel.app, deployment `dpl_2M2m1sbCJeL5HRzTQ4ew4kCvHQAg`. Anonymous access returns 302 to authentication; authenticated owner fetch returns 200 and full-site content with noindex headers. Owner browser loads all 16 images; no horizontal overflow at normal viewport or 390px. Vercel protection remains all_except_custom_domains. Never promote this preview or assign a public/custom domain. Preview settings are separate from production; form is closed without configuration. Full source and its photography are excluded from the public build. A staged package marker rejects production builds. Preview directory: `/var/folders/1v/k0mk5l5d2y560rk0vwmmpdp00000gn/T/ssh-phase3-release-opqLrI`.

April needs separate access. User confirmed invitation address **hello@sweatsocialhouse.com** (earlier missing-e spelling was corrected). Vercel Share invitation was sent and its People with access list shows this email, while Only people with access remains selected. April's actual Vercel session has not been verified. A connector/CLI grant attempt did not produce a visible grant; the subsequent UI invitation is the verified operation. Subscriber dashboard access remains separate and unchanged.

Verification: 10 unit/security/build tests passed; 7 real development-database scenarios plus parent passed using freshly pulled development-only settings and injected test email delivery (no real inbox proof). Both page scripts match; static syntax/CSP/assets validation passed. Coming-soon page checked at 390px and 1440px without overflow; images load, marketing unchecked, disabled state truthful, privacy dialog keyboard focus/Escape/return verified, no browser console errors. Resend domain and all three records still verified by provider on October 26; no new diagnostic email sent. Clerk domain page still shows all five exact CNAMEs from docs/clerk-dns-setup.md unverified. No DNS mutations in this work yet.

Next: user signs into Namecheap (in-app tab is open on login); add only the five missing Clerk CNAMEs, preserve mailbox/Resend/website records, verify authoritative DNS and Clerk TLS. Complete April's invitation/real mailbox verification and pin via the intended login. Test real signup confirmation, consent, preferences and removal in protected staging before opening public signup. Re-run deployment checks, promote only the public coming-soon release, and verify the canonical domain. Source work is on a codex branch; follow docs/phase-3-operations.md for the two release tracks.

## Current Phase 3 status — 2026-10-21

**Implementation is complete; Resend DNS is verified. Activation still awaits production Clerk setup and real end-to-end tests.** This section and `docs/phase-3-operations.md` supersede older static/demo-only notes below. The business details are confirmed: Sweat Social House, founder April, contact/admin email hello@sweatsocialhouse.com, domain https://sweatsocialhouse.com, Namecheap Private Email. No separate registered business name was supplied. Refund rules stay drafts; no tickets/payments/memberships were added.

Built: real signup endpoint, separate development/production Neon databases and migrated schemas, database-enforced duplicate prevention, email ownership confirmation, unchecked optional marketing with exact consent history, private Clerk dashboard with search/status filters/pagination/consent history/withdrawal/removal, self-service preferences and removal, daily retention cleanup, security headers and public-build allowlist. The existing landing-page artwork, colors, typography, navigation, responsive layout and animations are preserved; only signup/contact/privacy content changes. The form starts disabled and only opens when the server confirms all required configuration.

Verified locally: 9 security/build tests passed; 7 real-database scenarios plus their parent test passed using synthetic example.invalid records and an injected test-only mail transport; no emails were sent. Scenarios cover concurrent duplicates, hashed/expired/replayed/wrong-purpose tokens, consent integrity, opt-out/removal cascades, failed delivery retry, persistent throttling and retention cleanup. Static JavaScript/CSP/assets/anchors validation passed. Dependency audit: zero vulnerabilities. Browser checks: desktop/390px images loaded, no horizontal overflow, 8 desktop/4 mobile decoration nodes, pointer-events protection, accessible privacy dialog, disabled signup and unchecked marketing, preferences fragment clearing, and Clerk development sign-in rendering without subscriber access. Expected Clerk development-key warning only; no landing-page browser errors. Local unauthorized admin/cleanup requests returned 401; signup returned 503 while disabled; server source/SQL/environment/package files returned 404.

Remaining before activation:
- Resend domain `send.sweatsocialhouse.com` and all three records report `verified` as of 2026-10-21 23:26 UTC. Both Namecheap authoritative servers plus Google/Cloudflare returned exact matching hosts/values. Earlier missing results were cached NXDOMAIN; Resend verification had also not been started. Triggering verification resolved it without DNS changes or duplicate records. See `docs/email-dns-setup.md`. Existing mailbox records are untouched; click/open tracking remain off. A single clearly labeled delivery test to hello@sweatsocialhouse.com (email ID `01a160c9-b49c-722f-9802-10a7f4b48c69`) now reports `last_event:delivered`. This establishes receiving-mail-server acceptance, not Inbox versus Spam placement; mailbox-owner confirmation remains pending. No subscriber was created by this test.
- Existing Clerk production instance `ins_3L0mA22weeXUD1tkwGGe3XP8bdb` initially had placeholder domain striking.skunk-52.lcl.dev. Updated the existing Vercel integration to sweatsocialhouse.com, with Hobby plan and all paid add-ons off. Set production access mode to invite-only; email is required and must be verified, with one-time email codes enabled. User explicitly approved connecting Production and Development; that connection is saved. Production now has pk_live/sk_live credentials; decoded public host is clerk.sweatsocialhouse.com, matching admin CSP. Five Clerk-specific CNAMEs remain absent from authoritative DNS; exact values are in docs/clerk-dns-setup.md. Namecheap session expired while opening domain settings; owner re-login requested. No DNS record was added or changed yet. Staged production deployment `dpl_BCFXs8p5d1VNnCWTs1PNarnAxunT` built READY but failed three Clerk DNS Configuration checks and was not promoted. Its config reports enabled:false/authEnabled:true with the intended live public key; an unsigned admin request returns Please sign in. Do not bypass the DNS checks. Clean staged source: /var/folders/1v/k0mk5l5d2y560rk0vwmmpdp00000gn/T/ssh-phase3-release-iJ1V3r. April still needs an invitation, actual mailbox verification and successful private dashboard session; no identity has been pre-verified or pinned by this work.
- Resend reports the diagnostic email delivered, but real signup confirmation, consent/removal and an authenticated administrator journey are **not yet verified**. Production flags remain `WAITLIST_ENABLED=false`, `EMAIL_DOMAIN_VERIFIED=false`. Do not call this a functioning public waitlist until those end-to-end checks pass.
- Confirm provider retention settings, age/guardian policy, ongoing confirmed-list retention and legal review. No marketing campaign sender is included. Event booking/refunds/waiver execution remain outside this phase.

Resource IDs, setup steps, exact commands, data model/security decisions and deployment instructions are in `docs/phase-3-operations.md`. Secrets are in ignored local environment files and Vercel only; the public build excludes all server/config/SQL/environment source. The old Python source-directory preview and static ZIP deployment commands are obsolete.

## Phase 3 deployment verification — 2026-10-21

Production is published at https://sweatsocialhouse.com, deployment `dpl_FSSTtUvJ4zoxs2a4ir9YGfNdxnWK` (Node 24, READY, staged then promoted). The public root returned HTTP 200; deployed HTML exactly matched local source; all five configured security headers were present. All 16 rendered images (including 8 decorative marks) finished loading in the live browser. No horizontal overflow; optional marketing unchecked; signup explicitly disabled. Both www.sweatsocialhouse.com and sweat-social-house.vercel.app now redirect to the canonical domain, including the homepage. The `/admin` shortcut redirects to `/admin.html`.

Live `/api/config` confirms `enabled:false`, `authEnabled:false`, no publishable key exposed while authentication is unavailable. Admin API returned 503 with the expected setup message and no data; unauthorized cleanup returned 401. Server source, environment file and package manifest returned 404. A staged invalid confirmation POST reached the production database and returned the expected 400. The admin page has a separate restricted Clerk CSP and private/no-store caching. Runtime log inspection on the previous equivalent application build found only the two expected disabled-admin 503 test entries; no unexplained crash. The one-hour query exceeded Hobby retention, so a five-minute window was used. External alerting/log drains were not configured by this phase.

Code is saved on collaboration branch `codex/phase-3-waitlist`; main is not overwritten. Deployment uses the tested staged source; Git auto-deployment remains off. Activation steps above are still outstanding. No real signup email or April login has been claimed as verified.

## Historical notes

## Signup phase — setup pending, 2026-10-21

Requested: real email signup, secure subscriber storage, duplicate prevention, optional marketing consent, a private April dashboard, and subscriber removal requests. Preserve all existing site visuals. The user explicitly chose to keep refund rules as drafts.

No subscriber feature is implemented or live yet. Read-only checks found no connected integration resources or environment variables. Setup attempts for Neon (database), Clerk (dashboard authentication), and Resend (email) each stopped with `integration_terms_acceptance_required`. No terms were accepted, no resources provisioned, and no live application changes made in this phase. The account owner must review/accept the service terms in Vercel before retrying. Resend also requires an owned sending domain. April's dashboard email, business legal/display identity, public contact email, and owned domain remain unanswered.

Owner setup links:
- https://vercel.com/truecitys-projects-07c65883/~/integrations/accept-terms/neon?source=cli
- https://vercel.com/truecitys-projects-07c65883/~/integrations/accept-terms/clerk?source=cli
- https://vercel.com/truecitys-projects-07c65883/~/integrations/accept-terms/resend?source=cli

Implementation plan after provisioning:
- Keep the existing HTML/CSS and add same-origin Vercel Functions; scope CSP changes to the actual API and authentication needs. Do not deploy source/config/secrets as static assets when adding server code.
- Use a private Neon database accessed only by server functions with parameterized queries; separate test and production data. Normalize email casing/whitespace and enforce uniqueness in the database, including simultaneous requests. Do not rewrite provider-specific dots or plus aliases.
- Collect minimal information. Use email ownership confirmation, generic duplicate responses, validation, body limits and persistent rate limiting. Keep optional marketing unchecked; record the exact consent text/version, choice and timestamp. An unauthenticated duplicate submission must not overwrite an existing subscriber's preferences.
- Use Clerk for authentication and a server-side allowlist of April's verified account ID for every dashboard API. No public subscriber lists, browser-only authorization, or shared password. Return private/no-store responses and avoid logging personal data or tokens.
- Use Resend with a verified sending domain for requested confirmation and removal emails. Use expiring random tokens stored as hashes. Confirm state-changing removal with POST so link scanners cannot delete records. Distinguish marketing opt-out from deletion; document retention, backups, provider logs and any required minimal suppression records before making deletion promises.
- Test concurrent duplicate requests, consent integrity, expired/reused tokens, unauthorized dashboard access, throttling, email failures and subscriber removal end-to-end. Use designated test addresses; do not send unrequested email to real subscribers.
- Confirm business contact and privacy/retention decisions before activating real collection. Refund/booking/payment rules remain drafts and outside this signup phase.

## Security and policy update — 2026-10-20

Production verification: https://sweat-social-house.vercel.app returned unauthenticated HTTP 200 with all five configured security headers and existing HSTS. Served HTML exactly matched source commit `6849a7e`; live waiver/demo behavior, all images, eight decorations, and a clean browser error/warning log were confirmed. Deployment: `dpl_7aEEtfxKSqdGHEXybxWtJ9iR3PAN` (production, READY).

Priorities 1–4 are implemented. The existing design, assets, navigation, animations, and demo form are preserved. Existing policy dialogs now contain business-specific privacy, event-terms, and refund drafts; a fitness waiver draft shares the same dialog. All are expressly non-final; there is no agreement/signature mechanism. No business identity, refund deadline, retention period, or enforceable release has been invented.

Security headers in `sweat-social-house/vercel.json` now include CSP, frame restrictions, nosniff, referrer policy, and device-permission restrictions. CSP allows only the two exact inline scripts by SHA-256 hash, permits existing inline styling, and blocks connections/forms while this remains a demo. The contact inline handler was moved into the hashed script. **Any change to either inline script, including policy text, requires running `python3 scripts/check_site.py --update-csp`; validate with `python3 scripts/check_site.py`.** Never add unsafe-inline to script-src to work around a stale hash. Future registration will require deliberately updating connect-src/form-action and adding the backend protections.

Dialog accessibility now includes focus on the title, Tab/Shift+Tab containment, inert background, scroll locking, Escape/backdrop/close dismissal, and focus restoration. Local browser checks with the actual headers passed: all images, eight decoration nodes, demo no-save feedback, all four dialogs, keyboard focus, background exclusion, and a 390px viewport with no horizontal overflow. No browser errors/warnings were reported. Static syntax, assets, anchors, and CSP validation passed. No comprehensive cross-browser or assistive-technology audit has been performed.

Remaining before real registration: confirm the legal operator and monitored contact, age/guardian rules, hosting-log practices, data retention/deletion process, processors, and consent workflow. Before ticket sales: finalize cancellation/refund/weather/transfer terms and payment protections. Before event launch: qualified attorney review of all applicable documents, including release scope, parties, emergency procedures, and photo permission. The waiver draft is not active liability protection.

Drafting references: [FTC consumer privacy guidance](https://www.ftc.gov/business-guidance/privacy-security/consumer-privacy), [FTC information protection guide](https://www.ftc.gov/business-guidance/resources/protecting-personal-information-guide-business), [Georgia published code/annotations, historical reference only](https://www.legis.ga.gov/api/document/docs/default-source/joint-features-document-library/t1-t2-t3-%28v3%29-2019-pdf.pdf). These inform review topics; they do not establish current legal compliance or waiver enforceability.

## Built and deployed

- Responsive static landing page with burgundy/blush branding, centered wide logo and matching header background.
- April's portrait: phone removed, SSH clothing monograms, warm blush studio background.
- Event preview: May 2027, 15–20 guests, April-led sculpt and social gathering; Atlanta metro, venue/date/pricing TBD.
- Updated welcome, hydration, lounge and empty photo-op images. Foreground instructor removed from the workout photo while keeping group participants.
- Falling monogram-plus-heart decoration, enlarged/darkened/slowed after feedback; fewer marks on phones, reduced-motion handling and no tap interception.
- Demo waitlist with read-only sample data and explicit no-save/no-reservation confirmation. Policy preview dialogs.
- Public production URL: https://sweat-social-house.vercel.app
- Verified successful production deployment: `dpl_nBf8y7WaHi64AvwSp4FEKyKACwoQ`, project `prj_7Ttx2JtcqQ9HDC4V2nyLF0CyFKTc`, team `truecitys-projects-07c65883`.

## Current work

Documentation handoff is complete. AGENTS.md was updated after explicit user approval of the protected-file exception, and its read-only permissions were restored. CLAUDE.md imports the shared guide. HANDOFF.md records the project status and verification. Existing synced-reference protection rules were preserved. No application code or deployment was changed.

The earlier Vercel blocker was resolved through direct CLI browser login as `truecity`, the team owner. The app connector itself remains suspect (creation 403, current-user 404); it was not repaired. Use the verified CLI path in AGENTS.md for future authorized deployments.

## Verification performed during handoff

- Local site running at http://127.0.0.1:4173; browser reload succeeds.
- All page images loaded successfully.
- Demo button produced: “Demo complete ♡ Nothing was sent or saved. You have not joined a waitlist or reserved a spot.”
- Browser console inspection returned no error entries.
- Both active inline scripts passed `node --check` (Node 24.17.0).
- All eight distinct referenced local assets exist; all nonempty fragment links resolve to page IDs; Vercel JSON parses.
- No automated test suite, test runner, package manifest or build pipeline exists. Thus no automated suite could be run; smoke/static checks passed instead. These are not comprehensive accessibility, cross-browser or performance tests.
- Earlier deployment verification confirmed unauthenticated HTTP 200, all live images loaded and the live demo worked. Those production checks were not rerun during this documentation-only handoff.
- `git status --short` and `git remote -v` failed with “not a git repository”. This is an uninitialized workspace, not merely a repository missing a remote.

## Known limitations / TODOs / open questions

- Root AGENTS.md is a protected file in a synced project workspace. Its update was explicitly approved; preserve its reference-protection rules and keep the shared guide in version control to avoid losing it during future workspace syncs.

- Real waitlist backend, email delivery, consent/privacy details and owner access remain unimplemented. Decide the service and data-retention requirements before collecting real personal information.
- Confirm exact event date/time, venue, capacity, price and registration process with April.
- Replace placeholder contact behavior with a verified business address when supplied.
- Policy dialog keyboard handling is now implemented (see latest update above). Business-specific drafts still require owner decisions and attorney review before use.
- Large PNG assets make the release archive approximately 14 MB; optimize formats/resolutions for phones without degrading approved visuals.
- Inline CSS has accumulated duplicate overrides. Consider consolidating later in a dedicated code change; unused style.css and script.js are misleading legacy files.
- Header artwork is intentionally stretched to the user's requested banner proportions; consider a purpose-designed wide asset if quality becomes a concern.
- Decorative intertwined initials can still be difficult to read at small sizes and can overlap page content. User accepted a larger, darker, slower version; confirm with April if further simplification is needed.
- Generated edits may alter minor scene details. Inspiration imagery is labeled as such, not past-event photography.
- Root contains old image versions and ZIP artifacts; decide what to archive versus track. Do not deploy the entire workspace.
- No custom domain, CI, automated regression suite or continuous Git deployment is configured. Git origin is now configured.

## Decisions and reasoning

- Buildless static HTML keeps a visual review site simple and deployable without dependencies.
- The user's imported ZIP became the design base; current source of truth is sweat-social-house/index.html, not imported-preview or release ZIPs.
- The demo uses fixed samples to prevent visitors from submitting personal details to an unconfigured service.
- Local assets eliminate the broken external-image problem from the earlier mockup.
- Keep dates and commercial details tentative rather than inventing confirmed information.
- Use direct Vercel CLI authorization after connector failures; preserve the intended team and avoid overwriting an unrelated existing project.
- Deploy only a staged release containing current referenced assets and explicitly exclude `.env*`. Vercel linking creates credential-bearing local state.

## Suggested next steps

1. Have April review the public URL on her phone and collect copy/design feedback.
2. Use https://github.com/truecity/sweat-social-house.git for shared source history. Pull before working, use a branch for each change, and commit/push finished work before switching tools.
3. After GitHub exists, optionally connect that repository to the existing Vercel project with Root Directory `sweat-social-house`. This is not currently configured.
4. Agree on backend/registration requirements and business details before replacing the demo.
5. In separately authorized code work, consolidate styles, optimize images and improve dialog accessibility. Add focused tests around real registration when it exists.

## GitHub setup (historical bootstrap instructions)

Git has now been initialized on main and origin is https://github.com/truecity/sweat-social-house.git. The initial push follows this documentation update. The commands below record the original setup procedure; do not reinitialize an existing clone.

```sh
cd /Users/brandonlee/.codex/.chatgpt-projects/g-p-6ad7b9dfad388191ace236d11e60de9e
git init -b main
printf '.env*\n.vercel/\nnode_modules/\n.DS_Store\n*.zip\nimported-preview/\nsources/\n' > .gitignore
git add .gitignore AGENTS.md CLAUDE.md HANDOFF.md sweat-social-house/
git commit -m "Initial Sweat Social House website and contributor handoff"
git remote add origin https://github.com/truecity/sweat-social-house.git
git push -u origin main
```

If Git requests an author identity, configure your own name/email before committing. Authenticate to GitHub through its normal login or credential manager; do not embed tokens in remote URLs. No user GitHub account was assumed from the Vercel username.

## Opening in another tool

```sh
git clone https://github.com/truecity/sweat-social-house.git
cd sweat-social-house
```

Open this cloned root in Claude Code. CLAUDE.md imports AGENTS.md. Read HANDOFF.md before changes. Avoid simultaneous edits to the same files from separate tools. The earlier Git validation failures above describe the pre-initialization state.

## Latest portrait update

The hero now uses assets/april-studio-logo.png. The previous wall hearts were replaced with the supplied monogram and small heart as burgundy wall lettering, matching the studio lighting. The previous april-studio.png is retained as a historical asset. Inline JavaScript syntax and referenced assets passed validation.
