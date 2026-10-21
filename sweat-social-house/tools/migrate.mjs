import pg from 'pg';
import {readFile} from 'node:fs/promises';
import {connectionString} from '../server/connection.js';
if(!process.env.DATABASE_URL_UNPOOLED)throw new Error('Missing direct migration connection');
const client=new pg.Client({connectionString:connectionString(process.env.DATABASE_URL_UNPOOLED)});
try{await client.connect();await client.query('BEGIN');await client.query(await readFile(new URL('../db/001_waitlist.sql',import.meta.url),'utf8'));await client.query('COMMIT');console.log('Waitlist schema migration passed');}catch(e){await client.query('ROLLBACK').catch(()=>{});console.error('Migration failed (credentials withheld)');process.exitCode=1;}finally{await client.end();}
