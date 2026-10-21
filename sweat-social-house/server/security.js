import { createHash,createHmac,randomBytes } from 'node:crypto';
import { settings, PRIVACY_VERSION } from './config.js';
import { database } from './db.js';
export class HttpError extends Error { constructor(status,message){super(message);this.status=status;} }
export function normalizeEmail(value) {
  if(typeof value!=='string')throw new HttpError(400,'Enter a valid email address.');
  const email=value.trim().toLowerCase();
  if(email.length>254 || !/^[a-z0-9.!#$%&'*+\/= ?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$/i.test(email) || /\s/.test(email) || email.split('@')[0].length>64)
    throw new HttpError(400,'Enter a valid email address.');
  return email;
}
export function signupInput(body) {
  if(body.consentVersion!==PRIVACY_VERSION)throw new HttpError(400,'The Privacy Notice has changed. Reload the page and review your choices.');
  const email=normalizeEmail(body.email);
  const name=typeof body.name==='string'?body.name.trim():'';
  if(name.length<1||name.length>80||/[\x00-\x1f\x7f<>]/.test(name))throw new HttpError(400,'Enter your first name (up to 80 characters).');
  if(body.waitlistConsent!==true)throw new HttpError(400,'Please agree to receive the launch-list emails.');
  if(typeof body.marketing!=='boolean')throw new HttpError(400,'Choose your marketing preference.');
  return {email,name,marketing:body.marketing};
}
export const tokenHash=t=>createHash('sha256').update(t).digest('hex');
export const newToken=()=>randomBytes(32).toString('base64url');
export function validToken(t){if(typeof t!=='string'||!/^[A-Za-z0-9_-]{43}$/.test(t))throw new HttpError(400,'This link is invalid or expired. Request a new link.');return t;}
export function checkOrigin(req) {
  const {origin,production}=settings();
  const allowed=new Set([origin,...(!production?['http://127.0.0.1:4175','http://localhost:4175']:[])]);
  if(!allowed.has(req.headers.origin)||req.headers['sec-fetch-site']==='cross-site')throw new HttpError(403,'Please use the form on the Sweat Social House website.');
}
export async function readBody(req) {
  if(!String(req.headers['content-type']||'').startsWith('application/json'))throw new HttpError(415,'Use the website form to submit.');
  if(Number(req.headers['content-length'])>4096)throw new HttpError(413,'Request too large.');
  let data=req.body;
  if(data===undefined){let raw='';for await(const chunk of req){raw+=chunk;if(Buffer.byteLength(raw)>4096)throw new HttpError(413,'Request too large.');}data=raw;}
  if(typeof data==='string'){if(Buffer.byteLength(data)>4096)throw new HttpError(413,'Request too large.');try{data=JSON.parse(data);}catch{throw new HttpError(400,'Invalid request.');}}
  if(!data||Array.isArray(data)||typeof data!=='object'||Buffer.byteLength(JSON.stringify(data))>4096)throw new HttpError(400,'Invalid request.');
  return data;
}
export async function rateLimit(req,scope,email='') {
  if(!process.env.RATE_LIMIT_SECRET)throw new HttpError(503,'Signup is not open yet. Please check back soon.');
  const ip=process.env.VERCEL ? String(req.headers['x-vercel-forwarded-for']||'unknown').split(',')[0].trim() : req.socket?.remoteAddress||'local';
  for(const [label,value,max] of [['ip',ip,scope==='admin'?120:20],...(email?[['email',email,4]]:[])]){
    const key=createHmac('sha256',process.env.RATE_LIMIT_SECRET).update(scope+':'+label+':'+value).digest('hex');
    const {rows}=await database().query(`INSERT INTO ssh.rate_limits(key,count,expires_at) VALUES($1,1,now()+interval '1 hour')
      ON CONFLICT(key) DO UPDATE SET count=CASE WHEN ssh.rate_limits.expires_at<now() THEN 1 ELSE ssh.rate_limits.count+1 END,
      expires_at=CASE WHEN ssh.rate_limits.expires_at<now() THEN now()+interval '1 hour' ELSE ssh.rate_limits.expires_at END RETURNING count`,[key]);
    if(rows[0].count>max)throw new HttpError(429,'Too many attempts. Please try again in an hour.');
  }
}
export function endpoint(methods,run) {
  return async(req,res)=>{
    res.setHeader('Cache-Control','private, no-store');res.setHeader('Vercel-CDN-Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');
    res.setHeader('Content-Type','application/json; charset=utf-8');
    try{
      if(!methods.includes(req.method)){res.setHeader('Allow',methods.join(', '));throw new HttpError(405,'Method not allowed.');}
      if(req.method!=='GET')checkOrigin(req);
      const result=await run(req,res);
      res.statusCode=200;res.end(JSON.stringify(result));
    }catch(error){
      const status=error instanceof HttpError?error.status:503;
      if(status===429)res.setHeader('Retry-After','3600');
      // Never log bodies, emails, auth headers, tokens, or provider error payloads.
      if(status===503)console.error('Waitlist request unavailable');
      res.statusCode=status;res.end(JSON.stringify({error:error instanceof HttpError?error.message:'We could not complete that request. Please try again or contact hello@sweatsocialhouse.com.'}));
    }
  };
}
