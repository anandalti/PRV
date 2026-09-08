// Use CommonJS require for OktaJwtVerifier for compatibility with require().
const OktaJwtVerifier = require('@okta/jwt-verifier').default || require('@okta/jwt-verifier');

const oktaJwtVerifier = new OktaJwtVerifier({
  issuer: process.env.OKTA_ISSUER, // e.g., https://dev-xxxx.okta.com/oauth2/default
});

const API_AUDIENCE = process.env.API_AUDIENCE || 'api://default';

async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const match = authHeader.match(/Bearer (.+)/);
    if (!match) return res.status(401).json({status:'Token_Missing',message:'Missing bearer token'});

    const accessToken = match[1];
    const jwt = await oktaJwtVerifier.verifyAccessToken(accessToken, API_AUDIENCE);
    // console.log(accessToken, jwt);
    req.user = jwt.claims; // includes scp, groups, sub, email (if configured)
    return next();
  } catch (err) {
    console.error('JWT verification failed:', err);
    return res.status(401).json({status:'Invalid_Token',message:'Invalid or expired token'});
  }
}

module.exports = authMiddleware;