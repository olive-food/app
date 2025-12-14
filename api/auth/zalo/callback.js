// api/auth/zalo/callback.js

function parseCookies(cookieHeader = '') {
  const out = {};
  cookieHeader.split(';').forEach((part) => {
    const [k, ...v] = part.trim().split('=');
    if (!k) return;
    out[k] = decodeURIComponent(v.join('=') || '');
  });
  return out;
}

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

    // Anh đang dùng biến ZALO_SECRET_KEY trên Vercel
    const secretKey = process.env.ZALO_SECRET_KEY || process.env.ZALO_APP_SECRET;

    if (!appId || !secretKey) {
      res.statusCode = 500;
      res.end('Missing ZALO_APP_ID or ZALO_SECRET_KEY');
      return;
    }

    const baseUrl =
      process.env.VERCEL_ENV === 'development'
        ? 'http://localhost:3000'
        : 'https://app.olive.com.vn';

    const redirectUri = `${baseUrl}/api/auth/zalo/callback`;

    const url = new URL(req.url, `http://${req.headers.host}`);
    const code = url.searchParams.get('code');

    if (!code) {
      res.statusCode = 400;
      res.end('Missing "code" from Zalo callback');
      return;
    }

    // Lấy code_verifier từ cookie
    const cookies = parseCookies(req.headers.cookie || '');
    const codeVerifier = cookies.zalo_code_verifier;

    if (!codeVerifier) {
      res.statusCode = 400;
      res.end('Missing PKCE code_verifier cookie. Please login again.');
      return;
    }

    // 1) Đổi code -> access_token (User Access Token V4)
    const tokenUrl = 'https://oauth.zaloapp.com/v4/access_token';

    const body = new URLSearchParams({
      app_id: appId,
      code,
      grant_type: 'authorization_code',
      code_verifier: codeVerifier,
      redirect_uri: redirectUri,
    });

    // IMPORTANT: vì anh bật “Kiểm tra secret key…”
    // => phải gửi header secret_key
    const tokenData = await fetchJson(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        secret_key: secretKey,
      },
      body,
    });

    const accessToken = tokenData?.access_token;
    if (!accessToken) {
      console.error('Zalo token response:', tokenData);
      res.statusCode = 500;
      res.end('Failed to get Zalo access_token');
      return;
    }

    // 2) Lấy profile (id, name, picture)
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

    // Xóa cookie code_verifier sau khi dùng xong
    res.setHeader('Set-Cookie', [
      'zalo_code_verifier=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax; Secure',
    ]);

    // 3) Redirect về /#/cs?zaloUser=...
    const redirectUrl =
      `${baseUrl}/#/cs?zaloUser=` +
      encodeURIComponent(JSON.stringify(zaloUser));

    res.writeHead(302, { Location: redirectUrl });
    res.end();
  } catch (err) {
    console.error('Zalo callback error:', err);
    res.statusCode = 500;
    res.end('Zalo callback error');
  }
}