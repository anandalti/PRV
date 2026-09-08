'use strict';

const sizingOperationsUseCases = require('../../../v2/service/usecases/sizingOperations');
const { assert } = require('../../utils/errors');
const { toRestrictedLiftDTO } = require('../models/dto/restrictedLiftDTO');

class SizingOperationsService {
    assertAuthenticated(userEmail) {
        assert(userEmail, 'Unauthorized', { code: 'UNAUTHENTICATED', status: 401 });
    }

    async getPopupLayout(userEmail, workflowId) {
        this.assertAuthenticated(userEmail);
        return sizingOperationsUseCases.getPopupLayout({
            userId: userEmail,
            workflowId,
        });
    }

    async evaluateValidations(userEmail, input) {
        this.assertAuthenticated(userEmail);
        return sizingOperationsUseCases.validateSizing({ payload: input });
    }

    async convertUom(userEmail, input) {
        this.assertAuthenticated(userEmail);
        return sizingOperationsUseCases.convertUom({ payload: input });
    }

    async saveWorkflowRecord(userEmail, input) {
        this.assertAuthenticated(userEmail);
        return sizingOperationsUseCases.saveWorkflowRecord({ payload: input });
    }

    async getRestrictedLiftPopup(userEmail, input) {
        this.assertAuthenticated(userEmail);
        return sizingOperationsUseCases.getRestrictedLiftPopupLayout({
            userId: userEmail,
            query: input,
            source: 'GraphQL',   // tells use-case to load GQL JSON (with 'query' field)
        });
    }

    async getLiftRestrictions(userEmail, input) {
        this.assertAuthenticated(userEmail);
        return sizingOperationsUseCases.getLiftRestrictions({ input });
    }

    async getRestrictedLiftCapacity(userEmail, input) {
        this.assertAuthenticated(userEmail);
        return sizingOperationsUseCases.getRestrictedLiftCapacity({ input });
    }

    async saveRestrictedLiftData(userEmail, input) {
        this.assertAuthenticated(userEmail);
        const data = await sizingOperationsUseCases.saveRestrictedLiftData({ input });
        return toRestrictedLiftDTO(data || {});
    }
}

module.exports = {
    SizingOperationsService,
};
