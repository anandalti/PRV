const { get_design_code, isMassOrVolumetric } = require("./commonMethodsReports");
const { getRoundedReportsVal, getReportsVal, genResPayload, getFLowKey, convertUOM } = require("./dataMapperCommonMethods");
const { filterFlowKey } = require("../../helper/flowKey2");

var reportData = require("../../v2/service/report.service");

const TwoPhase_Back_Pressure_Correction_Factor_Kbw = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("Kbw", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const TwoPhase_Discharge_Coefficient_K2Phi = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("K2phi", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const TwoPhase_Inlet_Specific_Volume_v1 = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("liquid_specific_volume", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}
//fn takes input
//provide accurate data
const TwoPhase_Required_Orifice_Area_Areq = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("areq", sizingData);

    return genResPayload(val, sizingData.misc_properties.orifice_area, sizingData, uomResults)
}

const Absolute_Pressure_Ratio_PR = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("calc_result.PR", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Capacity_of_Selected_Valve_Qm = (sizingData, uomResults, templateId) => {
    let val = getRoundedReportsVal("Qm", sizingData);

    if(val){
        const convertR = convertUOM(val, "massflow.kghr", sizingData.req_pressure_flow_uom, uomResults)

        val = convertR.value;
    }

    return genResPayload(val, sizingData.req_pressure_flow_uom, sizingData, uomResults)
}

const Capacity_of_Selected_Valve_Qm_actual = (sizingData, uomResults, templateId) => {
    let val = getRoundedReportsVal("Qm", sizingData);
    val = val ? val / 0.9 : val;

    return genResPayload(val, "massflow.kghr", sizingData, uomResults)
}

const Capacity_of_Selected_Valve_VL = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("req_pressure_flow", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Capacity_of_Selected_Valve_W = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("flowTypeP", sizingData);

    return genResPayload(val, sizingData.req_pressure_flow_uom, sizingData, uomResults)
}

const Critical_Pressure_Pc = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("calc_result.Pc", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Critical_Pressure_Ratio_ηc = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("calc_result.Eta_c", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Differential_Pressure_X = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("delta_vaccum", sizingData);

    return genResPayload(val, sizingData.vaccum_uom, sizingData, uomResults)
}

const Discharge_Coefficient_Kd = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("kd", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Flashing_Critical_Pressure_Ratio_ηvc = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("calc_result.Eta_vc", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Flashing_Mass_Flux_Gv = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("G", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Flashing_Partial_Pressure_Ratio_ηv = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("Eta_v", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Gas_Constant_C = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("calc_result.C", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Gas_Mass_Fraction_x1 = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Inlet_gas_Mole_Fraction_in_Vapor_Phase_yg1 = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("calc_result.yg1", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Inlet_Relieving_Pa = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("calc_result.result.PA", sizingData);

    return genResPayload(val, sizingData.calc_method === "Metric" ? "pressure.barg" : "pressure.psig", sizingData, uomResults)
}

const Inlet_Relieving_Pressure_P1 = (sizingData, uomResults, templateId) => {
    let val;
    if(sizingData.service_type === "Liquid"){
        val = getRoundedReportsVal("calc_result.result.PA", sizingData)
    }else{
        val = getRoundedReportsVal("calc_result.P1", sizingData)
    }
    return genResPayload(val, sizingData.calc_method === "English" ? "abspressure.psia" : "abspressure.bara", sizingData, uomResults)
}

const Is_Flow_Critical_Subcritical = (sizingData, uomResults, templateId) => {
    // const val = getRoundedReportsVal("is_critical", sizingData);
    return genResPayload(sizingData.is_critical, null, sizingData, uomResults)
}

const Lift_Restriction_REST = (sizingData, uomResults, templateId) => {
    // const val = getRoundedReportsVal("", sizingData);

    return genResPayload("restricted", null, sizingData, uomResults)
}

const Mass_Critical_Flow_for_Noise_Calc_W = (sizingData, uomResults, templateId) => {     
     const val = getRoundedReportsVal("wact", sizingData);
    return genResPayload(val, sizingData.calc_method === "English" ? "massflow.lbhr" : "massflow.kghr", sizingData, uomResults)
}

const Mass_Critical_Flow_W = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("flowTypeP", sizingData);
    return genResPayload(val, sizingData.req_pressure_flow_uom, sizingData, uomResults)
}

const Mass_Flow_for_Noise_Calc_W = (sizingData, uomResults, templateId) => {
    let val = sizingData.k_a_dataset === "ASME"? 'wact': (sizingData.service === 'P'? 'WmaxP':'WmaxV')
    const finalval = getRoundedReportsVal(val, sizingData);
    return genResPayload(finalval, sizingData.calc_method === "English" ? "massflow.lbhr" : "massflow.kghr", sizingData, uomResults)
}

const Mass_Flow_W = (sizingData, uomResults, templateId) => {
    let dynamicKey = "flowTypeP";
    let dynamicUOM = sizingData.req_pressure_flow_uom;
    const templateIdArr = ['14','2','30','32','33'];
    if(templateIdArr.includes(templateId)){
        dynamicKey = "flowTypeV";
        dynamicUOM = sizingData.req_pressure_flow_uom;
    }

    const val = getRoundedReportsVal(dynamicKey, sizingData);

    return genResPayload(val, dynamicUOM, sizingData, uomResults)
}
// const W_generic_notnoise=()=>{

//     const val = getRoundedReportsVal(dynamicKey, sizingData);

//     return genResPayload(val, dynamicUOM, sizingData, uomResults)
// }

const Mass_Flux_G = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("calc_result.G", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Mass_SubCritical_Flow_for_Noise_Calc_W = (sizingData, uomResults, templateId) => {
    const mOrVFlow = isMassOrVolumetric(sizingData["req_pressure_flow_uom"]);
    let dynamicKey = mOrVFlow === "Mass" ? "wact" : "WmaxP" ;

    const val = getRoundedReportsVal(dynamicKey, sizingData);
    sizingData.key = "wForNoise";

    return genResPayload(val, sizingData.calc_method === "English" ? "massflow.lbhr" : "massflow.kghr", sizingData, uomResults)
}

const Mass_SubCritical_Flow_W = (sizingData, uomResults, templateId) => {
    let dynamicKey = "flowTypeP";
    let dynamicUOM = sizingData.req_pressure_flow_uom;
    const templateIdArr = ['14','2','30','32','33'];
    if(templateIdArr.includes(templateId)){
        dynamicKey = "flowTypeV";
        dynamicUOM = sizingData.req_pressure_flow_uom;
    }

    const val = getRoundedReportsVal(dynamicKey, sizingData);

    return genResPayload(val, dynamicUOM, sizingData, uomResults)
}

const Napier_Correction_Factor_Kn = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("calc_result.Kn", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Noise_Level_at_100ft_30m_L100 = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("L100", sizingData);

    return genResPayload(val, sizingData.lp_uom, sizingData, uomResults, "")
}

const Noise_Level_for_Open_Discharge_at_Distance_r_Lp = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("noiseLp", sizingData);

    return genResPayload(val, sizingData.lp_uom ? sizingData.lp_uom : "noise.db", sizingData, uomResults)
}

const Nonflashing_Critical_Pressure_Ratio_ηgc = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("calc_result.Eta_gc", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Nonflashing_Mass_Flux_Gg = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("mass_flux", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Nonflashing_Partial_Pressure_Ratio_ηg = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("calc_result.Eta_g", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Omega_ω = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("calc_result.Omega", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Outlet_Area_AO = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("outletArea", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Outlet_Pressure_P2 = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("calc_result.P2", sizingData);

    return genResPayload(val, sizingData.calc_method === "English" ? "abspressure.psia" : "abspressure.bara", sizingData, uomResults)
}

const Outlet_Pressure_Pb = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("calc_result.result.PB", sizingData);

    return genResPayload(val, sizingData.calc_method === "Metric" ? "pressure.barg" : "pressure.psig", sizingData, uomResults)
}

const Outlet_Static_Pressure_Po = (sizingData, uomResults, templateId) => {

    let val = getRoundedReportsVal("outletStaticPressure", sizingData);

    if (val && sizingData.outletStaticPressure_uom) {
        const inputval = convertUOM(val, sizingData.calc_method === "Metric" ? "pressure.barg" : "pressure.psig", sizingData.outletStaticPressure_uom, uomResults);

        val = (inputval.value).toFixed(7);
    }

    return genResPayload(val, sizingData.outletStaticPressure_uom, sizingData, uomResults)

}

const Over_Pressure_Ratio_X = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("calc_result.PR", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Pseudo_Set_Pressure_Ppset = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Reaction_Force_for_Open_Discharge_Fr = (sizingData, uomResults, templateId) => {
    let val = getRoundedReportsVal("reactionForce", sizingData);

    // if(val && sizingData.fr_uom){
    //     const inputval = convertUOM(val, sizingData.calc_method === "Metric" ? "force.N" : "force.lbf", sizingData.fr_uom, uomResults);

    //     val = (inputval.value).toFixed(3);
    // }

    return genResPayload(val, sizingData.fr_uom, sizingData, uomResults)
}

const Required_Orifice_Area_Areq = (sizingData, uomResults, templateId) => {
    let val = getRoundedReportsVal("areq", sizingData);

    if((templateId == "14" || templateId == "13") && val){
        const convertAreq = convertUOM(val, sizingData.calc_method === "English" ? "area.in2" : "area.cm2", sizingData.misc_properties.orifice_area, uomResults);

        val = convertAreq.value
    }

    return genResPayload(val, sizingData.misc_properties.orifice_area, sizingData, uomResults)
}

const Restricted_Lift_Capacity_Qmrest = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("<missing>", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Restricted_Lift_Capacity_VLrest = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("<missing>", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Restricted_Lift_Capacity_Vrest = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("<missing>", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Restricted_Lift_Capacity_Wrest = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("<missing>", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Reynolds_Number_R = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("r", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Reynolds_Number_Rm = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("rmax", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Reynolds_Number_Rmax = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("rmax", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Saturated_Omega_ω = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("omega", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Saturation_Pressure_Ratio_ηs = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("calc_result.Eta_s", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Sound_Power_Level_PWL = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("soundPowerLevel", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Sound_Pressure_Level_for_Open_Discharge_at_Distance_r_PSLr = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("soundPowerLevel", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Sp_Vol_Difference_vvl1 = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("calc_result.Vvl1", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Specific_Volume_Difference_vvls = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("calc_result.vvls", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Subcooling_Region_Low_High = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const SubCritical_Discharge_Coefficient_Derated_Kd = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("kd", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const SubCritical_Discharge_Coefficients_Actual_K = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("k", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const SubCritical_Flow_Factor_Fs = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("calc_result.FS", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Superimposed_Back_Pressure_Absolute_PU = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("const_supimp_bk_pressure", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Theoretical_Pressure_Ratio_TPR = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("calc_result.TPR", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Transition_Saturation_Pressure_Ratio_ηst = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("calc_result.Eta_st", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Void_Fraction_α1 = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("calc_result.Alpha", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Volumetric_Critical_Flow_V = (sizingData, uomResults, templateId) => {
    let dynamicKey = "flowTypeP";
    let dynamicUOM = sizingData.req_pressure_flow_uom;
    const templateIdArr = ['14', '2', '30', '32', '33'];
    if (templateIdArr.includes(templateId)) {
        dynamicKey = "flowTypeV";
        dynamicUOM = sizingData.req_pressure_flow_uom;
    }

    const val = getRoundedReportsVal(dynamicKey, sizingData);

    return genResPayload(val, dynamicUOM, sizingData, uomResults)
}

const Volumetric_Flow_V = (sizingData, uomResults, templateId) => {
    let dynamicKey = "flowTypeP";
    let dynamicUOM = sizingData.req_pressure_flow_uom;
    const templateIdArr = ['14', '2', '30', '32', '33'];
    if (templateIdArr.includes(templateId)) {
        dynamicKey = "flowTypeV";
        dynamicUOM = sizingData.req_pressure_flow_uom;
    }

    const val = getRoundedReportsVal(dynamicKey, sizingData);

    return genResPayload(val, dynamicUOM, sizingData, uomResults)
}

const NoisepayloadW_Api = (sizingData, uomResults, templateId) => {
    let val = sizingData.k_a_dataset === "API" ? sizingData.service === "P"? sizingData.flowTypeP: sizingData.flowTypeV:null;
    console.log({val})
    return genResPayload(val, sizingData.calc_method === "English" ? "massflow.lbhr" : "massflow.kghr", sizingData, uomResults)
  }
const Volumetric_SubCritical_Flow_V = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("flowTypeP", sizingData);

    return genResPayload(val, sizingData.req_pressure_flow_uom, sizingData, uomResults)
}

// Liquid 2
const Inlet_Relieving_Pa_Liq2 = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("calc_result.P1", sizingData);

    return genResPayload(val, sizingData.calc_method === "English" ? "abspressure.psia" : "abspressure.bara", sizingData, uomResults)
}

const Outlet_Pressure_Pb_Liq2 = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("calc_result.P2", sizingData);

    return genResPayload(val, sizingData.calc_method === "English" ? "abspressure.psia" : "abspressure.bara", sizingData, uomResults)
}

const Capacity_of_Selected_Valve_VL_Liq2 = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("req_pressure_flow", sizingData);

    return genResPayload(val, sizingData.req_pressure_flow_uom, sizingData, uomResults)
}

const Reynolds_Number_R_Liq2 = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Reynolds_Number_Rmax_Liq2 = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Required_Orifice_Area_Areq_Liq2 = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("modeldata_liquid2.Areq", sizingData);

    return genResPayload(val, sizingData.misc_properties.orifice_area, sizingData, uomResults)
}
//after json will update here---------------
const Mass_Critical_Flow_for_Noise_Calc_W_Equation = (sizingData, uomResults, templateId) => {
    let val = sizingData.k_a_dataset === "ASME" ? "W = A * C * Kd * P1 * Kb * Kc * [M / (T * Z)]^0.5" : "W = A * C * K,API * P1 * Kb * Kc * [M / (T * Z)]^0.5"

    return genResPayload(val, null, sizingData, uomResults)
}

const Reaction_Force_Equation_17b_VCID_18 = (sizingData, uomResults, templateId) => {
    let val = sizingData.k_a_dataset === "ASME" ? "Fr = (A * C * Kd * P1 * Kc / 366) * {k / [(k + 1) * Z]}^0.5" : "Fr = (A * C * K,API * P1 * Kc / 366) * {k / [(k + 1) * Z]}^0.5"

    return genResPayload(val, null, sizingData, uomResults)
}

const Reaction_Force_Equation_17b_VCID_20 = (sizingData, uomResults, templateId) => {
    let val = sizingData.k_a_dataset === "ASME" ? "Fr = (A * C * Kd * P1 * Kc / 27.907) * {k / [(k + 1) * Z]}^0.5" : "Fr = (A * C * K,API * P1 * Kc / 27.907) * {k / [(k + 1) * Z]}^0.5"

    return genResPayload(val, null, sizingData, uomResults)
}

const Reaction_Force_Equation_17b_VCID_19 = (sizingData, uomResults, templateId) => {
    let val = sizingData.k_a_dataset === "ASME" ? "Fr = (A * C * Kd * P1 * Kc / 366) * {k / [(k + 1) * Z]}^0.5 + (Ao * Po)" : "Fr = (A * C * K,API * P1 * Kc / 366) * {k / [(k + 1) * Z]}^0.5 + (Ao * Po)"

    return genResPayload(val, null, sizingData, uomResults)
}

const Reaction_Force_Equation_17b_VCID_21 = (sizingData, uomResults, templateId) => {
    let val = sizingData.k_a_dataset === "ASME" ? "Fr = (A * C * Kd * P1 * Kc / 27.907) * {k / [(k + 1) * Z]}^0.5 + (10* Ao * Po)" : "Fr = (A * C * K,API * P1 * Kc / 27.907) * {k / [(k + 1) * Z]}^0.5 + (10* Ao * Po)"

    return genResPayload(val, null, sizingData, uomResults)
}

const Reaction_Force_Equation_17a_VCID_18 = (sizingData, uomResults, templateId) => {
    let val = sizingData.k_a_dataset === "ASME" ? "Fr = 0.03593 * A * P1 * Kd * Kn * Ksh * Ksc * Kc * ((ho - 823)^0.5)" : "Fr = 0.03593 * A * P1 * K,API * Kn * Ksh * Ksc * Kc * ((ho - 823)^0.5)"

    return genResPayload(val, null, sizingData, uomResults)
}

const Reaction_Force_Equation_17a_VCID_19 = (sizingData, uomResults, templateId) => {
    let val = sizingData.k_a_dataset === "ASME" ? "Fr = 0.03593 * A * P1 * Kd * Kn * Ksh * Ksc * Kc * ((ho - 823)^0.5) + (Ao * Po)" : "Fr = 0.03593 * A * P1 * K,API * Kn * Ksh * Ksc * Kc * ((ho - 823)^0.5) + (Ao * Po)"

    return genResPayload(val, null, sizingData, uomResults)
}

const Reaction_Force_Equation_17a_VCID_20 = (sizingData, uomResults, templateId) => {
    let val = sizingData.k_a_dataset === "ASME" ? "Fr = 0.23562 * A * P1 * Kd * Kn * Ksh * Ksc * Kc * ((ho - 1914.3)^0.5)" : "Fr = 0.23562 * A * P1 * K,API * Kn * Ksh * Ksc * Kc * ((ho - 1914.3)^0.5)"

    return genResPayload(val, null, sizingData, uomResults)
}

const Reaction_Force_Equation_17a_VCID_21 = (sizingData, uomResults, templateId) => {
    let val = sizingData.k_a_dataset === "ASME" ? "Fr = 0.23562 * A * P1 * Kd * Kn * Ksh * Ksc * Kc * ((ho - 1914.3)^0.5) + (10 * Ao * Po)" : "Fr = 0.23562 * A * P1 * K,API * Kn * Ksh * Ksc * Kc * ((ho - 1914.3)^0.5) + (10 * Ao * Po)"

    return genResPayload(val, null, sizingData, uomResults)
}

const W_for_Noise_13D_8 = (sizingData, uomResults, templateId) => {
    let val = sizingData.k_a_dataset === "ASME" ? "W = 51.5 * A * P1 * Kd * Kb * Kc * Kn * Ksh *Ksc" : "W = 51.5 * A * P1 * K,API * Kb * Kc * Kn * Ksh *Ksc"

    return genResPayload(val, null, sizingData, uomResults)
}

const W_for_Noise_13D_9 = (sizingData, uomResults, templateId) => {
    let val = sizingData.k_a_dataset === "ASME" ? "W = 52.5 * A * P1 * Kd * Kb * Kc * Kn * Ksh * Ksc" : "W = 52.5 * A * P1 * K,API * Kb * Kc * Kn * Ksh * Ksc"

    return genResPayload(val, null, sizingData, uomResults)
}

const W_for_Noise_13b_69 = (sizingData, uomResults, templateId) => {
    let val =
      sizingData.k_a_dataset === "ASME"
        ? "W = A * C * Kd * P1 * Kb * Kc * [M / (T * Z)]^0.5"
        : "W = A * C *  K,API* P1 * Kb * Kc * [M / (T * Z)]^0.5";
  
    return genResPayload(val, null, sizingData, uomResults);
  };

const W_for_Noise_13c_73 = (sizingData, uomResults, templateId) => {
    let val =
      sizingData.k_a_dataset === "ASME"
        ? "W = 735 * Kd * A * P1 * Fs * [M / (T * Z)]^0.5"
        : "W = 735 *  K,API * A * P1 * Fs * [M / (T * Z)]^0.5";
  
    return genResPayload(val, null, sizingData, uomResults);
  };

const W_for_Noise_13c_74 = (sizingData, uomResults, templateId) => {
    let val =
      sizingData.k_a_dataset === "ASME"
        ? "W = 560 * Kd * A * P1 * Fs * [M / (T * Z)]^0.5"
        : "W = 560 * K,API  * A * P1 * Fs * [M / (T * Z)]^0.5";
  
    return genResPayload(val, null, sizingData, uomResults);
  };

const Outlet_Static_Pressure_Po_16a_70 = (sizingData, uomResults, templateId) => {
    let val =
      sizingData.k_a_dataset === "ASME"
        ? "Po = [0.02764 * A * P1 * Kd * Kn * Ksh * Ksc * Kc * ((ho - 823)^0.5) / Ao] - Patm"
        : "Po = [0.02764 * A * P1 *  K,API* Kn * Ksh * Ksc * Kc * ((ho - 823)^0.5) / Ao] - Patm";
  
    return genResPayload(val, null, sizingData, uomResults);
  };

  const Outlet_Static_Pressure_Po_16a_71 = (sizingData, uomResults, templateId) => {
    let val =
      sizingData.k_a_dataset === "ASME"
        ? "Po = [0.01812 * A * P1 * Kd * Kn * Ksh * Ksc * Kc * ((ho - 1914.3)^0.5) / Ao] - Patm"
        : "Po = [0.01812 * A * P1 *  K,API * Kn * Ksh * Ksc * Kc * ((ho - 1914.3)^0.5) / Ao] - Patm";
  
    return genResPayload(val, null, sizingData, uomResults);
  };

const Outlet_Static_Pressure_Po_16b_70 = (sizingData, uomResults, templateId) => {
    let val =
      sizingData.k_a_dataset === "ASME"
        ? "Po = [(0.00245 * A * C * Kd* P1 * Kc) / (Do^2 * (k * Z)^0.5)] - Patm"
        : "Po = [(0.00245 * A * C * K,API* P1 * Kc) / (Do^2 * (k * Z)^0.5)] - Patm";
  
    return genResPayload(val, null, sizingData, uomResults);
  };

const Outlet_Static_Pressure_Po_16b_71 = (sizingData, uomResults, templateId) => {
    let val =
      sizingData.k_a_dataset === "ASME"
        ? "Po = [(0.003225 * A * C * Kd * P1 * Kc) / (Do^2 * (k * Z)^0.5)] - Patm"
        : "Po = [(0.003225 * A * C * K,API * P1 * Kc) / (Do^2 * (k * Z)^0.5)] - Patm";
  
    return genResPayload(val, null, sizingData, uomResults);
  };

const Reaction_Force_for_Open_Discharge_Fr_17c_8 = (sizingData, uomResults, templateId) => {
    let val =
      sizingData.k_a_dataset === "ASME"
        ? "Fr = [2.002 * Pa * (A * Kd * Kv,max)^2] / Ao"
        : "Fr = [2.002 * Pa * (A * K,API * Kv,max)^2] / Ao";
  
    return genResPayload(val, null, sizingData, uomResults);
  };

const Reaction_Force_for_Open_Discharge_Fr_17c_9 = (sizingData, uomResults, templateId) => {
    let val =
      sizingData.k_a_dataset === "ASME"
        ? "Fr = [20.02 * Pa * (A * Kd * Kv,max)^2] / Ao"
        : "Fr = [20.02 * Pa * (A * K,API * Kv,max)^2] / Ao";
  
    return genResPayload(val, null, sizingData, uomResults);
  };

module.exports = {
    TwoPhase_Back_Pressure_Correction_Factor_Kbw, TwoPhase_Discharge_Coefficient_K2Phi, TwoPhase_Inlet_Specific_Volume_v1, TwoPhase_Required_Orifice_Area_Areq, Absolute_Pressure_Ratio_PR, Capacity_of_Selected_Valve_Qm, Capacity_of_Selected_Valve_Qm_actual, Capacity_of_Selected_Valve_VL, Capacity_of_Selected_Valve_W, Critical_Pressure_Pc, Critical_Pressure_Ratio_ηc, Differential_Pressure_X, Discharge_Coefficient_Kd, Flashing_Critical_Pressure_Ratio_ηvc, Flashing_Mass_Flux_Gv, Flashing_Partial_Pressure_Ratio_ηv, Gas_Constant_C, Gas_Mass_Fraction_x1, Inlet_gas_Mole_Fraction_in_Vapor_Phase_yg1, Inlet_Relieving_Pa, Inlet_Relieving_Pressure_P1, Is_Flow_Critical_Subcritical, Lift_Restriction_REST, Mass_Critical_Flow_for_Noise_Calc_W, Mass_Critical_Flow_W, Mass_Flow_for_Noise_Calc_W, Mass_Flow_W, Mass_Flux_G, Mass_SubCritical_Flow_for_Noise_Calc_W, Mass_SubCritical_Flow_W, Napier_Correction_Factor_Kn, Noise_Level_at_100ft_30m_L100, Noise_Level_for_Open_Discharge_at_Distance_r_Lp, Nonflashing_Critical_Pressure_Ratio_ηgc, Nonflashing_Mass_Flux_Gg, Nonflashing_Partial_Pressure_Ratio_ηg, Omega_ω, Outlet_Area_AO, Outlet_Pressure_P2, Outlet_Pressure_Pb, Outlet_Static_Pressure_Po, Over_Pressure_Ratio_X, Pseudo_Set_Pressure_Ppset, Reaction_Force_for_Open_Discharge_Fr, Required_Orifice_Area_Areq, Restricted_Lift_Capacity_Qmrest, Restricted_Lift_Capacity_VLrest, Restricted_Lift_Capacity_Vrest, Restricted_Lift_Capacity_Wrest, Reynolds_Number_R, Reynolds_Number_Rm, Reynolds_Number_Rmax, Saturated_Omega_ω, Saturation_Pressure_Ratio_ηs, Sound_Power_Level_PWL, Sound_Pressure_Level_for_Open_Discharge_at_Distance_r_PSLr, Sp_Vol_Difference_vvl1, Specific_Volume_Difference_vvls, Subcooling_Region_Low_High, SubCritical_Discharge_Coefficient_Derated_Kd, SubCritical_Discharge_Coefficients_Actual_K, SubCritical_Flow_Factor_Fs, Superimposed_Back_Pressure_Absolute_PU, Theoretical_Pressure_Ratio_TPR, Transition_Saturation_Pressure_Ratio_ηst, Void_Fraction_α1, Volumetric_Critical_Flow_V, Volumetric_Flow_V, Volumetric_SubCritical_Flow_V, Inlet_Relieving_Pa_Liq2, Outlet_Pressure_Pb_Liq2, Capacity_of_Selected_Valve_VL_Liq2, Reynolds_Number_R_Liq2, Reynolds_Number_Rmax_Liq2, Required_Orifice_Area_Areq_Liq2, Mass_Critical_Flow_for_Noise_Calc_W_Equation, Reaction_Force_Equation_17b_VCID_18, Reaction_Force_Equation_17b_VCID_20, Reaction_Force_Equation_17b_VCID_19, Reaction_Force_Equation_17b_VCID_21,
    Reaction_Force_Equation_17a_VCID_18,
    Reaction_Force_Equation_17a_VCID_19,
    Reaction_Force_Equation_17a_VCID_20,
    Reaction_Force_Equation_17a_VCID_21,
    W_for_Noise_13D_8,
    W_for_Noise_13D_9,
    W_for_Noise_13b_69,
  W_for_Noise_13c_73,
  W_for_Noise_13c_74,
  Outlet_Static_Pressure_Po_16a_70,
  Outlet_Static_Pressure_Po_16a_71,
  Outlet_Static_Pressure_Po_16b_70,
  Outlet_Static_Pressure_Po_16b_71,
  Reaction_Force_for_Open_Discharge_Fr_17c_8,
  Reaction_Force_for_Open_Discharge_Fr_17c_9,
  NoisepayloadW_Api
}