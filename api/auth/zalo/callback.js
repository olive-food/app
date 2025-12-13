// api/auth/zalo/callback.js

async function fetchJson(url, options) {
  const r = await fetch(url, options);
  const text = await r.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Non-JSON response (${r.status}): ${text}`);
  }
}

export default async function handler(req, res) {
  try {
    const appId = process.env.ZALO_APP_ID;
    const appSecret = process.env.ZALO_APP_SECRET;

    if (!appId || !appSecret) {
      res.statusCode = 500;
      res.end('Missing ZALO_APP_ID or ZALO_APP_SECRET');
      return;
    }

    const baseUrl =
      process.env.VERCEL_ENV === 'development'
        ? 'http://localhost:3000'
        : 'https://app.olive.com.vn';

    const url = new URL(req.url, `http://${req.headers.host}`);
    const code = url.searchParams.get('code');

    if (!code) {
      res.statusCode = 400;
      res.end('Missing "code" from Zalo callback');
      return;
    }

    // 1) Đổi code -> access_token
    const tokenUrl = 'https://oauth.zaloapp.com/v4/access_token';

    const body = new URLSearchParams({
      app_id: appId,
      app_secret: appSecret,
      code,
      grant_type: 'authorization_code',
    });

    const tokenData = await fetchJson(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });

    const accessToken = tokenData?.access_token;
    if (!accessToken) {
      console.error('Zalo token response:', tokenData);
      res.statusCode = 500;
      res.end('Failed to get Zalo access_token');
      return;
    }

    // 2) Lấy profile user
    const profileUrl =
      'https://graph.zalo.me/v2.0/me' +
      `?access_token=${encodeURIComponent(accessToken)}` +
      `&fields=id,name,picture`;

    const profileData = await fetchJson(profileUrl, { method: 'GET' });

    const picture =
      profileData?.picture?.data?.url ||
      profileData?.picture ||
      '';

    const zaloUser = {
      id: profileData?.id,
      name: profileData?.name,
      picture,
    };

    // 3) Redirect về /#/cs?zaloUser=...
    const redirectUrl =
      `${baseUrl}/#/cs?zaloUser=` +
      encodeURIComponent(JSON.stringify(zaloUser));

    console.log('Zalo callback success, redirect to:', redirectUrl);

    res.writeHead(302, { Location: redirectUrl });
    res.end();
  } catch (err) {
    console.error('Zalo callback error:', err);
    res.statusCode = 500;
    res.end('Zalo callback error');
  }
}
