'use strict';

const { commonTypeDefs, commonResolvers } = require('./common/scalars');
const { authTypeDefs } = require('./auth/typeDefs');
const { sizingTypeDefs } = require('./sizing/typeDefs');
const {
    sizingOperationsTypeDefs,
    sizingOperationsResolvers,
    resultsTypeDefs,
    resultsResolvers,
} = require('../sizing');
const { authResolvers } = require('../resolvers/auth/resolvers');
const { sizingResolvers } = require('../resolvers/sizing/resolvers');

const rootTypeDefs = `#graphql
  type Query {
    _health: String!
  }

  type Mutation {
    _noop: String!
  }
`;

const typeDefs = [
    rootTypeDefs,
    commonTypeDefs,
    authTypeDefs,
    sizingTypeDefs,
    sizingOperationsTypeDefs,
    resultsTypeDefs,
];

const resolvers = {
    ...commonResolvers,
    Query: {
        _health: () => 'ok',
        ...(sizingResolvers.Query || {}),
        ...(sizingOperationsResolvers.Query || {}),
        ...(resultsResolvers.Query || {}),
    },
    Mutation: {
        _noop: () => 'ok',
        ...(authResolvers.Mutation || {}),
        ...(sizingOperationsResolvers.Mutation || {}),
        ...(resultsResolvers.Mutation || {}),
    },
};

module.exports = {
    typeDefs,
    resolvers,
};
