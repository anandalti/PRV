'use strict';

const { expressMiddleware } = require('@as-integrations/express4');
const { createApolloServer } = require('./server');
const { env } = require('./config/env');
const { logger } = require('./utils/logger');
const { getCurrentUser, resolveRefreshToken, getActorFromContext, resolveCorrelationId } = require('./middleware/authContext');
const { WorkflowDataDataSource } = require('./data-sources/workflowDataDataSource');
const { createWorkflowDataLoader } = require('./dataloaders/workflowDataLoader');
const { AuthGraphQLService } = require('./services/auth/authService');
const { SizingGraphQLService } = require('./services/sizing/sizingService');
const { SizingOperationsService } = require('./sizing/services/sizingOperationsService');
const { SizingResultsService } = require('./sizing/services/sizingResultsService');

const buildServices = () => {
    const workflowDataDataSource = new WorkflowDataDataSource();
    const workflowDataLoader = createWorkflowDataLoader(workflowDataDataSource);

    return {
        auth: new AuthGraphQLService(),
        sizing: new SizingGraphQLService({ workflowDataDataSource, workflowDataLoader }),
        sizingOps: new SizingOperationsService(),
        results: new SizingResultsService(),
    };
};

const mountGraphQL = async (app) => {
    const apolloServer = createApolloServer();
    await apolloServer.start();

    // Workaround for GHSA-9q82-xgwf-vj6h: reject GET requests with a
    // non-application/json Content-Type header to prevent XS-Search bypass.
    app.use(env.graphQLPath, (req, res, next) => {
        for (let i = 0; i < req.rawHeaders.length - 1; i += 2) {
            if (
                req.rawHeaders[i].toLowerCase() === 'content-type' &&
                req.rawHeaders[i + 1].includes('message/')
            ) {
                return res.status(415).json({ error: 'Content-Type not allowed' });
            }
        }
        next();
    });

    app.use(
        env.graphQLPath,
        expressMiddleware(apolloServer, {
            context: async ({ req, res }) => {
                const currentUser = getCurrentUser(req);
                const actor = getActorFromContext({ req, currentUser });

                return {
                    req,
                    res,
                    currentUser,
                    actor,
                    requestMeta: {
                        source: 'GraphQL',
                        correlationId: resolveCorrelationId(req),
                    },
                    refreshToken: resolveRefreshToken(req),
                    services: buildServices(),
                };
            },
        })
    );

    logger.info(`GraphQL endpoint mounted at ${env.graphQLPath}`);
    return apolloServer;
};

module.exports = {
    mountGraphQL,
};
