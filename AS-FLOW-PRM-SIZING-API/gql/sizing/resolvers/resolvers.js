'use strict';

const { toGraphQLError, AppError } = require('../../utils/errors');
const { logger } = require('../../utils/logger');
const { SIZING_MESSAGES } = require('../config/messages');
const { makePayload } = require('../utils/responses');
const { ensureAuthenticated } = require('../../middleware/authContext');

const sizingOperationsResolvers = {
    Query: {
        popupLayout: async (_, { workflowId }, { services, currentUser }) => {
            try {
                const email = ensureAuthenticated(currentUser);
                const data = await services.sizingOps.getPopupLayout(email, workflowId);
                return makePayload(SIZING_MESSAGES.popupLoaded, data);
            } catch (error) {
                logger.error('popupLayout query failed', { error: error.message });
                throw toGraphQLError(error);
            }
        },

        restrictedLiftPopup: async (_, { input }, { services, currentUser }) => {
            try {
                const email = ensureAuthenticated(currentUser);
                const data = await services.sizingOps.getRestrictedLiftPopup(email, input);
                return makePayload(SIZING_MESSAGES.restrictedLiftPopupLoaded, data);
            } catch (error) {
                logger.error('restrictedLiftPopup query failed', { error: error.message });
                throw toGraphQLError(error);
            }
        },

        liftRestrictions: async (_, { input }, { services, currentUser }) => {
            try {
                const email = ensureAuthenticated(currentUser);
                const data = await services.sizingOps.getLiftRestrictions(email, input);
                return makePayload(SIZING_MESSAGES.liftRestrictionsLoaded, data);
            } catch (error) {
                logger.error('liftRestrictions query failed', { error: error.message });
                throw toGraphQLError(error);
            }
        },

        rlCapacity: async (_, { input }, { services, currentUser }) => {
            try {
                const email = ensureAuthenticated(currentUser);
                const data = await services.sizingOps.getRestrictedLiftCapacity(email, input);
                return makePayload(SIZING_MESSAGES.rlCapacityLoaded, data);
            } catch (error) {
                logger.error('rlCapacity query failed', { error: error.message });
                throw toGraphQLError(error);
            }
        },
    },

    Mutation: {
        validateSizing: async (_, { input }, { services, currentUser }) => {
            try {
                const email = ensureAuthenticated(currentUser);
                const data = await services.sizingOps.evaluateValidations(email, input);
                return makePayload(SIZING_MESSAGES.validateSuccess, data);
            } catch (error) {
                logger.error('validateSizing mutation failed', { error: error.message });
                throw toGraphQLError(error);
            }
        },

        convertUom: async (_, { input }, { services, currentUser }) => {
            try {
                const email = ensureAuthenticated(currentUser);
                const data = await services.sizingOps.convertUom(email, input);
                return makePayload(SIZING_MESSAGES.uomConverted, data);
            } catch (error) {
                logger.error('convertUom mutation failed', { error: error.message });
                throw toGraphQLError(error);
            }
        },

        saveWorkflowCallprocs: async (_, { input }, { services, currentUser }) => {
            try {
                const email = ensureAuthenticated(currentUser);
                const data = await services.sizingOps.saveWorkflowRecord(email, input);
                return {
                    success: true,
                    message: SIZING_MESSAGES.workflowSaved,
                    code: 'OK',
                    data: {
                        message: data?.message,
                        sizingData: data?.sizingData,
                        proceedButtonEnableFlag: data?.ProceedButtonEnableFlag,
                    },
                    errors: [],
                };
            } catch (error) {
                logger.error('saveWorkflowCallprocs mutation failed', { error: error.message });
                throw toGraphQLError(error);
            }
        },

        saveRestrictedLiftData: async (_, { input }, { services, currentUser }) => {
            try {
                const email = ensureAuthenticated(currentUser);
                const data = await services.sizingOps.saveRestrictedLiftData(email, input);
                return {
                    success: true,
                    message: SIZING_MESSAGES.restrictedLiftSaved,
                    code: 'OK',
                    data,
                    errors: [],
                };
            } catch (error) {
                logger.error('saveRestrictedLiftData mutation failed', { error: error.message });
                throw toGraphQLError(error);
            }
        },
    },
};

module.exports = {
    sizingOperationsResolvers,
};
