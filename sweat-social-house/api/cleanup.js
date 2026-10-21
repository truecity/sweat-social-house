import {timingSafeEqual} from 'node:crypto';
import {endpoint,HttpError} from '../server/security.js';
import {cleanup} from '../server/waitlist.js';
export default endpoint(['GET'],async req=>{
  const expected=process.env.CRON_SECRET&&Buffer.from('Bearer '+process.env.CRON_SECRET);
  const actual=Buffer.from(req.headers.authorization||'');
  if(!expected||actual.length!==expected.length||!timingSafeEqual(actual,expected))throw new HttpError(401,'Unauthorized.');
  await cleanup();return {ok:true};
});
