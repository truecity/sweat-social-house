import pg from 'pg';
import { attachDatabasePool } from '@vercel/functions';
import { connectionString } from './connection.js';
let pool;
export function database() {
  if (!pool) {
    if (!process.env.DATABASE_URL) throw new Error('Database unavailable');
    pool = new pg.Pool({connectionString:connectionString(process.env.DATABASE_URL),max:5,idleTimeoutMillis:5000,connectionTimeoutMillis:10000,statement_timeout:10000});
    attachDatabasePool(pool);
  }
  return pool;
}
export async function transaction(run) {
  const client = await database().connect();
  try { await client.query('BEGIN'); const result=await run(client); await client.query('COMMIT'); return result; }
  catch(error) { await client.query('ROLLBACK'); throw error; }
  finally { client.release(); }
}
export async function closeDatabase() { if(pool){await pool.end();pool=undefined;} }
