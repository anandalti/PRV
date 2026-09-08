//const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
// const indexRouter = require('./routes/index');
const helmet = require('helmet');
require('dotenv').config();
const { mountGraphQL } = require('./gql');


const { doubleCsrf } = require('csrf-csrf');

const { doubleCsrfProtection } = doubleCsrf({
  getSecret: () => process.env.SESSION_EMR_SECRET || 'csrf-fallback-secret',
  cookieName: '_csrf',
  cookieOptions: {
    httpOnly: false,          // intentionally JS-readable for double-submit pattern
    sameSite: 'Strict',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 1000,
  },
  ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
  getTokenFromRequest: (req) => req.headers['x-csrf-token'],
});

const app = express();
// Update timeout for gateway to 5 minutes
app.use((req, res, next) => {
  req.setTimeout(300000)
  res.setTimeout(300000);
  next();
});

app.use(helmet());
/* Netsparker - Secuirty  */
//HCST-HH-001

app.use(helmet.contentSecurityPolicy({
  // Specify directives as normal.
  directives: {
    defaultSrc: ["'self'", '*.emerson.com', 'localhost:3000', '*.emersonprocess.com', 'localhost:63593', 'localhost:3004', '*.googleapis.com', '*.bootstrapcdn.com', '*.aspnetcdn.com', '*.emrsn.com', '*.jquery.com', '*.azurewebsites.net', '*.oktapreview.com', '*.visualstudio.com', '*.okta.com'],
    scriptSrc: ["'self'", "'unsafe-inline'", '*.emerson.com', 'localhost:3000','*.emersonprocess.com', 'localhost:63593', 'localhost:3004', '*.googleapis.com', '*.bootstrapcdn.com', '*.aspnetcdn.com', '*.googletagmanager.com', '*.emrsn.com', '*.jquery.com', '*.azurewebsites.net', "'unsafe-eval'"],
    styleSrc: ["'self'", '*.bootstrapcdn.com', '*.jquery.com', '*.emerson.com', '*.azurewebsites.net', 'localhost:3000', '*.emersonprocess.com', 'localhost:63593', 'localhost:3004', "'unsafe-inline'"],
    fontSrc: ["'self'", '*.emerson.com', '*.bootstrapcdn.com', '*.azurewebsites.net', '*.emrsn.com', 'localhost:3000', '*.emersonprocess.com', 'localhost:63593', 'localhost:3004', 'data:'],
    imgSrc: ['*.emerson.com', '*.azurewebsites.net', 'data:', '*.emrsn.com', 'localhost:3000', '*.emersonprocess.com','localhost:63593', 'localhost:3004'],
    sandbox: ['allow-forms', 'allow-scripts', 'allow-same-origin', 'allow-popups'],
    objectSrc: ["'none'"],
    upgradeInsecureRequests: [],
    workerSrc: ["'none'"]  // This is not set.
  },

  // This module will detect common mistakes in your directives and throw errors
  // if it finds any. To disable this, enable "loose mode".
  loose: false,

  // Set to true if you only want browsers to report errors, not block them.
  // You may also set this to a function(req, res) in order to decide dynamically
  // whether to use reportOnly mode, e.g., to allow for a dynamic kill switch.
  reportOnly: false,

  // Set to true if you want to blindly set all headers: Content-Security-Policy,
  // X-WebKit-CSP, and X-Content-Security-Policy.
  setAllHeaders: false,

  // Set to true if you want to disable CSP on Android where it can be buggy.
  disableAndroid: false,

  // Set to false if you want to completely disable any user-agent sniffing.
  // This may make the headers less compatible but it will be much faster.
  // This defaults to `true`.
  browserSniff: true
}))


//HCST-HH-002
app.use(helmet.hsts({
  maxAge: 31536000,
  includeSubDomains: true, // Must be enabled to be approved
  preload: true
}))
// Strict-Transport-Security: max-age: 31536000; includeSubDomains

app.use((req, res, next) => {
  res.append('X-Frame-Options', 'SAMEORIGIN');
  next();
});


//HCST-HH-003
app.use(helmet.noSniff())

//HCST-HH-009
app.disable('x-powered-by');


app.set('x-powered-by', false);

//HCST-HH-010
app.use(helmet.xssFilter())


//HCST-HH-011
app.use(function (req, res, next) {
  res.removeHeader("X-Powered-By");
  next();
});

// Adding CORS
app.use(function (req, res, next) {
  //Enabling CORS
  //let headers = [];
  let allowedOrigins = [
    'prvpa_desktop_sizing_app',
    'http://localhost:3000',
    'http://localhost:3004',
    'http://localhost:3007',
    'http://localhost:4000',
    'http://localhost:3002',
    'http://localhost:63593',
    'https://prvpa-sizing-dev.emerson.com',
    'https://prvpa-sizing-stage.emerson.com',
    'https://prvpa-sizing.emerson.com',
    'https://prvpa-reports-dev.emerson.com',
    'https://prvpa-reports-stage.emerson.com',
    'https://prvpa-reports.emerson.com',
    'https://prvpa-drawing-dev.emerson.com',
    'https://prvpa-drawing-stage.emerson.com',
    'https://prvpa-drawing.emerson.com',
    'https://d1-live.emerson.com',
    'https://s1-live.emerson.com',
    'https://www.emerson.com',
    'https://tlkemr-live.dev.emrsn.org',
    'https://tlkemr-live.dev.emerson.com',
    'https://regulatorportal.emersonprocess.com/'
  ];

  // let allowedOrigins = ["*.*"];

  let origin = req.headers.origin;
  // console.log(origin)
  if (origin && (allowedOrigins.indexOf(origin) > -1)) {
    // headers.push(makeJSONkey("Access-Control-Allow-Origin",origin))
    let newIndex = allowedOrigins.indexOf(origin);
    let newOrigin = allowedOrigins[newIndex];
    res.setHeader('Access-Control-Allow-Origin', newOrigin);
    // res.setHeader('Access-Control-Allow-Origin', "*");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT,DELETE,PATCH");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With," +
      "contentType,Content-Type, Accept, Authorization, X-CSRF-Token");
    res.header('Access-Control-Allow-Credentials', true);
    res.setHeader("X-Frame-Options", "SAMEORIGIN")
  }
  // headers.push(makeJSONkey("Access-Control-Allow-Methods","GET,HEAD,OPTIONS,POST,PUT,DELETE"))
  // headers.push(makeJSONkey("Access-Control-Allow-Headers","Origin, X-Requested-With, contentType,Content-Type, Accept, Authorization"))
  // headers.push(makeJSONkey('Access-Control-Allow-Credentials',true))

  //applyHeaders(headers, res);
  if (req.method == 'OPTIONS') {
    res.send("");
  }
  else next();
});


// view engine setup
app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: "50mb", extended: false }));
app.use(cookieParser());
// For secure cookie , Netsparker secuirty 
app.set('trust proxy', 1)


let sessionData = { secret: process.env.SESSION_EMR_SECRET, resave: true, saveUninitialized: true };
sessionData.cookie = {
  secure: true
}



app.use(session(sessionData));

// CSRF protection (CWE-352) using csrf-csrf — must be after session middleware.
// Exemptions:
//   1. Safe HTTP methods (GET, HEAD, OPTIONS) — handled by csrf-csrf ignoredMethods.
//   2. Bearer-authenticated requests — custom headers prove same-origin intent.
//   3. JSON Content-Type — HTML forms cannot send JSON bodies.
//   4. Internal admin tool routes (/check-availability/api, /import-tool/api) —
//      server-to-server or local-only; no browser session involved.
app.use((req, res, next) => {
  if ((req.headers.authorization || '').startsWith('Bearer ')) return next();
  const ct = (req.headers['content-type'] || '').toLowerCase();
  if (ct.includes('application/json')) return next();
  if (req.originalUrl.startsWith('/check-availability/') || req.originalUrl.startsWith('/import-tool/')) return next();
  doubleCsrfProtection(req, res, next);
});


// Setup the static folder
app.use(express.static(path.join(__dirname, 'public'), {
  setHeaders: function (res, path) {
    res.setHeader("Expires", new Date(1981, 10, 19, 14, 22).toUTCString());
    res.setHeader('Cache-Control', 'no-cache');
  }

}));


// Session Local varaible setup
// app.use(function(req, res, next) {
//     res.locals.useremail = req.session.user;
//     res.locals.lastURL=req.session.lastpage;
//     next();
//   });

// app.use(
//   '/v2/api/files',
//   express.static(path.join(__dirname, 'v2', '_static', '_uploads'))
// );



//Starting the Router
const v2Router = require('./v2/routes');

// app.use('/', indexRouter);  // Root Routers
app.use('/v2/api', v2Router);

// GraphQL endpoint is mounted side-by-side with existing REST APIs.
mountGraphQL(app).catch((error) => {
  console.error('[GraphQLBootstrap] Failed to mount /gql endpoint', error);
});

if (process.env.IMPORT_TOOL_ACTIVE === "true") {
  const importToolRouter = require('./v2/routes/import-tool');
  app.use('/import-tool/api', importToolRouter);
}


if (process.env.CHECK_AVAILABILITY_ACTIVE === "true") {
  const checkAvailabilityRouter = require('./v2/routes/check-availability');
  app.use('/check-availability/api', checkAvailabilityRouter);
}

app.use(function (err, req, res, next) {
  // CWE-200/CWE-209: log full error server-side only — never expose err details to the client
  console.error('[GlobalErrorHandler]', err);

  // CWE-209: read only the safe, pre-defined fields from the session error object.
  // Never pass req.session.error directly to the template — it may contain stack traces
  // or internal messages set by earlier middleware.
  const sessionError = req?.session?.error || {};
  delete req?.session?.error;

  const safeError = {
    errormessage: sessionError.errormessage || 'Internal Server error, Please try again later',
    app: 'PRMSizing',
    redirectUrl: sessionError.redirectUrl || '/',
    error_code: '500',
    status: '500',
  };

  res.status(500).json(safeError);
});

module.exports = app;