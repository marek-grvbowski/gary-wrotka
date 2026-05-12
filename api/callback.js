// Vercel Serverless Function — GitHub OAuth callback handler for Sveltia/Decap CMS.
// Wymienia code na access_token i wysyła z powrotem do okna CMS przez postMessage.

export default async function handler(req, res) {
  const code = req.query.code;
  if (!code) {
    res.status(400).send('Missing ?code in callback.');
    return;
  }

  const clientId = process.env.GITHUB_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GITHUB_OAUTH_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    res.status(500).send('Missing GITHUB_OAUTH_CLIENT_ID / GITHUB_OAUTH_CLIENT_SECRET env vars.');
    return;
  }

  try {
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    });
    const data = await tokenRes.json();

    const payload = data.access_token
      ? { token: data.access_token, provider: 'github' }
      : { error: data.error_description || data.error || 'unknown_error' };

    const status = data.access_token ? 'success' : 'error';
    const message = `authorization:github:${status}:${JSON.stringify(payload)}`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(`<!doctype html>
<html><body>
<script>
  (function() {
    function send() {
      window.opener && window.opener.postMessage(${JSON.stringify(message)}, '*');
    }
    window.addEventListener('message', function (e) {
      if (e.data === 'authorizing:github') send();
    }, false);
    send();
    setTimeout(function () { window.close(); }, 1000);
  })();
</script>
<p>Logowanie zakończone — możesz zamknąć to okno.</p>
</body></html>`);
  } catch (err) {
    res.status(500).send('OAuth exchange failed: ' + err.message);
  }
}
