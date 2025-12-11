import crypto from 'crypto';

// 1. Zalo App Credentials (Cần cấu hình trong Vercel Environment Variables)
// Sau khi đăng ký ứng dụng trên Zalo for Developers, anh sẽ có 2 giá trị này
const appId = process.env.ZALO_APP_ID;
const secretKey = process.env.ZALO_SECRET_KEY; // Đây là App Secret Key

// 2. Base URL (Giống như Google Login)
const clientBaseUrl = 
  process.env.VERCEL_ENV === 'development'
    ? 'http://localhost:3000'
    : 'https://app.olive.com.vn'; 

// URL callback phải được khai báo giống hệt trong cấu hình Zalo App
const redirectUri = `${clientBaseUrl}/api/auth/zalo/callback`;

// Hàm hỗ trợ tính toán appsecret_proof (yêu cầu bảo mật của Zalo)
const calculateAppSecretProof = (accessToken, appSecret) => {
    // Sử dụng thuật toán HMAC SHA256
    const hmac = crypto.createHmac('sha256', appSecret);
    hmac.update(accessToken);
    return hmac.digest('hex');
};

export default async function handler(req, res) {
  try {
    // Lấy code từ query string sau khi Zalo redirect về
    const code = req.query.code;

    if (!code) {
      res.statusCode = 400;
      return res.end('Missing code');
    }

    // --- BƯỚC 1: Đổi Code lấy Access Token ---
    const tokenResponse = await fetch('https://oauth.zaloapp.com/v4/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      // Gửi yêu cầu bằng x-www-form-urlencoded
      body: new URLSearchParams({
        app_id: appId,
        app_secret: secretKey,
        code: code,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      }).toString()
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error || !tokenData.access_token) {
      console.error('Zalo Token Error:', tokenData);
      res.statusCode = 401;
      return res.end(`Failed to get Zalo access token: ${tokenData.error_name || 'Unknown'}`);
    }

    const accessToken = tokenData.access_token;
    
    // Tính toán appsecret_proof
    const proof = calculateAppSecretProof(accessToken, secretKey);

    // --- BƯỚC 2: Lấy thông tin User Profile ---
    // Yêu cầu các field: id, name, picture
    const profileResponse = await fetch(`https://graph.zalo.me/v2.0/me?fields=id,name,picture`, {
      method: 'GET',
      headers: {
        // Zalo dùng access_token và appsecret_proof trong header
        'access_token': accessToken,
        'appsecret_proof': proof, 
      },
    });

    const profileData = await profileResponse.json();
    
    if (profileData.error) {
      console.error('Zalo Profile Error:', profileData);
      res.statusCode = 401;
      return res.end(`Failed to get Zalo profile: ${profileData.error_name || 'Unknown'}`);
    }

    // --- BƯỚC 3: Xử lý và Chuyển hướng về Frontend ---
    const zaloUser = {
      id: profileData.id, 
      name: profileData.name,
      // Zalo trả về cấu trúc ảnh trong data.picture.data.url
      picture: profileData.picture?.data?.url || 'https://via.placeholder.com/40', 
    };

    const redirectUrl = `${clientBaseUrl}/#/cs?zaloUser=${encodeURIComponent(
      JSON.stringify(zaloUser)
    )}`;
    
    console.log("Redirecting Zalo user to:", redirectUrl);

    res.writeHead(302, { Location: redirectUrl });
    res.end();

  } catch (err) {
    console.error('Zalo callback error (Function crashed):', err);
    res.statusCode = 500;
    res.end('Zalo callback error');
  }
}