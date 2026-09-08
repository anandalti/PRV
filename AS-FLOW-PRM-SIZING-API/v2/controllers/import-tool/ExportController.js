const { ingestSizingPayload } = require("../../service/import-tool");

exports.readTags = async (req, res, next) => {
    console.log('[ExportController.readTags] Received POST /import-tool/api/export request');
    try {
        const tags = req.body;
        const user = req.user;

        if (!tags || (Array.isArray(tags) && tags.length === 0)) {
            console.error('[ExportController.readTags] Error: Empty or invalid req.body payload received:', tags);
            return res.status(400).json({
                status: 'Error',
                function: 'ExportController.readTags',
                message: 'Invalid payload: req.body is empty or not an array of tags'
            });
        }

        console.log(`[ExportController.readTags] Processing ${Array.isArray(tags) ? tags.length : 1} tag(s) for user:`, user?.email || user?.sub || 'unknown');
        
        const { ImportRequestId, bomSolveResultStatus } = await ingestSizingPayload(tags);
        
        console.log('[ExportController.readTags] Success! ImportRequestId:', ImportRequestId);
        return res.json({ message: 'Tags received successfully', ImportRequestId, bomSolveResultStatus });
    } catch (error) {
        console.error('[ExportController.readTags FAULT] Function: ExportController.readTags');
        console.error('[ExportController.readTags Error Message]:', error.message);
        console.error('[ExportController.readTags Stack Trace]:', error.stack);

        return res.status(500).json({
            status: 'Error',
            function: 'ExportController.readTags',
            message: 'Error processing tags in export endpoint',
            error: error.message,
            stack: error.stack
        });
    }
};