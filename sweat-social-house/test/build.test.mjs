import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
test('build publishes only public pages, scripts, styles and approved images',async()=>{
 execFileSync(process.execPath,['tools/build.mjs']);
 const root=await readdir('public');assert.deepEqual(root.sort(),['admin.html','assets','client','index.html','preferences.html','robots.txt'].sort());
 const allowed=new Set(['.html','.js','.css','.png','.jpg','.txt']);
 const files=await readdir('public',{recursive:true});
 for(const file of files){if(!file.includes('.'))continue;assert.ok(allowed.has(file.slice(file.lastIndexOf('.'))),file);assert.doesNotMatch(file,/(?:\.env|node_modules|server|api\/|package|\.sql)/);}
 const html=await readFile('public/index.html','utf8');assert.match(html,/signup-fields" disabled/);assert.doesNotMatch(html,/(?:sk_live_|sk_test_|re_[A-Za-z0-9]{20}|postgresql:\/\/)/);
});
