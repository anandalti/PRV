const { genResPayload, getReportsVal } = require("./dataMapperCommonMethods");

const PressureFluidLabel = (sizingData, uomResults, templateId) => {
    const condition = getReportsVal("pressure_checkbox", sizingData);
    let val = '';
    if(condition === "true") {
        val = 'Pressure Fluid:'
    }
    return genResPayload(val, null, sizingData, uomResults)
}

const PressureSetPointLabel = (sizingData, uomResults, templateId) => {
    const condition = getReportsVal("pressure_checkbox", sizingData);
    let val = '';
    let val1 = getReportsVal("set_pressure", sizingData);
    if(condition === "true" && !!val1) {
        val = 'Pressure Set Point:'
    }
    return genResPayload(val, null, sizingData, uomResults)
}

const AllowedOverPressureLabel = (sizingData, uomResults, templateId) => {
    const condition = getReportsVal("pressure_checkbox", sizingData);
    let val = '';
    let val1 = getReportsVal("over_pressure", sizingData);
    if(condition === "true" && !!val1) {
        val = 'Allowed Over Pressure:'
    }
    return genResPayload(val, null, sizingData, uomResults)
}

const PressureFlowRateLabel = (sizingData, uomResults, templateId) => {
    const condition = getReportsVal("pressure_checkbox", sizingData);
    let val = '';
    let val1 = getReportsVal("req_pressure_flow", sizingData);
    if(condition === "true" && !!val1) {
        val = 'Pressure Flow Rate:'
    }
    return genResPayload(val, null, sizingData, uomResults)
}

const DifferentialPressureLabel = (sizingData, uomResults, templateId) => {
    const condition = getReportsVal("pressure_checkbox", sizingData);
    let val = '';
    let val1 = getReportsVal("delta_press", sizingData);
    if(condition === "true" && !!val1) {
        val = 'Differential Pressure:'
    }
    return genResPayload(val, null, sizingData, uomResults)
}

const VacuumFluidLabel = (sizingData, uomResults, templateId) => {
    const condition = getReportsVal("vaccum_checkbox", sizingData);
    let val = '';
    if(condition === "true") {
        val = 'Vacuum Fluid:'
    }
    return genResPayload(val, null, sizingData, uomResults)
}

const VacuumSetPointLabel = (sizingData, uomResults, templateId) => {
    const condition = getReportsVal("vaccum_checkbox", sizingData);
    let val = '';
    let val1 = getReportsVal("set_vaccum", sizingData);
    if(condition === "true" && !!val1) {
        val = 'Vacuum Set Point:'
    }
    return genResPayload(val, null, sizingData, uomResults)
}

const AllowedUnderPressureLabel = (sizingData, uomResults, templateId) => {
    const condition = getReportsVal("vaccum_checkbox", sizingData);
    let val = '';
    let val1 = getReportsVal("under_press_v", sizingData);
    if(condition === "true" && !!val1) {
        val = 'Allowed Under Pressure:'
    }
    return genResPayload(val, null, sizingData, uomResults)
}

const VacuumFlowRateLabel = (sizingData, uomResults, templateId) => {
    const condition = getReportsVal("vaccum_checkbox", sizingData);
    let val = '';
    let val1 = getReportsVal("required_flow_vacuum", sizingData);
    if(condition === "true" && !!val1) {
        val = 'Vacuum Flow Rate:'
    }
    return genResPayload(val, null, sizingData, uomResults)
}

const DifferentialVacuumLabel = (sizingData, uomResults, templateId) => {
    const condition = getReportsVal("vaccum_checkbox", sizingData);
    let val = '';
    let val1 = getReportsVal("delta_vaccum", sizingData);
    if(condition === "true" && !!val1) {
        val = 'Differential Vacuum:'
    }
    return genResPayload(val, null, sizingData, uomResults)
}

const PressureFluid = (sizingData, uomResults, templateId) => {
    const condition = getReportsVal("pressure_checkbox", sizingData);
    let val = '';
    if(condition === "true") {
        val = getReportsVal("fluid_name", sizingData);
    }
    return genResPayload(val, null, sizingData, uomResults)
}

const PressureSetPoint = (sizingData, uomResults, templateId) => {
    const condition = getReportsVal("pressure_checkbox", sizingData);
    let val = '';
    if(condition === "true") {
        val = getReportsVal("set_pressure", sizingData);
    }
    return genResPayload(val, sizingData.pressure_uom, sizingData, uomResults);
}

const AllowedOverPressure = (sizingData, uomResults, templateId) => {
    const condition = getReportsVal("pressure_checkbox", sizingData);
    let val = '';
    if(condition === "true") {
        val = getReportsVal("over_pressure", sizingData);
    }
    return genResPayload(val, sizingData.pressure_uom, sizingData, uomResults)
}

const PressureFlowRate = (sizingData, uomResults, templateId) => {
    const condition = getReportsVal("pressure_checkbox", sizingData);
    let val = '';
    if(condition === "true") {
        val = getReportsVal("req_pressure_flow", sizingData);
    }
    return genResPayload(val, sizingData.req_pressure_flow_uom, sizingData, uomResults)
}

const DifferentialPressure = (sizingData, uomResults, templateId) => {
    const condition = getReportsVal("pressure_checkbox", sizingData);
    let val = '';
    if(condition === "true") {
        val = getReportsVal("delta_press", sizingData);
    }
    return genResPayload(val, sizingData.pressure_uom, sizingData, uomResults)
}

const VacuumFluid = (sizingData, uomResults, templateId) => {
    const condition = getReportsVal("vaccum_checkbox", sizingData);
    let val = '';
    if(condition === "true") {
        val = getReportsVal("fluid_name_v", sizingData);
    }
    return genResPayload(val, null, sizingData, uomResults)
}

const VacuumSetPoint = (sizingData, uomResults, templateId) => {
    const condition = getReportsVal("vaccum_checkbox", sizingData);
    let val = '';
    if(condition === "true") {
        val = getReportsVal("set_vaccum", sizingData);
    }
    return genResPayload(val, sizingData.pressure_uom, sizingData, uomResults)
}

const AllowedUnderPressure = (sizingData, uomResults, templateId) => {
    const condition = getReportsVal("vaccum_checkbox", sizingData);
    let val = '';
    if(condition === "true") {
        val = getReportsVal("under_press_v", sizingData);
    }
    return genResPayload(val, sizingData.pressure_uom, sizingData, uomResults)
}

const VacuumFlowRate = (sizingData, uomResults, templateId) => {
    const condition = getReportsVal("vaccum_checkbox", sizingData);
    let val = '';
    if(condition === "true") {
        val = getReportsVal("required_flow_vacuum", sizingData);
    }
    return genResPayload(val, sizingData.req_pressure_flow_uom, sizingData, uomResults)
}

const DifferentialVacuum = (sizingData, uomResults, templateId) => {
    const condition = getReportsVal("vaccum_checkbox", sizingData);
    let val = '';
    if(condition === "true") {
        val = getReportsVal("delta_vaccum", sizingData);
    }
    return genResPayload(val, sizingData.pressure_uom, sizingData, uomResults)
}

module.exports = {
    PressureFluidLabel,
    PressureSetPointLabel,
    AllowedOverPressureLabel,
    PressureFlowRateLabel,
    DifferentialPressureLabel,
    VacuumFluidLabel,
    VacuumSetPointLabel,
    AllowedUnderPressureLabel,
    VacuumFlowRateLabel,
    DifferentialVacuumLabel,
    PressureFluid,
    PressureSetPoint,
    AllowedOverPressure,
    PressureFlowRate,
    DifferentialPressure,
    VacuumFluid,
    VacuumSetPoint,
    AllowedUnderPressure,
    VacuumFlowRate,
    DifferentialVacuum
}