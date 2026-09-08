const { get_design_code, get_sizing_std, getFluidStateAtInletValue } = require("./commonMethodsReports");
const { getRoundedReportsVal, getReportsVal, genResPayload, getFLowKey, getUnitNameOfUOM, convertUOM } = require("./dataMapperCommonMethods");
const Tag_Number = (sizingData, uomResults, templateId) => {
    const val = getReportsVal("reports_general.tagNumber", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Tag_Notes = (sizingData, uomResults, templateId) => {
    const val = getReportsVal("tag_notes.tagNote", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Valve_Model_Number = (sizingData, uomResults, templateId) => {
    const val = getReportsVal("model", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Quantity = (sizingData, uomResults, templateId, sapData) => {
    let val = getReportsVal("quantity", sizingData);
    try {
        if(!val && sapData && sapData.outputParameters && sapData.outputParameters.Quantity) {
            val = parseInt(sapData.outputParameters.Quantity);
        }
    } catch (error) {
        console.error("Error in Quantity: ", error);
        val = 1;
    }
    return genResPayload(val, null, sizingData, uomResults)
}

const Required_Flow = (sizingData, uomResults, templateId) => {
    let dynamicKey = "req_pressure_flow";
    let dynamicUOM = sizingData.req_pressure_flow_uom;
    const templateIdArr = ['14','2','30','32','33'];
    if(templateIdArr.includes(templateId)){
        dynamicKey = "vaccum_flow";
        dynamicUOM = sizingData.req_pressure_flow_uom;
    }

    const val = getRoundedReportsVal(dynamicKey, sizingData);

    return genResPayload(val, dynamicUOM, sizingData, uomResults)
}

const Rated_Flow = (sizingData, uomResults, templateId) => {
    let dynamicKey = "flowTypeP";
    let dynamicUOM = sizingData.req_pressure_flow_uom;
    const templateIdArr = ['14','2','30','32','33'];
    if(templateIdArr.includes(templateId)){
        dynamicKey = "flowTypeV";
    }

    const val = getRoundedReportsVal(dynamicKey, sizingData);

    return genResPayload(val, dynamicUOM, sizingData, uomResults)
}

const Design_Code = (sizingData, uomResults, templateId) => {
    let val = get_design_code(sizingData["code"])

    if(val === "ASME VIII/XIII- UV" && !sizingData.is_section_VIII && sizingData["code"] !== "ISO 4126-7 (2nd Edition)"){
        val = "ASME Non Code"
    }

    return genResPayload(val, null, sizingData, uomResults)
}

const Sizing_Std = (sizingData, uomResults, templateId) => {
    const val = get_sizing_std(sizingData["code"])

    return genResPayload(val, null, sizingData, uomResults)
}

const Fluid_State_at_Inlet = (sizingData, uomResults, templateId) => {
    const val = getFluidStateAtInletValue(sizingData)

    return genResPayload(val, null, sizingData, uomResults)
}

const Required_Area = (sizingData, uomResults, templateId) => {
    let val = getRoundedReportsVal("areq", sizingData);

    if((templateId == "14" || templateId == "13") && val){
        const convertAreq = convertUOM(val, sizingData.calc_method === "English" ? "area.in2" : "area.cm2", sizingData.misc_properties.orifice_area, uomResults);

        val = convertAreq.value
    }

    return genResPayload(val, sizingData.misc_properties.orifice_area, sizingData, uomResults)
}

const Selected_Area = (sizingData, uomResults, templateId) => {
    const selArea = sizingData.misc_properties.ka_dataset === "ASME" ? "a" : "aapi";
    const val = getRoundedReportsVal(selArea, sizingData);

    return genResPayload(val, sizingData.misc_properties.orifice_area, sizingData, uomResults)
}

const Reaction_Force = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("reactionForce", sizingData);

    return genResPayload(val, sizingData.fr_uom, sizingData, uomResults)
}

const Noise_Level_Open_Discharge = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("noiseLp", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Flow_Rated_Acutal_Maximum_Text = (sizingData, uomResults, templateId) => {
    const designCode = get_design_code(sizingData["code"])
    const flowKey = getFLowKey(designCode, sizingData.misc_properties.ka_dataset)
    return genResPayload(flowKey, null, sizingData, uomResults)
}

const Distance_From_Valve_At = (sizingData, uomResults, templateId) => {
    let inputVal=""
    let inputUOM = "";

    if(!sizingData.updated){
        inputVal = getRoundedReportsVal("preference_details.prefDistanceFromValve", sizingData);
        inputUOM = getReportsVal("preference_details.prefDistanceFromValveUnit", sizingData);
    }
    else{
        inputVal = getRoundedReportsVal("distanceFromValve", sizingData); 
        inputUOM = getReportsVal("r_uom",sizingData);
    }
   
    // return genResPayload(inputVal ? (Number(inputVal)).toFixed(7) : null, inputUOM, sizingData, uomResults)

    return genResPayload(inputVal ? `at ${(Number(inputVal)).toFixed(3)} ${getUnitNameOfUOM(inputUOM, uomResults)}` : `at 100 ft`, null, sizingData, uomResults)
}

const Liquid1Or2 = (sizingData, uomResults, templateId) => {
    const val = templateId === "16.1" ? "LIQUID 2" : "LIQUID 1"

    return genResPayload(val, null, sizingData, uomResults)
}

module.exports = { Tag_Number, Tag_Notes, Valve_Model_Number, Quantity, Required_Flow, Rated_Flow, Design_Code, Sizing_Std, Fluid_State_at_Inlet, Required_Area, Selected_Area, Reaction_Force, Noise_Level_Open_Discharge, Flow_Rated_Acutal_Maximum_Text, Distance_From_Valve_At, Liquid1Or2 }