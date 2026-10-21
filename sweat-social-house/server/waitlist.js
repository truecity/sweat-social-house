import {randomUUID} from 'node:crypto';
import {database,transaction} from './db.js';
import {VERSION,PRIVACY_VERSION,WAITLIST_WORDING,MARKETING_WORDING} from './config.js';
import {newToken,tokenHash,validToken,HttpError} from './security.js';
import {sendLink} from './mail.js';
export const GENERIC='If this address needs confirmation, an email is on its way. Check your inbox and spam folder. If you already confirmed, you are already on the list.';
export async function cleanup() {
  await database().query("DELETE FROM ssh.tokens WHERE expires_at<now()");
  await database().query("DELETE FROM ssh.rate_limits WHERE expires_at<now()");
  await database().query("DELETE FROM ssh.subscribers WHERE status='pending' AND created_at<now()-interval '7 days'");
  await database().query("DELETE FROM ssh.admin_actions WHERE occurred_at<now()-interval '90 days'");
}
export async function requestSignup(input,send=sendLink) {
  const token=newToken(),hash=tokenHash(token);
  const job=await transaction(async db=>{
    await db.query(`INSERT INTO ssh.subscribers(id,email,first_name) VALUES($1,$2,$3) ON CONFLICT(email) DO NOTHING`,[randomUUID(),input.email,input.name]);
    const {rows}=await db.query('SELECT * FROM ssh.subscribers WHERE email=$1 FOR UPDATE',[input.email]);const sub=rows[0];
    if(sub.status!=='pending' || (sub.last_email_at&&Date.now()-new Date(sub.last_email_at).getTime()<60000))return null;
    await db.query("DELETE FROM ssh.tokens WHERE subscriber_id=$1 AND purpose='confirm'",[sub.id]);
    await db.query(`INSERT INTO ssh.tokens(hash,subscriber_id,purpose,payload,expires_at) VALUES($1,$2,'confirm',$3,now()+interval '24 hours')`,[hash,sub.id,JSON.stringify({...input,version:VERSION,privacyVersion:PRIVACY_VERSION,waitlistText:WAITLIST_WORDING,marketingText:MARKETING_WORDING})]);
    await db.query('UPDATE ssh.subscribers SET last_email_at=now() WHERE id=$1',[sub.id]);
    return {id:sub.id};
  });
  if(job){
    try{await send(input.email,token,'confirm',hash);}
    catch(e){await database().query('DELETE FROM ssh.tokens WHERE hash=$1',[hash]);await database().query('UPDATE ssh.subscribers SET last_email_at=NULL WHERE id=$1',[job.id]);throw e;}
  }
  return {message:GENERIC};
}
export async function requestManagement(email,send=sendLink){
  const token=newToken(),hash=tokenHash(token);
  const job=await transaction(async db=>{
    const {rows}=await db.query('SELECT * FROM ssh.subscribers WHERE email=$1 FOR UPDATE',[email]);const sub=rows[0];
    if(!sub||(sub.last_email_at&&Date.now()-new Date(sub.last_email_at).getTime()<60000))return null;
    await db.query("DELETE FROM ssh.tokens WHERE subscriber_id=$1 AND purpose='manage'",[sub.id]);
    await db.query("INSERT INTO ssh.tokens(hash,subscriber_id,purpose,expires_at) VALUES($1,$2,'manage',now()+interval '30 minutes')",[hash,sub.id]);
    await db.query('UPDATE ssh.subscribers SET last_email_at=now() WHERE id=$1',[sub.id]);return sub;
  });
  if(job){try{await send(email,token,'manage',hash);}catch(e){await database().query('DELETE FROM ssh.tokens WHERE hash=$1',[hash]);await database().query('UPDATE ssh.subscribers SET last_email_at=NULL WHERE id=$1',[job.id]);throw e;}}
  return {message:'If this address is on our list, a private link is on its way. Check your inbox and spam folder. You can also contact hello@sweatsocialhouse.com.'};
}
export async function applyToken(token,action){
  validToken(token);const hash=tokenHash(token);
  return transaction(async db=>{
    const {rows}=await db.query(`SELECT t.*,s.status FROM ssh.tokens t JOIN ssh.subscribers s ON s.id=t.subscriber_id WHERE t.hash=$1 AND t.expires_at>now() FOR UPDATE OF t,s`,[hash]);
    const record=rows[0];if(!record)throw new HttpError(400,'This link is invalid, expired, or already used. Request a new link.');
    if(action==='confirm'){
      if(record.purpose!=='confirm'||record.status!=='pending')throw new HttpError(400,'This link cannot confirm a signup.');
      const p=record.payload;
      await db.query("UPDATE ssh.subscribers SET first_name=$2,status='confirmed',marketing=$3,confirmed_at=now(),updated_at=now() WHERE id=$1",[record.subscriber_id,p.name,p.marketing]);
      for(const [kind,granted,version,wording] of [['waitlist',true,p.privacyVersion,p.waitlistText],['marketing',p.marketing,p.version,p.marketingText]])
        await db.query('INSERT INTO ssh.consent_events(subscriber_id,kind,granted,version,wording) VALUES($1,$2,$3,$4,$5)',[record.subscriber_id,kind,granted,version,wording]);
      await db.query("DELETE FROM ssh.tokens WHERE subscriber_id=$1 AND purpose='confirm'",[record.subscriber_id]);
      return {message:'You are confirmed ♡ You are on the May 2027 launch list. This does not reserve an event place.'};
    }
    if(record.purpose!=='manage')throw new HttpError(400,'Request a preferences link to make this change.');
    if(action==='remove'){
      await db.query('DELETE FROM ssh.subscribers WHERE id=$1',[record.subscriber_id]);
      return {message:'Your subscriber record and consent history have been removed from our active database. Provider delivery logs and backups may remain until their retention periods expire. Contact hello@sweatsocialhouse.com with any questions.'};
    }
    if(!['unsubscribe','marketing-off'].includes(action))throw new HttpError(400,'Choose a valid preference.');
    await db.query("UPDATE ssh.subscribers SET marketing=false,status=CASE WHEN $2='unsubscribe' THEN 'unsubscribed' ELSE status END,updated_at=now() WHERE id=$1",[record.subscriber_id,action]);
    await db.query('INSERT INTO ssh.consent_events(subscriber_id,kind,granted,version,wording) VALUES($1,$2,false,$3,$4)',[record.subscriber_id,action==='unsubscribe'?'all-email':'marketing',VERSION,action==='unsubscribe'?'Stop all waitlist and marketing emails.':'Stop optional marketing emails.']);
    await db.query("DELETE FROM ssh.tokens WHERE subscriber_id=$1 AND purpose='manage'",[record.subscriber_id]);
    return {message:action==='unsubscribe'?'You have been unsubscribed from launch-list and marketing emails.':'Optional marketing is turned off. You remain on the launch list.'};
  });
}
