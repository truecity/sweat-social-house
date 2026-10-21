import test from 'node:test';
import assert from 'node:assert/strict';
import {Readable} from 'node:stream';
import {normalizeEmail,signupInput,newToken,tokenHash,validToken,checkOrigin,readBody,endpoint} from '../server/security.js';
import {identityAllowed,requireAdmin} from '../server/auth.js';
import {settings,PRIVACY_VERSION} from '../server/config.js';
import {connectionString} from '../server/connection.js';
const valid={name:'April',email:' April+test@Example.com ',waitlistConsent:true,marketing:false,consentVersion:PRIVACY_VERSION};
test('email normalization preserves aliases; invalid and excessive inputs are rejected',()=>{
 assert.equal(normalizeEmail(valid.email),'april+test@example.com');
 for(const email of ['x','x@','x y@example.com','<x>@example.com','x@a..com','x'.repeat(65)+'@example.com',null])assert.throws(()=>normalizeEmail(email));
 assert.deepEqual(signupInput(valid),{name:'April',email:'april+test@example.com',marketing:false});
 for(const input of [{name:''},{name:'<script>'},{name:'a'.repeat(81)},{waitlistConsent:false},{marketing:'true'},{consentVersion:'old'}])assert.throws(()=>signupInput({...valid,...input}));
});
test('secure tokens have no reversible stored form',()=>{
 const first=newToken(),second=newToken();assert.notEqual(first,second);assert.equal(validToken(first),first);assert.equal(tokenHash(first).length,64);assert.notEqual(tokenHash(first),first);assert.throws(()=>validToken('../invalid'));
});
test('mutations require an allowed origin and same-site request',()=>{
 assert.doesNotThrow(()=>checkOrigin({headers:{origin:'https://sweatsocialhouse.com'}}));
 for(const headers of [{},{origin:'https://attacker.example'},{origin:'https://sweatsocialhouse.com','sec-fetch-site':'cross-site'}])assert.throws(()=>checkOrigin({headers}));
});
test('body content type, length and JSON object shape are enforced',async()=>{
 for(const body of ['{bad','[]','null','"string"','{"a":"'+'x'.repeat(4096)+'"}'])await assert.rejects(readBody({headers:{'content-type':'application/json'},body}));
 await assert.rejects(readBody({headers:{'content-type':'text/plain'},body:'{}'}));
 const stream=Readable.from([Buffer.from('{"name":"April"}')]);stream.headers={'content-type':'application/json'};assert.deepEqual(await readBody(stream),{name:'April'});
});
test('only the intended verified primary email is eligible; unverified/secondary/locked accounts fail',()=>{
 const user={primaryEmailAddressId:'e1',emailAddresses:[{id:'e1',emailAddress:'HELLO@sweatsocialhouse.com',verification:{status:'verified'}}]};
 assert.equal(identityAllowed(user,'hello@sweatsocialhouse.com'),true);
 for(const variant of [{...user,banned:true},{...user,locked:true},{...user,primaryEmailAddressId:'e2'},{...user,emailAddresses:[{...user.emailAddresses[0],verification:{status:'unverified'}}]},{...user,emailAddresses:[{...user.emailAddresses[0],emailAddress:'other@example.com'}]}])assert.equal(identityAllowed(variant,'hello@sweatsocialhouse.com'),false);
});
test('production refuses test authentication keys, and missing mail verification keeps signup closed',async()=>{
 const old={...process.env};
 try {
  Object.assign(process.env,{VERCEL_ENV:'production',NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:'pk_test_example',CLERK_SECRET_KEY:'sk_test_example',DATABASE_URL:'configured',RATE_LIMIT_SECRET:'configured',RESEND_API_KEY:'configured',WAITLIST_ENABLED:'true',EMAIL_DOMAIN_VERIFIED:'false'});
  assert.equal(settings().authReady,false);assert.equal(settings().ready,false);await assert.rejects(requireAdmin({headers:{}}),{status:503});
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY='pk_live_example';process.env.CLERK_SECRET_KEY='sk_live_example';
  await assert.rejects(requireAdmin({headers:{}}),{status:401});
 }finally{for(const key of Object.keys(process.env))if(!(key in old))delete process.env[key];Object.assign(process.env,old);}
});
test('API boundaries block disallowed methods and never return private exception details',async()=>{
 const handler=endpoint(['GET'],async()=>{throw new Error('private database credentials');});
 for(const [method,expected] of [['POST',405],['GET',503]]){
  const headers={};const response={setHeader:(k,v)=>headers[k]=v,end:value=>response.body=value};
  await handler({method,headers:{}},response);assert.equal(response.statusCode,expected);assert.match(headers['Cache-Control'],/no-store/);assert.doesNotMatch(response.body,/credentials/);
 }
});
test('database connections always verify certificates and hostname',()=>{
 const parsed=new URL(connectionString('postgresql://user:password@db.example/db?sslmode=require&uselibpqcompat=true'));assert.equal(parsed.searchParams.get('sslmode'),'verify-full');assert.equal(parsed.searchParams.has('uselibpqcompat'),false);
});
