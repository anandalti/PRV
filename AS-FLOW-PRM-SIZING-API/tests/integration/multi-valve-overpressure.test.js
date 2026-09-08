// Requires the local database populated by npm run db:setup:local.
// node --env-file=.env.local --test tests/integration/multi-valve-overpressure.test.js
const { before, after, test } = require('node:test');
const assert = require('node:assert/strict');
const { pool } = require('../../v2/db/pgsqldb');
const { getUOMs } = require('../../v2/service/getUom');
const { convertUnit } = require('../../v2/utils/helper');
const { fetchDefaultValues, evaluateDefaultValues } = require('../../v2/service/evaluateExpressions/defaultValues');
const { refreshMultiValvePressure, hasMultiValveSetPressureChanged } = require('../../v2/service/results/MultiValvePressure');
const { evalInputs } = require('../../v2/controllers/ValidateController');
const { saveRecordUsingSP } = require('../../v2/controllers/SaveWorkflowRecordController');

let uoms;
before(async () => { uoms = await getUOMs(); });
after(async () => { await pool.end(); });

const previousSelection = [{
    Pset: 30, Pover: 4.8, PoverP: 16,
    ReResponse: JSON.stringify({ equationValues: { receivedUOM: { pressureUOM: 'pressure.psig' } } })
}];
const inputs = (overrides = {}) => ({
    SetPressure: 5.6375, SystemMAWP: '', OverPressure: 0.902, OverPressurePer: 16,
    PressureUOM: 'pressure.psig', IsMultivalve: true, SizingBasis: 'Process',
    IsASMESection8: true, CalculationMethod: 'English', SelectedValve: previousSelection,
    ...overrides
});
const toBar = value => Number(convertUnit(value, uoms.find(unit => unit.UnitKey === 'pressure.psig'), uoms.find(unit => unit.UnitKey === 'pressure.barg')));
const near = (actual, expected) => assert.ok(Math.abs(Number(actual) - expected) < 1e-7, `${actual} should equal ${expected}`);

test('returning to Multi-Valve after Set Pressure changes replaces stale 0.902 psig with the 4 psig rule', async () => {
    const original = inputs();
    near(original.SetPressure * original.OverPressurePer / 100, 0.902);
    const result = await refreshMultiValvePressure(original, 1, uoms);
    near(result.OverPressure, 4);
    near(result.OverPressurePer, 4 * 100 / original.SetPressure);
    assert.equal(original.OverPressure, 0.902, 'request and saved rows remain immutable');
    assert.equal(previousSelection[0].Pset, 30);
});

test('the configured percentage rule is used after increasing Set Pressure past 25 psig', async () => {
    const result = await refreshMultiValvePressure(inputs({ SetPressure: 50 }), 1, uoms);
    near(result.OverPressure, 8);
    near(result.OverPressurePer, 16);
});

test('the fixed-to-percentage boundary at 25 psig remains 4 psig', async () => {
    const result = await refreshMultiValvePressure(inputs({ SetPressure: 25 }), 1, uoms);
    near(result.OverPressure, 4);
    near(result.OverPressurePer, 16);
});

test('a Set Pressure change in barg applies the psig rule and converts the result back', async () => {
    const result = await refreshMultiValvePressure(inputs({
        SetPressure: toBar(5.6375), OverPressure: toBar(0.902), PressureUOM: 'pressure.barg', CalculationMethod: 'Metric'
    }), 1, uoms);
    near(result.OverPressure, toBar(4));
    near(result.OverPressurePer, 4 * 100 / 5.6375);
});

test('changing only pressure units preserves a user overpressure value', async () => {
    const original = inputs({ SetPressure: toBar(30), OverPressure: toBar(4), PressureUOM: 'pressure.barg' });
    assert.equal(hasMultiValveSetPressureChanged(original, uoms), false);
    assert.equal(await refreshMultiValvePressure(original, 1, uoms), original);
});

test('revisiting unchanged results preserves a user overpressure percentage', async () => {
    const original = inputs({ SetPressure: 30, OverPressure: 3.6, OverPressurePer: 12 });
    assert.equal(await refreshMultiValvePressure(original, 1, uoms), original);
});

test('single-valve results are unaffected', async () => {
    const original = inputs({ IsMultivalve: false });
    assert.equal(await refreshMultiValvePressure(original, 1, uoms), original);
});

test('fire sizing uses its configured default rather than the process-case default', async () => {
    const result = await refreshMultiValvePressure(inputs({ SetPressure: 20, SizingBasis: 'Fire Case' }), 1, uoms);
    near(result.OverPressure, 4.2);
    near(result.OverPressurePer, 21);
});

test('validation derives percentage from fresh pressure regardless of expression order', async () => {
    const defaults = await fetchDefaultValues('SetPressure', 1);
    const reversed = [...defaults].sort((a, b) => Number(b.CurrentId === 'OverPressurePer') - Number(a.CurrentId === 'OverPressurePer'));
    const result = await evaluateDefaultValues(reversed, inputs(), 'SetPressure');
    near(result.OverPressure, 4);
    near(result.OverPressurePer, 4 * 100 / 5.6375);
});

test('an explicit percentage edit continues to calculate its pressure', async () => {
    const defaults = (await fetchDefaultValues('OverPressurePer', 1)).filter(rule => rule.CurrentId === 'OverPressure');
    const result = await evaluateDefaultValues(defaults, inputs({ SetPressure: 30, OverPressurePer: 12 }), 'OverPressurePer');
    near(result.OverPressure, 3.6);
});

test('clearing Set Pressure clears its derived percentage without NaN or Infinity', async () => {
    const defaults = await fetchDefaultValues('SetPressure', 1);
    const result = await evaluateDefaultValues(defaults, inputs({ SetPressure: '' }), 'SetPressure');
    assert.equal(result.OverPressure, '');
    assert.equal(result.OverPressurePer, '');
});

test('the complete field validation flow returns the rule-derived pressure and percentage', async () => {
    const result = await evalInputs({
        currentField: { FieldName: 'SetPressure', FieldValue: 5.6375 },
        inputs: { ...inputs({ SetPressure: 30 }), workflowId: 1 }, error: []
    });
    near(result.inputs.OverPressure, 4);
    near(result.inputs.OverPressurePer, 4 * 100 / 5.6375);
});

test('the sizing persistence boundary receives the same corrected pressure as the results calculation', async t => {
    // The repository has no production PROC_SaveSizing body. Capture only that write;
    // expression and UOM reads still execute against the seeded local database.
    const query = pool.query.bind(pool);
    let saved;
    t.mock.method(pool, 'query', async (sql, parameters) => {
        if (sql.includes('CALL public."PROC_SaveSizing"')) {
            saved = parameters[0];
            return { rows: [{ Message_OUT: 'captured', SizingData_OUT: [{}] }] };
        }
        return query(sql, parameters);
    });
    await saveRecordUsingSP(inputs({ WorkFlowId: 1 }), false);
    near(saved.PressureDetails[0].OverPressure, 4);
    near(saved.PressureDetails[0].OverPressurePer, 4 * 100 / 5.6375);
});
