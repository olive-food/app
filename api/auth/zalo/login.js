// api/auth/zalo/login.js

export default async function handler(req, res) {
  try {
    const appId = process.env.ZALO_APP_ID;

    if (!appId) {
      res.statusCode = 500;
      res.end('Missing ZALO_APP_ID in environment variables');
      return;
    }

    // Lấy baseUrl theo môi trường (prod chạy app.olive.com.vn)
    const baseUrl =
      process.env.VERCEL_ENV === 'development'
        ? 'http://localhost:3000'
        : 'https://app.olive.com.vn';

    const redirectUri = `${baseUrl}/api/auth/zalo/callback`;

    const state = Math.random().toString(36).slice(2);

    const authUrl =
      'https://oauth.zaloapp.com/v4/permission' +
      `?app_id=${encodeURIComponent(appId)}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&state=${encodeURIComponent(state)}`;

    res.writeHead(302, { Location: authUrl });
    res.end();
  } catch (err) {
    console.error('Zalo login error:', err);
    res.statusCode = 500;
    res.end('Zalo login error');
  }
}
