import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {database,closeDatabase} from '../server/db.js';
import {requestSignup,requestManagement,applyToken,cleanup} from '../server/waitlist.js';
import {tokenHash,rateLimit} from '../server/security.js';
import {WAITLIST_WORDING,MARKETING_WORDING} from '../server/config.js';
if(process.env.VERCEL_ENV==='production'||process.env.SSH_DATABASE_TESTS!=='development-only')throw new Error('Explicit development-only database test opt-in required');
const prefix='ssh-test-'+randomUUID(),email=prefix+'@example.invalid';
const mailbox=[];const send=async(address,token,purpose)=>{mailbox.push({address,token,purpose});};
const db=database();
test('real database: duplicate races, immutable consent, token lifecycle, opt-out and removal',async t=>{
 let id;
 try {
  await t.test('concurrent requests create one subscriber and one confirmation, never raw token storage',async()=>{
   const responses=await Promise.all(Array.from({length:6},()=>requestSignup({email,name:'Test',marketing:false},send)));
   assert.ok(responses.every(r=>r.message===responses[0].message));assert.equal(mailbox.length,1);
   const {rows}=await db.query('SELECT * FROM ssh.subscribers WHERE email=$1',[email]);assert.equal(rows.length,1);id=rows[0].id;assert.equal(rows[0].status,'pending');
   const tokens=await db.query('SELECT * FROM ssh.tokens WHERE subscriber_id=$1',[id]);assert.equal(tokens.rows[0].hash,tokenHash(mailbox[0].token));assert.ok(!JSON.stringify(tokens.rows).includes(mailbox[0].token));
  });
  await t.test('wrong purpose and expired tokens cannot change data',async()=>{
   await assert.rejects(applyToken(mailbox[0].token,'remove'),{status:400});
   await db.query("UPDATE ssh.tokens SET expires_at=now()-interval '1 minute' WHERE subscriber_id=$1",[id]);
   await assert.rejects(applyToken(mailbox[0].token,'confirm'),{status:400});
   await db.query("UPDATE ssh.tokens SET expires_at=now()+interval '1 hour' WHERE subscriber_id=$1",[id]);
  });
  await t.test('confirmation records exact consent; replay and duplicate cannot alter marketing',async()=>{
   await applyToken(mailbox[0].token,'confirm');await assert.rejects(applyToken(mailbox[0].token,'confirm'),{status:400});
   await requestSignup({email,name:'Changed',marketing:true},send);assert.equal(mailbox.length,1);
   const row=(await db.query('SELECT * FROM ssh.subscribers WHERE id=$1',[id])).rows[0];assert.equal(row.marketing,false);assert.equal(row.first_name,'Test');assert.equal(row.status,'confirmed');
   const events=(await db.query('SELECT * FROM ssh.consent_events WHERE subscriber_id=$1 ORDER BY id',[id])).rows;
   assert.equal(events.length,2);assert.equal(events[0].wording,WAITLIST_WORDING);assert.equal(events[1].wording,MARKETING_WORDING);assert.equal(events[1].granted,false);
  });
  await t.test('preferences do not reveal missing addresses and require explicit one-time actions',async()=>{
   const missing=await requestManagement(prefix+'-missing@example.invalid',send);assert.equal(mailbox.length,1);
   await db.query('UPDATE ssh.subscribers SET last_email_at=NULL WHERE id=$1',[id]);
   const found=await requestManagement(email,send);assert.equal(found.message,missing.message);assert.equal(mailbox.length,2);
   await assert.rejects(applyToken(mailbox[1].token,'confirm'),{status:400});
   await applyToken(mailbox[1].token,'unsubscribe');await assert.rejects(applyToken(mailbox[1].token,'remove'),{status:400});
   assert.equal((await db.query('SELECT status FROM ssh.subscribers WHERE id=$1',[id])).rows[0].status,'unsubscribed');
   await requestSignup({email,name:'Changed',marketing:true},send);assert.equal(mailbox.length,2);
   await db.query('UPDATE ssh.subscribers SET last_email_at=NULL WHERE id=$1',[id]);
   await requestManagement(email,send);await applyToken(mailbox[2].token,'remove');
   for(const table of ['subscribers','tokens','consent_events'])assert.equal((await db.query(`SELECT count(*)::int n FROM ssh.${table} WHERE ${table==='subscribers'?'id':'subscriber_id'}=$1`,[id])).rows[0].n,0);
  });
  await t.test('failed email leaves no valid link and permits retry',async()=>{
   await assert.rejects(requestSignup({email,name:'Test',marketing:true},async()=>{throw new Error('delivery unavailable');}));
   const row=(await db.query('SELECT * FROM ssh.subscribers WHERE email=$1',[email])).rows[0];id=row.id;assert.equal(row.last_email_at,null);assert.equal((await db.query('SELECT count(*)::int n FROM ssh.tokens WHERE subscriber_id=$1',[id])).rows[0].n,0);
   await requestSignup({email,name:'Test',marketing:true},send);await applyToken(mailbox.at(-1).token,'confirm');assert.equal((await db.query('SELECT marketing FROM ssh.subscribers WHERE id=$1',[id])).rows[0].marketing,true);
  });
  await t.test('persistent rate limit is shared across simultaneous requests',async()=>{
   const request={socket:{remoteAddress:prefix},headers:{}};
   const results=await Promise.allSettled(Array.from({length:6},()=>rateLimit(request,prefix,email)));
   assert.equal(results.filter(r=>r.status==='fulfilled').length,4);assert.ok(results.filter(r=>r.status==='rejected').every(r=>r.reason.status===429));
  });
  await t.test('retention cleanup removes stale pending records and dependent tokens',async()=>{
   await db.query("UPDATE ssh.subscribers SET status='pending',created_at=now()-interval '8 days' WHERE id=$1",[id]);await cleanup();assert.equal((await db.query('SELECT count(*)::int n FROM ssh.subscribers WHERE id=$1',[id])).rows[0].n,0);
  });
 }finally{await db.query('DELETE FROM ssh.subscribers WHERE email=$1',[email]);await closeDatabase();}
});
