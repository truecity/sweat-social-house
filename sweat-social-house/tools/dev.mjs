import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
await import('./build.mjs');
const root=fileURLToPath(new URL('..',import.meta.url));
const config=JSON.parse(await readFile(resolve(root,'vercel.json'),'utf8'));
const handlers={};for(const name of ['config','signup','preferences','admin','cleanup'])handlers['/api/'+name]=(await import('../api/'+name+'.js')).default;
const clerkHost=process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?Buffer.from(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.split('_')[2],'base64').toString().replace(/\$$/,''):'';
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.txt':'text/plain; charset=utf-8'};
createServer(async(req,res)=>{
 try {
  const pathname=new URL(req.url,'http://127.0.0.1').pathname;
  for(const entry of config.headers){
   if(entry.source==='/(.*)' || (entry.source==='/admin.html'?pathname==='/admin.html':entry.source.includes('?!admin')&&pathname!=='/admin.html'))
    for(const header of entry.headers)res.setHeader(header.key,header.key==='Content-Security-Policy'?header.value.replace('; upgrade-insecure-requests','').replaceAll('https://clerk.sweatsocialhouse.com',clerkHost?'https://'+clerkHost:'https://clerk.sweatsocialhouse.com'):header.value);
  }
  if(handlers[pathname])return await handlers[pathname](req,res);
  if(!['GET','HEAD'].includes(req.method)){res.statusCode=405;return res.end();}
  if(pathname==='/admin'){res.writeHead(302,{Location:'/admin.html'});return res.end();}
  const publicRoot=resolve(root,'public'),file=resolve(publicRoot,'.'+decodeURIComponent(pathname==='/'?'/index.html':pathname));
  if(!file.startsWith(publicRoot+'/'))throw new Error();
  const body=await readFile(file);res.setHeader('Content-Type',types[extname(file)]||'application/octet-stream');res.end(req.method==='HEAD'?undefined:body);
 }catch{res.statusCode=404;res.end('Not found');}
}).listen(4175,'127.0.0.1',()=>console.log('Local site and API: http://127.0.0.1:4175'));
