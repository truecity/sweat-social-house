# Automated email DNS setup

These records are already installed in Namecheap and verified by Resend as of 2026-10-21 23:26 UTC. **Do not add duplicates.** Keep existing website, Namecheap Private Email MX, SPF, DKIM, and DMARC records unchanged. The table is a reference, not a request for further DNS changes. TTL is Automatic (public answers showed approximately 1800 seconds).

| Type | Host | Value | Priority |
| --- | --- | --- | --- |
| TXT | resend._domainkey.send | p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDrvbRLw10U6jybrcVcBSR62bqub6R30qkXKIzTlVoupVu4UwR8QU+vYZ87+rDNF82vDFaAPz3D+/mgI/kNIBNTwP6l8XlPXwUoU4tP/CuN+j06abXKO2syZxDkxui8nbWtVJm+k6mEZVy5JsAAxhBbwqvIkcF+gCWIPml35z0C4wIDAQAB | — |
| MX | send.send | feedback-smtp.us-east-1.amazonses.com | 10 |
| TXT | send.send | v=spf1 include:amazonses.com ~all | — |

These are the actual public verification records returned for Resend domain `send.sweatsocialhouse.com` (domain ID `73f79f6e-948f-416d-90ba-6851381c6b1b`). The double `send.send` is intentional: Resend's default return-path prefix under the sending subdomain. Do not replace the root-domain MX records. Messages will use `updates@send.sweatsocialhouse.com`, with replies directed to `hello@sweatsocialhouse.com`.

Both authoritative nameservers (`dns1.registrar-servers.com`, `dns2.registrar-servers.com`) and public resolvers Cloudflare (1.1.1.1) and Google (8.8.8.8) returned all three records with exact matching values. MX priority is 10. Earlier recursive lookups had cached NXDOMAIN responses from the older zone serial; those results did not describe the updated authoritative zone. Resend initially reported `not_started`. A verification request against the existing domain moved it through `pending` to `verified`; all three records now report `verified`. No hostname or value correction was needed, and no mailbox DNS was changed.

Public registrations remain disabled until Clerk production authentication and real confirmation/consent/removal tests pass. These are public DNS values, not API secrets. Provider reference: [verify an existing domain](https://resend.com/docs/api-reference/domains/verify-domain).
