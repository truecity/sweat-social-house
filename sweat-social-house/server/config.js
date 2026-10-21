export const VERSION = '2026-10-21';
export const PRIVACY_VERSION = 'waitlist-2026-10-21';
export const WAITLIST_WORDING = 'Email me about the May 2027 Sweat Social House launch. I have read the Privacy Notice. This is not an event booking.';
export const MARKETING_WORDING = 'Also email me occasional Sweat Social House news and future event offers. Optional; I can unsubscribe at any time.';
export function settings() {
  const origin = process.env.APP_ORIGIN || 'https://sweatsocialhouse.com';
  const production = process.env.VERCEL_ENV === 'production';
  const publicKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || '';
  const authReady = !!process.env.CLERK_SECRET_KEY && !!publicKey && !!process.env.DATABASE_URL && !!process.env.RATE_LIMIT_SECRET && (!production || (publicKey.startsWith('pk_live_') && process.env.CLERK_SECRET_KEY.startsWith('sk_live_')));
  const ready = process.env.WAITLIST_ENABLED === 'true' && !!process.env.DATABASE_URL &&
    !!process.env.RATE_LIMIT_SECRET && !!process.env.RESEND_API_KEY && process.env.EMAIL_DOMAIN_VERIFIED === 'true';
  return {origin,production,publicKey,authReady,ready,
    adminEmail:'hello@sweatsocialhouse.com',contact:'hello@sweatsocialhouse.com',
    from:'Sweat Social House <updates@send.sweatsocialhouse.com>'};
}
