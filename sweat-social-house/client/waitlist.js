(() => {
  const form = document.getElementById('signup');
  const fields = document.getElementById('signup-fields');
  const button = document.getElementById('signup-button');
  const status = document.getElementById('success');
  let config;
  fetch('/api/config', {cache: 'no-store'}).then(async response => {
    if (!response.ok) throw new Error();
    config = await response.json();
    if (!config.enabled) return;
    document.getElementById('waitlist-wording').textContent = config.waitlistText;
    document.getElementById('marketing-wording').textContent = config.marketingText;
    document.getElementById('signup-availability').textContent = 'Join the launch list, then check your inbox to confirm ♡';
    fields.disabled = false;
  }).catch(() => { document.getElementById('signup-availability').textContent = 'Registration is temporarily unavailable. Please check back or contact hello@sweatsocialhouse.com.'; });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!config?.enabled || button.disabled) return;
    button.disabled = true;
    status.textContent = 'Sending your confirmation link…';
    try {
      const response = await fetch('/api/signup', {
        method: 'POST', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({name: form.elements.name.value, email: form.elements.email.value,
          waitlistConsent: document.getElementById('waitlist-consent').checked,
          marketing: document.getElementById('marketing-consent').checked,
          consentVersion: config.privacyVersion, website: form.elements.website.value})
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Please try again.');
      status.textContent = result.message;
      form.reset();
    } catch (error) { status.textContent = error.message === 'Failed to fetch' ? 'We could not connect. Please try again.' : error.message; }
    finally { button.disabled = false; status.focus({preventScroll: true}); }
  });
})();
