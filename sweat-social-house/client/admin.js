(() => {
  const status = document.getElementById('status');
  const dashboard = document.getElementById('dashboard');
  const rows = document.getElementById('subscribers');
  const dialog = document.getElementById('manage-dialog');
  let page = 0, total = 0, pending, busy = false, requestSequence = 0;
  function clearPrivateView() {
    requestSequence++;
    dashboard.hidden = true; rows.replaceChildren();
    document.getElementById('summary').replaceChildren();
    document.getElementById('consent-history').replaceChildren();
    document.getElementById('manage-description').textContent = '';
    document.getElementById('search-form').reset();
    dialog.close(); pending = null;
  }
  async function api(path, body) {
    const token = await window.Clerk.session?.getToken();
    if (!token) { clearPrivateView(); throw new Error('Please sign in again.'); }
    const response = await fetch(path, {method:body?'POST':'GET', cache:'no-store',
      headers:{Authorization:'Bearer '+token,...(body?{'Content-Type':'application/json'}:{})},
      ...(body?{body:JSON.stringify(body)}:{})});
    const result = await response.json();
    if (!response.ok) {
      if ([401,403].includes(response.status)) clearPrivateView();
      throw new Error(result.error || 'Please try again.');
    }
    return result;
  }
  function cell(text) { const td=document.createElement('td');td.textContent=text;return td; }
  async function load() {
    if (busy) return;
    busy = true;
    const sequence = ++requestSequence;
    status.textContent = 'Loading subscribers…';
    try {
      const params = new URLSearchParams({page:String(page),q:document.getElementById('search').value,status:document.getElementById('filter').value});
      const data = await api('/api/admin?'+params);
      if (sequence !== requestSequence) return;
      rows.replaceChildren(); total=data.total;
      document.getElementById('summary').replaceChildren(...[
        data.summary.total+' total',data.summary.confirmed+' confirmed',data.summary.marketing+' opted into marketing'
      ].map(text=>{const el=document.createElement('span');el.textContent=text;return el;}));
      data.subscribers.forEach(sub => {
        const tr=document.createElement('tr'), name=cell(sub.first_name), email=document.createElement('div');
        email.textContent=sub.email;name.append(email);
        tr.append(name,cell(sub.status),cell(sub.marketing?'Opted in':'Not opted in'),cell(new Date(sub.created_at).toLocaleDateString()));
        const actions=cell('');
        for (const [action,label] of [['consent','Consent history'],['marketing-off','Stop marketing'],['unsubscribe','Unsubscribe'],['remove','Remove']]) {
          const button=document.createElement('button');button.type='button';button.className='secondary';button.textContent=label;
          button.setAttribute('aria-label',label+' for '+sub.first_name);
          button.addEventListener('click',()=>manage(sub,action));actions.append(button);
        }
        tr.append(actions);rows.append(tr);
      });
      document.getElementById('result-count').textContent=total+' matching subscriber'+(total===1?'':'s');
      document.getElementById('page').textContent='Page '+(page+1)+' of '+Math.max(1,Math.ceil(total/50));
      document.getElementById('previous').disabled=page===0;
      document.getElementById('next').disabled=(page+1)*50>=total;
      dashboard.hidden=false;status.textContent=total?'':'No subscribers match this search.';
    } catch(error) { status.textContent=error.message; }
    finally { busy=false; }
  }
  async function manage(sub,action) {
    pending={id:sub.id,action,confirm:true};
    const history=document.getElementById('consent-history');history.replaceChildren();
    const apply=document.getElementById('apply');apply.hidden=action==='consent';
    document.getElementById('manage-title').textContent=action==='consent'?'Consent history':'Confirm subscriber change';
    document.getElementById('manage-description').textContent=action==='consent'?sub.email:
      (action==='remove'?'Permanently remove the active subscriber record and consent history for ':action==='unsubscribe'?'Stop all launch-list and marketing emails for ':'Stop optional marketing emails for ')+sub.email+'?';
    dialog.showModal();document.getElementById('cancel').focus();
    if(action==='consent') {
      history.textContent='Loading consent history…';
      try { const data=await api('/api/admin?id='+encodeURIComponent(sub.id));
        if(!dialog.open||pending?.id!==sub.id||pending.action!=='consent')return;
        history.replaceChildren();
        if(!data.events.length)history.textContent='No confirmed consent recorded yet.';
        for(const event of data.events){const p=document.createElement('p');p.textContent=new Date(event.occurred_at).toLocaleString()+' · '+event.kind+' · '+(event.granted?'Granted':'Not granted / withdrawn')+' · '+event.version+' — '+event.wording;history.append(p);}
      }catch(error){history.textContent=error.message;}
    }
  }
  document.getElementById('cancel').addEventListener('click',()=>dialog.close());
  document.getElementById('apply').addEventListener('click',async()=>{
    const button=document.getElementById('apply');if(button.disabled||!pending)return;button.disabled=true;
    try {await api('/api/admin',pending);dialog.close();await load();status.textContent='Subscriber updated.';}
    catch(error){dialog.close();status.textContent=error.message;}
    finally {button.disabled=false;pending=null;status.focus();}
  });
  document.getElementById('search-form').addEventListener('submit',event=>{event.preventDefault();if(!busy){page=0;load();}});
  document.getElementById('previous').addEventListener('click',()=>{if(!busy&&page>0){page--;load();}});
  document.getElementById('next').addEventListener('click',()=>{if(!busy&&(page+1)*50<total){page++;load();}});
  function script(src, key) { return new Promise((resolve,reject)=>{const el=document.createElement('script');el.src=src;el.crossOrigin='anonymous';if(key)el.dataset.clerkPublishableKey=key;el.onload=resolve;el.onerror=()=>reject(new Error('Secure sign-in could not load. Please try again.'));document.head.append(el);}); }
  async function start() {
    try {
      const response=await fetch('/api/config',{cache:'no-store'});if(!response.ok)throw new Error('Dashboard is temporarily unavailable.');
      const cfg=await response.json();
      if(!cfg.authEnabled) {status.textContent='Secure dashboard sign-in is being configured. Subscriber information is not accessible here yet.';return;}
      const host=atob(cfg.clerkPublishableKey.split('_')[2]).replace(/\$$/,'');
      if(!/^[a-z0-9.-]+$/.test(host))throw new Error('Invalid sign-in configuration.');
      await script('https://'+host+'/npm/@clerk/ui@1/dist/ui.browser.js');
      await script('https://'+host+'/npm/@clerk/clerk-js@6/dist/clerk.browser.js',cfg.clerkPublishableKey);
      await window.Clerk.load({ui:{ClerkUI:window.__internal_ClerkUICtor}});
      const update=async()=>{
        const signin=document.getElementById('sign-in');
        if(window.Clerk.isSignedIn) {window.Clerk.unmountSignIn(signin);signin.hidden=true;window.Clerk.mountUserButton(document.getElementById('account'));await load();}
        else {clearPrivateView();signin.hidden=false;status.textContent='Sign in with April’s verified business email to continue.';window.Clerk.mountSignIn(signin,{forceRedirectUrl:location.origin+'/admin.html',signUpForceRedirectUrl:location.origin+'/admin.html'});}
      };
      await update();
      let previous=window.Clerk.session?.id;
      window.Clerk.addListener(({session})=>{if(previous!==session?.id){previous=session?.id;clearPrivateView();update();}});
    } catch(error) {clearPrivateView();status.textContent=error.message;}
  }
  // Never leave subscriber details in a restored back-forward cache entry.
  window.addEventListener('pagehide',clearPrivateView);
  window.addEventListener('pageshow',event=>{if(event.persisted)location.reload();});
  start();
})();
