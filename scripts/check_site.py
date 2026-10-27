"""Validate the static site; use --update-csp after changing inline JavaScript."""
from pathlib import Path
import argparse
import base64
import hashlib
import json
import re
import subprocess

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--update-csp', action='store_true')
args = parser.parse_args()
root = Path(__file__).resolve().parents[1] / 'sweat-social-house'
html = (root / 'full-site.html').read_text()
public_html = (root / 'index.html').read_text()
assert re.findall(r'<script>(.*?)</script>', public_html, re.S) == re.findall(r'<script>(.*?)</script>', html, re.S), 'Policy/animation scripts must match both tracks'
assert 'Summer 2027' in public_html and 'May 2027' not in html
assert 'full-site.html' not in public_html
scripts = re.findall(r'<script>(.*?)</script>', html, re.S)
assert len(scripts) == 2, 'Review script policy if script count changes'
hashes = []
for code in scripts:
    subprocess.run(['node', '--check'], input=code, text=True, check=True)
    hashes.append("'sha256-" + base64.b64encode(hashlib.sha256(code.encode()).digest()).decode() + "'")
config_path = root / 'vercel.json'
config = json.loads(config_path.read_text())
headers = config['headers'][1]['headers']
csp = next(h for h in headers if h['key'] == 'Content-Security-Policy')
if args.update_csp:
    csp['value'] = re.sub(r'(?<![\w-])script-src [^;]+', "script-src 'self' " + ' '.join(hashes), csp['value'])
    config_path.write_text(json.dumps(config, indent=2) + '\n')
actual_hashes = re.findall(r"'sha256-[^']+'", csp['value'])
assert actual_hashes == hashes, 'CSP hashes are stale: run python3 scripts/check_site.py --update-csp'
assert not re.search(r'\son\w+\s*=', html), 'Inline event handlers are blocked by CSP'
for directive in ["connect-src 'self'", "form-action 'none'", "frame-ancestors 'none'", "script-src-attr 'none'"]:
    assert directive in csp['value'], directive
for asset in set(re.findall(r'src="(assets/[^"]+)"', html)):
    assert (root / asset).is_file(), asset
ids = re.findall(r'id="([^"]+)"', html)
assert len(ids) == len(set(ids)), 'Duplicate IDs'
for anchor in re.findall(r'href="#([^"]+)"', html):
    assert anchor in ids, anchor
for key in ['privacy', 'terms', 'refund', 'waiver']:
    assert f'data-policy="{key}"' in html, key
assert 'signup-fields" disabled' in html and 'marketing-consent' in html
assert config['outputDirectory'] == 'public'
for folder in ['client', 'server', 'api']:
    for script in (root / folder).glob('*.js'):
        subprocess.run(['node', '--check', str(script)], check=True)
print('PASS: JavaScript syntax, CSP hashes/directives, assets, IDs, anchors and draft links')
