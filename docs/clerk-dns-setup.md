# Clerk production DNS setup

The existing `sweat-social-house-dashboard` application (`app_3L0mA59OLRRUIgjOmWmj9NKPevC`) now uses `sweatsocialhouse.com` in its existing production instance. No replacement app or paid add-on was created.

In Namecheap → Domain List → sweatsocialhouse.com → Advanced DNS, add these five **CNAME** records with TTL **Automatic**. All five names returned NXDOMAIN from the authoritative Namecheap server when checked on October 21, 2026. These are Clerk records, separate from the already verified Resend records. Do not duplicate or alter Resend records, root mailbox MX/SPF, Namecheap DKIM, DMARC, or website records.

| Type | Host | Value | TTL |
| --- | --- | --- | --- |
| CNAME | clerk | frontend-api.clerk.services | Automatic |
| CNAME | accounts | accounts.clerk.services | Automatic |
| CNAME | clkmail | mail.x5ezl3q5psqr.clerk.services | Automatic |
| CNAME | clk._domainkey | dkim1.x5ezl3q5psqr.clerk.services | Automatic |
| CNAME | clk2._domainkey | dkim2.x5ezl3q5psqr.clerk.services | Automatic |

Values were read directly from this application's production Domains page after updating the Vercel integration's production domain. Namecheap appends `.sweatsocialhouse.com` to Host. If a record now exists at a listed host, compare rather than add a duplicate or overwrite it blindly.

After saving, verify authoritative DNS, use Clerk's **Verify Records**, and confirm Frontend API, account portal, email configuration and TLS certificates are ready. Keep public waitlist registration disabled. April must accept her intended invitation and verify `hello@sweatsocialhouse.com` herself; never mark her email verified through an API.
