// api/auth/google/callback.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const code = req.query.code as string | undefined;
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = 'https://app.olive.com.vn/api/auth/google/callback';

  if (!code) {
    res.status(400).send('Missing code');
    return;
  }
  if (!clientId || !clientSecret) {
    res.status(500).send('Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET');
    return;
  }

  try {
    // 1. Đổi code lấy access_token
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenRes.json() as any;
    const accessToken = tokenData.access_token as string | undefined;

    if (!accessToken) {
      console.error('Token error:', tokenData);
      res.status(500).send('Failed to get access token');
      return;
    }

    // 2. Lấy thông tin user
    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const user = await userRes.json() as any;

    // 3. Tạm thời: redirect về frontend kèm theo info đơn giản
    const payload = encodeURIComponent(JSON.stringify({
      email: user.email,
      name: user.name,
      picture: user.picture,
    }));

    // Sau này có thể tạo JWT, lưu cookie, v.v. ở đây
    res.writeHead(302, { Location: `/#/login?googleUser=${payload}` });
    res.end();
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
}
