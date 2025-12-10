const { google } = require('googleapis');

const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const redirectUri =
  process.env.VERCEL_ENV === 'development'
    ? 'http://localhost:3000/api/auth/google/callback'
    : 'https://app.olive.com.vn/api/auth/google/callback';

const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);

module.exports = async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const code = url.searchParams.get('code');

    if (!code) {
      res.statusCode = 400;
      return res.end('Missing code');
    }

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ auth: oauth2Client, version: 'v2' });
    const { data } = await oauth2.userinfo.get();

    const googleUser = {
      id: data.id,
      email: data.email,
      name: data.name,
      picture: data.picture,
    };

    const clientBaseUrl =
      process.env.VERCEL_ENV === 'development'
        ? 'http://localhost:3000'
        : 'https://app.olive.com.vn';

    const redirectUrl = `${clientBaseUrl}/#/cs?googleUser=${encodeURIComponent(
      JSON.stringify(googleUser)
    )}`;

    res.writeHead(302, { Location: redirectUrl });
    res.end();
  } catch (err) {
    console.error(err);
    res.statusCode = 500;
    res.end('Google callback error');
  }
};
