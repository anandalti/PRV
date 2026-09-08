const { MocJSONDATA } = require("./moc_json");
const { subFlowValidations, subMOC_conditions, subSIZING_conditions, templateID_conditions } = require("./datasheet_json");

// Get template Id==========================
const validateConditionsForTempalteID = (conditions, productType) => {
    let checkUndefinedVal = conditions[productType] ? conditions[productType] : "Template ID doesn't exist for this productType"
    return checkUndefinedVal;
}

const getTheTemplateIDForDataSheet = (sizingData) => {
    return validateConditionsForTempalteID(templateID_conditions, sizingData.Brand.Value[0] + sizingData.ValveType.Value)
}

// Get SubflowID============================
const getsubtemplateidForSubFlow = (templateId, sizingData) => {
    const subTemplateId = subFlowValidations.filter((element) => element.templateId === templateId && element.service_type.includes(sizingData.ServiceType.Value) && (element.code === "NA" || element.code.includes(sizingData.Code.Value)) && (element.k_a_dataset === "NA" || element.k_a_dataset.includes(sizingData.KaDataset.Value))).map(element => {
        return element.subTemplateId;
    })

    return subTemplateId;
}

// // Get SubMoc============================
const getsubtemplateIdForMOC = (templateId, sizingData) => {
    const subTemplateId = subMOC_conditions.filter((element) => (element.brand_valve_type === "NA" || element.brand_valve_type === sizingData.Brand.Value[0] + sizingData.ValveType.Value) && element.templateId === templateId && (element.model === "all" || (eval(element.model))) && (element.service_type === "NA" || element.service_type === sizingData.ServiceType.Value) && (element.pressure_selected ? element.pressure_selected === sizingData.PressureCheckBox.Value : true) && (element.vacuum_selected ? element.vacuum_selected === sizingData.VacuumCheckBox.Value : true)).map(element => {
        return element.subTemplateId;
    })

    // console.log("subTemplateIdForMoc", subTemplateId)

    return subTemplateId;
}

const getsubtemplateIdForsubSIZING = (templateId, sizingData) => {
    // const isSuperCritical = () => {
    //     const t = parseFloat(tempData.relievingTemp);
    //     const pcrit = parseFloat(systemData.criticalPressure);
    // }

    const subTemplateId = subSIZING_conditions.filter((element) => element.templateId === templateId && element.service_type === sizingData.ServiceType.Value && (element.code === "all" || eval(element.code)) && (element.expression ? eval(element.expression) : true)).map(element => {
        return element.subTemplateId;
    })

    return subTemplateId;
}

// compare 2 objects =======================
const compareObjects = (obj1, obj2) => {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) {
        return false;
    }

    for (let key of keys1) {
        if (obj1[key] !== obj2[key]) {
            return false
        }
    }

    return true;
}

// ===============GET MOC VALUE===============
const getMOCVALUES = (sizingData, sapData) => {
    if (sapData === null) return {};

    // find the correct mapping array
    const moc_mapping_arr = MocJSONDATA.filter(element => element.ModelId == sizingData.Valve_Model_Number.Value).map(element => {
        return element.Data
    })

    // find the required sap-data-value for particular model
    if (!moc_mapping_arr[0]) return {};

    let moc_Data = {}
    moc_mapping_arr[0].forEach(element => {
        let sapDataToCompareWithCondition = {};
        let param_key = Object.keys(element)[0];
        let conditionReFormatting = {};
        element[param_key].Condition.forEach(c => {
            let param_key = Object.keys(c)[0];
            conditionReFormatting[param_key] = c[param_key];
        })

        Object.keys(conditionReFormatting).forEach(key => {
            sapData.outputParameters.char_summary_items.map(sapElement => {
                let sapCharArr = sapElement.SapChar === "" ? [] : sapElement.SapChar.split("_");

                let sapChar = sapCharArr[sapCharArr.length - 1];
                if (sapChar === key) {
                    sapDataToCompareWithCondition[sapChar] = sapElement.CharValue;
                }
            })
        })

        if (compareObjects(sapDataToCompareWithCondition, conditionReFormatting)) {
            if (!(param_key.includes("Accessor"))) {
                moc_Data[param_key] = element[param_key].Value;
            } else {
                moc_Data[param_key] = moc_Data[param_key] === undefined ? [] : moc_Data[param_key];
                moc_Data[param_key].push(element[param_key].Value)
            }
        }
    })

    // remove this code below
    sapData.outputParameters.char_summary_items.forEach(item => {
        if (item.SapChar.includes("CATALOG_NUMBER")) {
            moc_Data.catalogue_number = item.CharValue;
        }
    })

    return moc_Data;
}


module.exports = { getTheTemplateIDForDataSheet, getsubtemplateidForSubFlow, getsubtemplateIdForMOC, getsubtemplateIdForsubSIZING, getMOCVALUES }