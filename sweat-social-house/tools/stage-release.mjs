import {mkdtemp,readFile,readdir,copyFile,mkdir,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const release=await mkdtemp(resolve(tmpdir(),'ssh-phase3-release-'));
const full=process.argv.includes('--full-preview');
const sourcePage=full?'full-site.html':'index.html';
const files=new Set(['index.html','admin.html','preferences.html','vercel.json','package.json','package-lock.json']);
for(const page of ['index.html','admin.html','preferences.html'])
 for(const match of (await readFile(resolve(root,page==='index.html'?sourcePage:page),'utf8')).matchAll(/(?:src|href)="\/?((?:assets|client)\/[^"?#]+)"/g))files.add(match[1]);
for(const directory of ['api','server','client'])for(const name of await readdir(resolve(root,directory)))if(/\.(js|css)$/.test(name))files.add(directory+'/'+name);
files.add('tools/build.mjs');
for(const name of await readdir(resolve(root,'assets/fonts')))if(/\.(ttf|txt)$/.test(name))files.add('assets/fonts/'+name);
for(const file of files){await mkdir(dirname(resolve(release,file)),{recursive:true});await copyFile(resolve(root,file==='index.html'?sourcePage:file),resolve(release,file));}
if(full){
 const pkg=JSON.parse(await readFile(resolve(release,'package.json'),'utf8'));pkg.sshPreviewOnly=true;
 await writeFile(resolve(release,'package.json'),JSON.stringify(pkg,null,2)+'\n');
 const config=JSON.parse(await readFile(resolve(release,'vercel.json'),'utf8'));delete config.crons;
 config.headers.push({source:'/(.*)',headers:[{key:'X-Robots-Tag',value:'noindex, nofollow, noarchive'}]});
 await writeFile(resolve(release,'vercel.json'),JSON.stringify(config,null,2)+'\n');
}
await writeFile(resolve(release,'.vercelignore'),'.env*\n.git\nnode_modules\npublic\n');
console.log(release);
