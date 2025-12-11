import { google } from 'googleapis';

// 1. Khai báo biến môi trường
const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

// 🌟 ĐỊNH NGHĨA BASE URL CỐ ĐỊNH 🌟
// Giúp loại trừ lỗi tính toán base URL trong môi trường Serverless của Vercel
const clientBaseUrl = 
  process.env.VERCEL_ENV === 'development'
    ? 'http://localhost:3000'
    : 'https://app.olive.com.vn'; 

const redirectUri = `${clientBaseUrl}/api/auth/google/callback`;

const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);

export default async function handler(req, res) {
  try {
    // 2. Lấy code: Sử dụng cách an toàn hơn để lấy code từ query params
    const code = req.query.code;

    if (!code) {
      res.statusCode = 400;
      return res.end('Missing code');
    }

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ auth: oauth2Client, version: 'v2' });
    const { data } = await oauth2.userinfo.get();
    
    // 🌟 THÊM KIỂM TRA: Đảm bảo Google trả về dữ liệu đầy đủ
    if (!data || !data.email || !data.id) {
        console.error('Google did not return complete user data:', data);
        res.statusCode = 400;
        return res.end('Google data incomplete');
    }

    const googleUser = {
      id: data.id,
      email: data.email,
      name: data.name,
      picture: data.picture,
    };

    // 3. Tạo URL chuyển hướng (Sử dụng Hash Router: /#/cs?...)
    const redirectUrl = `${clientBaseUrl}/#/cs?googleUser=${encodeURIComponent(
      JSON.stringify(googleUser)
    )}`;
    
    console.log(`SUCCESS: Redirecting to ${redirectUrl}`);

    res.writeHead(302, { Location: redirectUrl });
    res.end();
  } catch (err) {
    console.error('Google callback error (Final Attempt):', err);
    res.statusCode = 500;
    res.end('Google callback error');
  }
}