(() => {
  const params = new URLSearchParams(location.hash.slice(1));
  let token = params.get('token');
  const purpose = params.get('purpose');
  // Keep the secret only in this page's memory, not URLs, cookies or browser storage.
  if (location.hash) history.replaceState(null, '', location.pathname);
  const status = document.getElementById('status');
  const dialog = document.getElementById('choice-dialog');
  let pendingAction;
  if (token && ['confirm', 'manage'].includes(purpose)) {
    document.getElementById('request-panel').hidden = true;
    document.getElementById(purpose + '-panel').hidden = false;
  }
  async function send(body) {
    const buttons = [...document.querySelectorAll('button')];
    buttons.forEach(button => button.disabled = true);
    status.textContent = 'Working…';
    try {
      const response = await fetch('/api/preferences', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body)});
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Please try again.');
      status.textContent = result.message;
      if (body.action !== 'request') {
        token = null;
        document.getElementById('confirm-panel').hidden = true;
        document.getElementById('manage-panel').hidden = true;
        document.getElementById('request-panel').hidden = false;
      }
      document.getElementById('request-form').reset();
    } catch(error) { status.textContent = error.message === 'Failed to fetch' ? 'We could not connect. Please try again.' : error.message; document.getElementById('request-panel').hidden = false; }
    finally { buttons.forEach(button => button.disabled = false); status.focus(); }
  }
  document.getElementById('request-form').addEventListener('submit', event => {event.preventDefault();send({action:'request',email:document.getElementById('email').value});});
  document.getElementById('confirm').addEventListener('click', () => send({action:'confirm',token}));
  document.querySelectorAll('[data-action]').forEach(button => button.addEventListener('click', () => {
    pendingAction = button.dataset.action;
    document.getElementById('choice-text').textContent = pendingAction === 'remove' ? 'Remove your subscriber record and consent history from the active database? This cannot be undone here.' : pendingAction === 'unsubscribe' ? 'Stop all launch-list and optional marketing emails?' : 'Stop optional marketing and keep Summer 2027 launch-list emails?';
    dialog.showModal(); document.getElementById('choice-cancel').focus();
  }));
  document.getElementById('choice-cancel').addEventListener('click', () => dialog.close());
  document.getElementById('choice-confirm').addEventListener('click', () => {dialog.close();send({action:pendingAction,token});});
})();
