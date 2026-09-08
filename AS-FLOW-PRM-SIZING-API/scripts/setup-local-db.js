'use strict';

// Bootstrap only the local development database from checked-in snapshots.
// This is not a replacement for the complete application database backup.
const fs = require('node:fs');
const path = require('node:path');
const { Client } = require('pg');
const root = path.resolve(__dirname, '..');
require('dotenv').config({ path: path.join(root, '.env.local') });

const quote = name => '"' + name.replace(/"/g, '""') + '"';
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const connection = {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    connectionTimeoutMillis: 5000,
};

function localGuard() {
    if (process.env.LOCAL_DATABASE_BOOTSTRAP !== 'true' ||
        !['localhost', '127.0.0.1', '::1'].includes(connection.host) ||
        connection.database !== 'prv_sizing_local') {
        throw new Error('Bootstrap requires the dedicated localhost database prv_sizing_local and LOCAL_DATABASE_BOOTSTRAP=true.');
    }
}

function columnType(rows, key) {
    const values = rows.map(row => row[key]).filter(value => value !== null && value !== undefined);
    if (values.length && values.every(value => typeof value === 'boolean')) return 'boolean';
    if (values.length && values.every(value => typeof value === 'number')) {
        return values.every(Number.isInteger) ? 'integer' : 'double precision';
    }
    if (values.length && values.every(value => typeof value === 'object')) return 'jsonb';
    return 'text';
}

async function seedSnapshot(client, table, rows, identity = 'Id') {
    if (!Array.isArray(rows) || !rows.length) throw new Error('Empty or invalid snapshot: ' + table);
    const keys = [...new Set(rows.flatMap(Object.keys))];
    const types = Object.fromEntries(keys.map(key => [key, columnType(rows, key)]));
    const hasIdentity = keys.includes(identity) && types[identity] === 'integer' &&
        new Set(rows.map(row => row[identity])).size === rows.length;
    const columns = keys.map(key => `${quote(key)} ${hasIdentity && key === identity ? 'serial PRIMARY KEY' : types[key]}`);
    await client.query(`CREATE TABLE IF NOT EXISTS ${quote(table)} (${columns.join(', ')})`);
    const existing = await client.query(`SELECT COUNT(*)::int AS count FROM ${quote(table)}`);
    if (existing.rows[0].count) {
        console.log(`${table}: preserved ${existing.rows[0].count} existing rows`);
        return;
    }
    for (let offset = 0; offset < rows.length; offset += 150) {
        const values = [];
        const placeholders = rows.slice(offset, offset + 150).map(row => '(' + keys.map(key => {
            let value = row[key] ?? null;
            if (value !== null && typeof value === 'object') value = JSON.stringify(value);
            values.push(value);
            return '$' + values.length;
        }).join(',') + ')');
        await client.query(`INSERT INTO ${quote(table)} (${keys.map(quote).join(',')}) VALUES ${placeholders.join(',')}`, values);
    }
    if (hasIdentity) {
        await client.query('SELECT setval(pg_get_serial_sequence($1, $2), $3, true)',
            [quote(table), identity, Math.max(...rows.map(row => row[identity]))]);
    }
    console.log(`${table}: seeded ${rows.length} rows`);
}

async function setup() {
    localGuard();
    const admin = new Client({ ...connection, database: 'postgres' });
    await admin.connect();
    try {
        const exists = await admin.query('SELECT 1 FROM pg_database WHERE datname = $1', [connection.database]);
        if (!exists.rowCount) await admin.query(`CREATE DATABASE ${quote(connection.database)}`);
    } finally { await admin.end(); }

    const client = new Client(connection);
    await client.connect();
    try {
        await client.query('BEGIN');
        await client.query(fs.readFileSync(path.join(root, 'v2/db/migrations/001_create_UserDetails.sql'), 'utf8'));
        for (const model of ['UserPreferences', 'UserReportHeader']) {
            const source = fs.readFileSync(path.join(root, `v2/models/${model}.js`), 'utf8');
            const fields = [...source.matchAll(/this\.(\w+)\s*=\s*data\./g)].map(match => match[1]);
            const columns = fields.map(key => {
                if (key === 'Id') return '"Id" serial PRIMARY KEY';
                if (key === 'UserId') return '"UserId" integer NOT NULL REFERENCES "UserDetails"("Id") ON DELETE CASCADE';
                if (key.startsWith('GeneralEnable')) return `${quote(key)} boolean DEFAULT false`;
                if (['SystemAtmPressure', 'ValveDistanceFromValve'].includes(key)) return `${quote(key)} double precision`;
                return `${quote(key)} text`;
            });
            await client.query(`CREATE TABLE IF NOT EXISTS ${quote(model)} (${columns.join(', ')})`);
        }

        const snapshots = {
            UOM: 'UOMs', WorkflowSectionDetails: 'workflowSections', SectionFieldDetails: 'SectionFields',
            FieldApiCallAction: 'FieldApiActions', FieldDefaultValue: 'FieldDefaultValues',
            FieldDisabled: 'FieldDisabledValues', FieldErrors: 'FieldErrors', FieldExpression: 'FieldExpressions',
            FieldGroup: 'FieldGroup', FieldHiddenInSidebar: 'FieldHiddenFromSidebarValues',
            FieldMandatory: 'FieldMandatoryValues', FieldOptions: 'FieldOptions',
            FieldValidations: 'FieldValidations', FieldVisible: 'FieldVisibleValues',
        };
        for (const [table, file] of Object.entries(snapshots)) {
            const identity = table === 'WorkflowSectionDetails' ? 'SectionId' : table === 'SectionFieldDetails' ? 'FieldId' : 'Id';
            await seedSnapshot(client, table, read(`v2/data/workflowSectionFields/${file}.json`), identity);
        }
        await client.query('ALTER TABLE "FieldExpression" ADD COLUMN IF NOT EXISTS "ExpectedValue" text');
        // Catalog labels/WorkflowIds: KT FRS Part1-Main, sections 4.4.1.1 through 4.4.1.25.
        // Local lookup identifiers are not authoritative production identifiers.
        await seedSnapshot(client, 'GetWorkflowData', read('scripts/local-workflows.json'));
        await client.query(fs.readFileSync(path.join(__dirname, 'local-field-properties.sql'), 'utf8'));

        const credentialsPath = path.resolve(root, '../.local/login.json');
        const bcrypt = require('bcrypt');
        const crypto = require('node:crypto');
        let credentials;
        let createdCredentials = false;
        if (fs.existsSync(credentialsPath)) credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
        else {
            createdCredentials = true;
            credentials = { Name: 'Local Developer', Email: 'local.developer@emerson.com', Password: crypto.randomBytes(18).toString('base64url') + '!aA1', AppType: 'sizing' };
            fs.mkdirSync(path.dirname(credentialsPath), { recursive: true });
            fs.writeFileSync(credentialsPath, JSON.stringify(credentials, null, 2), { flag: 'wx' });
        }
        const hash = await bcrypt.hash(credentials.Password, 10);
        const user = await client.query(`INSERT INTO "UserDetails" ("Name","Email","PasswordHash","AppType") VALUES ($1,$2,$3,$4)
            ON CONFLICT ("Email","AppType") DO UPDATE SET "Name"=EXCLUDED."Name",
                "PasswordHash" = CASE WHEN $5 THEN EXCLUDED."PasswordHash" ELSE "UserDetails"."PasswordHash" END
            RETURNING "Id"`,
            [credentials.Name, credentials.Email, hash, credentials.AppType, createdCredentials]);
        const userId = user.rows[0].Id;
        await client.query(`INSERT INTO "UserReportHeader" ("UserId","Company","Address","CityStateZip","Country","Phone","EmailUrlFax")
            SELECT $1,'','','','','','' WHERE NOT EXISTS (SELECT 1 FROM "UserReportHeader" WHERE "UserId"=$1)`, [userId]);
        // Match the preference defaults used by AuthService.createPreferences.
        const defaults = {
            UserId: userId, DisplayUnitSystem: 'All', CalculationMethod: 'English', SystemAtmPressure: 14.696,
            SystemAtmPressureUOM: 'abspressure.psia', SystemPressure: 'pressure.psig', SystemTemperature: 'temperature.degF',
            FluidLiquidViscosity: 'viscosity.cP', FluidSpecificHeat: 'specificheat.BTUlbF', FluidMassFlux: 'massflux.lbsft2',
            FluidSpecificVolume: 'specificvolume.ft3lb', FluidLatentHeat: 'latentheat.BTUlb', FluidDensity: 'density.lbft3',
            FluidHeatInput: 'power.BTUh', FlowrateGas: 'gasvolflow.SCFH', FlowrateLiquid: 'liquidvolflow.GPMUS',
            FlowrateSteam: 'massflow.lbh', Flowrate2Phase: 'massflow.lbh', FlowrateAPI521Fire: 'massflow.lbh',
            FlowrateSubcooled: 'liquidvolflow.BBLh', ValveDataSetSinglePhase: 'ASME', ValveDataSetMultiPhase: 'ASME',
            ValveDistanceFromValve: 100, GeneralEnable7thEditionfor2Phase: false, GeneralEnable6thEditionfor2Phase: false,
        };
        const unitDefaults = read('v2/data/workflowSectionFields/DefaultUOMs.json');
        const dimensions = { ValveOrificeArea: 'area', ValveReactionForce: 'force', ValveDimension: 'lengthforvalve', ValveWeight: 'mass', ValveDistanceFromValveUOM: 'length', VesselDimensions: 'length', VesselSurfaceArea: 'area', VesselVolume: 'volume' };
        for (const [field, dimension] of Object.entries(dimensions)) {
            defaults[field] = unitDefaults.find(unit => unit.DimensionName === dimension && unit.SystemUnit === 'English')?.UnitKey;
        }
        for (const field of Object.keys(defaults)) {
            if (typeof defaults[field] === 'string' && defaults[field].includes('.')) {
                const dim = defaults[field].split('.')[0];
                const allUnits = read('v2/data/workflowSectionFields/UOMs.json');
                if (!allUnits.some(unit => unit.UnitKey === defaults[field])) {
                    const unit = unitDefaults.find(unit => unit.DimensionName === dim && unit.SystemUnit === 'English');
                    if (!unit) throw new Error('No default unit for ' + field);
                    defaults[field] = unit.UnitKey;
                }
            }
        }
        const keys = Object.keys(defaults);
        await client.query(`INSERT INTO "UserPreferences" (${keys.map(quote)}) SELECT ${keys.map((_, i) => '$' + (i + 1))}
            WHERE NOT EXISTS (SELECT 1 FROM "UserPreferences" WHERE "UserId"=$1)`, keys.map(key => defaults[key]));
        await client.query('COMMIT');
        console.log('Local database ready. Login details are in .local/login.json.');
        console.log('Seed includes repository snapshots only; full valve selection requires the application reference database.');
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally { await client.end(); }
}

setup().catch(error => { console.error('Local setup failed:', error.message); process.exitCode = 1; });
