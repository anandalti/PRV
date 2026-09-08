'use strict';

const format = (level, message, meta) => {
    const timestamp = new Date().toISOString();
    const serializedMeta = meta ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [GraphQL] [${level}] ${message}${serializedMeta}`;
};

const logger = {
    info: (message, meta) => console.info(format('INFO', message, meta)),
    warn: (message, meta) => console.warn(format('WARN', message, meta)),
    error: (message, meta) => console.error(format('ERROR', message, meta)),
};

module.exports = { logger };
