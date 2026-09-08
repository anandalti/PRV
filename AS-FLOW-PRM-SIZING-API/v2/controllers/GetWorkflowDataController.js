
'use strict';

const sizingQueryUseCases = require('../service/usecases/sizingQuery');

const getAllGetWorkflowData = async (req, res) => {
    try {
        const data = await sizingQueryUseCases.getWorkflowData({
            userId: req.query?.userId || req.user?.email,
            outputFormat: 'legacy',
        });
        res.set('Cache-Control', 'public, max-age=3600');
        return res.json(data);
    } catch (err) {
        if (err?.status) {
            return res.status(err.status).json({ status: 'error', message: err.message });
        }
        console.error('[GetWorkflowDataController.getAllGetWorkflowData]', err);
        return res.status(500).json({ status: 'error', message: 'Failed to fetch workflow data' });
    }
};

const getGetWorkflowData = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ status: 'error', message: 'Invalid id' });
        }
        const [data] = await sizingQueryUseCases.getWorkflowData({
            userId: req.query?.userId || req.user?.email,
            id,
            outputFormat: 'legacy',
        });
        return res.json(data);
    } catch (err) {
        if (err?.status) {
            return res.status(err.status).json({ status: 'error', message: err.message });
        }
        console.error('[GetWorkflowDataController.getGetWorkflowData]', err);
        return res.status(500).json({ status: 'error', message: 'Failed to fetch workflow data' });
    }
};

module.exports = {
    getAllGetWorkflowData,
    getGetWorkflowData
};
    