# Sweat Social House contributor guide

## Project and workspace

A responsive women-centered fitness and community website for April, with a planned May 2027 gathering for 15–20 guests and a clearly labeled demo waitlist. Production: https://sweat-social-house.vercel.app

This directory is a local mirror of the ChatGPT project “Business ideas/App ideas”. Treat `sources/`, if present, as read-only reference material. Do not edit, rename, move or delete synced project files. Synced references may be replaced when another task is created. Application files live in `sweat-social-house/`.

## Stack

Buildless HTML, CSS and vanilla browser JavaScript, with local PNG/JPEG images and Vercel static hosting. No framework, backend, package.json, lockfile, runtime dependencies or external fonts. Active CSS and both scripts are inline in index.html. Python 3 is used for preview; Node.js is used only for syntax checks. Verified tools: Python 3.14.2, Node 24.17.0 and Vercel CLI 65.0.0; no application tool versions are pinned.

## Install and run

No dependency installation is needed. From this workspace root:

```sh
python3 -m http.server 4173 --bind 127.0.0.1 --directory sweat-social-house
```

Open http://127.0.0.1:4173. Stop with Ctrl+C. Reuse an existing preview server or choose another port if occupied; do not kill unrelated processes.

## Tests and validation

There is no automated test suite or npm test command. Run these checks without modifying source:

```sh
python3 - <<'PY'
from pathlib import Path
import json, re, subprocess
root = Path('sweat-social-house')
html = (root / 'index.html').read_text()
for code in re.findall(r'<script[^>]*>(.*?)</script>', html, re.S):
    subprocess.run(['node', '--check'], input=code, text=True, check=True)
for asset in set(re.findall(r'src="(assets/[^"]+)"', html)):
    assert (root / asset).is_file(), asset
ids = set(re.findall(r'id="([^"]+)"', html))
for anchor in re.findall(r'href="#([^"]+)"', html):
    assert anchor in ids, anchor
json.loads((root / 'vercel.json').read_text())
print('Static validation passed')
PY
```

Browser checks: load all images, test section links and policy previews, click “Try the Demo ♡” and confirm no-save/no-reservation feedback. Check desktop and 390px phone width, no horizontal overflow and no console errors. Verify reduced-motion behavior and that decorations do not intercept taps. These smoke checks are not a comprehensive automated suite.

## Build and package

There is no compilation. Package current source and only referenced assets:

```sh
python3 - <<'PY'
from pathlib import Path
import re, zipfile
root = Path('sweat-social-house')
html = (root / 'index.html').read_text()
files = ['index.html', 'vercel.json', *sorted(set(re.findall(r'src="(assets/[^"]+)"', html)))]
with zipfile.ZipFile('sweat-social-house-updated.zip', 'w', zipfile.ZIP_DEFLATED) as archive:
    for name in files:
        archive.write(root / name, name)
PY
```

The matcher includes the quoted animation image path in JavaScript. Update this procedure if future code constructs paths dynamically.

## Deployment (when requested)

Team: `truecitys-projects-07c65883` (`team_w3bnu59qAXU1AgHAKAfv0bTp`). Project: `sweat-social-house` (`prj_7Ttx2JtcqQ9HDC4V2nyLF0CyFKTc`). Never overwrite the unrelated `thisisthefirstone` project.

The app connector returned creation 403 and user-lookup 404; direct CLI browser sign-in as owner `truecity` succeeded. The connector was not repaired. Use explicit team/project scope:

```sh
npm install --prefix /private/tmp/ssh-vercel-cli vercel@65.0.0
/private/tmp/ssh-vercel-cli/node_modules/.bin/vercel login
# Package first using the command above.
release_dir="$(mktemp -d /private/tmp/ssh-release.XXXXXX)"
unzip sweat-social-house-updated.zip -d "$release_dir"
printf '.env*\n.git\n' > "$release_dir/.vercelignore"
/private/tmp/ssh-vercel-cli/node_modules/.bin/vercel link --yes --project sweat-social-house --scope truecitys-projects-07c65883 --cwd "$release_dir"
/private/tmp/ssh-vercel-cli/node_modules/.bin/vercel project inspect --non-interactive --scope truecitys-projects-07c65883 --cwd "$release_dir"
# Continue only after the reported owner/project matches above.
/private/tmp/ssh-vercel-cli/node_modules/.bin/vercel deploy --prod --yes --scope truecitys-projects-07c65883 --cwd "$release_dir"
```

The account owner completes login. Linking can generate an OIDC token in .env.local: never print, commit, package or upload it. Keep `.env*` excluded. Verify public unauthenticated access, live images and demo behavior before declaring deployment success. Deployment READY alone is insufficient.

## Structure

- `AGENTS.md`: shared contributor instructions; `CLAUDE.md` contains only its import.
- `HANDOFF.md`: status, checks, limitations, decisions and GitHub bootstrap commands.
- `sweat-social-house/index.html`: active page, inline CSS/scripts, content, policy dialogs and animation.
- `sweat-social-house/vercel.json`: framework null, build command null, output directory `.`.
- `sweat-social-house/assets/`: current and historical imagery. Current HTML references determine what ships.
- `sweat-social-house/style.css` and `script.js`: unused early draft files. They are not loaded; script.js references IDs absent from the current page.
- `imported-preview/index.html`: imported original reference with embedded images, not active source.
- `sweat-social-house-updated.zip`: generated release, not source of truth.
- `sweat-social-house-ready.zip`: obsolete release.

Current images: reference-1.jpg, april-studio.png, group-workout.png, hydration-latest.png, welcome-latest.png, lounge-latest.png, photo-area-latest.png, falling-monogram.png.

## Conventions and gotchas

Use plain HTML/CSS/JS, relative local asset URLs, semantic sections and accessible labels/alt text. Avoid adding dependencies for small visual changes. The inherited page is compact/minified; successive CSS overrides at the end of its style block win. Make focused edits; do not incidentally reformat everything. Consolidation should be a separate reviewed change.

Preserve burgundy/blush/cream branding, serif typography, responsive layout and approved portrait. Keep historical image assets until cleanup is authorized. Images include user-supplied and generated derivatives; do not alter April's appearance without a request.

The waitlist uses read-only sample values and no backend. Never imply a registration, email, stored data or reserved place exists. Contact email is a placeholder with an intercepted click; policies are previews. Venue, exact date and pricing remain unconfirmed. Inspiration imagery is not evidence of past events.

Falling monogram/heart decorations are fixed CSS animations with pointer-events:none and reduced-motion support. Fewer marks appear on phones; they were enlarged/darkened/slowed for readability. Preserve these protections.

Do not commit `.env*`, `.vercel/`, credentials, browser authentication state or temporary release files. Git is initialized on main with origin https://github.com/truecity/sweat-social-house.git. Vercel Git auto-deployment is not configured; production releases currently use the explicit CLI workflow above. See HANDOFF.md for collaboration setup.
