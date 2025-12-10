// api/auth/google/login.js

export default async function handler(req, res) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI 
    || "https://app.olive.com.vn/api/auth/google/callback";

  if (!clientId) {
    console.error("Missing GOOGLE_CLIENT_ID");
    res.statusCode = 500;
    res.end("Missing GOOGLE_CLIENT_ID");
    return;
  }

  const authUrl =
    "https://accounts.google.com/o/oauth2/v2/auth?" +
    new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "openid email profile",
      access_type: "online",
      prompt: "select_account",
    }).toString();

  res.writeHead(302, { Location: authUrl });
  res.end();
}
