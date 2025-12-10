// api/auth/google/login.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    res.status(500).send('Missing GOOGLE_CLIENT_ID');
    return;
  }

 const redirectUri = 'https://app.olive.com.vn/api/auth/google/callback'; // khi deploy sẽ sửa thành app.olive.com.vn
  const scope = [
    'openid',
    'email',
    'profile',
  ].join(' ');

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope,
    access_type: 'offline',
    prompt: 'consent',
  });

  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

  res.writeHead(302, { Location: googleAuthUrl });
  res.end();
}
