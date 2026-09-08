const express = require('express');
const router = express.Router();
const { getJobStatus } = require('../../controllers/import-tool/SSEController');

// Subscribe to job status via SSE using jobId
router.get('/:jobId', getJobStatus);

router.get('/', (req, res) => {
    res.status(400).json({ message: 'Invalid request. Please provide a jobId: /job-status/:jobId' });
});

module.exports = router;