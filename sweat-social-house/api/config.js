import {endpoint} from '../server/security.js';
import {settings,WAITLIST_WORDING,MARKETING_WORDING,PRIVACY_VERSION} from '../server/config.js';
export default endpoint(['GET'],async()=>{const c=settings();return {enabled:c.ready,authEnabled:c.authReady,clerkPublishableKey:c.authReady?c.publicKey:null,contact:c.contact,waitlistText:WAITLIST_WORDING,marketingText:MARKETING_WORDING,privacyVersion:PRIVACY_VERSION};});
