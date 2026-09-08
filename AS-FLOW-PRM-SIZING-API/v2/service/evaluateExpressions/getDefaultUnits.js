const fs = require('fs');
const path = require('path');
const { getDefaultUOMs } = require("../getUom");
const { FieldUomConversion } = require('../fieldCalculations/FieldUomConversion');

function isStringifiedJSON(str) {
    if (typeof str !== 'string') return false;
    try {
        const parsed = JSON.parse(str);
        return typeof parsed === 'object' && parsed !== null;
    } catch (e) {
        return false;
    }
}

let _fieldsGroupByUOMCache = null;

const getFieldsGroupByUOM = () => {
    if (_fieldsGroupByUOMCache) return _fieldsGroupByUOMCache;
    const workflow = path.join(__dirname, `../../data/workflowSectionFields/SectionFields.json`)
    const fileData = fs.readFileSync(workflow, 'utf8');
    const workflowSections=JSON.parse(fileData);
    const fields = workflowSections?.reduce((acc, field) => {
        if (field?.UomFieldName) {
            if (!acc[field?.UomFieldName]) {
                acc[field?.UomFieldName] = [field?.FieldName];
            } else {
                acc[field?.UomFieldName].push(field?.FieldName);
            }
        }
        return acc;
    }, {});
    fields['DensityUOM'] = ['Density', 'DensityLiquid'];
    fields['SpecificVolumeUOM'] = ['SpecificVolume', 'SpecificVolumeLiquid', 'CombinedSpVolAtInlet'];
    //fields['SpecificVolumeUOM'] = ['SpecificVolume', 'SpecificVolumeLiquid'];
    _fieldsGroupByUOMCache = fields;
    return _fieldsGroupByUOMCache;
}

const clearFieldsGroupByUOMCache = () => { _fieldsGroupByUOMCache = null; };

const getDefaultUnits = async(inputs, variables, CurrentId, uom = '') => {
    try{
        const fieldsbyUOM = getFieldsGroupByUOM();
        const defaultUOMs = await getDefaultUOMs();
        const defaultUnits = {
            'English': {
            },
            'Metric': {
            }
        };
        const receivedUOM = Object.keys(fieldsbyUOM).reduce((acc, uomField) => {
            acc[uomField] = inputs[uomField];
            const defaultUomObj = defaultUOMs.filter(d => inputs[uomField]?.split('.')[0] === 'temp' ? d.DimensionName === 'temperature' : d.DimensionName === inputs[uomField]?.split('.')[0]);
            defaultUomObj.forEach(d => {
                defaultUnits[d.SystemUnit][uomField] = d.UnitKey;
            });
            return acc;
        }, {});
        let uomString = uom;
        let defaultUom;
        if(isStringifiedJSON(uom)) {
            parsedUom = JSON.parse(uom);
            defaultUom = {};
            const variableKeys = Object.keys(variables);
            for (const key of Object.keys(parsedUom)) {
                if (variableKeys.includes(key) || key === CurrentId) {
                    defaultUom[parsedUom[key][0]] = parsedUom[key][1];
                }
            }            
            uomString = null;
        } else {
            defaultUom = defaultUnits['English'];
            if(inputs?.CalculationMethod &&  inputs?.CalculationMethod === 'Metric') {
                defaultUom = defaultUnits['Metric'];
            }
        }

        let CurrentIdUOM;
        const fieldsToConvert = Object.keys(fieldsbyUOM).reduce((acc, uomField) => {
            acc[uomField] = fieldsbyUOM[uomField].filter(f => !!variables?.[f]);
            if(fieldsbyUOM[uomField].find(f => f === CurrentId)) {
                CurrentIdUOM = uomField;
            }
            return acc;
        }, {});
        let convertedValues = {...variables};
        for (const uomField of Object.keys(fieldsToConvert)) {
            const fromUom = receivedUOM[uomField];
            const toUom = uomString ?? defaultUom[uomField];
            if(fromUom && toUom && fromUom !== toUom) {
                const fields = fieldsToConvert[uomField].reduce((acc, field) => {
                    acc[field] = variables[field];
                    return acc;
                }, {});
                const valuesConverted = await FieldUomConversion({ values: fields, fromUom, toUom, inputs });
                convertedValues = { ...convertedValues, ...valuesConverted.convertedValue };
            }
        }

        return { convertedValues, receivedUOM: receivedUOM[CurrentIdUOM], defaultUom: uomString ?? defaultUom[CurrentIdUOM] };
    }catch(error){
        console.log('Error in getDefaultUnits >>>>>', error);
    }
}

const getReceivedUnit = async (inputs, values, receivedUOM, defaultUom) => {
    const fromUom = defaultUom;
    const toUom = receivedUOM;
    let receivedUOMValue = values;
    if (fromUom && toUom && fromUom !== toUom) {
        let convertedValues = await FieldUomConversion({ values, fromUom, toUom, inputs });
        receivedUOMValue = convertedValues.convertedValue;
    }
    return receivedUOMValue;
};

module.exports = {
    getDefaultUnits,
    getReceivedUnit,
    clearFieldsGroupByUOMCache
};