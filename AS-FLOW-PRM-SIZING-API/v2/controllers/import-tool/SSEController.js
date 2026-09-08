const { registerClient, getJob } = require("../../service/import-tool/jobStore");

// UUID v4 validation regex — ensures jobId is a structurally valid UUID before use
const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const isValidUUID = (id) => UUID_V4_REGEX.test(id);

const setSSEHeaders = (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    const origin = req.headers.origin;
    if (origin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
};

/**
 * SSE endpoint for clients to subscribe to job status updates.
 * The connection stays open until the background job pushes a result.
 *
 * @param {Object} req - Express request (expects req.params.jobId)
 * @param {Object} res - Express response (SSE stream)
 */
const getJobStatus = (req, res) => {
    const { jobId } = req.params;

    if (!jobId) {
        return res.status(400).json({ message: 'jobId is required.' });
    }

    if (!isValidUUID(jobId)) {
        return res.status(400).json({ message: 'jobId must be a valid UUID (v4).' });
    }

    const job = getJob(jobId);
    if (!job) {
        return res.status(404).json({ message: `No job found with id: ${jobId}` });
    }

    // Set SSE headers to keep the connection open
    setSSEHeaders(req, res);
    res.flushHeaders();

    // Send an initial "connected" event so the client knows the stream is live
    res.write(`data: ${JSON.stringify({ status: 'connected', jobId })}\n\n`);

    // Register this SSE client — when the background job completes, it will push here
    registerClient(jobId, res);

    // Handle client disconnect (browser closed tab, etc.)
    req.on('close', () => {
        console.log(`SSE client disconnected for job [${jobId}]`);
        res.end();
    });
};

/**
 * Test SSE endpoint that emits a few static events after short delays.
 * This is useful for verifying frontend SSE handling without a long-running backend process.
 */
const testSSE = (req, res) => {
    const jobId = req.query.jobId || 'test-sse';

    setSSEHeaders(req, res);
    res.flushHeaders();

    res.write(`data: ${JSON.stringify({ status: 'connected', jobId, message: 'SSE stream connected' })}\n\n`);

    const timers = [];
    const clearTimers = () => {
        timers.forEach((timer) => clearTimeout(timer));
    };

    const sendAfter = (delay, payload) => {
        const timer = setTimeout(() => {
            if (res.writableEnded) return;
            res.write(`data: ${JSON.stringify(payload)}\n\n`);

            if (payload.status === 'done') {
                clearTimers();
                res.end();
            }
        }, delay);

        timers.push(timer);
    };

    sendAfter(1000, { status: 'progress', progress: 25, value: 100, message: 'Static test payload #1' });
    sendAfter(2000, { status: 'progress', progress: 50, value: 200, message: 'Static test payload #2' });
    sendAfter(3000, { status: 'done', progress: 100, value: 300, message: 'Static test payload complete' });

    req.on('close', () => {
        clearTimers();
        if (!res.writableEnded) {
            res.end();
        }
    });
};

module.exports = { getJobStatus, testSSE };
