const { get_design_code, get_sizing_std } = require("../reportsDataMapper/commonMethodsReports");
const { getRoundedReportsVal, getReportsVal, genResPayload } = require("../reportsDataMapper/dataMapperCommonMethods");

const Tag_Number = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("tag_num", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Tag_Service = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("service", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const PID_No = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("p_id", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Line_No = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("lineNumber", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Equipment_No = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("<<SAP>>", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Quantity = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("quantity", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Design_Code = (sizingData, uomResults, templateId) => {
    const val = get_design_code(sizingData["code"])

    return genResPayload(val, null, sizingData, uomResults)
}

const Sizing_Basis = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("sizing_basis", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Sizing_Std = (sizingData, uomResults, templateId) => {
    const val = get_sizing_std(sizingData["code"])

    return genResPayload(val, null, sizingData, uomResults)
}

const Valve_Model_Number = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("model", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Manufacturer = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("<<SAP>>", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Required_Area = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("areq", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Selected_Area = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("a", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const K_A_Dataset = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("ka_dataset", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Size_Orifice = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("size_orifice", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Reaction_Force = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("calc_result.F_R", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Noise_Level_Open_Discharge = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("calc_result.L_{100}", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Distance_From_Valve_At = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("distanceFromValve", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Tag_Notes = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("tag_notes.tagNote", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const System_MAWP = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("sys_mawp", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const System_MAWV = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("sys_mawv", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Operating_Pn = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("opr_pressure", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Set_Pressure_Pset = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("set_pressure", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Set_Pressure_Vacuum_Vset = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("set_vaccum", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Over_Pressure_Pover = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("over_pressure", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const CDTP = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("<<missing CDTP>>", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Back_Pressure_Built_Up_Pbu = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("builtUp_bk_pressure", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Constant_Superimposed_BP_Psic = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("const_supimp_bk_pressure", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Variable_Superimposed_BP_Psiv = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("var_supimp_bk_pressure", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Back_Pressure_Pback = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("total_bk_pressure", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Inlet_Line_Loss_Ploss = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("inlet_pressure", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Atmospheric_Pressure_Patm = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("atm_pressure", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Inlet_Loss_Ploss_Per = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("inlet_pres_loss", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Operating_Temperatures_Tn = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("opr_temp", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Design_Min_Temperatures_TDMin = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("designMin_temp", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Normal_System_Temperatures_TNS = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("NormalSys_temp", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Relieving_Temperature_T = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("relieve_temp (duplicate)", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Relieving_Temperature_Vacuum_T = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("relieve_temp_v", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Design_Max_Temperatures_TDMax = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("designMax_temp", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Inlet_Relieving_Pressure_P1 = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("<<missing>>", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Over_Pressure_Vacuum_Vover = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("under_press_v", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Inlet_Relieving_Pressure_P1_Vacuum = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("<<missing>>", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Required_Area_Vacuum = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("areq", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Selected_Area_Vacuum = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("aV", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Required_Flow = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("req_pressure_flow", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Rated_Flow = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("vrtd", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Actual_Flow = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("wact", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Maximum_Flow = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("VmaxP", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Nameplate_Flow = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("<<missing NP>>", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Nameplate_Flow_Criteria = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("<<missing NP>>", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Saturated_Flow = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("<<missing>>", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Superheated_Flow = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("<<missing>>", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Required_Flow_Vacuum = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("required_flow_vacuum", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Maximum_Flow_Vacuum = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("VmaxV", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Nameplate_Flow_Vacuum = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("<<missing NP>>", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Nameplate_Flow_Criteria_Vacuum = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("<<missing NP>>", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Fluid_State_at_Inlet = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("service_type", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Relieving_Case_Product_Type = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("product_type", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Total_Selected_Flow = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("<<missing>>", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Total_Selected_Flow_Vacuum = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("<<missing>>", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Fluid_Name = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("fluid_name", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Molecular_Weight_M = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("mol_wt_p", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Compressibility_Z = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("compressibility_p", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Ratio_of_Specific_Heats_k = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("ratio_SpHeat_k_p", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Subsonic_Flow_Factor_Fs = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("calc_result.FS", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Fluid_Name_Vacuum = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("fluid_name_v", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Molecular_Weight_Vacuum_M = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("mol_wt_v", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Compressibility_Vacuum_Z = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("compressibility_v", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Ratio_of_Specific_Heats_Vacuum_k = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("ratio_SpHeat_k_v", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Subsonic_Flow_Factor_Fs_Vacuum = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("<<missing>>", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Differential_Pressure_dp = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("delta_press", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Discharge_Coefficient_acutal_Kd = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("kd", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Differential_Pressure_Vacuum_dp = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("delta_vaccum", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Discharge_Coefficient_acutal_Vacuum_Kd = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("kd", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Vessel_Pressure_deltaP = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("delta_press", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Vessel_Vacuum_deltaP = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("delta_vaccum", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Over_Pressure_Pover_Per = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("over_pressure_per", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Over_Pressure_Vacuum_Vover_Per = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("under_press_v_per", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Gas_Constant_C = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("calc_result.C", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Specific_Gravity_SG = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("sp_gravity_p", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Viscosity_Mu = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("viscosity_cp", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Reynolds_Number_R = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("r", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Reynolds_Number_Rmax = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("rmax", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Fluid_Name_Steam = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Saturation_Temperature_Tsat = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("Missing", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Fluid_Name_Gas_Vapor = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("??", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Fluid_Name_L1 = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("liquid_1_fluid_name", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Viscosity_visc_Liq1 = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("Missing", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Specific_Gravity_SG_Liq1 = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("Missing", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Reynolds_Number_R_Liq1 = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Reynolds_Number_Rmax_Liq1 = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Fluid_Name_L2 = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("liquid_2_fluid_name", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Viscosity_visc_Liq2 = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("viscosity_2", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Specific_Gravity_SG_Liq2 = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("sp_gravity_2", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Reynolds_Number_R_Liq2 = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("Missing", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Reynolds_Number_Rmax_Liq2 = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("missing", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Vapor_Specific_Volume_at_Inlet_vv1 = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Liquid_Specific_Volume_at_Inlet_vl1 = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Liquid_Latent_Heat_at_Inlet_hvl1 = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Liquid_Specific_Heat_at_Inlet_Cp = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Specific_Volume_at_90Per_Inlet_v9 = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Thermodynamic_Critical_Temp_Tcrit = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("critTemp", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Thermodynamic_Critical_Press_Pcrit = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Specific_Volume_v1 = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Gas_Vapor_Sp_Vol_at_Inlet_vvg1 = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("gas_specific_volume", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Liquid_Density_at_Inlet_rhol1 = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("liquid_density_inlet", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Saturation_Pressure_Ps = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Gas_Vapor_Specific_Volume_at_Ps_vvs = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("saturated_vapor_Sp_Vol", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Liquid_Specific_Volume_at_Ps_vls = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Mixture_Density_at_90Per_Ps_rho9 = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("mix_density_sat", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Liquid_Latent_Heat_at_Ps_hvls = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Sautation_Pressure_of_Vapor_Pv1 = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("vap_Sat_Pressure", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Gas_Partial_Pressure_Pg1 = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("gas_partial_pressure", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Fluid_Name_Saturated_Water = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Mass_Flux_G = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("mass_flux", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Isentropic_Expansion_Coeff_k = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("isentropic_exp", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Outlet_Velocity_u = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("velocity", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Steam_Condition_Stm_Condition = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Dryness_Correction_Factor_xs = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("steam_dry_factor", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Liquid_Sp_Vol_at_Inlet_vl1 = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("liquid_specific_volume", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Sizing_Coefficients_K_Gas = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("k", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Sizing_Coefficients_Kb = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("kb", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Sizing_Coefficients_Effective_K_Gas_API = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("kapi", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Sizing_Coefficients_K_Liquid = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("k", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Sizing_Coefficients_Kw_Kw = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("missing", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Sizing_Coefficients_Kv = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("kv", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Sizing_Coefficients_Effective_K_Liquid_API = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("kapi", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Sizing_Coefficients_K_Steam = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("k", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Sizing_Coefficients_Kn = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("calc_result.kn", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Sizing_Coefficients_Ksc = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("calc_result.ksc", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Sizing_Coefficients_Effective_K_Steam_API = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("kapi", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Sizing_Coefficients_Kv_Liquid_1 = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("modeldata_liquid.Kv", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Sizing_Coefficients_Kv_max_Liq_1 = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("modeldata_liquid.Kmax", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Sizing_Coefficients_Kc_Kc = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("kc", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Sizing_Coefficients_Effective_K_2Phase_API = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Sizing_Coefficients_Kdr = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("kdr", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Sizing_Coefficients_Fd = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Sizing_Coefficients_Ks = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("calc_result.ks", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Sizing_Coefficients_Kdr2ph_K2phi = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Sizing_Coefficients_Kdrl = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("kdr", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Sizing_Coefficients_Kdrg = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("kdr", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Sizing_Coefficients_Fd_Kc = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("kc", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Sizing_Coefficients_Kd_Gas = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("kd", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Sizing_Coefficients_Kd_Liquid = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("kd", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Sizing_Coefficients_Kv_max = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("kmax", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Sizing_Coefficients_Kd_Steam = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("kd", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Sizing_Coefficients_Ksh = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("calc_results.K_sh", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Sizing_Coefficients_Kv_Liquid_2 = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("modeldata_liquid2.Kv", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Sizing_Coefficients_Kv_max_Liq_2 = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("modeldata_liquid2.Kmax", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Sizing_Coefficients_Kb_ISO = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Required_Capacity_Gas_Vapor_W = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Required_Capacity_Vapor_W = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Required_Capacity_Liquid_W = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Required_Capacity_Liquid_1_W = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Required_Capacity_Liquid_2_W = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Required_Capacity_Total_Required_Flow = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Required_Capacity_Total_Wreq = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Required_Capacity_Total_Qreq = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Single_or_Multi_Component_System = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("comp_system", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const System_far_from_thermodynamic_critical_point = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("isFarFromCritPt", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Nominal_boiling_range_less_than_150DegF = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Mixture_contains_less_than_point1per_wt_Hydrogen = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Is_Set_Pressure_is_greater_than_point5_barg = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Is_Rel_Temp_To_Lessthan_Equal_90per_of_Tcrit = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Is_Rel_Pressure_Po_Lessthan_50per_of_Pcrit = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Is_Condensation_Possible = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Vacuum_K_Gas = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("vaccum_k", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Pressure_PReqFlow = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Vacuum_VReqFlow = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Is_C_OR_Fs_Pressure_Lable = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Is_C_OR_Fs_Pressure_Value = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Is_C_OR_Fs_Vacuum_Lable = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Is_C_OR_Fs_Vacuum_Value = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

module.exports = {
    Tag_Number, Tag_Service, PID_No, Line_No, Equipment_No, Quantity, Design_Code, Sizing_Basis, Sizing_Std, Valve_Model_Number, Manufacturer, Required_Area, Selected_Area, K_A_Dataset, Size_Orifice, Reaction_Force, Noise_Level_Open_Discharge, Distance_From_Valve_At, Tag_Notes, System_MAWP, System_MAWV, Operating_Pn, Set_Pressure_Pset, Set_Pressure_Vacuum_Vset, Over_Pressure_Pover, CDTP, Back_Pressure_Built_Up_Pbu, Constant_Superimposed_BP_Psic, Variable_Superimposed_BP_Psiv, Back_Pressure_Pback, Inlet_Line_Loss_Ploss, Atmospheric_Pressure_Patm, Inlet_Loss_Ploss_Per, Operating_Temperatures_Tn, Design_Min_Temperatures_TDMin, Normal_System_Temperatures_TNS, Relieving_Temperature_T, Relieving_Temperature_Vacuum_T, Design_Max_Temperatures_TDMax, Inlet_Relieving_Pressure_P1, Over_Pressure_Vacuum_Vover, Inlet_Relieving_Pressure_P1_Vacuum, Required_Area_Vacuum, Selected_Area_Vacuum, Required_Flow, Rated_Flow, Actual_Flow, Maximum_Flow, Nameplate_Flow, Nameplate_Flow_Criteria, Saturated_Flow, Superheated_Flow, Required_Flow_Vacuum, Maximum_Flow_Vacuum, Nameplate_Flow_Vacuum, Nameplate_Flow_Criteria_Vacuum, Fluid_State_at_Inlet, Relieving_Case_Product_Type, Total_Selected_Flow, Total_Selected_Flow_Vacuum, Fluid_Name, Molecular_Weight_M, Compressibility_Z, Ratio_of_Specific_Heats_k, Subsonic_Flow_Factor_Fs, Fluid_Name_Vacuum, Molecular_Weight_Vacuum_M, Compressibility_Vacuum_Z, Ratio_of_Specific_Heats_Vacuum_k, Subsonic_Flow_Factor_Fs_Vacuum, Differential_Pressure_dp, Discharge_Coefficient_acutal_Kd, Differential_Pressure_Vacuum_dp, Discharge_Coefficient_acutal_Vacuum_Kd, Vessel_Pressure_deltaP, Vessel_Vacuum_deltaP, Over_Pressure_Pover_Per, Over_Pressure_Vacuum_Vover_Per, Gas_Constant_C, Specific_Gravity_SG, Viscosity_Mu, Reynolds_Number_R, Reynolds_Number_Rmax, Fluid_Name_Steam, Saturation_Temperature_Tsat, Fluid_Name_Gas_Vapor, Fluid_Name_L1, Viscosity_visc_Liq1, Specific_Gravity_SG_Liq1, Reynolds_Number_R_Liq1, Reynolds_Number_Rmax_Liq1, Fluid_Name_L2, Viscosity_visc_Liq2, Specific_Gravity_SG_Liq2, Reynolds_Number_R_Liq2, Reynolds_Number_Rmax_Liq2, Vapor_Specific_Volume_at_Inlet_vv1, Liquid_Specific_Volume_at_Inlet_vl1, Liquid_Latent_Heat_at_Inlet_hvl1, Liquid_Specific_Heat_at_Inlet_Cp, Specific_Volume_at_90Per_Inlet_v9, Thermodynamic_Critical_Temp_Tcrit, Thermodynamic_Critical_Press_Pcrit, Specific_Volume_v1, Gas_Vapor_Sp_Vol_at_Inlet_vvg1, Liquid_Density_at_Inlet_rhol1, Saturation_Pressure_Ps, Gas_Vapor_Specific_Volume_at_Ps_vvs, Liquid_Specific_Volume_at_Ps_vls, Mixture_Density_at_90Per_Ps_rho9, Liquid_Latent_Heat_at_Ps_hvls, Sautation_Pressure_of_Vapor_Pv1, Gas_Partial_Pressure_Pg1, Fluid_Name_Saturated_Water, Mass_Flux_G, Isentropic_Expansion_Coeff_k, Outlet_Velocity_u, Steam_Condition_Stm_Condition, Dryness_Correction_Factor_xs, Liquid_Sp_Vol_at_Inlet_vl1, Sizing_Coefficients_K_Gas, Sizing_Coefficients_Kb, Sizing_Coefficients_Effective_K_Gas_API, Sizing_Coefficients_K_Liquid, Sizing_Coefficients_Kw_Kw, Sizing_Coefficients_Kv, Sizing_Coefficients_Effective_K_Liquid_API, Sizing_Coefficients_K_Steam, Sizing_Coefficients_Kn, Sizing_Coefficients_Ksc, Sizing_Coefficients_Effective_K_Steam_API, Sizing_Coefficients_Kv_Liquid_1, Sizing_Coefficients_Kv_max_Liq_1, Sizing_Coefficients_Kc_Kc, Sizing_Coefficients_Effective_K_2Phase_API, Sizing_Coefficients_Kdr, Sizing_Coefficients_Fd, Sizing_Coefficients_Ks, Sizing_Coefficients_Kdr2ph_K2phi, Sizing_Coefficients_Kdrl, Sizing_Coefficients_Kdrg, Sizing_Coefficients_Fd_Kc, Sizing_Coefficients_Kd_Gas, Sizing_Coefficients_Kd_Liquid, Sizing_Coefficients_Kv_max, Sizing_Coefficients_Kd_Steam, Sizing_Coefficients_Ksh, Sizing_Coefficients_Kv_Liquid_2, Sizing_Coefficients_Kv_max_Liq_2, Sizing_Coefficients_Kb_ISO, Required_Capacity_Gas_Vapor_W, Required_Capacity_Vapor_W, Required_Capacity_Liquid_W, Required_Capacity_Liquid_1_W, Required_Capacity_Liquid_2_W, Required_Capacity_Total_Required_Flow, Required_Capacity_Total_Wreq, Required_Capacity_Total_Qreq, Single_or_Multi_Component_System, System_far_from_thermodynamic_critical_point, Nominal_boiling_range_less_than_150DegF, Mixture_contains_less_than_point1per_wt_Hydrogen, Is_Set_Pressure_is_greater_than_point5_barg, Is_Rel_Temp_To_Lessthan_Equal_90per_of_Tcrit, Is_Rel_Pressure_Po_Lessthan_50per_of_Pcrit, Is_Condensation_Possible, Vacuum_K_Gas, Pressure_PReqFlow, Vacuum_VReqFlow, Is_C_OR_Fs_Pressure_Lable, Is_C_OR_Fs_Pressure_Value, Is_C_OR_Fs_Vacuum_Lable, Is_C_OR_Fs_Vacuum_Value
}