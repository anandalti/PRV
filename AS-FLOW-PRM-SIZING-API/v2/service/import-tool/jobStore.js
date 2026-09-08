/**
 * In-memory job store for tracking async Oracle order submission jobs.
 * Holds job status and active SSE client connections keyed by jobId.
 */

const jobs = {}; // { [jobId]: { status, data, errors, sseClient } }

/**
 * Create a new job entry with status 'pending'.
 * @param {string} jobId
 */
const createJob = (jobId) => {
    jobs[jobId] = {
        status: 'pending',
        data: null,
        errors: null,
        sseClient: null
    };
};

/**
 * Register an SSE response object for a given jobId.
 * @param {string} jobId
 * @param {Object} res - Express response object (SSE stream)
 */
const registerClient = (jobId, res) => {
    if (jobs[jobId]) {
        jobs[jobId].sseClient = res;

        // If job already completed before client connected, push result immediately
        if (jobs[jobId].status === 'completed' || jobs[jobId].status === 'failed') {
            pushToClient(jobId);
        }
    }
};

/**
 * Update the job result and push to SSE client if connected.
 * @param {string} jobId
 * @param {'completed'|'failed'} status
 * @param {Object} data - Success data or error details
 */
const updateJob = (jobId, status, data) => {
    if (jobs[jobId]) {
        jobs[jobId].status = status;
        jobs[jobId].data = data;
        pushToClient(jobId);
    }
};

/**
 * Push the job result to the SSE client and close the stream.
 * @param {string} jobId
 */
const pushToClient = (jobId) => {
    const job = jobs[jobId];
    if (job && job.sseClient) {
        const payload = JSON.stringify({
            jobId,
            status: job.status,
            ...job.data
        });
        job.sseClient.write(`data: ${payload}\n\n`);
        job.sseClient.end();
        // Cleanup after pushing
        delete jobs[jobId];
    }
};

/**
 * Get the current state of a job.
 * @param {string} jobId
 * @returns {Object|null}
 */
const getJob = (jobId) => {
    return jobs[jobId] || null;
};

module.exports = {
    createJob,
    registerClient,
    updateJob,
    getJob
};
