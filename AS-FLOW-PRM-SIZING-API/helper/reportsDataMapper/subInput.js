const { getRoundedReportsVal, getReportsVal, genResPayload, convertUOM } = require("./dataMapperCommonMethods");

const TwoPhase_Discharge_Coefficient_K2φ = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("K2phi", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Atmospheric_Pressure_Patm = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("atm_pressure", sizingData);

    return genResPayload(val, sizingData.atm_pressure_uom, sizingData, uomResults);
}

const Atmospheric_Pressure_Vacuum_Patm = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("atm_pressure", sizingData);

    return genResPayload(val, sizingData.atm_pressure_uom, sizingData, uomResults)
}

const Back_Press_Correction_Factor_Kb = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("kb", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Back_Press_Correction_Factor_Kb_ISO = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("kb", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Back_Press_Correction_Factor_Kw = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("kb", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Back_Press_Correction_Factor_Vacuum_Kb = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("kb", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Back_Pressure_Pback = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("total_bk_pressure", sizingData);

    return genResPayload(val, sizingData.pressure_uom, sizingData, uomResults)
}

const Compressibility_Vacuum_Z = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("compressibility_v", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Compressibility_Z = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("compressibility_p", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Constant_Superimposed_BP_Psic = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("const_supimp_bk_pressure", sizingData);

    return genResPayload(val, sizingData.pressure_uom, sizingData, uomResults)
}

const Differential_Pressure_dp = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("delta_press", sizingData);

    return genResPayload(val, sizingData.pressure_uom, sizingData, uomResults)
}

const Differential_Pressure_Vacuum_dp = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("delta_vaccum", sizingData);

    return genResPayload(val, sizingData.vaccum_uom, sizingData, uomResults)
}

const Discharge_Coefficient_acutal_Kd = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("kd", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Discharge_Coefficient_acutal_Vacuum_Kd = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("kd", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Discharge_Coefficient_API_KAPI = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("kapi", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Discharge_Coefficient_derated_K = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("k", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Discharge_Coefficient_derated_Kdr = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("k", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Distance_from_Valve_noise_r = (sizingData, uomResults, templateId) => {
   
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
    return genResPayload(inputVal ? (Number(inputVal)).toFixed(7) : null, inputUOM, sizingData, uomResults)
}

const Dryness_Correction_Factor_xs = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("steam_dry_factor", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Gas_Back_Press_Corr_Factor_Kb = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("kb", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Gas_Discharge_Coefficient_KG = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("k", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Gas_Partial_Pressure_Pg1 = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("gas_partial_pressure", sizingData);

    return genResPayload(val, sizingData.atm_pressure_uom, sizingData, uomResults)
}

const Gas_Vapor_Density_at_Outlet_rhog2 = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("<<User Input in Reports UI>>", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Gas_Vapor_Sp_Vol_at_Inlet_vv1 = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("gas_specific_volume", sizingData);

    return genResPayload(val, sizingData.sp_volume_uom, sizingData, uomResults)
}

const Gas_Vapor_Sp_Vol_at_Inlet_vvg1 = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("gas_vap_com_sp_vol", sizingData);

    return genResPayload(val, sizingData.sp_volume_uom, sizingData, uomResults)
}

const Gas_Vapor_Specific_Volume_at_Ps_vvs = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("saturated_vapor_Sp_Vol", sizingData);

    return genResPayload(val, sizingData.sp_volume_uom, sizingData, uomResults)
}

const Inlet_Line_Loss_Ploss = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("inlet_pres_loss", sizingData);

    return genResPayload(val, sizingData.pressure_uom, sizingData, uomResults)
}

const Inlet_Stagnation_Enthalpy_ho = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("calc_result.ho", sizingData);
    const inputVal = convertUOM(val, sizingData.calc_result.ho_uom, sizingData.preference_details.prefLTHTVaporization, uomResults)
    
    return genResPayload(inputVal.value ? (inputVal.value).toFixed(7) : null, sizingData.preference_details.prefLTHTVaporization, sizingData, uomResults)
}

const Isentropic_Expansion_Coeff_k = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("isentropic_exp", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const K_vs_PR_Intercept_b = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("b", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const K_vs_PR_Intercept_Vacuum_b = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("b", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const K_vs_PR_Slope_m = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("m", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const K_vs_PR_Slope_Vacuum_m = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("m", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Liquid_Back_Press_Corr_Factor_Kw = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("kb", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Liquid_Density_at_Inlet_rhol1 = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("liquid_density_inlet", sizingData);

    return genResPayload(val, sizingData.density_uom, sizingData, uomResults)
}

const Liquid_Density_at_Inlet_ρl1 = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("liquid_density_inlet", sizingData);

    return genResPayload(val, sizingData.density_uom, sizingData, uomResults)
}

const Liquid_Density_at_Outlet_rhol2 = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("<<missing>>", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Liquid_Discharge_Coefficient_KL = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("k", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Liquid_Latent_Heat_at_Inlet_hvl1 = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("latent_heat", sizingData);

    return genResPayload(val, sizingData.latent_heat_unit, sizingData, uomResults)
}

const Liquid_Latent_Heat_at_Ps_hvls = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("latent_heat", sizingData);

    return genResPayload(val, sizingData.latent_heat_unit, sizingData, uomResults)
}

const Liquid_Sp_Vol_at_Inlet_vl1 = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("liquid_specific_volume", sizingData);

    return genResPayload(val, sizingData.sp_volume_uom, sizingData, uomResults)
}

const Liquid_Specific_Heat_at_Inlet_Cp = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("liq_Spec_heat_inlet", sizingData);

    return genResPayload(val, sizingData.liq_Spec_heat_inlet_uom, sizingData, uomResults)
}

const Liquid_Specific_Volume_at_Inlet_vl1 = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("liq_Spec_heat_inlet", sizingData);

    return genResPayload(val, sizingData.sp_volume_uom, sizingData, uomResults)
}

const Liquid_Specific_Volume_at_Ps_vls = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("liquid_specific_volume", sizingData);

    return genResPayload(val, sizingData.sp_volume_uom, sizingData, uomResults)
}

const Mass_Flux_G = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("mass_flux", sizingData);

    return genResPayload(val, sizingData.mass_flux_uom, sizingData, uomResults)
}

const Maximum_Flow_Coefficient_Kmax = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("kmax", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Maximum_Flow_Coefficient_Vacuum_Kmax = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("kmaxV", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Mixture_Density_at_90Per_Ps_rho9 = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("mix_density_sat", sizingData);

    return genResPayload(val, sizingData.density_uom, sizingData, uomResults)
}

const Molecular_Mass_M = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("mol_wt_p", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Molecular_Weight_M = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("mol_wt_p", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Molecular_Weight_Vacuum_M = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("mol_wt_v", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Orifice_Area_A = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("a", sizingData);

    return genResPayload(val, sizingData.misc_properties.orifice_area, sizingData, uomResults)
}

const Orifice_Area_AAPI = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("aapi", sizingData);

    return genResPayload(val, sizingData.misc_properties.orifice_area, sizingData, uomResults)
}

const Orifice_Area_Vacuum_A = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("aV", sizingData);

    return genResPayload(val, sizingData.misc_properties.orifice_area, sizingData, uomResults)
}

const Outlet_Diameter_Do = (sizingData, uomResults, templateId, sapData) => {
    const val = (sapData.dimensionData.OutletDiameter);
    console.log({val})
    return genResPayload(val, "outletDiameter."+sizingData.do_uom, sizingData, uomResults)
}

const Outlet_Diameter_Vacuum_Do = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("outletDiameter", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Outlet_Gas_Mass_Fraction_x2 = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("<<User Input in Reports UI>>", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Outlet_Velocity_u = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("velocity", sizingData);

    return genResPayload(val, sizingData.velocity_uom, sizingData, uomResults)
}

const Over_Pressure_Pover = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("over_pressure", sizingData);

    return genResPayload(val, sizingData.pressure_uom, sizingData, uomResults)
}

const Over_Pressure_Vacuum_Vover = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("under_press_v", sizingData);

    return genResPayload(val, sizingData.vaccum_uom, sizingData, uomResults)
}

const Ratio_of_Specific_Heats_k = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("ratio_SpHeat_k_p", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Ratio_of_Specific_Heats_Vacuum_k = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("ratio_SpHeat_k_v", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Relieving_Temperature_T = (sizingData, uomResults, templateId) => {
    const dynamicKey =sizingData.code === "Non-Code (API 2000, 7th Edition)"? sizingData.code === "Non-Code (API 2000, 7th Edition)" && sizingData.service ==="V" ? "relieving_forVacc":"relieving_forPress" : "relieve_temp" ;
    const val = getRoundedReportsVal(dynamicKey, sizingData);

    return genResPayload(val, sizingData.temp_uom, sizingData, uomResults)
}

const Relieving_Temperature_Vacuum_T = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("relieving_forVacc", sizingData);

    return genResPayload(val, sizingData.temp_uom, sizingData, uomResults)
}

const Required_Area__Gas_AreqG = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("modeldata_gas.Areq", sizingData);

    return genResPayload(val, sizingData.misc_properties.orifice_area, sizingData, uomResults)
}

const Required_Area__Liquid_1_AreqL1 = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("modeldata_liquid.Areq", sizingData);

    return genResPayload(val, sizingData.misc_properties.orifice_area, sizingData, uomResults)
}

const Required_Area__Liquid_2_AreqL2 = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("modeldata_liquid2.Areq", sizingData);

    return genResPayload(val, sizingData.misc_properties.orifice_area, sizingData, uomResults)
}

const Required_Gas_Flow_Wg = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("gas_flow", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Required_Gas_Vapor_Flow_Wv = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("req_pressure_flow", sizingData);

    return genResPayload(val, sizingData.req_pressure_flow_uom, sizingData, uomResults)
}

const Required_Liquid_Flow_VL = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("req_pressure_flow", sizingData);

    return genResPayload(val, sizingData.req_pressure_flow_uom, sizingData, uomResults)
}

const Required_Liquid_Flow_Wl = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("liquid_flow", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Required_Mass_Flow__Gas_W_V = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("gas_flow", sizingData);

    return genResPayload(val, sizingData.req_pressure_flow_uom, sizingData, uomResults)
}

const Required_Mass_Flow__Liquid_1_VLL1 = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("liquid_flow", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Required_Mass_Flow__Liquid_2_VLL2 = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("liquid_two_flow", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Required_Mass_Flow_Qreq = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("req_pressure_flow", sizingData);

    return genResPayload(val, sizingData.req_pressure_flow_uom, sizingData, uomResults)
}

const Required_Mass_Flow_Vacuum_Wreq = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("req_pressure_flow", sizingData);

    return genResPayload(val, sizingData.req_pressure_flow_uom, sizingData, uomResults)
}

const Required_Mass_Flow_Wreq = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("req_pressure_flow", sizingData);

    return genResPayload(val, sizingData.req_pressure_flow_uom, sizingData, uomResults)
}

const Required_Vapor_Flow_Wv = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("vapor_flow", sizingData);

    return genResPayload(val, sizingData.req_pressure_flow_uom, sizingData, uomResults)
}

const Required_Volumetric_Flow_Vacuum_Vreq = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("vaccum_flow", sizingData);

    return genResPayload(val, sizingData.req_pressure_flow_uom, sizingData, uomResults)
}

const Required_Volumetric_Flow_VLreq = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("req_pressure_flow", sizingData);

    return genResPayload(val, sizingData.req_pressure_flow_uom, sizingData, uomResults)
}

const Required_Volumetric_Flow_Vreq = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("req_pressure_flow", sizingData);

    return genResPayload(val, sizingData.req_pressure_flow_uom, sizingData, uomResults)
}

const Rupture_Disc_CCF_Fd = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("fd", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Rupture_Disc_CCF_Kc = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("kc", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Saturation_Pressure_Ps = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("vapor_saturation_pressure", sizingData);

    return genResPayload(val, sizingData.atm_pressure_uom, sizingData, uomResults)
}

const Sautation_Pressure_of_Vapor_Pv1 = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("vapor_pressure", sizingData);

    return genResPayload(val, sizingData.atm_pressure_uom, sizingData, uomResults)
}

const Set_Pressure_Pset = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("set_pressure", sizingData);

    return genResPayload(val, sizingData.pressure_uom, sizingData, uomResults)
}

const Set_Pressure_Vacuum_Vset = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("set_vaccum", sizingData);

    return genResPayload(val, sizingData.vaccum_uom, sizingData, uomResults)
}

const Shape_Factor_E = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("e", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Shape_Factor_Vacuum_E = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("eV", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Specific_Gravity_SG = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("sp_gravity_p", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Specific_Volume_at_90Per_Inlet_v9 = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("sp_volume_sat", sizingData);

    return genResPayload(val, sizingData.sp_volume_uom, sizingData, uomResults)
}

const Specific_Volume_v1 = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("convertedValues.v0Input", sizingData);
return genResPayload(val, sizingData.convertedValues.voInputUOM, sizingData, uomResults)
}

const Steam_Pressure_Coefficient_Ks = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("calc_result.Ks", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Supercritical_Correction_Factor_ks = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("calc_result.ksc", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Superheat_Correction_Factor_Ksh = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("calc_result.K_sh", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Tank_Pressure_Ptank = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("vessel_press", sizingData);

    return genResPayload(val, sizingData.pressure_uom, sizingData, uomResults)
}

const Tank_Vacuum_Vacuum_Vtank = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("vessel_vaccum", sizingData);

    return genResPayload(val, sizingData.vaccum_uom, sizingData, uomResults)
}

const Total_Required_Flow_Wreq = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("req_pressure_flow", sizingData);

    return genResPayload(val, sizingData.req_pressure_flow_uom, sizingData, uomResults)
}

const Transition_to_Full_Open_Tp = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("tp", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Transition_to_Full_Open_Vacuum_Tp = (sizingData, uomResults, templateId) => {
    let val = getRoundedReportsVal("tpV", sizingData);

    if(val){
        const convertVal = convertUOM(val, sizingData.calc_method === "English" ? "pressure.psig" : "pressure.barg", sizingData.vaccum_uom, uomResults);

        val = convertVal.value
    }

    return genResPayload(val, sizingData.vaccum_uom, sizingData, uomResults)
}

const Vapor_Density_at_Outlet_rhog2 = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("<<missing>>", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Vapor_Sp_Vol_at_Inlet_vv1 = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("gas_specific_volume", sizingData);

    return genResPayload(val, sizingData.sp_volume_uom, sizingData, uomResults)
}

const Vapor_Specific_Volume_at_Inlet_vv1 = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("gas_specific_volume", sizingData);

    return genResPayload(val, sizingData.sp_volume_uom, sizingData, uomResults)
}

const Variable_Superimposed_BP_Psiv = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("var_supimp_bk_pressure", sizingData);

    return genResPayload(val, sizingData.pressure_uom, sizingData, uomResults)
}

const Viscosity_Correction_Factor_Kv = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("kv", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Viscosity_Correction_Max_Flow_Kv_m = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("kmaxV", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Viscosity_Correction_Max_Flow_Kvmax = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("kv", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Viscosity_Correction_Rqd_Flow_Kv = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("kv", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Viscosity_Correction_Rqd_Flow_Kv_req = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("kv", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Viscosity_Mu = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("viscosity_cp", sizingData);

    return genResPayload(val, sizingData.viscosity_uom, sizingData, uomResults)
}

const Viscosity_visc = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("viscosity_cp", sizingData);

    return genResPayload(val, sizingData.viscosity_uom, sizingData, uomResults)
}

// Liquid 2
const Specific_Gravity_SG_Liq2 = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("sp_gravity_2", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Viscosity_visc_Liq2 = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("viscosity_2", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Required_Volumetric_Flow_VLreq_Liq2 = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("req_pressure_flow", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Required_Mass_Flow_Wreq_Liq2 = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("req_pressure_flow", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Discharge_Coefficient_acutal_Kd_Liq2 = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("modeldata_liquid2.Kd", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Discharge_Coefficient_API_KAPI_Liq2 = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("modeldata_liquid2.KAPI", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Discharge_Coefficient_derated_K_Liq2 = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("modeldata_liquid2.K", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Orifice_Area_A_Liq2 = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("modeldata_liquid2.A", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Orifice_Area_AAPI_Liq2 = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("modeldata_liquid2.AAPI", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Back_Press_Correction_Factor_Kbv = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("kb", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Back_Press_Correction_Factor_Kw_Liq2 = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("modeldata_liquid2.Kb", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Viscosity_Correction_Rqd_Flow_Kv_Liq2 = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("modeldata_liquid2.Kv", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Viscosity_Correction_Max_Flow_Kvmax_Liq2 = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("modeldata_liquid2.Kmax", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}
const gas_Outlet_Density = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("gasOutletDensity", sizingData);

    return genResPayload(val, sizingData.gasOutletDensity_uom ? sizingData.gasOutletDensity_uom : "density.lbft3", sizingData, uomResults)
}
const outlet_Gas_Mass_Fraction = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("outletGasMassFraction", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const liquid_Outlet_Density = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("liquidOutletDensity", sizingData);

    return genResPayload(val, sizingData.liquidOutletDensity_uom ? sizingData.liquidOutletDensity_uom : "density.lbft3", sizingData, uomResults)
}

module.exports = {
    TwoPhase_Discharge_Coefficient_K2φ, Atmospheric_Pressure_Patm, Atmospheric_Pressure_Vacuum_Patm, Back_Press_Correction_Factor_Kb, Back_Press_Correction_Factor_Kb_ISO, Back_Press_Correction_Factor_Kw, Back_Press_Correction_Factor_Vacuum_Kb, Back_Pressure_Pback, Compressibility_Vacuum_Z, Compressibility_Z, Constant_Superimposed_BP_Psic, Differential_Pressure_dp, Differential_Pressure_Vacuum_dp, Discharge_Coefficient_acutal_Kd, Discharge_Coefficient_acutal_Vacuum_Kd, Discharge_Coefficient_API_KAPI, Discharge_Coefficient_derated_K, Discharge_Coefficient_derated_Kdr, Distance_from_Valve_noise_r, Dryness_Correction_Factor_xs, Gas_Back_Press_Corr_Factor_Kb, Gas_Discharge_Coefficient_KG, Gas_Partial_Pressure_Pg1, Gas_Vapor_Density_at_Outlet_rhog2, Gas_Vapor_Sp_Vol_at_Inlet_vv1, Gas_Vapor_Sp_Vol_at_Inlet_vvg1, Gas_Vapor_Specific_Volume_at_Ps_vvs, Inlet_Line_Loss_Ploss, Inlet_Stagnation_Enthalpy_ho, Isentropic_Expansion_Coeff_k, K_vs_PR_Intercept_b, K_vs_PR_Intercept_Vacuum_b, K_vs_PR_Slope_m, K_vs_PR_Slope_Vacuum_m, Liquid_Back_Press_Corr_Factor_Kw, Liquid_Density_at_Inlet_rhol1, Liquid_Density_at_Inlet_ρl1, Liquid_Density_at_Outlet_rhol2, Liquid_Discharge_Coefficient_KL, Liquid_Latent_Heat_at_Inlet_hvl1, Liquid_Latent_Heat_at_Ps_hvls, Liquid_Sp_Vol_at_Inlet_vl1, Liquid_Specific_Heat_at_Inlet_Cp, Liquid_Specific_Volume_at_Inlet_vl1, Liquid_Specific_Volume_at_Ps_vls, Mass_Flux_G, Maximum_Flow_Coefficient_Kmax, Maximum_Flow_Coefficient_Vacuum_Kmax, Mixture_Density_at_90Per_Ps_rho9, Molecular_Mass_M, Molecular_Weight_M, Molecular_Weight_Vacuum_M, Orifice_Area_A, Orifice_Area_AAPI, Orifice_Area_Vacuum_A, Outlet_Diameter_Do, Outlet_Diameter_Vacuum_Do, Outlet_Gas_Mass_Fraction_x2, Outlet_Velocity_u, Over_Pressure_Pover, Over_Pressure_Vacuum_Vover, Ratio_of_Specific_Heats_k, Ratio_of_Specific_Heats_Vacuum_k, Relieving_Temperature_T, Relieving_Temperature_Vacuum_T, Required_Area__Gas_AreqG, Required_Area__Liquid_1_AreqL1, Required_Area__Liquid_2_AreqL2, Required_Gas_Flow_Wg, Required_Gas_Vapor_Flow_Wv, Required_Liquid_Flow_VL, Required_Liquid_Flow_Wl, Required_Mass_Flow__Gas_W_V, Required_Mass_Flow__Liquid_1_VLL1, Required_Mass_Flow__Liquid_2_VLL2, Required_Mass_Flow_Qreq, Required_Mass_Flow_Vacuum_Wreq, Required_Mass_Flow_Wreq, Required_Vapor_Flow_Wv, Required_Volumetric_Flow_Vacuum_Vreq, Required_Volumetric_Flow_VLreq, Required_Volumetric_Flow_Vreq, Rupture_Disc_CCF_Fd, Rupture_Disc_CCF_Kc, Saturation_Pressure_Ps, Sautation_Pressure_of_Vapor_Pv1, Set_Pressure_Pset, Set_Pressure_Vacuum_Vset, Shape_Factor_E, Shape_Factor_Vacuum_E, Specific_Gravity_SG, Specific_Volume_at_90Per_Inlet_v9, Specific_Volume_v1, Steam_Pressure_Coefficient_Ks, Supercritical_Correction_Factor_ks, Superheat_Correction_Factor_Ksh, Tank_Pressure_Ptank, Tank_Vacuum_Vacuum_Vtank, Total_Required_Flow_Wreq, Transition_to_Full_Open_Tp, Transition_to_Full_Open_Vacuum_Tp, Vapor_Density_at_Outlet_rhog2, Vapor_Sp_Vol_at_Inlet_vv1, Vapor_Specific_Volume_at_Inlet_vv1, Variable_Superimposed_BP_Psiv, Viscosity_Correction_Factor_Kv, Viscosity_Correction_Max_Flow_Kv_m, Viscosity_Correction_Max_Flow_Kvmax, Viscosity_Correction_Rqd_Flow_Kv, Viscosity_Correction_Rqd_Flow_Kv_req, Viscosity_Mu, Viscosity_visc, Specific_Gravity_SG_Liq2,Viscosity_visc_Liq2,Required_Volumetric_Flow_VLreq_Liq2,Required_Mass_Flow_Wreq_Liq2,Discharge_Coefficient_acutal_Kd_Liq2,Discharge_Coefficient_API_KAPI_Liq2,Discharge_Coefficient_derated_K_Liq2,Orifice_Area_A_Liq2,Orifice_Area_AAPI_Liq2,Back_Press_Correction_Factor_Kbv,Back_Press_Correction_Factor_Kw_Liq2,Viscosity_Correction_Rqd_Flow_Kv_Liq2,Viscosity_Correction_Max_Flow_Kvmax_Liq2,gas_Outlet_Density,outlet_Gas_Mass_Fraction,liquid_Outlet_Density
}