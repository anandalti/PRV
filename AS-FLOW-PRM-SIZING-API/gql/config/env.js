'use strict';

const getIntEnv = (name, fallback) => {
    const raw = process.env[name] ?? fallback;
    const parsed = parseInt(raw, 10);
    if (Number.isNaN(parsed)) {
        throw new Error(`Invalid integer value for ${name}: ${raw}`);
    }
    return parsed;
};

const env = {
    nodeEnv: process.env.NODE_ENV || 'development',
    accessTokenSecret: process.env.ACCESS_TOKEN_SECRET || 'dev-insecure-access-token-secret',
    graphQLPath: process.env.GQL_PATH || '/gql',
    graphQLIntrospection: process.env.GQL_INTROSPECTION !== 'false',
    graphQLPort: getIntEnv('GQL_PORT', '0'),
    accessCookieMaxAgeMs: getIntEnv('GQL_ACCESS_COOKIE_MAX_AGE_MS', String(10 * 60 * 1000)),
    refreshCookieMaxAgeMs: getIntEnv('GQL_REFRESH_COOKIE_MAX_AGE_MS', String(24 * 60 * 60 * 1000)),
};

module.exports = { env };
