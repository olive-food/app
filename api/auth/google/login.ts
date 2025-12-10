export default async function handler(req, res) {
  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
  const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

  const authUrl =
    "https://accounts.google.com/o/oauth2/v2/auth?" +
    new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      response_type: "code",
      scope: "email profile",
      access_type: "online",
      prompt: "select_account",
    });

  res.redirect(authUrl);
}
