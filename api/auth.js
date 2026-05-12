// Vercel Serverless Function — start GitHub OAuth flow for Sveltia CMS.
// Wymaga env vars: GITHUB_OAUTH_CLIENT_ID, GITHUB_OAUTH_CLIENT_SECRET.

export default function handler(req, res) {
  const clientId = process.env.GITHUB_OAUTH_CLIENT_ID;
  if (!clientId) {
    res.status(500).send('Missing GITHUB_OAUTH_CLIENT_ID env var on Vercel.');
    return;
  }

  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const redirectUri = `${protocol}://${host}/api/callback`;

  const state = (req.query.site_id || host) + ':' + Math.random().toString(36).slice(2);

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: 'repo,user',
    state,
  });

  res.writeHead(302, {
    Location: `https://github.com/login/oauth/authorize?${params.toString()}`,
  });
  res.end();
}
