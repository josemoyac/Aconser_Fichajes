export default () => ({
  provider: process.env.OIDC_PROVIDER ?? 'mock',
  issuer: process.env.OIDC_ISSUER_URL ?? '',
  clientId: process.env.OIDC_CLIENT_ID ?? '',
  clientSecret: process.env.OIDC_CLIENT_SECRET ?? '',
  redirectUri: process.env.OIDC_REDIRECT_URI ?? 'http://localhost:3000/auth/callback',
  scopes: process.env.OIDC_SCOPES ?? 'openid profile email offline_access',
  cookieDomain: process.env.COOKIE_DOMAIN ?? 'localhost'
});
