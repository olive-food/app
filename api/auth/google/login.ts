// api/auth/google/login.ts

export default function handler(req: any, res: any) {
  const clientId = process.env.GOOGLE_CLIENT_ID;

  if (!clientId) {
    console.error("Missing GOOGLE_CLIENT_ID env");
    res.statusCode = 500;
    res.end("Missing GOOGLE_CLIENT_ID");
    return;
  }

  // Redirect URI dùng cho cả login & callback – phải trùng với cấu hình trên Google
  const redirectUri = "https://app.olive.com.vn/api/auth/google/callback";

  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", "openid email profile");
  authUrl.searchParams.set("access_type", "online");
  authUrl.searchParams.set("prompt", "select_account");

  res.writeHead(302, {
    Location: authUrl.toString(),
  });
  res.end();
}
