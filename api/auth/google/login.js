const { google } = require('googleapis');

const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const redirectUri =
  process.env.VERCEL_ENV === 'development'
    ? 'http://localhost:3000/api/auth/google/callback'
    : 'https://app.olive.com.vn/api/auth/google/callback';

const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);

module.exports = (req, res) => {
  const scopes = ['openid', 'profile', 'email'];

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: scopes,
  });

  res.writeHead(302, { Location: url });
  res.end();
};
