# Sweat Social House handoff

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
- Policy dialogs need keyboard focus management and focus restoration review. Placeholder policies are not launch-ready business policies.
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
