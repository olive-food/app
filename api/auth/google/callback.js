// api/auth/google/callback.js
import { google } from 'googleapis';

// 1. Lấy thông tin OAuth từ biến môi trường
const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

// 2. URL base của frontend
const clientBaseUrl =
  process.env.VERCEL_ENV === 'development'
    ? 'http://localhost:3000' // khi chạy local
    : 'https://app.olive.com.vn'; // khi chạy trên Vercel

// 3. URL callback đã đăng ký với Google
const redirectUri = `${clientBaseUrl}/api/auth/google/callback`;

// 4. Tạo OAuth2 client
const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);

// 5. Hàm handler cho callback
export default async function handler(req, res) {
  try {
    // Lấy "code" Google trả về trong URL
    const url = new URL(req.url, `http://${req.headers.host}`);
    const code = url.searchParams.get('code');

    if (!code) {
      res.statusCode = 400;
      res.end('Missing "code" from Google callback');
      return;
    }

    // Đổi "code" lấy token
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Lấy thông tin user
    const oauth2 = google.oauth2({ auth: oauth2Client, version: 'v2' });
    const { data } = await oauth2.userinfo.get();

    const googleUser = {
      id: data.id,
      email: data.email,
      name: data.name,
      picture: data.picture,
    };

    // 🔴 QUAN TRỌNG: redirect về /#/cs?googleUser=...
    const redirectUrl = `${clientBaseUrl}/#/cs?googleUser=${encodeURIComponent(
      JSON.stringify(googleUser)
    )}`;

    console.log('Google callback success, redirect to:', redirectUrl);

    res.writeHead(302, { Location: redirectUrl });
    res.end();
  } catch (err) {
    console.error('Google callback error:', err);
    res.statusCode = 500;
    res.end('Google callback error');
  }
}
