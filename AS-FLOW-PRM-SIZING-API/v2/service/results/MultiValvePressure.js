const { convertUnit } = require('../../utils/helper');
const { fetchDefaultValues, evaluateDefaultValues } = require('../evaluateExpressions/defaultValues');

// Selected rows retain the pressure/UOM from the previous results request.
// Compare in the current unit before deciding whether to reset a rule default.
const hasMultiValveSetPressureChanged = (inputs, uoms) => {
    const lowValve = inputs.SelectedValve?.[0];
    if (inputs.IsMultivalve !== true || !lowValve || lowValve.Pset == null || lowValve.Pset === '') return false;
    let response = lowValve.ReResponse;
    if (typeof response === 'string') {
        try { response = JSON.parse(response); } catch { return false; }
    }
    const previousUnitKey = response?.equationValues?.receivedUOM?.pressureUOM || lowValve.PressureUOM || inputs.PressureUOM;
    const previousUnit = uoms.find(unit => unit.UnitKey === previousUnitKey);
    const currentUnit = uoms.find(unit => unit.UnitKey === inputs.PressureUOM);
    if (!previousUnit || !currentUnit || inputs.SetPressure === '') return false;
    const previousPressure = Number(convertUnit(Number(lowValve.Pset), previousUnit, currentUnit));
    const currentPressure = Number(inputs.SetPressure);
    return Number.isFinite(previousPressure) && Number.isFinite(currentPressure)
        && Math.abs(previousPressure - currentPressure) > 1e-7 * Math.max(1, Math.abs(currentPressure));
};

const refreshMultiValvePressure = async (inputs, workflowId, uoms) => {
    if (!hasMultiValveSetPressureChanged(inputs, uoms)) return inputs;
    const defaults = await fetchDefaultValues('SetPressure', workflowId);
    const pressureRules = defaults.filter(rule => rule.CurrentId === 'OverPressure');
    if (!pressureRules.length) return inputs;
    const pressureValues = await evaluateDefaultValues(pressureRules, inputs, 'SetPressure');
    return { ...inputs, ...pressureValues };
};

module.exports = { hasMultiValveSetPressureChanged, refreshMultiValvePressure };
