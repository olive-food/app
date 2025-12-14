// api/auth/zalo/login.js
import crypto from 'crypto';

function base64Url(buffer) {
  return buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function sha256Base64Url(str) {
  const hash = crypto.createHash('sha256').update(str).digest();
  return base64Url(hash);
}

export default async function handler(req, res) {
  try {
    const appId = process.env.ZALO_APP_ID;
    if (!appId) {
      res.statusCode = 500;
      res.end('Missing ZALO_APP_ID');
      return;
    }

    const baseUrl =
      process.env.VERCEL_ENV === 'development'
        ? 'http://localhost:3000'
        : 'https://app.olive.com.vn';

    const redirectUri = `${baseUrl}/api/auth/zalo/callback`;

    // ===== PKCE =====
    const codeVerifier = base64Url(crypto.randomBytes(32));
    const codeChallenge = sha256Base64Url(codeVerifier);

    // Lưu code_verifier vào cookie (httpOnly) để callback lấy ra
    // (cookie tồn tại 10 phút)
    res.setHeader('Set-Cookie', [
      `zalo_code_verifier=${encodeURIComponent(codeVerifier)}; Path=/; HttpOnly; Max-Age=600; SameSite=Lax; Secure`,
    ]);

    // state (demo)
    const state = base64Url(crypto.randomBytes(16));

    // Zalo OAuth v4 permission endpoint
    const authUrl =
      'https://oauth.zaloapp.com/v4/permission' +
      `?app_id=${encodeURIComponent(appId)}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&state=${encodeURIComponent(state)}` +
      `&code_challenge=${encodeURIComponent(codeChallenge)}` +
      `&code_challenge_method=S256`;

    res.writeHead(302, { Location: authUrl });
    res.end();
  } catch (err) {
    console.error('Zalo login error:', err);
    res.statusCode = 500;
    res.end('Zalo login error');
  }
}