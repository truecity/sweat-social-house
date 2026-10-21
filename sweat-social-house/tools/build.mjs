import {mkdir,readFile,writeFile,copyFile,rm,readdir} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const output=resolve(root,'public');
await rm(output,{recursive:true,force:true});await mkdir(output,{recursive:true});
// This allowlist is the deployment boundary. Server code, credentials and SQL never become static files.
const pages=['index.html','admin.html','preferences.html'];
const files=new Set(pages);
for(const page of pages){
  const html=await readFile(resolve(root,page),'utf8');
  for(const match of html.matchAll(/(?:src|href)="\/?((?:assets|client)\/[^"?#]+)"/g))files.add(match[1]);
}
for(const name of await readdir(resolve(root,'client')))if(/\.(js|css)$/.test(name))files.add('client/'+name);
for(const name of files){const destination=resolve(output,name);await mkdir(dirname(destination),{recursive:true});await copyFile(resolve(root,name),destination);}
await writeFile(resolve(output,'robots.txt'),'User-agent: *\nDisallow: /admin.html\nDisallow: /preferences.html\nDisallow: /api/\n');
console.log(`Built ${files.size} public files. Server source and secrets excluded.`);
