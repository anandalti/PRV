'use strict';

// Load the intended environment explicitly, for example:
// node --env-file=.env.local scripts/migrate-workflow-details.js --backfill
const fs = require('node:fs/promises');
const path = require('node:path');
const { normalizeWorkflowId, createWorkflowPersistence, workflowsDirectory, popupFiles } = require('../v2/service/layoutjsons/workflowPersistence');

async function backfill(client) {
    const filenames = (await fs.readdir(workflowsDirectory))
        .filter(filename => /^workflowSections\d+\.json$/.test(filename))
        .sort((left, right) => left.localeCompare(right, undefined, { numeric: true }));
    let inserted = 0;
    await client.query('BEGIN');
    try {
        await client.query('SELECT pg_advisory_xact_lock(706782, 1)');
        for (const filename of filenames) {
            const workflowId = normalizeWorkflowId(filename.match(/\d+/)[0]);
            const details = JSON.parse((await fs.readFile(path.join(workflowsDirectory, filename), 'utf8')).replace(/^\uFEFF/, ''));
            if (!Array.isArray(details) || details.some(section => Number(section.workflowId) !== workflowId || !Array.isArray(section.fields))) {
                throw new Error(`Invalid workflow layout: ${filename}`);
            }
            let popupDetails = null;
            if (popupFiles[workflowId]) {
                try {
                    popupDetails = JSON.parse((await fs.readFile(path.join(workflowsDirectory, popupFiles[workflowId]), 'utf8')).replace(/^\uFEFF/, ''));
                } catch (error) {
                    if (error.code !== 'ENOENT') throw error;
                }
            }
            const result = await client.query(
                `INSERT INTO "WorkflowDetails" ("WorkflowId", "WorkflowDetails", "PopupDetails")
                 VALUES ($1, $2::jsonb, $3::jsonb) ON CONFLICT ("WorkflowId") DO NOTHING`,
                [workflowId, JSON.stringify(details), popupDetails === null ? null : JSON.stringify(popupDetails)]
            );
            inserted += result.rowCount;
        }
        await client.query('COMMIT');
        return { inserted, available: filenames.length };
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    }
}

async function main() {
    const args = process.argv.slice(2);
    if (args.some(arg => !['--backfill', '--restore'].includes(arg)) || (args.includes('--backfill') && args.includes('--restore'))) {
        throw new Error('Usage: migrate-workflow-details.js [--backfill | --restore]');
    }
    if (!process.env.DB_HOST || !process.env.DB_NAME) {
        throw new Error('Load the target database environment with node --env-file before running this migration.');
    }
    const { pool } = require('../v2/db/pgsqldb');
    try {
        const sql = await fs.readFile(path.join(__dirname, '../v2/db/migrations/003_create_WorkflowDetails.sql'), 'utf8');
        await pool.query(sql);
        console.log('WorkflowDetails migration applied.');
        if (args.includes('--backfill')) {
            const client = await pool.connect();
            try {
                const result = await backfill(client);
                console.log(`Imported ${result.inserted} workflows from ${result.available} files; existing rows and all JSON files preserved.`);
            } finally {
                client.release();
            }
        }
        if (args.includes('--restore')) {
            const count = await createWorkflowPersistence({ pool }).restoreAll();
            console.log(`Restored backend JSON files for ${count} workflows from the database.`);
        }
    } finally {
        await pool.end();
    }
}

if (require.main === module) {
    main().catch(error => {
        console.error('WorkflowDetails migration failed:', error.message);
        process.exitCode = 1;
    });
}

module.exports = { backfill };
