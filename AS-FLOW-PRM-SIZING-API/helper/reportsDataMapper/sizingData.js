const { getRoundedReportsVal, genResPayload, getReportsVal } = require("./dataMapperCommonMethods");

const get_brand = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("brand", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const get_valve_type = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("valve_type", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const get_model_id = (sizingData, uomResults, templateId) => {
    const val = getReportsVal("model_id", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const get_service = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("service", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const get_code = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("code", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const get_service_type = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("service_type", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const get_CalcMethod = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("calc_method", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}
const get_DisplayUnit = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("display_unit_system", sizingData);
 
    return genResPayload(val, null, sizingData, uomResults)
}
const get_PR = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("calc_result.PR", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const get_TPR = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("calc_result.TPR", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const get_Po = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("outletStaticPressure", sizingData);

    return genResPayload(val, sizingData.outletStaticPressure_uom, sizingData, uomResults)
}

const get_over_pressure_per = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("over_pressure_per", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const get_ka_data_set = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("misc_properties.ka_dataset", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const get_is_liquid_2 = (sizingData, uomResults, templateId) => {
    const val = getReportsVal("is_liquid_2", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const massFlowOrVolumentric = (sizingData, uomResults, templateId) => {
    const val = !sizingData.req_pressure_flow_uom ? null : sizingData.req_pressure_flow_uom.includes("massflow") ? "Mass" : "Volumetric";

    return genResPayload(val, null, sizingData, uomResults)
}

const pressureCheckBox = (sizingData, uomResults, templateId) => {
    const val = getReportsVal("pressure_checkbox", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const vacuumCheckBox = (sizingData, uomResults, templateId) => {
    const val = getReportsVal("vaccum_checkbox", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const prefDistanceFromValve = (sizingData, uomResults, templateId) => {
    const val = getReportsVal("preference_details.prefDistanceFromValve", sizingData);

    return genResPayload(val, sizingData.preference_details.prefDistanceFromValveUnit, sizingData, uomResults)
}

const SuperCriticalCFact_ksc = (sizingData, uomResults, templateId) => {
    const val = getReportsVal("calc_result.ksc", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}
module.exports = { get_brand, get_valve_type, get_model_id, get_service, get_code, get_service_type, get_CalcMethod, get_PR, get_TPR, get_Po, get_over_pressure_per, get_ka_data_set, get_is_liquid_2, massFlowOrVolumentric, pressureCheckBox, vacuumCheckBox,get_DisplayUnit,prefDistanceFromValve, SuperCriticalCFact_ksc }