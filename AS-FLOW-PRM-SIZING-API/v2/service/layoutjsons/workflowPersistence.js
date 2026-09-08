'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const WorkflowDetails = require('../../models/WorkflowDetails');

const workflowsDirectory = path.resolve(__dirname, '../../data/workflows');
const popupFiles = Object.freeze({
    3: 'API2000Popup.json',
    12: 'FireSizingPopup.json',
    23: 'API2000Popup.json',
    24: 'API2000Popup.json',
});

function normalizeWorkflowId(value) {
    const workflowId = Number(value);
    if (!/^\d+$/.test(String(value)) || !Number.isSafeInteger(workflowId) || workflowId < 1 || workflowId > 2147483647) {
        throw Object.assign(new Error('Invalid workFlowId'), { status: 400 });
    }
    return workflowId;
}

function createWorkflowPersistence({ pool, directory = workflowsDirectory, fileSystem = fs }) {
    const atomicWrite = async (target, contents) => {
        const temporary = `${target}.${randomUUID()}.tmp`;
        try {
            await fileSystem.writeFile(temporary, contents, { flag: 'wx' });
            await fileSystem.rename(temporary, target);
        } catch (error) {
            try {
                await fileSystem.rm(temporary, { force: true });
            } catch (cleanupError) {
                throw new AggregateError([error, cleanupError], 'Failed to publish and clean up the temporary workflow file');
            }
            throw error;
        }
    };

    async function save(workflowIdValue, details, popupDetails = null) {
        const workflowId = normalizeWorkflowId(workflowIdValue);
        if (!Array.isArray(details) || details.some(section => !section || typeof section !== 'object' ||
            !Array.isArray(section.fields) || Number(section.workflowId) !== workflowId)) {
            throw Object.assign(new Error('Workflow details must contain sections for the requested workflow'), { status: 400 });
        }
        if (popupDetails !== null && (!popupFiles[workflowId] || typeof popupDetails !== 'object' || Array.isArray(popupDetails))) {
            throw Object.assign(new Error('Invalid popup details for workflow'), { status: 400 });
        }
        // Serialize once, before any mutation, to reject invalid/circular JSON.
        const publications = [{
            target: path.join(directory, `workflowSections${workflowId}.json`),
            contents: JSON.stringify(details, null, 2),
        }];
        if (popupDetails !== null) {
            publications.push({ target: path.join(directory, popupFiles[workflowId]), contents: JSON.stringify(popupDetails, null, 2) });
        }
        const snapshot = JSON.parse(publications[0].contents);
        const popupSnapshot = popupDetails === null ? null : JSON.parse(publications[1].contents);

        return publish(async client => ({
            record: await WorkflowDetails.upsert(client, workflowId, snapshot, popupSnapshot),
            publications,
        }));
    }

    async function restoreAll() {
        return publish(async client => {
            const records = await WorkflowDetails.getAll(client);
            const files = new Map();
            for (const record of records) {
                const workflowId = normalizeWorkflowId(record.WorkflowId);
                files.set(`workflowSections${workflowId}.json`, record.WorkflowDetails);
                if (record.PopupDetails !== null && popupFiles[workflowId]) {
                    files.set(popupFiles[workflowId], record.PopupDetails);
                }
            }
            return {
                record: records.length,
                publications: [...files].map(([filename, details]) => ({
                    target: path.join(directory, filename),
                    contents: JSON.stringify(details, null, 2),
                })),
            };
        });
    }

    async function publish(prepare) {
        const client = await pool.connect();
        const published = [];
        let transactionStarted = false;
        let discardClient = false;
        try {
            await client.query('BEGIN');
            transactionStarted = true;
            // The lock also protects popup files shared by several workflow IDs.
            await client.query('SELECT pg_advisory_xact_lock(706782, 1)');
            const { record, publications } = await prepare(client);
            await fileSystem.mkdir(directory, { recursive: true });
            for (const publication of publications) {
                let previous = null;
                try {
                    previous = await fileSystem.readFile(publication.target);
                } catch (error) {
                    if (error.code !== 'ENOENT') throw error;
                }
                await atomicWrite(publication.target, publication.contents);
                published.push({ target: publication.target, previous });
            }
            await client.query('COMMIT');
            transactionStarted = false;
            return record;
        } catch (error) {
            const recoveryErrors = [];
            // Restore files while still holding the database lock.
            for (const publication of published.reverse()) {
                try {
                    if (publication.previous === null) {
                        await fileSystem.rm(publication.target, { force: true });
                    } else {
                        await atomicWrite(publication.target, publication.previous);
                    }
                } catch (recoveryError) {
                    recoveryErrors.push(recoveryError);
                }
            }
            if (transactionStarted) {
                try {
                    await client.query('ROLLBACK');
                } catch (recoveryError) {
                    recoveryErrors.push(recoveryError);
                    discardClient = true;
                }
            }
            if (recoveryErrors.length) {
                throw new AggregateError([error, ...recoveryErrors], 'Workflow update failed; restore workflow files from the database before retrying');
            }
            throw error;
        } finally {
            client.release(discardClient);
        }
    }

    return { save, restoreAll };
}

async function saveWorkflowDetails(workflowId, details, popupDetails = null) {
    const { pool } = require('../../db/pgsqldb');
    return createWorkflowPersistence({ pool }).save(workflowId, details, popupDetails);
}

module.exports = { createWorkflowPersistence, saveWorkflowDetails, normalizeWorkflowId, workflowsDirectory, popupFiles };
