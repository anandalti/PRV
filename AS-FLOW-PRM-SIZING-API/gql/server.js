'use strict';

const { ApolloServer } = require('@apollo/server');
const { typeDefs, resolvers } = require('./schema');
const { env } = require('./config/env');
const { logger } = require('./utils/logger');

const createApolloServer = () => {
    const server = new ApolloServer({
        typeDefs,
        resolvers,
        introspection: env.graphQLIntrospection,
        formatError: (formattedError) => {
            logger.error('GraphQL operation failed', {
                code: formattedError.extensions?.code,
                message: formattedError.message,
            });

            const code = formattedError.extensions?.code || 'INTERNAL_SERVER_ERROR';
            const mappedStatus = {
                UNAUTHENTICATED: 401,
                FORBIDDEN: 403,
                BAD_USER_INPUT: 400,
            }[code] || 500;

            // Return a minimal, sanitized error payload to avoid leaking
            // stacktrace, source locations, resolver paths, or file system hints.
            return {
                message: formattedError.message,
                extensions: {
                    code,
                    http: formattedError.extensions?.http || { status: mappedStatus },
                },
            };
        },
    });

    return server;
};

module.exports = {
    createApolloServer,
};
