// api/auth/google/callback.js

export default async function handler(req, res) {
  const code = req.query && req.query.code;
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri =
    process.env.GOOGLE_REDIRECT_URI ||
    "https://app.olive.com.vn/api/auth/google/callback";

  if (!code) {
    res.statusCode = 400;
    res.end("Missing code");
    return;
  }

  if (!clientId || !clientSecret) {
    console.error("Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET");
    res.statusCode = 500;
    res.end("Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET");
    return;
  }

  try {
    // 1. Đổi code sang access_token
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }).toString(),
    });

    const tokenData = await tokenRes.json();

    if (!tokenData.access_token) {
      console.error("Token error:", tokenData);
      res.statusCode = 500;
      res.end("Failed to get access token");
      return;
    }

    // 2. Lấy thông tin user từ Google
    const userRes = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      }
    );

    const googleUser = await userRes.json();

    // 3. Gửi profile về frontend qua query
    const payload = encodeURIComponent(
      JSON.stringify({
        id: googleUser.id,
        email: googleUser.email,
        name: googleUser.name,
        picture: googleUser.picture,
      })
    );

    res.writeHead(302, {
      Location: `/#/login?googleUser=${payload}`,
    });
    res.end();
  } catch (err) {
    console.error("Google callback error:", err);
    res.statusCode = 500;
    res.end("Internal Server Error");
  }
}
