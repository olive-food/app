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
    // Đổi code lấy access_token (bắt buộc phải làm để Google chấp nhận flow)
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

    if (!tokenData.access_token) {
      console.error('Token error:', tokenData);
      res.status(500).send('Failed to get access token');
      return;
    }

    // (Có thể gọi API user info nếu muốn, hiện tại mình chưa dùng tới)
    // const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    //   headers: { Authorization: `Bearer ${tokenData.access_token}` },
    // });
    // const user = await userRes.json();

    // 👉 Thành công rồi thì quay về login, kèm cờ googleLogin=1
    res.writeHead(302, { Location: '/#/login?googleLogin=1' });
    res.end();
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
}
