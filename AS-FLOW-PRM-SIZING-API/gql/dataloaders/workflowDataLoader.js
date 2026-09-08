'use strict';

const DataLoader = require('dataloader');

const createWorkflowDataLoader = (workflowDataDataSource) => new DataLoader(
    async (ids) => workflowDataDataSource.getByIds(ids.map((id) => Number(id))),
    { cacheKeyFn: (key) => Number(key) }
);

module.exports = {
    createWorkflowDataLoader,
};
