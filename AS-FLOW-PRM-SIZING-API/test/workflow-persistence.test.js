'use strict';

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');
const { randomUUID } = require('node:crypto');
const { Pool } = require('pg');
const { createWorkflowPersistence, normalizeWorkflowId } = require('../v2/service/layoutjsons/workflowPersistence');

const layout = (workflowId, value) => [{
    workflowId, sectionId: 1, sectionName: 'Pressure', displayOrder: 1,
    fields: [{ fieldId: 1, fieldName: 'SetPressure', defaultValue: value,
        label: 'Valve\'s pressure — ΔP', options: [{ value: '"; DROP TABLE x; --', label: 'Quoted value' }],
        nested: { nullable: null, enabled: false, values: [1, 2.5, 'psig'] } }],
}];
const popup = value => ({ sectionName: 'TankData', displayType: 'popup', fields: [{ defaultValue: value }] });

describe('WorkflowDetails database and file publication', () => {
    let admin;
    let pool;
    let directory;
    let persistence;
    const schema = `workflow_test_${randomUUID().replaceAll('-', '')}`;
    const readLayout = id => fs.readFile(path.join(directory, `workflowSections${id}.json`), 'utf8').then(JSON.parse);
    const getRecord = async id => (await pool.query('SELECT * FROM "WorkflowDetails" WHERE "WorkflowId" = $1', [id])).rows[0];

    before(async () => {
        assert.ok(['localhost', '127.0.0.1', '::1'].includes(process.env.DB_HOST), 'Tests require an explicitly configured local PostgreSQL database');
        assert.equal(process.env.DB_NAME, 'prv_sizing_local', 'Tests use only the dedicated local development database');
        const connection = {
            host: process.env.DB_HOST, port: Number(process.env.DB_PORT), database: process.env.DB_NAME,
            user: process.env.DB_USER, password: process.env.DB_PASS, ssl: false, connectionTimeoutMillis: 5000,
        };
        admin = new Pool(connection);
        await admin.query(`CREATE SCHEMA "${schema}"`);
        pool = new Pool({ ...connection, options: `-c search_path=${schema}` });
        const migration = await fs.readFile(path.join(__dirname, '../v2/db/migrations/003_create_WorkflowDetails.sql'), 'utf8');
        await pool.query(migration);
        await pool.query(migration);
        directory = await fs.mkdtemp(path.join(os.tmpdir(), 'prv-workflow-'));
        persistence = createWorkflowPersistence({ pool, directory });
    });

    after(async () => {
        const applicationDatabase = require.cache[require.resolve('../v2/db/pgsqldb')];
        if (applicationDatabase) await applicationDatabase.exports.pool.end();
        if (pool) await pool.end();
        if (admin) {
            assert.match(schema, /^workflow_test_[a-f0-9]{32}$/);
            await admin.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
            await admin.end();
        }
        if (directory) {
            const resolved = path.resolve(directory);
            assert.equal(path.dirname(resolved), path.resolve(os.tmpdir()));
            assert.ok(path.basename(resolved).startsWith('prv-workflow-'));
            await fs.rm(resolved, { recursive: true, force: true });
        }
    });

    it('round-trips the complete workflow and popup JSON and updates the same row', async () => {
        const first = await persistence.save('012', layout(12, 20), popup(20));
        assert.deepEqual(first.WorkflowDetails, layout(12, 20));
        assert.deepEqual(await readLayout(12), first.WorkflowDetails);
        assert.deepEqual(JSON.parse(await fs.readFile(path.join(directory, 'FireSizingPopup.json'), 'utf8')), first.PopupDetails);

        const updated = await persistence.save(12, layout(12, 30), popup(30));
        assert.equal((await pool.query('SELECT COUNT(*)::int AS count FROM "WorkflowDetails" WHERE "WorkflowId" = 12')).rows[0].count, 1);
        assert.equal(updated.CreatedAt.getTime(), first.CreatedAt.getTime());
        assert.ok(updated.UpdatedAt >= first.UpdatedAt);
        assert.deepEqual((await getRecord(12)).WorkflowDetails, await readLayout(12));
        assert.deepEqual(updated.PopupDetails, popup(30));
        assert.deepEqual(await readLayout(12), layout(12, 30));
    });

    it('leaves files and the previous row intact when PostgreSQL rejects an update', async () => {
        await persistence.save(8, layout(8, 40));
        await pool.query(`ALTER TABLE "WorkflowDetails" ADD CONSTRAINT reject_test_value
            CHECK ("WorkflowDetails" #>> '{0,fields,0,defaultValue}' <> '999')`);
        await assert.rejects(persistence.save(8, layout(8, 999)), /reject_test_value/);
        assert.deepEqual((await getRecord(8)).WorkflowDetails, layout(8, 40));
        assert.deepEqual(await readLayout(8), layout(8, 40));
        await pool.query('ALTER TABLE "WorkflowDetails" DROP CONSTRAINT reject_test_value');
    });

    it('rolls back the row and restores the first file when publishing the popup fails', async () => {
        const beforeUpdate = await getRecord(12);
        const broken = createWorkflowPersistence({ pool, directory, fileSystem: {
            ...fs,
            rename: async (source, target) => {
                if (path.basename(target) === 'FireSizingPopup.json') throw new Error('Simulated popup rename failure');
                return fs.rename(source, target);
            },
        } });
        await assert.rejects(broken.save(12, layout(12, 50), popup(50)), /Simulated popup rename failure/);
        assert.deepEqual(await getRecord(12), beforeUpdate);
        assert.deepEqual(await readLayout(12), beforeUpdate.WorkflowDetails);
        assert.deepEqual(JSON.parse(await fs.readFile(path.join(directory, 'FireSizingPopup.json'), 'utf8')), beforeUpdate.PopupDetails);
        assert.equal((await fs.readdir(directory)).filter(name => name.endsWith('.tmp')).length, 0);
    });

    it('removes newly created files when the database commit fails', async () => {
        const failingPool = {
            connect: async () => {
                const client = await pool.connect();
                return {
                    query: (sql, parameters) => {
                        if (sql === 'COMMIT') throw new Error('Simulated commit failure');
                        return client.query(sql, parameters);
                    },
                    release: error => client.release(error),
                };
            },
        };
        await assert.rejects(createWorkflowPersistence({ pool: failingPool, directory }).save(9, layout(9, 60)), /Simulated commit failure/);
        assert.equal(await getRecord(9), undefined);
        await assert.rejects(readLayout(9), { code: 'ENOENT' });
    });

    it('serializes concurrent updates so the final file matches the final database row', async () => {
        let enteredRename;
        let finishRename;
        const entered = new Promise(resolve => { enteredRename = resolve; });
        const gate = new Promise(resolve => { finishRename = resolve; });
        const delayed = createWorkflowPersistence({ pool, directory, fileSystem: {
            ...fs,
            rename: async (source, target) => {
                enteredRename();
                await gate;
                return fs.rename(source, target);
            },
        } });
        const first = delayed.save(17, layout(17, 10));
        await entered;
        const second = persistence.save(17, layout(17, 20));
        finishRename();
        await Promise.all([first, second]);
        assert.deepEqual((await getRecord(17)).WorkflowDetails, layout(17, 20));
        assert.deepEqual(await readLayout(17), layout(17, 20));
    });

    it('restores missing/stale files from committed JSON without changing rows', async () => {
        await persistence.save(3, layout(3, 1), popup('older'));
        await persistence.save(23, layout(23, 2), popup('latest'));
        const beforeRestore = await pool.query('SELECT * FROM "WorkflowDetails" ORDER BY "WorkflowId"');
        await fs.rm(path.join(directory, 'workflowSections12.json'));
        await fs.writeFile(path.join(directory, 'workflowSections17.json'), '[]');
        await fs.writeFile(path.join(directory, 'API2000Popup.json'), '{}');
        assert.equal(await persistence.restoreAll(), beforeRestore.rowCount);
        assert.deepEqual(await readLayout(12), (await getRecord(12)).WorkflowDetails);
        assert.deepEqual(await readLayout(17), (await getRecord(17)).WorkflowDetails);
        assert.deepEqual(JSON.parse(await fs.readFile(path.join(directory, 'API2000Popup.json'), 'utf8')), popup('latest'));
        assert.deepEqual((await pool.query('SELECT * FROM "WorkflowDetails" ORDER BY "WorkflowId"')).rows, beforeRestore.rows);
    });

    it('rejects invalid IDs and mismatched layouts before publishing', async () => {
        for (const id of ['../1', '0', -1, '1.5', '1e2', '2147483648', null, undefined]) {
            assert.throws(() => normalizeWorkflowId(id), /Invalid workFlowId/);
        }
        await assert.rejects(persistence.save(1, layout(2, 10)), /requested workflow/);
        await assert.rejects(persistence.save(1, layout(1, 10), popup(10)), /Invalid popup/);
        assert.equal(await getRecord(1), undefined);
    });

    it('publishes an actual generated workflow and reports missing workflows through the controller', async t => {
        const persistenceModule = require('../v2/service/layoutjsons/workflowPersistence');
        const saveMock = t.mock.method(persistenceModule, 'saveWorkflowDetails', persistence.save);
        const { updateWorkFlowFile } = require('../v2/utils/jsondata_crud/workflows/WorkflowJsonActions');
        const generated = await updateWorkFlowFile(1);
        assert.equal(generated.status, 'Success');
        assert.equal(saveMock.mock.calls.length, 1);
        const stored = await getRecord(1);
        assert.ok(stored.WorkflowDetails.length > 0);
        assert.ok(stored.WorkflowDetails.some(section => section.fields.length > 0));
        assert.deepEqual(await readLayout(1), stored.WorkflowDetails);

        const { updateWorkflowLayout } = require('../v2/controllers/LayoutController');
        let status;
        let body;
        const response = {
            status: code => { status = code; return response; },
            json: value => { body = value; return response; },
        };
        // The legacy implementation swallowed this failure and returned HTTP 200.
        t.mock.method(console, 'error', () => {});
        await updateWorkflowLayout({ query: { workFlowId: '2147483647' } }, response);
        assert.equal(status, 404);
        assert.match(body.error, /No sections found/);
        assert.equal(saveMock.mock.calls.length, 1);
        await updateWorkflowLayout({ query: { workFlowId: '0' } }, response);
        assert.equal(status, 400);
        saveMock.mock.mockImplementation(async () => { throw new Error('Simulated storage failure'); });
        await updateWorkflowLayout({ query: { workFlowId: '1' } }, response);
        assert.equal(status, 500);
        assert.equal(body.status, 'Error');
    });
});
