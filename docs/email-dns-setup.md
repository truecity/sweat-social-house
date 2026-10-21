# Automated email DNS setup

Add these records in Namecheap → Domain List → sweatsocialhouse.com → Advanced DNS. Keep existing website, Namecheap Private Email MX, SPF, DKIM, and verification records unchanged. TTL can be Automatic.

| Type | Host | Value | Priority |
| --- | --- | --- | --- |
| TXT | resend._domainkey.send | p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDrvbRLw10U6jybrcVcBSR62bqub6R30qkXKIzTlVoupVu4UwR8QU+vYZ87+rDNF82vDFaAPz3D+/mgI/kNIBNTwP6l8XlPXwUoU4tP/CuN+j06abXKO2syZxDkxui8nbWtVJm+k6mEZVy5JsAAxhBbwqvIkcF+gCWIPml35z0C4wIDAQAB | — |
| MX | send.send | feedback-smtp.us-east-1.amazonses.com | 10 |
| TXT | send.send | v=spf1 include:amazonses.com ~all | — |

These are the actual public verification records returned for Resend domain `send.sweatsocialhouse.com` (domain ID `73f79f6e-948f-416d-90ba-6851381c6b1b`). The double `send.send` is intentional: Resend's default return-path prefix under the sending subdomain. Do not replace the root-domain MX records. Messages will use `updates@send.sweatsocialhouse.com`, with replies directed to `hello@sweatsocialhouse.com`.

After saving, request verification in the existing Resend resource. Sending must stay disabled until status is verified. These are public DNS values, not API secrets.
