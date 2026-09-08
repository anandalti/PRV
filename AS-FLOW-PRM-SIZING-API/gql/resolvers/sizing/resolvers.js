'use strict';

const { toGraphQLError, AppError } = require('../../utils/errors');
const { logger } = require('../../utils/logger');
const { ensureAuthenticated } = require('../../middleware/authContext');

const success = (message, data, code = 'OK') => ({
    success: true,
    message,
    code,
    data,
    errors: [],
});

const sizingResolvers = {
    Query: {
        genericErrorsGrid: async (_, __, { services, currentUser }) => {
            try {
                const userEmail = ensureAuthenticated(currentUser);
                const data = await services.sizing.getGenericErrorsGrid(userEmail);
                return success('Generic errors loaded successfully', data);
            } catch (error) {
                logger.error('genericErrorsGrid query failed', { error: error.message });
                throw toGraphQLError(error);
            }
        },

        fluids: async (_, { fluidTypeId }, { services, currentUser }) => {
            try {
                const userEmail = ensureAuthenticated(currentUser);
                const data = await services.sizing.getFluids(userEmail, fluidTypeId);
                return success('Fluids loaded successfully', data);
            } catch (error) {
                logger.error('fluids query failed', { error: error.message });
                throw toGraphQLError(error);
            }
        },

        uomDetails: async (_, __, { services, currentUser }) => {
            try {
                const userEmail = ensureAuthenticated(currentUser);
                const data = await services.sizing.getUomDetails(userEmail);
                return success('UOM details loaded successfully', data);
            } catch (error) {
                logger.error('uomDetails query failed', { error: error.message });
                throw toGraphQLError(error);
            }
        },

        workflowData: async (_, { id }, { services, currentUser }) => {
            try {
                const userEmail = ensureAuthenticated(currentUser);
                const data = await services.sizing.getWorkflowData(userEmail, id);
                return success('Workflow data loaded successfully', data);
            } catch (error) {
                logger.error('workflowData query failed', { error: error.message });
                throw toGraphQLError(error);
            }
        },

        preferencesLayout: async (_, __, { services, currentUser }) => {
            try {
                const userEmail = ensureAuthenticated(currentUser);
                const data = await services.sizing.getPreferencesLayout(userEmail);
                return success('Preferences layout loaded successfully', data);
            } catch (error) {
                logger.error('preferencesLayout query failed', { error: error.message });
                throw toGraphQLError(error);
            }
        },

        workflowLayout: async (_, { workFlowId }, { services, currentUser }) => {
            try {
                const userEmail = ensureAuthenticated(currentUser);
                const data = await services.sizing.getWorkflowLayout(userEmail, workFlowId);
                return success('Workflow layout loaded successfully', data);
            } catch (error) {
                logger.error('workflowLayout query failed', { error: error.message });
                throw toGraphQLError(error);
            }
        },
    },
};

module.exports = {
    sizingResolvers,
};
