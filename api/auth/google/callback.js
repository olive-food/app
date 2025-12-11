import { google } from 'googleapis';

// 1. Thông tin ứng dụng Google OAuth (lấy từ biến môi trường)
const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

// 2. Địa chỉ website phía client (app React)
const clientBaseUrl =
  process.env.VERCEL_ENV === 'development'
    ? 'http://localhost:5173' // nếu chạy dev bằng "npm run dev"
    : 'https://app.olive.com.vn'; // khi deploy trên Vercel với domain app.olive.com.vn

// 3. Địa chỉ callback mà Google sẽ gọi lại
const redirectUri = `${clientBaseUrl}/api/auth/google/callback`;

// 4. Tạo OAuth2 client
const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);

// 5. Hàm xử lý callback từ Google
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

    // 6. Đổi "code" lấy access token
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // 7. Lấy thông tin user từ Google
    const oauth2 = google.oauth2({ auth: oauth2Client, version: 'v2' });
    const { data } = await oauth2.userinfo.get();

    const googleUser = {
      id: data.id,
      email: data.email,
      name: data.name,
      picture: data.picture,
    };

    // 8. Tạo URL để chuyển người dùng về lại app React
    // 🔴 LƯU Ý: chuyển về /#/login?googleUser=... (KHÔNG phải /#/cs nữa)
    const redirectUrl = `${clientBaseUrl}/#/login?googleUser=${encodeURIComponent(
      JSON.stringify(googleUser)
    )}`;

    console.log('SUCCESS: Redirecting to', redirectUrl);

    // 9. Redirect
    res.writeHead(302, { Location: redirectUrl });
    res.end();
  } catch (err) {
    console.error('Google callback error:', err);
    res.statusCode = 500;
    res.end('Google callback error');
  }
}
