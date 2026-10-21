import {endpoint,readBody,normalizeEmail,rateLimit,HttpError} from '../server/security.js';
import {settings} from '../server/config.js';
import {requestManagement,applyToken,cleanup} from '../server/waitlist.js';
export default endpoint(['POST'],async req=>{
 if(!process.env.DATABASE_URL)throw new HttpError(503,'Preferences are not available yet. Contact hello@sweatsocialhouse.com.');
 await rateLimit(req,'preferences');const body=await readBody(req);await cleanup();
 if(body.action==='request'){
  if(!settings().ready)throw new HttpError(503,'Email links are temporarily unavailable. Contact hello@sweatsocialhouse.com.');
  const email=normalizeEmail(body.email);await rateLimit(req,'preferences-address',email);return requestManagement(email);
 }
 return applyToken(body.token,body.action);
});
