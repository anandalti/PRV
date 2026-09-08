'use strict';

const { sizingOperationsTypeDefs } = require('./schema/typeDefs');
const { sizingOperationsResolvers } = require('./resolvers/resolvers');
const { resultsTypeDefs } = require('./schema/resultsTypeDefs');
const { resultsResolvers } = require('./resolvers/resultsResolvers');

module.exports = {
    sizingOperationsTypeDefs,
    sizingOperationsResolvers,
    resultsTypeDefs,
    resultsResolvers,
};
