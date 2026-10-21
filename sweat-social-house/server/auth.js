import {createClerkClient} from '@clerk/backend';
import {settings} from './config.js';
import {HttpError} from './security.js';
import {database} from './db.js';
export function identityAllowed(user,email){
  return !!user && !user.banned && !user.locked && user.emailAddresses?.some(e=>e.id===user.primaryEmailAddressId && e.emailAddress.toLowerCase()===email && e.verification?.status==='verified');
}
export async function requireAdmin(req){
  const cfg=settings();
  if(!cfg.authReady)throw new HttpError(503,'Dashboard sign-in is being configured.');
  // Use a bearer session token, never a browser-provided role or email.
  if(!/^Bearer [A-Za-z0-9_.-]+$/.test(req.headers.authorization||''))throw new HttpError(401,'Please sign in.');
  const clerk=createClerkClient({secretKey:process.env.CLERK_SECRET_KEY,publishableKey:cfg.publicKey});
  const request=new Request(cfg.origin+'/api/admin',{headers:{authorization:req.headers.authorization}});
  const state=await clerk.authenticateRequest(request,{authorizedParties:[cfg.origin,...(!cfg.production?['http://127.0.0.1:4175','http://localhost:4175']:[])],acceptsToken:'session_token'});
  const auth=state.toAuth();
  if(!auth?.userId)throw new HttpError(401,'Please sign in again.');
  const user=await clerk.users.getUser(auth.userId);
  if(!identityAllowed(user,cfg.adminEmail))throw new HttpError(403,'This account does not have dashboard access.');
  // Pin the first verified intended administrator. Changed email/account cannot silently replace it.
  await database().query('INSERT INTO ssh.admin_identity(singleton,clerk_user_id) VALUES(true,$1) ON CONFLICT(singleton) DO NOTHING',[auth.userId]);
  const {rows}=await database().query('SELECT clerk_user_id FROM ssh.admin_identity WHERE singleton=true');
  if(rows[0]?.clerk_user_id!==auth.userId)throw new HttpError(403,'This account is not the configured administrator.');
  return auth.userId;
}
