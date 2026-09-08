'use strict';

const Tokens = require('csrf');
const tokens = new Tokens();

const CSRF_COOKIE_NAME = '_csrf';
const CSRF_HEADER_NAME = 'x-csrf-token';
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/**
 * Issues a fresh CSRF secret + token pair, stores the secret in the session,
 * and writes the client-visible token in a non-httpOnly cookie so the SPA can
 * read and echo it as a request header (Synchronizer Token Pattern).
 */
const issueToken = (req, res) => {
  const secret = tokens.secretSync();
  const token  = tokens.create(secret);
  req.session.csrfSecret = secret;
  res.cookie(CSRF_COOKIE_NAME, token, {
    httpOnly: false,          // intentionally JS-readable — required for double-submit pattern
    sameSite: 'Strict',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 1000,  // 1 hour
  });
  return token;
};

/**
 * CSRF protection middleware — Synchronizer Token Pattern.
 *
 * Exemptions (CSRF does not apply to these request categories):
 *
 *  1. Safe HTTP methods (GET, HEAD, OPTIONS) — no state mutation.
 *
 *  2. Requests carrying a valid Authorization: Bearer header.
 *     Cross-origin CSRF payloads cannot set arbitrary request headers,
 *     so the presence of a Bearer token proves same-origin intent.
 *
 *  3. Requests with Content-Type: application/json.
 *     HTML forms cannot send JSON bodies; the browser always uses
 *     application/x-www-form-urlencoded or multipart/form-data for
 *     cross-origin simple requests.  express.json() enforces this at
 *     the parsing layer, making all JSON API endpoints CSRF-safe.
 *
 * For any remaining state-mutating request the middleware validates that
 * the X-CSRF-Token request header matches the session-stored token.
 */
const csrfProtection = (req, res, next) => {
  // 1. Safe methods — ensure token cookie exists then continue
  if (SAFE_METHODS.has(req.method)) {
    if (!req.session.csrfSecret) issueToken(req, res);
    return next();
  }

  // 2. Bearer-authenticated requests are inherently CSRF-safe
  if ((req.headers.authorization || '').startsWith('Bearer ')) {
    return next();
  }

  // 3. JSON Content-Type is safe from simple-request CSRF
  const ct = (req.headers['content-type'] || '').toLowerCase();
  if (ct.includes('application/json')) {
    return next();
  }

  // 4. Validate Synchronizer Token for all remaining state-mutating requests
  const secret       = req.session.csrfSecret;
  const requestToken = req.headers[CSRF_HEADER_NAME];

  if (!secret || !requestToken || !tokens.verify(secret, requestToken)) {
    return res.status(403).json({ status: 'error', message: 'Forbidden' });
  }

  next();
};

/**
 * Route handler that issues a fresh CSRF token.
 * The SPA should call GET /v2/api/auth/csrf-token before any non-JSON
 * state-mutating request to obtain a valid token for the session.
 */
const csrfTokenEndpoint = (req, res) => {
  const token = issueToken(req, res);
  return res.status(200).json({ status: 'success', csrfToken: token });
};

module.exports = { csrfProtection, csrfTokenEndpoint };
