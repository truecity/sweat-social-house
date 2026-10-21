import {endpoint,readBody,signupInput,rateLimit,HttpError} from '../server/security.js';
import {settings} from '../server/config.js';
import {cleanup,requestSignup,GENERIC} from '../server/waitlist.js';
export default endpoint(['POST'],async req=>{
 if(!settings().ready)throw new HttpError(503,'The launch list is opening soon. Please check back.');
 await rateLimit(req,'signup');const body=await readBody(req);
 if(body.website)return {message:GENERIC};
 const input=signupInput(body);await rateLimit(req,'signup-address',input.email);await cleanup();return requestSignup(input);
});
