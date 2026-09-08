const test = require('node:test');
const assert = require('node:assert/strict');
const { evaluateExpression } = require('../v2/utils/parse');
const { rules, getFireMultiValveRule, evaluateFireMultiValveRule, validationExpression, totalPressureValidationExpression } = require('../v2/service/fieldCalculations/SectionVIIIFireMultiValveRules');
const expressions = require('../v2/data/workflowSectionFields/FieldExpressions.json');
const migration = require('../v2/db/migrations/section-viii-fire-rule-expressions.json');
const { validate } = require('../v2/service/evaluateExpressions/validations');
const uoms = require('../v2/data/workflowSectionFields/UOMs.json');

const inputs = (SetPressure, SystemMAWP = '') => ({
    IsMultivalve: true, IsASMESection8: true, SizingBasis: 'Fire Case',
    SetPressure, SystemMAWP, PressureUOM: 'pressure.psig',
});
const close = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-10, `${actual} != ${expected}`);
const scenarios = [
    { caseNumber: 17, set: 18, mawp: '', def: 3.78, min: 3, max: 4, high: 19.8 },
    { caseNumber: 18, set: 25, mawp: 25, def: 5.25, min: 3, max: 5.25, high: 27.5 },
    { caseNumber: 19, set: 40, mawp: 40, def: 8.4, min: 4, max: 8.4, high: 44 },
    { caseNumber: 20, set: 16, mawp: 18, def: 3.36, min: 3, max: 6, high: 19.8 },
    { caseNumber: 21, set: 20, mawp: 25, def: 4.2, min: 3, max: 10.25, high: 27.5 },
    { caseNumber: 22, set: 40, mawp: 50, def: 8.4, min: 4, max: 20.5, high: 55 },
];

for (const scenario of scenarios) {
    test(`case ${scenario.caseNumber}: documented defaults, pressure bounds and high-set expression`, () => {
        const values = inputs(scenario.set, scenario.mawp);
        const rule = getFireMultiValveRule(values);
        const result = evaluateFireMultiValveRule(values);
        assert.equal(result.caseNumber, scenario.caseNumber);
        close(result.defaultOverPressure, scenario.def);
        close(result.minOverPressure, scenario.min);
        close(result.maxOverPressure, scenario.max);
        close(result.minHighSetPressure, scenario.set);
        close(result.maxHighSetPressure, scenario.high);

        for (const OverPressure of [scenario.min, scenario.max]) {
            assert.equal(evaluateExpression(validationExpression(rule), { ...values, OverPressure }), false);
            assert.equal(evaluateExpression(totalPressureValidationExpression(rule), { ...values, OverPressure }), false);
        }
        for (const OverPressure of [scenario.min - 0.001, scenario.max + 0.001]) {
            assert.equal(evaluateExpression(validationExpression(rule), { ...values, OverPressure }), true);
        }
        assert.equal(evaluateExpression(totalPressureValidationExpression(rule), { ...values, OverPressure: scenario.max + 0.001 }), true);
        assert.equal(evaluateExpression(validationExpression(rule), { ...values, OverPressure: '' }), false);

        for (const HighSetPressure of [scenario.set, scenario.high]) {
            const highResult = evaluateFireMultiValveRule({ ...values, OverPressure: scenario.def, HighSetPressure });
            assert.equal(highResult.highSetPressureValid, true);
            close(highResult.highSetOverPressure, scenario.set + scenario.def - HighSetPressure);
        }
        for (const HighSetPressure of [scenario.set - 0.001, scenario.high + 0.001]) {
            assert.equal(evaluateFireMultiValveRule({ ...values, HighSetPressure }).highSetPressureValid, false);
        }
    });
}

test('cases are mutually exclusive at the 4/0.21 and 30 psig boundaries', () => {
    const threshold = 4 / 0.21;
    const boundaries = [
        [threshold - 0.00001, '', 17], [threshold, '', 17], [threshold + 0.00001, '', 18],
        [29.99999, '', 18], [30, '', 19],
        [16, threshold - 0.00001, 20], [16, threshold, 20], [16, threshold + 0.00001, 21],
        [29.99999, 40, 21], [30, 40, 22],
    ];
    for (const [set, mawp, expectedCase] of boundaries) {
        const matches = rules.filter(rule => evaluateExpression(rule.condition, inputs(set, mawp)));
        assert.deepEqual(matches.map(rule => rule.caseNumber), [expectedCase]);
    }
});

test('blank and equal MAWP select the same case; unrelated applications do not match', () => {
    for (const set of [18, 25, 40]) {
        assert.equal(getFireMultiValveRule(inputs(set)).caseNumber, getFireMultiValveRule(inputs(set, set)).caseNumber);
        assert.equal(getFireMultiValveRule({ ...inputs(set), SystemMAWP: null }).caseNumber, getFireMultiValveRule(inputs(set)).caseNumber);
    }
    const base = inputs(18);
    for (const override of [{ IsMultivalve: false }, { IsASMESection8: false }, { SizingBasis: 'Blocked Discharge' }, { SetPressure: '' }, { SetPressure: 0 }, { SetPressure: -1 }, { SystemMAWP: 17 }]) {
        assert.equal(getFireMultiValveRule({ ...base, ...override }), null);
    }
});

test('migration and active snapshots use all twelve canonical validation expressions', () => {
    const template = require('../v2/data/SectionVIIIOverPressureRules.json');
    assert.equal(migration.length, 12);
    for (const update of migration) {
        const rule = rules.find(rule => rule.caseNumber === update.caseNumber);
        assert.ok([validationExpression(rule), totalPressureValidationExpression(rule)].includes(update.expression));
        assert.ok(expressions.some(row => row.Expression === update.expression), `Missing database expression for case ${rule.caseNumber}`);
        assert.ok(template.some(row => row.target.expression === update.expression), `Missing legacy expression for case ${rule.caseNumber}`);
        assert.equal(expressions.some(row => row.Expression === update.previousExpression), false);
        assert.equal(template.some(row => row.target.expression === update.previousExpression), false);
    }
});

test('configured fire defaults agree with the documented six case defaults', () => {
    const configured = [...new Set(expressions.filter(row => row.CurrentId === 'OverPressure' && row.ExpressionId.startsWith('DEFAULT') && row.Expression.includes("SizingBasis == 'Fire Case'" ) && row.Expression.includes('4/0.16')).map(row => row.Expression))];
    assert.ok(configured.length > 0);
    for (const expression of configured) {
        for (const scenario of scenarios) {
            close(Number(evaluateExpression(expression, { ...inputs(scenario.set, scenario.mawp), OverPressurePer: 1 })), scenario.def);
        }
    }
});

test('actual validation service rejects numeric/string zero and treats null/blank as missing', async () => {
    for (const scenario of scenarios) {
        const rule = rules.find(rule => rule.caseNumber === scenario.caseNumber);
        const expression = expressions.find(row => row.Expression === validationExpression(rule));
        const validation = { ...expression, CurrentId: 'OverPressure', MessageType: 'error', Message: 'Below minimum', DynamicFlag: false };
        for (const value of [0, '0', null, '', undefined]) {
            const errors = await validate(uoms, [validation], { ...inputs(scenario.set, scenario.mawp), workflowId: 1, OverPressure: value }, { FieldName: 'OverPressure', FieldValue: value });
            assert.equal(errors.length, value === 0 || value === '0' ? 1 : 0, `Case ${scenario.caseNumber}: ${String(value)}`);
        }
    }
});

test('computed high-set boundary tolerates binary arithmetic noise and rejects invalid numbers', () => {
    const values = inputs(25, 25);
    assert.equal(evaluateFireMultiValveRule({ ...values, HighSetPressure: 25 * 1.1 }).highSetPressureValid, true);
    assert.equal(evaluateFireMultiValveRule({ ...values, HighSetPressure: 27.50001 }).highSetPressureValid, false);
    assert.equal(evaluateFireMultiValveRule({ ...values, HighSetPressure: NaN }).highSetPressureValid, false);
});
