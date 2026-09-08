// Apply the case 17–22 expression migration to snapshots and, optionally, a database.
// node scripts/sync-pressure-rule-expressions.js --database --env .env.local
const fs = require('node:fs');
const path = require('node:path');
const updates = require('../v2/db/migrations/section-viii-fire-rule-expressions.json');
const root = path.resolve(__dirname, '..');

const syncSnapshots = () => {
    const files = [
        'v2/data/SectionVIIIOverPressureRules.json',
        'v2/data/workflowSectionFields/FieldExpressions.json',
        'v2/data/workflowSections27.json',
    ];
    let changed = 0;
    for (const name of files) {
        const filename = path.join(root, name);
        const original = fs.readFileSync(filename, 'utf8');
        let content = original;
        for (const update of updates) {
            content = content.split(JSON.stringify(update.previousExpression)).join(JSON.stringify(update.expression));
        }
        if (content !== original) {
            // Parse before writing so malformed generated JSON cannot replace a snapshot.
            JSON.parse(content);
            fs.writeFileSync(filename, content);
            changed++;
        }
    }
    return changed;
};

const syncDatabase = async pool => {
    const client = await pool.connect();
    let changed = 0;
    try {
        await client.query('BEGIN');
        for (const update of updates) {
            const result = await client.query(
                'UPDATE "FieldExpression" SET "Expression" = $1 WHERE "Expression" = $2',
                [update.expression, update.previousExpression],
            );
            changed += result.rowCount;
        }
        await client.query('COMMIT');
        return changed;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

const main = async () => {
    const envIndex = process.argv.indexOf('--env');
    if (envIndex !== -1) {
        if (!process.argv[envIndex + 1]) throw new Error('--env requires an environment file');
        require('dotenv').config({ path: path.resolve(root, process.argv[envIndex + 1]), override: true });
    }
    console.log(`Updated ${syncSnapshots()} pressure-rule snapshots.`);
    if (process.argv.includes('--database')) {
        const { pool } = require('../v2/db/pgsqldb');
        try {
            console.log(`Updated ${await syncDatabase(pool)} database expressions. Restart the API to clear expression caches.`);
        } finally {
            await pool.end();
        }
    }
};

if (require.main === module) main().catch(error => {
    console.error(`Pressure-rule migration failed: ${error.message}`);
    process.exitCode = 1;
});

module.exports = { syncSnapshots, syncDatabase };
