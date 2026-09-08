const rules = require('../../data/SectionVIIIFireMultiValveRules.json');
const { evaluateExpression } = require('../../utils/parse');

const validationExpression = rule => `${rule.condition} && OverPressure != '' && (OverPressure < (${rule.minOverPressure}) || OverPressure > (${rule.maxOverPressure}))`;
const totalPressureValidationExpression = rule => `${rule.condition} && OverPressure != '' && (SetPressure + OverPressure) > (SetPressure + (${rule.maxOverPressure}))`;
const highSetValidationExpression = rule => `${rule.condition} && HighSetPressure != '' && (HighSetPressure < (${rule.minHighSetPressure}) || HighSetPressure > (${rule.maxHighSetPressure}))`;

// Allow only arithmetic/unit-conversion noise at a pressure boundary. Keep full
// precision for calculations; formatting displayed limits must not change validity.
const comparePressures = (value, limit) => {
    const tolerance = 1e-9 * Math.max(1, Math.abs(value), Math.abs(limit));
    return Math.abs(value - limit) <= tolerance ? 0 : value < limit ? -1 : 1;
};

// All pressures are gauge pressures in psig. Convert units before calling.
const getFireMultiValveRule = inputs => {
    const values = { ...inputs, SystemMAWP: inputs.SystemMAWP ?? '' };
    return rules.find(rule => evaluateExpression(rule.condition, values)) ?? null;
};

const evaluateFireMultiValveRule = inputs => {
    const values = { ...inputs, SystemMAWP: inputs.SystemMAWP ?? '' };
    const rule = getFireMultiValveRule(values);
    if (!rule) return null;
    const result = { caseNumber: rule.caseNumber };
    for (const key of ['defaultOverPressure', 'minOverPressure', 'maxOverPressure', 'minHighSetPressure', 'maxHighSetPressure']) {
        result[key] = Number(evaluateExpression(rule[key], values));
    }
    if (values.HighSetPressure !== undefined && values.HighSetPressure !== null && values.HighSetPressure !== '') {
        const highSetPressure = Number(values.HighSetPressure);
        result.highSetPressureValid = Number.isFinite(highSetPressure)
            && comparePressures(highSetPressure, result.minHighSetPressure) >= 0
            && comparePressures(highSetPressure, result.maxHighSetPressure) <= 0;
        // 2026 design specification, Part IV N60: high-set minimum is 10% of H.
        result.minHighSetOverPressure = Number(evaluateExpression('0.10 * HighSetPressure', values));
        result.maxHighSetOverPressure = Number(evaluateExpression(`SetPressure + (${rule.maxOverPressure}) - HighSetPressure`, values));
        if (values.OverPressure !== undefined && values.OverPressure !== null && values.OverPressure !== '') {
            result.highSetOverPressure = Number(evaluateExpression(rule.highSetOverPressure, values));
        }
    }
    return result;
};

module.exports = { rules, validationExpression, totalPressureValidationExpression, highSetValidationExpression, getFireMultiValveRule, evaluateFireMultiValveRule, comparePressures };
