import {endpoint,readBody,rateLimit,HttpError} from '../server/security.js';
import {requireAdmin} from '../server/auth.js';
import {database,transaction} from '../server/db.js';
import {VERSION} from '../server/config.js';
import {cleanup} from '../server/waitlist.js';
export default endpoint(['GET','POST'],async req=>{
 const actor=await requireAdmin(req);await rateLimit(req,'admin');await cleanup();
 if(req.method==='GET'){
  const params=new URL(req.url,'https://sweatsocialhouse.com').searchParams;
  if(params.has('id')){
   const id=params.get('id');
   if(!/^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/.test(id))throw new HttpError(400,'Invalid subscriber.');
   const {rows}=await database().query('SELECT kind,granted,version,wording,occurred_at FROM ssh.consent_events WHERE subscriber_id=$1 ORDER BY occurred_at,id',[id]);
   return {events:rows};
  }
  const q=(params.get('q')||'').trim().slice(0,100),status=params.get('status')||'';
  const page=Math.max(0,Math.min(10000,Number.parseInt(params.get('page')||'0',10)||0));
  if(status&&!['pending','confirmed','unsubscribed'].includes(status))throw new HttpError(400,'Invalid status.');
  const values=['%'+q.replace(/[\\%_]/g,'\\$&')+'%',status];
  const where="WHERE (email ILIKE $1 OR first_name ILIKE $1) AND ($2='' OR status=$2)";
  const [list,count,summary]=await Promise.all([
   database().query(`SELECT id,email,first_name,status,marketing,created_at,confirmed_at FROM ssh.subscribers ${where} ORDER BY created_at DESC,id LIMIT 50 OFFSET $3`,[...values,page*50]),
   database().query(`SELECT count(*)::int AS count FROM ssh.subscribers ${where}`,values),
   database().query("SELECT count(*)::int AS total,count(*) FILTER(WHERE status='confirmed')::int AS confirmed,count(*) FILTER(WHERE status='confirmed' AND marketing)::int AS marketing FROM ssh.subscribers")]);
  return {subscribers:list.rows,total:count.rows[0].count,summary:summary.rows[0],page};
 }
 const body=await readBody(req);
 if(!/^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/.test(body.id||'')||!['unsubscribe','marketing-off','remove'].includes(body.action))throw new HttpError(400,'Invalid management action.');
 if(body.action==='remove'&&body.confirm!==true)throw new HttpError(400,'Confirm removal first.');
 return transaction(async db=>{
  const {rows}=await db.query('SELECT id FROM ssh.subscribers WHERE id=$1 FOR UPDATE',[body.id]);if(!rows.length)throw new HttpError(404,'Subscriber not found.');
  if(body.action==='remove')await db.query('DELETE FROM ssh.subscribers WHERE id=$1',[body.id]);
  else{
   await db.query("UPDATE ssh.subscribers SET marketing=false,status=CASE WHEN $2='unsubscribe' THEN 'unsubscribed' ELSE status END,updated_at=now() WHERE id=$1",[body.id,body.action]);
   await db.query('INSERT INTO ssh.consent_events(subscriber_id,kind,granted,version,wording) VALUES($1,$2,false,$3,$4)',[body.id,body.action==='unsubscribe'?'all-email':'marketing',VERSION,'Preference withdrawn by the authorized administrator.']);
  }
  await db.query('INSERT INTO ssh.admin_actions(actor,action) VALUES($1,$2)',[actor,body.action]);
  return {message:'Subscriber updated.'};
 });
});
