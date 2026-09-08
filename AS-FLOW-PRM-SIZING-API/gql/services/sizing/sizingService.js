'use strict';

const sizingQueryUseCases = require('../../../v2/service/usecases/sizingQuery');
const { assert } = require('../../utils/errors');

class SizingGraphQLService {
    constructor() {
    }

    async getGenericErrorsGrid(userEmail) {
        assert(userEmail, 'Unauthorized', { code: 'UNAUTHENTICATED', status: 401 });
        return sizingQueryUseCases.getGenericErrorsGrid({ userId: userEmail });
    }

    async getFluids(userEmail, fluidTypeId) {
        assert(userEmail, 'Unauthorized', { code: 'UNAUTHENTICATED', status: 401 });
        return sizingQueryUseCases.getFluids({ userId: userEmail, fluidTypeId });
    }

    async getUomDetails(userEmail) {
        assert(userEmail, 'Unauthorized', { code: 'UNAUTHENTICATED', status: 401 });
        return sizingQueryUseCases.getUomDetails({ userId: userEmail });
    }

    async getWorkflowData(userEmail, id) {
        assert(userEmail, 'Unauthorized', { code: 'UNAUTHENTICATED', status: 401 });
        return sizingQueryUseCases.getWorkflowData({ userId: userEmail, id, outputFormat: 'dto' });
    }

    async getPreferencesLayout(userEmail) {
        assert(userEmail, 'Unauthorized', { code: 'UNAUTHENTICATED', status: 401 });
        return sizingQueryUseCases.getPreferencesLayout({ userId: userEmail });
    }

    async getWorkflowLayout(userEmail, workFlowId) {
        assert(userEmail, 'Unauthorized', { code: 'UNAUTHENTICATED', status: 401 });
        return sizingQueryUseCases.getWorkflowLayout({ userId: userEmail, workFlowId });
    }
}

module.exports = {
    SizingGraphQLService,
};
