const test = require('node:test');
const assert = require('node:assert/strict');
const { calculations } = require('../v2/service/calculations/Calculations');
const { validateMultiValveSelectionData } = require('../v2/service/results/MultiValveSection');
const { convertUnit } = require('../v2/utils/helper');
const uoms = require('../v2/data/workflowSectionFields/UOMs.json');

const response = {
    calculationFuntion: 'TEST_FIRE_PRESSURE',
    uomReceived: { pressureUOM: 'psig', flowCapacityUOM: 'lb/h', orificeAreaUOM: 'in²' },
    equationValues: { receivedUOM: { pressureUOM: 'pressure.psig' } },
};
// Isolate valve capacity calculation; exercise the real high-set validation,
// pressure conversion, returned rows, errors, and Proceed-button decision.
calculations.TEST_FIRE_PRESSURE = (_dataset, _valve, values) => ({
    Pset: values.SetPressure, Pover: values.OverPressure, PoverP: values.OverPressurePer,
    ReResponse: values.ReResponse, Wsel: 60, Wreq: 100, Asel: 1,
});
test.after(() => { delete calculations.TEST_FIRE_PRESSURE; });

const makeRow = (rowId, Pset, Pover, SystemMAWP) => ({
    rowId, Pset, Pover, PoverP: Pover / Pset * 100,
    ValvePset: Pset, ValvePover: Pover, ValvePoverP: Pover / Pset * 100,
    SizingBasis: 'Fire Case', IsASMESection8: true, SystemMAWP,
    ModelNumber: 'TEST', KADataSet: 'ASME', ReResponse: JSON.stringify(response),
    Patm: 14.7, Ploss: 0, Wsel: 60, Wreq: 100, Asel: 1,
});
const validate = (set, mawp, high, over = 0.21 * set, fieldName = 'ValvePset') => {
    const lowRow = makeRow(1, set, over, mawp);
    const highRow = { ...makeRow(2, set, over, mawp), ValvePset: high, ValvePover: 99, ValvePoverP: 99 };
    return validateMultiValveSelectionData({ workFlowId: 1, rowIdToValidate: 2, fieldName, valveData: [lowRow, highRow] });
};

for (const [number, set, mawp] of [[17, 18, ''], [18, 25, 25], [19, 40, 40], [20, 16, 18], [21, 20, 25], [22, 40, 50]]) {
    test(`case ${number} is used by the high-set runtime`, async () => {
        const result = await validate(set, mawp, set + 1);
        const high = result.selectedValves[1];
        const expected = Number((0.21 * set - 1).toFixed(9));
        assert.equal(Number(high.ValvePover), Number(expected.toFixed(3)));
        assert.ok(Math.abs(high.Pover + high.Pset - (set + 0.21 * set)) < 1e-8);
        assert.equal(Number(high.ValvePoverP), Number((expected / (set + 1) * 100).toFixed(3)));
        assert.deepEqual(result.error, []);
        assert.equal(result.ProceedButtonEnableFlag, true);
        for (const name of ['ValvePover', 'ValvePoverP']) {
            assert.equal(result.selectedValvesHeader.find(header => header.name === name).disabled, true);
        }
    });
}

test('minimum violations remain errors and do not clamp calculated high-set pressure', async () => {
    const result = await validate(40, 40, 44, 4);
    assert.equal(Number(result.selectedValves[1].ValvePover), 0);
    assert.equal(result.ProceedButtonEnableFlag, false);
    assert.ok(result.error.some(error => error.message.includes('Over Pressure')));
});

test('high-set limits reject values below low-set and above 110% of MAWP', async () => {
    const below = await validate(20, 25, 19);
    const above = await validate(20, 25, 27.501);
    assert.ok(below.error.some(error => error.message.includes('cannot be lower')));
    assert.ok(above.error.some(error => error.message.includes('110%')));
    assert.equal(below.ProceedButtonEnableFlag, false);
    assert.equal(above.ProceedButtonEnableFlag, false);
});

test('high-set pressure and percentage remain calculated after a direct edit request', async () => {
    for (const field of ['ValvePover', 'ValvePoverP']) {
        const result = await validate(18, '', 19, 3.78, field);
        assert.equal(Number(result.selectedValves[1].ValvePover), 2.78);
        assert.equal(Number(result.selectedValves[1].ValvePoverP), 14.632);
        assert.deepEqual(result.error, []);
    }
});

test('fire high-set rules convert barg input to psig and return the calculated pressure in barg', async () => {
    const psig = uoms.find(unit => unit.UnitKey === 'pressure.psig');
    const barg = uoms.find(unit => unit.UnitKey === 'pressure.barg');
    const toBarg = value => convertUnit(value, psig, barg);
    const metricResponse = { ...response,
        uomReceived: { ...response.uomReceived, pressureUOM: barg.UnitName },
        equationValues: { receivedUOM: { pressureUOM: barg.UnitKey } },
    };
    const rows = [makeRow(1, toBarg(20), toBarg(4.2), toBarg(25)), makeRow(2, toBarg(20), toBarg(4.2), toBarg(25))];
    rows.forEach(row => { row.ReResponse = JSON.stringify(metricResponse); });
    rows[1].ValvePset = toBarg(21);
    const result = await validateMultiValveSelectionData({ workFlowId: 1, rowIdToValidate: 2, fieldName: 'ValvePset', valveData: rows });
    assert.ok(Math.abs(result.selectedValves[1].Pover - toBarg(3.2)) < 1e-8);
    assert.deepEqual(result.error, []);
    assert.equal(result.ProceedButtonEnableFlag, true);
});

test('decimal pressure boundaries do not produce false overpressure errors', async () => {
    for (const set of [25.000001, 20.1234567, 40.1234567]) {
        for (const high of [set + 1, set * 1.10]) {
            const result = await validate(set, '', high);
            assert.deepEqual(result.error, [], `PsetL=${set}, PsetH=${high}`);
            assert.equal(result.ProceedButtonEnableFlag, true);
        }
    }
});

test('barg round-trips at the 110% high-set limit preserve valid decimal pressure values', async () => {
    const psig = uoms.find(unit => unit.UnitKey === 'pressure.psig');
    const barg = uoms.find(unit => unit.UnitKey === 'pressure.barg');
    const toBarg = value => convertUnit(value, psig, barg);
    const metricResponse = { ...response,
        uomReceived: { ...response.uomReceived, pressureUOM: barg.UnitName },
        equationValues: { receivedUOM: { pressureUOM: barg.UnitKey } },
    };
    for (const set of [25.000001, 20.1234567, 40.1234567]) {
        const rows = [makeRow(1, toBarg(set), toBarg(set * 0.21), ''), makeRow(2, toBarg(set), toBarg(set * 0.21), '')];
        rows.forEach(row => { row.ReResponse = JSON.stringify(metricResponse); });
        rows[1].ValvePset = toBarg(set * 1.10);
        const result = await validateMultiValveSelectionData({ workFlowId: 1, rowIdToValidate: 2, fieldName: 'ValvePset', valveData: rows });
        assert.deepEqual(result.error, [], `PsetL=${set} psig, converted to barg`);
        assert.equal(result.ProceedButtonEnableFlag, true);
    }
});

test('Section VIII disabled preserves the prior fire behavior and editable columns', async () => {
    const rows = [makeRow(1, 18, 3.78, ''), makeRow(2, 18, 3.78, '')];
    rows.forEach(row => { row.IsASMESection8 = false; });
    rows[1].ValvePset = 19;
    const result = await validateMultiValveSelectionData({ workFlowId: 1, rowIdToValidate: 2, fieldName: 'ValvePset', valveData: rows });
    assert.equal(Number(result.selectedValves[1].ValvePover), 3);
    assert.notEqual(result.selectedValvesHeader.find(header => header.name === 'ValvePover').disabled, true);
});
