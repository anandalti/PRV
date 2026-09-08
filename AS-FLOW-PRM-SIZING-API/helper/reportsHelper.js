const {
  headerFunc,
  footerFunc,
  subSummaryFunc,
  subInputFunc,
  subEquationFunc,
  sizingDataFunc,
  tagInfoFunc,
  valveSizingInformationFunc,
  specificTankDataFunc,
  valveSummaryFunc,
  valveDimensionsFunc,
  notesFunc
} = require("./reportsDataMapper");

const HeaderMapping = {
  ReportGeneratedDate: (sizingData, uomResults, templateId) => {
    return headerFunc.ReportGeneratedDate(sizingData, uomResults, templateId);
  },
  ReportTitle: (sizingData, uomResults, templateId) => {
    return headerFunc.ReportTitle(sizingData, uomResults, templateId);
  },
  CompanyName: (sizingData, uomResults, templateId) => {
    return headerFunc.CompanyName(sizingData, uomResults, templateId);
  },
  Address: (sizingData, uomResults, templateId) => {
    return headerFunc.Address(sizingData, uomResults, templateId);
  },
  City_State_Zip_Country: (sizingData, uomResults, templateId) => {
    return headerFunc.City_State_Zip_Country(
      sizingData,
      uomResults,
      templateId
    );
  },
  Phone: (sizingData, uomResults, templateId) => {
    return headerFunc.Phone(sizingData, uomResults, templateId);
  },
  Fax: (sizingData, uomResults, templateId) => {
    return headerFunc.Fax(sizingData, uomResults, templateId);
  },
  Email_Website: (sizingData, uomResults, templateId) => {
    return headerFunc.Email_Website(sizingData, uomResults, templateId);
  },
  Our_Reference_Number: (sizingData, uomResults, templateId) => {
    return headerFunc.Our_Reference_Number(sizingData, uomResults, templateId);
  },
  Client: (sizingData, uomResults, templateId) => {
    return headerFunc.Client(sizingData, uomResults, templateId);
  },
  Multiple_Valve_Application: (sizingData, uomResults, templateId) => {
    return headerFunc.Multiple_Valve_Application(
      sizingData,
      uomResults,
      templateId
    );
  },
  Location: (sizingData, uomResults, templateId) => {
    return headerFunc.Location(sizingData, uomResults, templateId);
  },
  End_User_Ref_Number: (sizingData, uomResults, templateId) => {
    return headerFunc.End_User_Ref_Number(sizingData, uomResults, templateId);
  },
  Project: (sizingData, uomResults, templateId) => {
    return headerFunc.Project(sizingData, uomResults, templateId);
  },
  Project_Ref_Number: (sizingData, uomResults, templateId) => {
    return headerFunc.Project_Ref_Number(sizingData, uomResults, templateId);
  },
};

const SubSummaryMapping = {
  Tag_Number: (sizingData, uomResults, templateId) => {
    return subSummaryFunc.Tag_Number(sizingData, uomResults, templateId);
  },
  Tag_Notes: (sizingData, uomResults, templateId) => {
    return subSummaryFunc.Tag_Notes(sizingData, uomResults, templateId);
  },
  Valve_Model_Number: (sizingData, uomResults, templateId) => {
    return subSummaryFunc.Valve_Model_Number(
      sizingData,
      uomResults,
      templateId
    );
  },
  Quantity: (sizingData, uomResults, templateId, sapData) => {
    return subSummaryFunc.Quantity(sizingData, uomResults, templateId, sapData);
  },
  Required_Flow: (sizingData, uomResults, templateId) => {
    return subSummaryFunc.Required_Flow(sizingData, uomResults, templateId);
  },
  Rated_Flow: (sizingData, uomResults, templateId) => {
    return subSummaryFunc.Rated_Flow(sizingData, uomResults, templateId);
  },
  Design_Code: (sizingData, uomResults, templateId) => {
    return subSummaryFunc.Design_Code(sizingData, uomResults, templateId);
  },
  Sizing_Std: (sizingData, uomResults, templateId) => {
    return subSummaryFunc.Sizing_Std(sizingData, uomResults, templateId);
  },
  Fluid_State_at_Inlet: (sizingData, uomResults, templateId) => {
    return subSummaryFunc.Fluid_State_at_Inlet(
      sizingData,
      uomResults,
      templateId
    );
  },
  Required_Area: (sizingData, uomResults, templateId) => {
    return subSummaryFunc.Required_Area(sizingData, uomResults, templateId);
  },
  Selected_Area: (sizingData, uomResults, templateId) => {
    return subSummaryFunc.Selected_Area(sizingData, uomResults, templateId);
  },
  Reaction_Force: (sizingData, uomResults, templateId) => {
    return subSummaryFunc.Reaction_Force(sizingData, uomResults, templateId);
  },
  Noise_Level_Open_Discharge: (sizingData, uomResults, templateId) => {
    return subSummaryFunc.Noise_Level_Open_Discharge(
      sizingData,
      uomResults,
      templateId
    );
  },
  Flow_Rated_Acutal_Maximum_Text: (sizingData, uomResults, templateId) => {
    return subSummaryFunc.Flow_Rated_Acutal_Maximum_Text(
      sizingData,
      uomResults,
      templateId
    );
  },
  Distance_From_Valve_At: (sizingData, uomResults, templateId) => {
    return subSummaryFunc.Distance_From_Valve_At(
      sizingData,
      uomResults,
      templateId
    );
  },
  Liquid1Or2: (sizingData, uomResults, templateId) => {
    return subSummaryFunc.Liquid1Or2(sizingData, uomResults, templateId);
  },
};

const SubInputMapping = {
  "2Phase_Discharge_Coefficient_K2φ": (sizingData, uomResults, templateId) => {
    return subInputFunc.TwoPhase_Discharge_Coefficient_K2φ(
      sizingData,
      uomResults,
      templateId
    );
  },
  Atmospheric_Pressure_Patm: (sizingData, uomResults, templateId) => {
    return subInputFunc.Atmospheric_Pressure_Patm(
      sizingData,
      uomResults,
      templateId
    );
  },
  Atmospheric_Pressure_Vacuum_Patm: (sizingData, uomResults, templateId) => {
    return subInputFunc.Atmospheric_Pressure_Vacuum_Patm(
      sizingData,
      uomResults,
      templateId
    );
  },
  Back_Press_Correction_Factor_Kbv: (sizingData, uomResults, templateId) => {
    return subInputFunc.Back_Press_Correction_Factor_Kbv(
      sizingData,
      uomResults,
      templateId
    );
  },
  Back_Press_Correction_Factor_Kb: (sizingData, uomResults, templateId) => {
    return subInputFunc.Back_Press_Correction_Factor_Kb(
      sizingData,
      uomResults,
      templateId
    );
  },
  Back_Press_Correction_Factor_Kb_ISO: (sizingData, uomResults, templateId) => {
    return subInputFunc.Back_Press_Correction_Factor_Kb_ISO(
      sizingData,
      uomResults,
      templateId
    );
  },
  Back_Press_Correction_Factor_Kw: (sizingData, uomResults, templateId) => {
    return subInputFunc.Back_Press_Correction_Factor_Kw(
      sizingData,
      uomResults,
      templateId
    );
  },
  Back_Press_Correction_Factor_Vacuum_Kb: (
    sizingData,
    uomResults,
    templateId
  ) => {
    return subInputFunc.Back_Press_Correction_Factor_Vacuum_Kb(
      sizingData,
      uomResults,
      templateId
    );
  },
  Back_Pressure_Pback: (sizingData, uomResults, templateId) => {
    return subInputFunc.Back_Pressure_Pback(sizingData, uomResults, templateId);
  },
  Compressibility_Vacuum_Z: (sizingData, uomResults, templateId) => {
    return subInputFunc.Compressibility_Vacuum_Z(
      sizingData,
      uomResults,
      templateId
    );
  },
  Compressibility_Z: (sizingData, uomResults, templateId) => {
    return subInputFunc.Compressibility_Z(sizingData, uomResults, templateId);
  },
  Constant_Superimposed_BP_Psic: (sizingData, uomResults, templateId) => {
    return subInputFunc.Constant_Superimposed_BP_Psic(
      sizingData,
      uomResults,
      templateId
    );
  },
  Differential_Pressure_dp: (sizingData, uomResults, templateId) => {
    return subInputFunc.Differential_Pressure_dp(
      sizingData,
      uomResults,
      templateId
    );
  },
  Differential_Pressure_Vacuum_dp: (sizingData, uomResults, templateId) => {
    return subInputFunc.Differential_Pressure_Vacuum_dp(
      sizingData,
      uomResults,
      templateId
    );
  },
  Discharge_Coefficient_acutal_Kd: (sizingData, uomResults, templateId) => {
    return subInputFunc.Discharge_Coefficient_acutal_Kd(
      sizingData,
      uomResults,
      templateId
    );
  },
  Discharge_Coefficient_acutal_Vacuum_Kd: (
    sizingData,
    uomResults,
    templateId
  ) => {
    return subInputFunc.Discharge_Coefficient_acutal_Vacuum_Kd(
      sizingData,
      uomResults,
      templateId
    );
  },
  Discharge_Coefficient_API_KAPI: (sizingData, uomResults, templateId) => {
    return subInputFunc.Discharge_Coefficient_API_KAPI(
      sizingData,
      uomResults,
      templateId
    );
  },
  Discharge_Coefficient_derated_K: (sizingData, uomResults, templateId) => {
    return subInputFunc.Discharge_Coefficient_derated_K(
      sizingData,
      uomResults,
      templateId
    );
  },
  Discharge_Coefficient_derated_Kdr: (sizingData, uomResults, templateId) => {
    return subInputFunc.Discharge_Coefficient_derated_Kdr(
      sizingData,
      uomResults,
      templateId
    );
  },
  Distance_from_Valve_noise_r: (sizingData, uomResults, templateId) => {
    return subInputFunc.Distance_from_Valve_noise_r(
      sizingData,
      uomResults,
      templateId
    );
  },
  Dryness_Correction_Factor_xs: (sizingData, uomResults, templateId) => {
    return subInputFunc.Dryness_Correction_Factor_xs(
      sizingData,
      uomResults,
      templateId
    );
  },
  Gas_Back_Press_Corr_Factor_Kb: (sizingData, uomResults, templateId) => {
    return subInputFunc.Gas_Back_Press_Corr_Factor_Kb(
      sizingData,
      uomResults,
      templateId
    );
  },
  Gas_Discharge_Coefficient_KG: (sizingData, uomResults, templateId) => {
    return subInputFunc.Gas_Discharge_Coefficient_KG(
      sizingData,
      uomResults,
      templateId
    );
  },
  Gas_Partial_Pressure_Pg1: (sizingData, uomResults, templateId) => {
    return subInputFunc.Gas_Partial_Pressure_Pg1(
      sizingData,
      uomResults,
      templateId
    );
  },
  Gas_Vapor_Density_at_Outlet_rhog2: (sizingData, uomResults, templateId) => {
    return subInputFunc.Gas_Vapor_Density_at_Outlet_rhog2(
      sizingData,
      uomResults,
      templateId
    );
  },
  Gas_Vapor_Sp_Vol_at_Inlet_vv1: (sizingData, uomResults, templateId) => {
    return subInputFunc.Gas_Vapor_Sp_Vol_at_Inlet_vv1(
      sizingData,
      uomResults,
      templateId
    );
  },
  Gas_Vapor_Sp_Vol_at_Inlet_vvg1: (sizingData, uomResults, templateId) => {
    return subInputFunc.Gas_Vapor_Sp_Vol_at_Inlet_vvg1(
      sizingData,
      uomResults,
      templateId
    );
  },
  Gas_Vapor_Specific_Volume_at_Ps_vvs: (sizingData, uomResults, templateId) => {
    return subInputFunc.Gas_Vapor_Specific_Volume_at_Ps_vvs(
      sizingData,
      uomResults,
      templateId
    );
  },
  Inlet_Line_Loss_Ploss: (sizingData, uomResults, templateId) => {
    return subInputFunc.Inlet_Line_Loss_Ploss(
      sizingData,
      uomResults,
      templateId
    );
  },
  Inlet_Stagnation_Enthalpy_ho: (sizingData, uomResults, templateId) => {
    return subInputFunc.Inlet_Stagnation_Enthalpy_ho(
      sizingData,
      uomResults,
      templateId
    );
  },
  Isentropic_Expansion_Coeff_k: (sizingData, uomResults, templateId) => {
    return subInputFunc.Isentropic_Expansion_Coeff_k(
      sizingData,
      uomResults,
      templateId
    );
  },
  K_vs_PR_Intercept_b: (sizingData, uomResults, templateId) => {
    return subInputFunc.K_vs_PR_Intercept_b(sizingData, uomResults, templateId);
  },
  K_vs_PR_Intercept_Vacuum_b: (sizingData, uomResults, templateId) => {
    return subInputFunc.K_vs_PR_Intercept_Vacuum_b(
      sizingData,
      uomResults,
      templateId
    );
  },
  K_vs_PR_Slope_m: (sizingData, uomResults, templateId) => {
    return subInputFunc.K_vs_PR_Slope_m(sizingData, uomResults, templateId);
  },
  K_vs_PR_Slope_Vacuum_m: (sizingData, uomResults, templateId) => {
    return subInputFunc.K_vs_PR_Slope_Vacuum_m(
      sizingData,
      uomResults,
      templateId
    );
  },
  Liquid_Back_Press_Corr_Factor_Kw: (sizingData, uomResults, templateId) => {
    return subInputFunc.Liquid_Back_Press_Corr_Factor_Kw(
      sizingData,
      uomResults,
      templateId
    );
  },
  Liquid_Density_at_Inlet_rhol1: (sizingData, uomResults, templateId) => {
    return subInputFunc.Liquid_Density_at_Inlet_rhol1(
      sizingData,
      uomResults,
      templateId
    );
  },
  Liquid_Density_at_Inlet_ρl1: (sizingData, uomResults, templateId) => {
    return subInputFunc.Liquid_Density_at_Inlet_ρl1(
      sizingData,
      uomResults,
      templateId
    );
  },
  Liquid_Density_at_Outlet_rhol2: (sizingData, uomResults, templateId) => {
    return subInputFunc.Liquid_Density_at_Outlet_rhol2(
      sizingData,
      uomResults,
      templateId
    );
  },
  Liquid_Discharge_Coefficient_KL: (sizingData, uomResults, templateId) => {
    return subInputFunc.Liquid_Discharge_Coefficient_KL(
      sizingData,
      uomResults,
      templateId
    );
  },
  Liquid_Latent_Heat_at_Inlet_hvl1: (sizingData, uomResults, templateId) => {
    return subInputFunc.Liquid_Latent_Heat_at_Inlet_hvl1(
      sizingData,
      uomResults,
      templateId
    );
  },
  Liquid_Latent_Heat_at_Ps_hvls: (sizingData, uomResults, templateId) => {
    return subInputFunc.Liquid_Latent_Heat_at_Ps_hvls(
      sizingData,
      uomResults,
      templateId
    );
  },
  Liquid_Sp_Vol_at_Inlet_vl1: (sizingData, uomResults, templateId) => {
    return subInputFunc.Liquid_Sp_Vol_at_Inlet_vl1(
      sizingData,
      uomResults,
      templateId
    );
  },
  Liquid_Specific_Heat_at_Inlet_Cp: (sizingData, uomResults, templateId) => {
    return subInputFunc.Liquid_Specific_Heat_at_Inlet_Cp(
      sizingData,
      uomResults,
      templateId
    );
  },
  Liquid_Specific_Volume_at_Inlet_vl1: (sizingData, uomResults, templateId) => {
    return subInputFunc.Liquid_Specific_Volume_at_Inlet_vl1(
      sizingData,
      uomResults,
      templateId
    );
  },
  Liquid_Specific_Volume_at_Ps_vls: (sizingData, uomResults, templateId) => {
    return subInputFunc.Liquid_Specific_Volume_at_Ps_vls(
      sizingData,
      uomResults,
      templateId
    );
  },
  Mass_Flux_G: (sizingData, uomResults, templateId) => {
    return subInputFunc.Mass_Flux_G(sizingData, uomResults, templateId);
  },
  Maximum_Flow_Coefficient_Kmax: (sizingData, uomResults, templateId) => {
    return subInputFunc.Maximum_Flow_Coefficient_Kmax(
      sizingData,
      uomResults,
      templateId
    );
  },
  Maximum_Flow_Coefficient_Vacuum_Kmax: (
    sizingData,
    uomResults,
    templateId
  ) => {
    return subInputFunc.Maximum_Flow_Coefficient_Vacuum_Kmax(
      sizingData,
      uomResults,
      templateId
    );
  },
  Mixture_Density_at_90Per_Ps_rho9: (sizingData, uomResults, templateId) => {
    return subInputFunc.Mixture_Density_at_90Per_Ps_rho9(
      sizingData,
      uomResults,
      templateId
    );
  },
  Molecular_Mass_M: (sizingData, uomResults, templateId) => {
    return subInputFunc.Molecular_Mass_M(sizingData, uomResults, templateId);
  },
  Molecular_Weight_M: (sizingData, uomResults, templateId) => {
    return subInputFunc.Molecular_Weight_M(sizingData, uomResults, templateId);
  },
  Molecular_Weight_Vacuum_M: (sizingData, uomResults, templateId) => {
    return subInputFunc.Molecular_Weight_Vacuum_M(
      sizingData,
      uomResults,
      templateId
    );
  },
  Orifice_Area_A: (sizingData, uomResults, templateId) => {
    return subInputFunc.Orifice_Area_A(sizingData, uomResults, templateId);
  },
  Orifice_Area_AAPI: (sizingData, uomResults, templateId) => {
    return subInputFunc.Orifice_Area_AAPI(sizingData, uomResults, templateId);
  },
  Orifice_Area_Vacuum_A: (sizingData, uomResults, templateId) => {
    return subInputFunc.Orifice_Area_Vacuum_A(
      sizingData,
      uomResults,
      templateId
    );
  },
  Outlet_Diameter_Do: (sizingData, uomResults, templateId, sapData) => {
    return subInputFunc.Outlet_Diameter_Do(sizingData, uomResults, templateId, sapData);
  },
  liquid_Outlet_Density: (sizingData, uomResults, templateId) => {
    return subInputFunc.liquid_Outlet_Density(
      sizingData,
      uomResults,
      templateId
    );
  },
  outlet_Gas_Mass_Fraction: (sizingData, uomResults, templateId) => {
    return subInputFunc.outlet_Gas_Mass_Fraction(
      sizingData,
      uomResults,
      templateId
    );
  },
  gas_Outlet_Density: (sizingData, uomResults, templateId) => {
    return subInputFunc.gas_Outlet_Density(sizingData, uomResults, templateId);
  },
  Outlet_Diameter_Vacuum_Do: (sizingData, uomResults, templateId) => {
    return subInputFunc.Outlet_Diameter_Vacuum_Do(
      sizingData,
      uomResults,
      templateId
    );
  },
  Outlet_Gas_Mass_Fraction_x2: (sizingData, uomResults, templateId) => {
    return subInputFunc.Outlet_Gas_Mass_Fraction_x2(
      sizingData,
      uomResults,
      templateId
    );
  },
  Outlet_Velocity_u: (sizingData, uomResults, templateId) => {
    return subInputFunc.Outlet_Velocity_u(sizingData, uomResults, templateId);
  },
  Over_Pressure_Pover: (sizingData, uomResults, templateId) => {
    return subInputFunc.Over_Pressure_Pover(sizingData, uomResults, templateId);
  },
  Over_Pressure_Vacuum_Vover: (sizingData, uomResults, templateId) => {
    return subInputFunc.Over_Pressure_Vacuum_Vover(
      sizingData,
      uomResults,
      templateId
    );
  },
  Ratio_of_Specific_Heats_k: (sizingData, uomResults, templateId) => {
    return subInputFunc.Ratio_of_Specific_Heats_k(
      sizingData,
      uomResults,
      templateId
    );
  },
  Ratio_of_Specific_Heats_Vacuum_k: (sizingData, uomResults, templateId) => {
    return subInputFunc.Ratio_of_Specific_Heats_Vacuum_k(
      sizingData,
      uomResults,
      templateId
    );
  },
  Relieving_Temperature_T: (sizingData, uomResults, templateId) => {
    return subInputFunc.Relieving_Temperature_T(
      sizingData,
      uomResults,
      templateId
    );
  },
  Relieving_Temperature_Vacuum_T: (sizingData, uomResults, templateId) => {
    return subInputFunc.Relieving_Temperature_Vacuum_T(
      sizingData,
      uomResults,
      templateId
    );
  },
  Required_Area__Gas_AreqG: (sizingData, uomResults, templateId) => {
    return subInputFunc.Required_Area__Gas_AreqG(
      sizingData,
      uomResults,
      templateId
    );
  },
  Required_Area__Liquid_1_AreqL1: (sizingData, uomResults, templateId) => {
    return subInputFunc.Required_Area__Liquid_1_AreqL1(
      sizingData,
      uomResults,
      templateId
    );
  },
  Required_Area__Liquid_2_AreqL2: (sizingData, uomResults, templateId) => {
    return subInputFunc.Required_Area__Liquid_2_AreqL2(
      sizingData,
      uomResults,
      templateId
    );
  },
  Required_Gas_Flow_Wg: (sizingData, uomResults, templateId) => {
    return subInputFunc.Required_Gas_Flow_Wg(
      sizingData,
      uomResults,
      templateId
    );
  },
  Required_Gas_Vapor_Flow_Wv: (sizingData, uomResults, templateId) => {
    return subInputFunc.Required_Gas_Vapor_Flow_Wv(
      sizingData,
      uomResults,
      templateId
    );
  },
  Required_Liquid_Flow_VL: (sizingData, uomResults, templateId) => {
    return subInputFunc.Required_Liquid_Flow_VL(
      sizingData,
      uomResults,
      templateId
    );
  },
  Required_Liquid_Flow_Wl: (sizingData, uomResults, templateId) => {
    return subInputFunc.Required_Liquid_Flow_Wl(
      sizingData,
      uomResults,
      templateId
    );
  },
  Required_Mass_Flow__Gas_W_V: (sizingData, uomResults, templateId) => {
    return subInputFunc.Required_Mass_Flow__Gas_W_V(
      sizingData,
      uomResults,
      templateId
    );
  },
  Required_Mass_Flow__Liquid_1_VLL1: (sizingData, uomResults, templateId) => {
    return subInputFunc.Required_Mass_Flow__Liquid_1_VLL1(
      sizingData,
      uomResults,
      templateId
    );
  },
  Required_Mass_Flow__Liquid_2_VLL2: (sizingData, uomResults, templateId) => {
    return subInputFunc.Required_Mass_Flow__Liquid_2_VLL2(
      sizingData,
      uomResults,
      templateId
    );
  },
  Required_Mass_Flow_Qreq: (sizingData, uomResults, templateId) => {
    return subInputFunc.Required_Mass_Flow_Qreq(
      sizingData,
      uomResults,
      templateId
    );
  },
  Required_Mass_Flow_Vacuum_Wreq: (sizingData, uomResults, templateId) => {
    return subInputFunc.Required_Mass_Flow_Vacuum_Wreq(
      sizingData,
      uomResults,
      templateId
    );
  },
  Required_Mass_Flow_Wreq: (sizingData, uomResults, templateId) => {
    return subInputFunc.Required_Mass_Flow_Wreq(
      sizingData,
      uomResults,
      templateId
    );
  },
  Required_Vapor_Flow_Wv: (sizingData, uomResults, templateId) => {
    return subInputFunc.Required_Vapor_Flow_Wv(
      sizingData,
      uomResults,
      templateId
    );
  },
  Required_Volumetric_Flow_Vacuum_Vreq: (
    sizingData,
    uomResults,
    templateId
  ) => {
    return subInputFunc.Required_Volumetric_Flow_Vacuum_Vreq(
      sizingData,
      uomResults,
      templateId
    );
  },
  Required_Volumetric_Flow_VLreq: (sizingData, uomResults, templateId) => {
    return subInputFunc.Required_Volumetric_Flow_VLreq(
      sizingData,
      uomResults,
      templateId
    );
  },
  Required_Volumetric_Flow_Vreq: (sizingData, uomResults, templateId) => {
    return subInputFunc.Required_Volumetric_Flow_Vreq(
      sizingData,
      uomResults,
      templateId
    );
  },
  Rupture_Disc_CCF_Fd: (sizingData, uomResults, templateId) => {
    return subInputFunc.Rupture_Disc_CCF_Fd(sizingData, uomResults, templateId);
  },
  Rupture_Disc_CCF_Kc: (sizingData, uomResults, templateId) => {
    return subInputFunc.Rupture_Disc_CCF_Kc(sizingData, uomResults, templateId);
  },
  Saturation_Pressure_Ps: (sizingData, uomResults, templateId) => {
    return subInputFunc.Saturation_Pressure_Ps(
      sizingData,
      uomResults,
      templateId
    );
  },
  Sautation_Pressure_of_Vapor_Pv1: (sizingData, uomResults, templateId) => {
    return subInputFunc.Sautation_Pressure_of_Vapor_Pv1(
      sizingData,
      uomResults,
      templateId
    );
  },
  Set_Pressure_Pset: (sizingData, uomResults, templateId) => {
    return subInputFunc.Set_Pressure_Pset(sizingData, uomResults, templateId);
  },
  Set_Pressure_Vacuum_Vset: (sizingData, uomResults, templateId) => {
    return subInputFunc.Set_Pressure_Vacuum_Vset(
      sizingData,
      uomResults,
      templateId
    );
  },
  Shape_Factor_E: (sizingData, uomResults, templateId) => {
    return subInputFunc.Shape_Factor_E(sizingData, uomResults, templateId);
  },
  Shape_Factor_Vacuum_E: (sizingData, uomResults, templateId) => {
    return subInputFunc.Shape_Factor_Vacuum_E(
      sizingData,
      uomResults,
      templateId
    );
  },
  Specific_Gravity_SG: (sizingData, uomResults, templateId) => {
    return subInputFunc.Specific_Gravity_SG(sizingData, uomResults, templateId);
  },
  Specific_Volume_at_90Per_Inlet_v9: (sizingData, uomResults, templateId) => {
    return subInputFunc.Specific_Volume_at_90Per_Inlet_v9(
      sizingData,
      uomResults,
      templateId
    );
  },
  Specific_Volume_v1: (sizingData, uomResults, templateId) => {
    return subInputFunc.Specific_Volume_v1(sizingData, uomResults, templateId);
  },
  Steam_Pressure_Coefficient_Ks: (sizingData, uomResults, templateId) => {
    return subInputFunc.Steam_Pressure_Coefficient_Ks(
      sizingData,
      uomResults,
      templateId
    );
  },
  Supercritical_Correction_Factor_ks: (sizingData, uomResults, templateId) => {
    return subInputFunc.Supercritical_Correction_Factor_ks(
      sizingData,
      uomResults,
      templateId
    );
  },
  Superheat_Correction_Factor_Ksh: (sizingData, uomResults, templateId) => {
    return subInputFunc.Superheat_Correction_Factor_Ksh(
      sizingData,
      uomResults,
      templateId
    );
  },
  Tank_Pressure_Ptank: (sizingData, uomResults, templateId) => {
    return subInputFunc.Tank_Pressure_Ptank(sizingData, uomResults, templateId);
  },
  Tank_Vacuum_Vacuum_Vtank: (sizingData, uomResults, templateId) => {
    return subInputFunc.Tank_Vacuum_Vacuum_Vtank(
      sizingData,
      uomResults,
      templateId
    );
  },
  Total_Required_Flow_Wreq: (sizingData, uomResults, templateId) => {
    return subInputFunc.Total_Required_Flow_Wreq(
      sizingData,
      uomResults,
      templateId
    );
  },
  Transition_to_Full_Open_Tp: (sizingData, uomResults, templateId) => {
    return subInputFunc.Transition_to_Full_Open_Tp(
      sizingData,
      uomResults,
      templateId
    );
  },
  Transition_to_Full_Open_Vacuum_Tp: (sizingData, uomResults, templateId) => {
    return subInputFunc.Transition_to_Full_Open_Vacuum_Tp(
      sizingData,
      uomResults,
      templateId
    );
  },
  Vapor_Density_at_Outlet_rhog2: (sizingData, uomResults, templateId) => {
    return subInputFunc.Vapor_Density_at_Outlet_rhog2(
      sizingData,
      uomResults,
      templateId
    );
  },
  Vapor_Sp_Vol_at_Inlet_vv1: (sizingData, uomResults, templateId) => {
    return subInputFunc.Vapor_Sp_Vol_at_Inlet_vv1(
      sizingData,
      uomResults,
      templateId
    );
  },
  Vapor_Specific_Volume_at_Inlet_vv1: (sizingData, uomResults, templateId) => {
    return subInputFunc.Vapor_Specific_Volume_at_Inlet_vv1(
      sizingData,
      uomResults,
      templateId
    );
  },
  Variable_Superimposed_BP_Psiv: (sizingData, uomResults, templateId) => {
    return subInputFunc.Variable_Superimposed_BP_Psiv(
      sizingData,
      uomResults,
      templateId
    );
  },
  Viscosity_Correction_Factor_Kv: (sizingData, uomResults, templateId) => {
    return subInputFunc.Viscosity_Correction_Factor_Kv(
      sizingData,
      uomResults,
      templateId
    );
  },
  Viscosity_Correction_Max_Flow_Kv_m: (sizingData, uomResults, templateId) => {
    return subInputFunc.Viscosity_Correction_Max_Flow_Kv_m(
      sizingData,
      uomResults,
      templateId
    );
  },
  Viscosity_Correction_Max_Flow_Kvmax: (sizingData, uomResults, templateId) => {
    return subInputFunc.Viscosity_Correction_Max_Flow_Kvmax(
      sizingData,
      uomResults,
      templateId
    );
  },
  Viscosity_Correction_Rqd_Flow_Kv: (sizingData, uomResults, templateId) => {
    return subInputFunc.Viscosity_Correction_Rqd_Flow_Kv(
      sizingData,
      uomResults,
      templateId
    );
  },
  Viscosity_Correction_Rqd_Flow_Kv_req: (
    sizingData,
    uomResults,
    templateId
  ) => {
    return subInputFunc.Viscosity_Correction_Rqd_Flow_Kv_req(
      sizingData,
      uomResults,
      templateId
    );
  },
  Viscosity_Mu: (sizingData, uomResults, templateId) => {
    return subInputFunc.Viscosity_Mu(sizingData, uomResults, templateId);
  },
  Viscosity_visc: (sizingData, uomResults, templateId) => {
    return subInputFunc.Viscosity_visc(sizingData, uomResults, templateId);
  },
  Specific_Gravity_SG_Liq2: (sizingData) => {
    return subInputFunc.Specific_Gravity_SG_Liq2(sizingData);
  },
  Viscosity_visc_Liq2: (sizingData) => {
    return subInputFunc.Viscosity_visc_Liq2(sizingData);
  },
  Required_Volumetric_Flow_VLreq_Liq2: (sizingData) => {
    return subInputFunc.Required_Volumetric_Flow_VLreq_Liq2(sizingData);
  },
  Required_Mass_Flow_Wreq_Liq2: (sizingData) => {
    return subInputFunc.Required_Mass_Flow_Wreq_Liq2(sizingData);
  },
  Discharge_Coefficient_acutal_Kd_Liq2: (sizingData) => {
    return subInputFunc.Discharge_Coefficient_acutal_Kd_Liq2(sizingData);
  },
  Discharge_Coefficient_API_KAPI_Liq2: (sizingData) => {
    return subInputFunc.Discharge_Coefficient_API_KAPI_Liq2(sizingData);
  },
  Discharge_Coefficient_derated_K_Liq2: (sizingData) => {
    return subInputFunc.Discharge_Coefficient_derated_K_Liq2(sizingData);
  },
  Orifice_Area_A_Liq2: (sizingData) => {
    return subInputFunc.Orifice_Area_A_Liq2(sizingData);
  },
  Orifice_Area_AAPI_Liq2: (sizingData) => {
    return subInputFunc.Orifice_Area_AAPI_Liq2(sizingData);
  },
  Back_Press_Correction_Factor_Kw_Liq2: (sizingData) => {
    return subInputFunc.Back_Press_Correction_Factor_Kw_Liq2(sizingData);
  },
  Viscosity_Correction_Rqd_Flow_Kv_Liq2: (sizingData) => {
    return subInputFunc.Viscosity_Correction_Rqd_Flow_Kv_Liq2(sizingData);
  },
  Viscosity_Correction_Max_Flow_Kvmax_Liq2: (sizingData) => {
    return subInputFunc.Viscosity_Correction_Max_Flow_Kvmax_Liq2(sizingData);
  },
};
const SubEquationMapping = {
  "2Phase_Back_Pressure_Correction_Factor_Kbw": (
    sizingData,
    uomResults,
    templateId
  ) => {
    return subEquationFunc.TwoPhase_Back_Pressure_Correction_Factor_Kbw(
      sizingData,
      uomResults,
      templateId
    );
  },
  "2Phase_Discharge_Coefficient_K2Phi": (
    sizingData,
    uomResults,
    templateId
  ) => {
    return subEquationFunc.TwoPhase_Discharge_Coefficient_K2Phi(
      sizingData,
      uomResults,
      templateId
    );
  },
  "2Phase_Inlet_Specific_Volume_v1": (sizingData, uomResults, templateId) => {
    return subEquationFunc.TwoPhase_Inlet_Specific_Volume_v1(
      sizingData,
      uomResults,
      templateId
    );
  },
  "2Phase_Required_Orifice_Area_Areq": (sizingData, uomResults, templateId) => {
    return subEquationFunc.TwoPhase_Required_Orifice_Area_Areq(
      sizingData,
      uomResults,
      templateId
    );
  },
  Absolute_Pressure_Ratio_PR: (sizingData, uomResults, templateId) => {
    return subEquationFunc.Absolute_Pressure_Ratio_PR(
      sizingData,
      uomResults,
      templateId
    );
  },
  Capacity_of_Selected_Valve_Qm: (sizingData, uomResults, templateId) => {
    return subEquationFunc.Capacity_of_Selected_Valve_Qm(
      sizingData,
      uomResults,
      templateId
    );
  },
  Capacity_of_Selected_Valve_Qm_actual: (
    sizingData,
    uomResults,
    templateId
  ) => {
    return subEquationFunc.Capacity_of_Selected_Valve_Qm_actual(
      sizingData,
      uomResults,
      templateId
    );
  },
  Capacity_of_Selected_Valve_VL: (sizingData, uomResults, templateId) => {
    return subEquationFunc.Capacity_of_Selected_Valve_VL(
      sizingData,
      uomResults,
      templateId
    );
  },
  Capacity_of_Selected_Valve_W: (sizingData, uomResults, templateId) => {
    return subEquationFunc.Capacity_of_Selected_Valve_W(
      sizingData,
      uomResults,
      templateId
    );
  },
  Critical_Pressure_Pc: (sizingData, uomResults, templateId) => {
    return subEquationFunc.Critical_Pressure_Pc(
      sizingData,
      uomResults,
      templateId
    );
  },
  Critical_Pressure_Ratio_ηc: (sizingData, uomResults, templateId) => {
    return subEquationFunc.Critical_Pressure_Ratio_ηc(
      sizingData,
      uomResults,
      templateId
    );
  },
  Differential_Pressure_X: (sizingData, uomResults, templateId) => {
    return subEquationFunc.Differential_Pressure_X(
      sizingData,
      uomResults,
      templateId
    );
  },
  Discharge_Coefficient_Kd: (sizingData, uomResults, templateId) => {
    return subEquationFunc.Discharge_Coefficient_Kd(
      sizingData,
      uomResults,
      templateId
    );
  },
  Flashing_Critical_Pressure_Ratio_ηvc: (
    sizingData,
    uomResults,
    templateId
  ) => {
    return subEquationFunc.Flashing_Critical_Pressure_Ratio_ηvc(
      sizingData,
      uomResults,
      templateId
    );
  },
  Flashing_Mass_Flux_Gv: (sizingData, uomResults, templateId) => {
    return subEquationFunc.Flashing_Mass_Flux_Gv(
      sizingData,
      uomResults,
      templateId
    );
  },
  Flashing_Partial_Pressure_Ratio_ηv: (sizingData, uomResults, templateId) => {
    return subEquationFunc.Flashing_Partial_Pressure_Ratio_ηv(
      sizingData,
      uomResults,
      templateId
    );
  },
  Gas_Constant_C: (sizingData, uomResults, templateId) => {
    return subEquationFunc.Gas_Constant_C(sizingData, uomResults, templateId);
  },
  Gas_Mass_Fraction_x1: (sizingData, uomResults, templateId) => {
    return subEquationFunc.Gas_Mass_Fraction_x1(
      sizingData,
      uomResults,
      templateId
    );
  },
  Inlet_gas_Mole_Fraction_in_Vapor_Phase_yg1: (
    sizingData,
    uomResults,
    templateId
  ) => {
    return subEquationFunc.Inlet_gas_Mole_Fraction_in_Vapor_Phase_yg1(
      sizingData,
      uomResults,
      templateId
    );
  },
  Inlet_Relieving_Pa: (sizingData, uomResults, templateId) => {
    return subEquationFunc.Inlet_Relieving_Pa(
      sizingData,
      uomResults,
      templateId
    );
  },
  Inlet_Relieving_Pressure_P1: (sizingData, uomResults, templateId) => {
    return subEquationFunc.Inlet_Relieving_Pressure_P1(
      sizingData,
      uomResults,
      templateId
    );
  },
  Is_Flow_Critical_Subcritical: (sizingData, uomResults, templateId) => {
    return subEquationFunc.Is_Flow_Critical_Subcritical(
      sizingData,
      uomResults,
      templateId
    );
  },
  Lift_Restriction_REST: (sizingData, uomResults, templateId) => {
    return subEquationFunc.Lift_Restriction_REST(
      sizingData,
      uomResults,
      templateId
    );
  },
  Mass_Critical_Flow_for_Noise_Calc_W: (sizingData, uomResults, templateId) => {
    return subEquationFunc.Mass_Critical_Flow_for_Noise_Calc_W(
      sizingData,
      uomResults,
      templateId
    );
  },
  Mass_Critical_Flow_W: (sizingData, uomResults, templateId) => {
    return subEquationFunc.Mass_Critical_Flow_W(
      sizingData,
      uomResults,
      templateId
    );
  },
  Mass_Flow_for_Noise_Calc_W: (sizingData, uomResults, templateId) => {
    return subEquationFunc.Mass_Flow_for_Noise_Calc_W(
      sizingData,
      uomResults,
      templateId
    );
  },
  Mass_Flow_W: (sizingData, uomResults, templateId) => {
    return subEquationFunc.Mass_Flow_W(sizingData, uomResults, templateId);
  },
  Mass_Flux_G: (sizingData, uomResults, templateId) => {
    return subEquationFunc.Mass_Flux_G(sizingData, uomResults, templateId);
  },
  Mass_SubCritical_Flow_for_Noise_Calc_W: (
    sizingData,
    uomResults,
    templateId
  ) => {
    return subEquationFunc.Mass_SubCritical_Flow_for_Noise_Calc_W(
      sizingData,
      uomResults,
      templateId
    );
  },
  Mass_SubCritical_Flow_W: (sizingData, uomResults, templateId) => {
    return subEquationFunc.Mass_SubCritical_Flow_W(
      sizingData,
      uomResults,
      templateId
    );
  },
  Napier_Correction_Factor_Kn: (sizingData, uomResults, templateId) => {
    return subEquationFunc.Napier_Correction_Factor_Kn(
      sizingData,
      uomResults,
      templateId
    );
  },
  Noise_Level_at_100ft_30m_L100: (sizingData, uomResults, templateId) => {
    return subEquationFunc.Noise_Level_at_100ft_30m_L100(
      sizingData,
      uomResults,
      templateId
    );
  },
  Noise_Level_for_Open_Discharge_at_Distance_r_Lp: (
    sizingData,
    uomResults,
    templateId
  ) => {
    return subEquationFunc.Noise_Level_for_Open_Discharge_at_Distance_r_Lp(
      sizingData,
      uomResults,
      templateId
    );
  },
  Nonflashing_Critical_Pressure_Ratio_ηgc: (
    sizingData,
    uomResults,
    templateId
  ) => {
    return subEquationFunc.Nonflashing_Critical_Pressure_Ratio_ηgc(
      sizingData,
      uomResults,
      templateId
    );
  },
  Nonflashing_Mass_Flux_Gg: (sizingData, uomResults, templateId) => {
    return subEquationFunc.Nonflashing_Mass_Flux_Gg(
      sizingData,
      uomResults,
      templateId
    );
  },
  Nonflashing_Partial_Pressure_Ratio_ηg: (
    sizingData,
    uomResults,
    templateId
  ) => {
    return subEquationFunc.Nonflashing_Partial_Pressure_Ratio_ηg(
      sizingData,
      uomResults,
      templateId
    );
  },
  Omega_ω: (sizingData, uomResults, templateId) => {
    return subEquationFunc.Omega_ω(sizingData, uomResults, templateId);
  },
  Outlet_Area_AO: (sizingData, uomResults, templateId) => {
    return subEquationFunc.Outlet_Area_AO(sizingData, uomResults, templateId);
  },
  Outlet_Pressure_P2: (sizingData, uomResults, templateId) => {
    return subEquationFunc.Outlet_Pressure_P2(
      sizingData,
      uomResults,
      templateId
    );
  },
  Outlet_Pressure_Pb: (sizingData, uomResults, templateId) => {
    return subEquationFunc.Outlet_Pressure_Pb(
      sizingData,
      uomResults,
      templateId
    );
  },
  Outlet_Static_Pressure_Po: (sizingData, uomResults, templateId) => {
    return subEquationFunc.Outlet_Static_Pressure_Po(
      sizingData,
      uomResults,
      templateId
    );
  },
  Over_Pressure_Ratio_X: (sizingData, uomResults, templateId) => {
    return subEquationFunc.Over_Pressure_Ratio_X(
      sizingData,
      uomResults,
      templateId
    );
  },
  Pseudo_Set_Pressure_Ppset: (sizingData, uomResults, templateId) => {
    return subEquationFunc.Pseudo_Set_Pressure_Ppset(
      sizingData,
      uomResults,
      templateId
    );
  },
  Reaction_Force_for_Open_Discharge_Fr: (
    sizingData,
    uomResults,
    templateId
  ) => {
    return subEquationFunc.Reaction_Force_for_Open_Discharge_Fr(
      sizingData,
      uomResults,
      templateId
    );
  },
  Required_Orifice_Area_Areq: (sizingData, uomResults, templateId) => {
    return subEquationFunc.Required_Orifice_Area_Areq(
      sizingData,
      uomResults,
      templateId
    );
  },
  Restricted_Lift_Capacity_Qmrest: (sizingData, uomResults, templateId) => {
    return subEquationFunc.Restricted_Lift_Capacity_Qmrest(
      sizingData,
      uomResults,
      templateId
    );
  },
  Restricted_Lift_Capacity_VLrest: (sizingData, uomResults, templateId) => {
    return subEquationFunc.Restricted_Lift_Capacity_VLrest(
      sizingData,
      uomResults,
      templateId
    );
  },
  Restricted_Lift_Capacity_Vrest: (sizingData, uomResults, templateId) => {
    return subEquationFunc.Restricted_Lift_Capacity_Vrest(
      sizingData,
      uomResults,
      templateId
    );
  },
  Restricted_Lift_Capacity_Wrest: (sizingData, uomResults, templateId) => {
    return subEquationFunc.Restricted_Lift_Capacity_Wrest(
      sizingData,
      uomResults,
      templateId
    );
  },
  Reynolds_Number_R: (sizingData, uomResults, templateId) => {
    return subEquationFunc.Reynolds_Number_R(
      sizingData,
      uomResults,
      templateId
    );
  },
  Reynolds_Number_Rm: (sizingData, uomResults, templateId) => {
    return subEquationFunc.Reynolds_Number_Rm(
      sizingData,
      uomResults,
      templateId
    );
  },
  Reynolds_Number_Rmax: (sizingData, uomResults, templateId) => {
    return subEquationFunc.Reynolds_Number_Rmax(
      sizingData,
      uomResults,
      templateId
    );
  },
  Saturated_Omega_ω: (sizingData, uomResults, templateId) => {
    return subEquationFunc.Saturated_Omega_ω(
      sizingData,
      uomResults,
      templateId
    );
  },
  Saturation_Pressure_Ratio_ηs: (sizingData, uomResults, templateId) => {
    return subEquationFunc.Saturation_Pressure_Ratio_ηs(
      sizingData,
      uomResults,
      templateId
    );
  },
  Sound_Power_Level_PWL: (sizingData, uomResults, templateId) => {
    return subEquationFunc.Sound_Power_Level_PWL(
      sizingData,
      uomResults,
      templateId
    );
  },
  Sound_Pressure_Level_for_Open_Discharge_at_Distance_r_PSLr: (
    sizingData,
    uomResults,
    templateId
  ) => {
    return subEquationFunc.Sound_Pressure_Level_for_Open_Discharge_at_Distance_r_PSLr(
      sizingData,
      uomResults,
      templateId
    );
  },
  Sp_Vol_Difference_vvl1: (sizingData, uomResults, templateId) => {
    return subEquationFunc.Sp_Vol_Difference_vvl1(
      sizingData,
      uomResults,
      templateId
    );
  },
  Specific_Volume_Difference_vvls: (sizingData, uomResults, templateId) => {
    return subEquationFunc.Specific_Volume_Difference_vvls(
      sizingData,
      uomResults,
      templateId
    );
  },
  Subcooling_Region_Low_High: (sizingData, uomResults, templateId) => {
    return subEquationFunc.Subcooling_Region_Low_High(
      sizingData,
      uomResults,
      templateId
    );
  },
  SubCritical_Discharge_Coefficient_Derated_Kd: (
    sizingData,
    uomResults,
    templateId
  ) => {
    return subEquationFunc.SubCritical_Discharge_Coefficient_Derated_Kd(
      sizingData,
      uomResults,
      templateId
    );
  },
  SubCritical_Discharge_Coefficients_Actual_K: (
    sizingData,
    uomResults,
    templateId
  ) => {
    return subEquationFunc.SubCritical_Discharge_Coefficients_Actual_K(
      sizingData,
      uomResults,
      templateId
    );
  },
  SubCritical_Flow_Factor_Fs: (sizingData, uomResults, templateId) => {
    return subEquationFunc.SubCritical_Flow_Factor_Fs(
      sizingData,
      uomResults,
      templateId
    );
  },
  Superimposed_Back_Pressure_Absolute_PU: (
    sizingData,
    uomResults,
    templateId
  ) => {
    return subEquationFunc.Superimposed_Back_Pressure_Absolute_PU(
      sizingData,
      uomResults,
      templateId
    );
  },
  Theoretical_Pressure_Ratio_TPR: (sizingData, uomResults, templateId) => {
    return subEquationFunc.Theoretical_Pressure_Ratio_TPR(
      sizingData,
      uomResults,
      templateId
    );
  },
  Transition_Saturation_Pressure_Ratio_ηst: (
    sizingData,
    uomResults,
    templateId
  ) => {
    return subEquationFunc.Transition_Saturation_Pressure_Ratio_ηst(
      sizingData,
      uomResults,
      templateId
    );
  },
  Void_Fraction_α1: (sizingData, uomResults, templateId) => {
    return subEquationFunc.Void_Fraction_α1(sizingData, uomResults, templateId);
  },
  Volumetric_Critical_Flow_V: (sizingData, uomResults, templateId) => {
    return subEquationFunc.Volumetric_Critical_Flow_V(
      sizingData,
      uomResults,
      templateId
    );
  },
  Volumetric_Flow_V: (sizingData, uomResults, templateId) => {
    return subEquationFunc.Volumetric_Flow_V(
      sizingData,
      uomResults,
      templateId
    );
  },
  NoisepayloadW_Api: (sizingData, uomResults, templateId) => {
    return subEquationFunc.NoisepayloadW_Api(
      sizingData,
      uomResults,
      templateId
    );
  },
  Volumetric_SubCritical_Flow_V: (sizingData, uomResults, templateId) => {
    return subEquationFunc.Volumetric_SubCritical_Flow_V(
      sizingData,
      uomResults,
      templateId
    );
  },
  Inlet_Relieving_Pa_Liq2: (sizingData, uomResults, templateId) => {
    return subEquationFunc.Inlet_Relieving_Pa_Liq2(
      sizingData,
      uomResults,
      templateId
    );
  },
  Outlet_Pressure_Pb_Liq2: (sizingData, uomResults, templateId) => {
    return subEquationFunc.Outlet_Pressure_Pb_Liq2(
      sizingData,
      uomResults,
      templateId
    );
  },
  Capacity_of_Selected_Valve_VL_Liq2: (sizingData, uomResults, templateId) => {
    return subEquationFunc.Capacity_of_Selected_Valve_VL_Liq2(
      sizingData,
      uomResults,
      templateId
    );
  },
  Reynolds_Number_R_Liq2: (sizingData, uomResults, templateId) => {
    return subEquationFunc.Reynolds_Number_R_Liq2(
      sizingData,
      uomResults,
      templateId
    );
  },
  Reynolds_Number_Rmax_Liq2: (sizingData, uomResults, templateId) => {
    return subEquationFunc.Reynolds_Number_Rmax_Liq2(
      sizingData,
      uomResults,
      templateId
    );
  },
  Required_Orifice_Area_Areq_Liq2: (sizingData, uomResults, templateId) => {
    return subEquationFunc.Required_Orifice_Area_Areq_Liq2(
      sizingData,
      uomResults,
      templateId
    );
  },
  Mass_Critical_Flow_for_Noise_Calc_W_Equation: (
    sizingData,
    uomResults,
    templateId
  ) => {
    return subEquationFunc.Mass_Critical_Flow_for_Noise_Calc_W_Equation(
      sizingData,
      uomResults,
      templateId
    );
  },

  Reaction_Force_Equation_17a_VCID_18: (sizingData, uomResults, templateId) => {
    return subEquationFunc.Reaction_Force_Equation_17a_VCID_18(
      sizingData,
      uomResults,
      templateId
    );
  },
  Reaction_Force_Equation_17a_VCID_19: (sizingData, uomResults, templateId) => {
    return subEquationFunc.Reaction_Force_Equation_17a_VCID_19(
      sizingData,
      uomResults,
      templateId
    );
  },
  Reaction_Force_Equation_17a_VCID_20: (sizingData, uomResults, templateId) => {
    return subEquationFunc.Reaction_Force_Equation_17a_VCID_20(
      sizingData,
      uomResults,
      templateId
    );
  },
  Reaction_Force_Equation_17a_VCID_21: (sizingData, uomResults, templateId) => {
    return subEquationFunc.Reaction_Force_Equation_17a_VCID_21(
      sizingData,
      uomResults,
      templateId
    );
  },

  Reaction_Force_Equation_17b_VCID_18: (sizingData, uomResults, templateId) => {
    return subEquationFunc.Reaction_Force_Equation_17b_VCID_18(
      sizingData,
      uomResults,
      templateId
    );
  },
  Reaction_Force_Equation_17b_VCID_20: (sizingData, uomResults, templateId) => {
    return subEquationFunc.Reaction_Force_Equation_17b_VCID_20(
      sizingData,
      uomResults,
      templateId
    );
  },
  Reaction_Force_Equation_17b_VCID_19: (sizingData, uomResults, templateId) => {
    return subEquationFunc.Reaction_Force_Equation_17b_VCID_19(
      sizingData,
      uomResults,
      templateId
    );
  },
  Reaction_Force_Equation_17b_VCID_21: (sizingData, uomResults, templateId) => {
    return subEquationFunc.Reaction_Force_Equation_17b_VCID_21(
      sizingData,
      uomResults,
      templateId
    );
  },
  W_for_Noise_13D_8: (sizingData, uomResults, templateId) => {
    return subEquationFunc.W_for_Noise_13D_8(
      sizingData,
      uomResults,
      templateId
    );
  },
  W_for_Noise_13D_9: (sizingData, uomResults, templateId) => {
    return subEquationFunc.W_for_Noise_13D_9(
      sizingData,
      uomResults,
      templateId
    );
  },

  W_for_Noise_13b_69: (sizingData, uomResults, templateId) => {
    return subEquationFunc.W_for_Noise_13b_69(
      sizingData,
      uomResults,
      templateId
    );
  },

  W_for_Noise_13c_73: (sizingData, uomResults, templateId) => {
    return subEquationFunc.W_for_Noise_13c_73(
      sizingData,
      uomResults,
      templateId
    );
  },

  W_for_Noise_13c_74: (sizingData, uomResults, templateId) => {
    return subEquationFunc.W_for_Noise_13c_74(
      sizingData,
      uomResults,
      templateId
    );
  },

  Outlet_Static_Pressure_Po_16a_70: (sizingData, uomResults, templateId) => {
    return subEquationFunc.Outlet_Static_Pressure_Po_16a_70(
      sizingData,
      uomResults,
      templateId
    );
  },

  Outlet_Static_Pressure_Po_16a_71: (sizingData, uomResults, templateId) => {
    return subEquationFunc.Outlet_Static_Pressure_Po_16a_71(
      sizingData,
      uomResults,
      templateId
    );
  },

  Outlet_Static_Pressure_Po_16b_70: (sizingData, uomResults, templateId) => {
    return subEquationFunc.Outlet_Static_Pressure_Po_16b_70(
      sizingData,
      uomResults,
      templateId
    );
  },

  Outlet_Static_Pressure_Po_16b_71: (sizingData, uomResults, templateId) => {
    return subEquationFunc.Outlet_Static_Pressure_Po_16b_71(
      sizingData,
      uomResults,
      templateId
    );
  },

  Reaction_Force_for_Open_Discharge_Fr_17c_8: (sizingData, uomResults, templateId) => {
    return subEquationFunc.Reaction_Force_for_Open_Discharge_Fr_17c_8(
      sizingData,
      uomResults,
      templateId
    );
  },

  Reaction_Force_for_Open_Discharge_Fr_17c_9: (sizingData, uomResults, templateId) => {
    return subEquationFunc.Reaction_Force_for_Open_Discharge_Fr_17c_9(
      sizingData,
      uomResults,
      templateId
    );
  },

};

const FooterMapping = {
  Printed_On: (sizingData, uomResults, templateId) => {
    return footerFunc.Printed_On(sizingData, uomResults, templateId);
  },
  SiteName_Environment: (sizingData, uomResults, templateId, host) => {
    return footerFunc.SiteName_Environment(sizingData, uomResults, templateId);
  },
  Sizing_Id: (sizingData, uomResults, templateId) => {
    return footerFunc.Sizing_Id(sizingData, uomResults, templateId);
  },
  Config_Id: (sizingData, uomResults, templateId, sapData) => {
    return footerFunc.Config_Id(sizingData, uomResults, templateId, sapData);
  },
};

const SizingDataMapping = {
  Brand: (sizingData, uomResults, templateId) => {
    return sizingDataFunc.get_brand(sizingData, uomResults, templateId);
  },
  ValveType: (sizingData, uomResults, templateId) => {
    return sizingDataFunc.get_valve_type(sizingData, uomResults, templateId);
  },
  ModelId: (sizingData, uomResults, templateId) => {
    return sizingDataFunc.get_model_id(sizingData, uomResults, templateId);
  },
  Service: (sizingData, uomResults, templateId) => {
    return sizingDataFunc.get_service(sizingData, uomResults, templateId);
  },
  ServiceType: (sizingData, uomResults, templateId) => {
    return sizingDataFunc.get_service_type(sizingData, uomResults, templateId);
  },
  Code: (sizingData, uomResults, templateId) => {
    return sizingDataFunc.get_code(sizingData, uomResults, templateId);
  },
  CalcMethod: (sizingData, uomResults, templateId) => {
    return sizingDataFunc.get_CalcMethod(sizingData, uomResults, templateId);
  },
  PR: (sizingData, uomResults, templateId) => {
    return sizingDataFunc.get_PR(sizingData, uomResults, templateId);
  },
  TPR: (sizingData, uomResults, templateId) => {
    return sizingDataFunc.get_TPR(sizingData, uomResults, templateId);
  },
  Po: (sizingData, uomResults, templateId) => {
    return sizingDataFunc.get_Po(sizingData, uomResults, templateId);
  },
  OverPressurePer: (sizingData, uomResults, templateId) => {
    return sizingDataFunc.get_over_pressure_per(
      sizingData,
      uomResults,
      templateId
    );
  },
  KaDataset: (sizingData, uomResults, templateId) => {
    return sizingDataFunc.get_ka_data_set(sizingData, uomResults, templateId);
  },
  IsLiquid2: (sizingData, uomResults, templateId) => {
    return sizingDataFunc.get_is_liquid_2(sizingData, uomResults, templateId);
  },
  MassFlowOrVolumetric: (sizingData, uomResults, templateId) => {
    return sizingDataFunc.massFlowOrVolumentric(
      sizingData,
      uomResults,
      templateId
    );
  },
  PressureCheckBox: (sizingData, uomResults, templateId) => {
    return sizingDataFunc.pressureCheckBox(sizingData, uomResults, templateId);
  },
  VacuumCheckBox: (sizingData, uomResults, templateId) => {
    return sizingDataFunc.vacuumCheckBox(sizingData, uomResults, templateId);
  },
  get_DisplayUnit: (sizingData, uomResults, templateId) => {
    return sizingDataFunc.get_DisplayUnit(sizingData, uomResults, templateId);
  },
  prefDistanceFromValve: (sizingData, uomResults, templateId) => {
    return sizingDataFunc.prefDistanceFromValve(
      sizingData,
      uomResults,
      templateId
    );
  },
  SuperCriticalCFact_ksc: (sizingData, uomResults, templateId) => {
    return sizingDataFunc.SuperCriticalCFact_ksc(
      sizingData,
      uomResults,
      templateId
    );
  },
};

const reportMappingFunc = (
  sizingData,
  mappingJSON,
  uomResults,
  templateId,
  host,
  sapData
) => {
  const mappedData = {};
  Object.keys(mappingJSON).forEach((key) => {
    if (sapData) {
      mappedData[key] = mappingJSON[key](sizingData, uomResults, templateId, sapData);
    } else {
      mappedData[key] = mappingJSON[key](sizingData, uomResults, templateId);
    }
  });
  return mappedData;
};

const TagInfoMapping = {
  TagNumber: (sizingData, uomResults, templateId) => {
    return tagInfoFunc.TagNumber(sizingData, uomResults, templateId);
  },
  SizingID: (sizingData, uomResults, templateId) => {
    return tagInfoFunc.SizingId(sizingData, uomResults, templateId);
  },
  ModelId: (sizingData, uomResults, templateId) => {
    return sizingDataFunc.get_model_id(sizingData, uomResults, templateId);
  },
  Revision: (sizingData, uomResults, templateId) => {
    return tagInfoFunc.Revision(sizingData, uomResults, templateId);
  },
  LastModified: (sizingData, uomResults, templateId) => {
    return tagInfoFunc.LastModified(sizingData, uomResults, templateId);
  },
  PreparedBy: (sizingData, uomResults, templateId) => {
    return tagInfoFunc.PreparedBy(sizingData, uomResults, templateId);
  },
  CheckedBy: (sizingData, uomResults, templateId) => {
    return tagInfoFunc.CheckedBy(sizingData, uomResults, templateId);
  },
  ApprovedBy: (sizingData, uomResults, templateId) => {
    return tagInfoFunc.ApprovedBy(sizingData, uomResults, templateId);
  }
};

const ValveSizingInformationMapping = {
  ValveType: (sizingData, uomResults, templateId) => {
    return valveSizingInformationFunc.ValveType(sizingData, uomResults, templateId);
  },
  ValveSize: (sizingData, uomResults, templateId) => {
    return valveSizingInformationFunc.ValveSize(sizingData, uomResults, templateId);
  },
  ValveTypeSize: (sizingData, uomResults, templateId) => {
    return valveSizingInformationFunc.ValveTypeSize(sizingData, uomResults, templateId);
  },
  IsCustomConfiguration: (sizingData, uomResults, templateId) => {
    return valveSizingInformationFunc.IsCustomConfiguration(sizingData, uomResults, templateId);
  },
  PartNumber: (sizingData, uomResults, templateId, sapData) => {
    return valveSizingInformationFunc.PartNumber(sizingData, uomResults, templateId, sapData);
  },
  Valve_Model_Number: (sizingData, uomResults, templateId) => {
    return subSummaryFunc.Valve_Model_Number(
      sizingData,
      uomResults,
      templateId
    );
  },
  QuantityToOrder: (sizingData, uomResults, templateId, sapData) => {
    return valveSizingInformationFunc.QuantityToOrder(sizingData, uomResults, templateId, sapData);
  },
  MaxPressureFlowCapacityLabel: (sizingData, uomResults, templateId) => {
    return valveSizingInformationFunc.MaxPressureFlowCapacityLabel(sizingData, uomResults, templateId);
  },
  MaxPressureFlowCapacity: (sizingData, uomResults, templateId) => {
    return valveSizingInformationFunc.MaxPressureFlowCapacity(sizingData, uomResults, templateId);
  },
  MaxVacuumFlowCapacityLabel: (sizingData, uomResults, templateId) => {
    return valveSizingInformationFunc.MaxVacuumFlowCapacityLabel(sizingData, uomResults, templateId);
  },
  MaxVacuumFlowCapacity: (sizingData, uomResults, templateId) => {
    return valveSizingInformationFunc.MaxVacuumFlowCapacity(sizingData, uomResults, templateId);
  },
  ERPCode: (sizingData, uomResults, templateId, sapData) => {
    return valveSizingInformationFunc.ERPCode(sizingData, uomResults, templateId, sapData);
  }
};

const SpecificTankDataMapping = {
  PressureFluidLabel: (sizingData, uomResults, templateId) => {
    return specificTankDataFunc.PressureFluidLabel(sizingData, uomResults, templateId);
  },
  PressureFluid: (sizingData, uomResults, templateId) => {
    return specificTankDataFunc.PressureFluid(sizingData, uomResults, templateId);
  },
  PressureSetPointLabel: (sizingData, uomResults, templateId) => {
    return specificTankDataFunc.PressureSetPointLabel(sizingData, uomResults, templateId);
  },
  PressureSetPoint: (sizingData, uomResults, templateId) => {
    return specificTankDataFunc.PressureSetPoint(sizingData, uomResults, templateId);
  },
  AllowedOverPressureLabel: (sizingData, uomResults, templateId) => {
    return specificTankDataFunc.AllowedOverPressureLabel(sizingData, uomResults, templateId);
  },
  AllowedOverPressure: (sizingData, uomResults, templateId) => {
    return specificTankDataFunc.AllowedOverPressure(sizingData, uomResults, templateId);
  },
  PressureFlowRateLabel: (sizingData, uomResults, templateId) => {
    return specificTankDataFunc.PressureFlowRateLabel(sizingData, uomResults, templateId);
  },
  PressureFlowRate: (sizingData, uomResults, templateId) => {
    return specificTankDataFunc.PressureFlowRate(sizingData, uomResults, templateId);
  },
  DifferentialPressureLabel: (sizingData, uomResults, templateId) => {
    return specificTankDataFunc.DifferentialPressureLabel(sizingData, uomResults, templateId);
  },
  DifferentialPressure: (sizingData, uomResults, templateId) => {
    return specificTankDataFunc.DifferentialPressure(sizingData, uomResults, templateId);
  },
  VacuumFluidLabel: (sizingData, uomResults, templateId) => {
    return specificTankDataFunc.VacuumFluidLabel(sizingData, uomResults, templateId);
  },
  VacuumFluid: (sizingData, uomResults, templateId) => {
    return specificTankDataFunc.VacuumFluid(sizingData, uomResults, templateId);
  },
  VacuumSetPointLabel:  (sizingData, uomResults, templateId) => {
    return specificTankDataFunc.VacuumSetPointLabel(sizingData, uomResults, templateId);
  },
  VacuumSetPoint: (sizingData, uomResults, templateId) => {
    return specificTankDataFunc.VacuumSetPoint(sizingData, uomResults, templateId);
  },
  AllowedUnderPressureLabel: (sizingData, uomResults, templateId) => {
    return specificTankDataFunc.AllowedUnderPressureLabel(sizingData, uomResults, templateId);
  },
  AllowedUnderPressure: (sizingData, uomResults, templateId) => {
    return specificTankDataFunc.AllowedUnderPressure(sizingData, uomResults, templateId);
  },
  VacuumFlowRateLabel: (sizingData, uomResults, templateId) => {
    return specificTankDataFunc.VacuumFlowRateLabel(sizingData, uomResults, templateId);
  },
  VacuumFlowRate: (sizingData, uomResults, templateId) => {
    return specificTankDataFunc.VacuumFlowRate(sizingData, uomResults, templateId);
  },
  DifferentialVacuumLabel: (sizingData, uomResults, templateId) => {
    return specificTankDataFunc.DifferentialVacuumLabel(sizingData, uomResults, templateId);
  },
  DifferentialVacuum: (sizingData, uomResults, templateId) => {
    return specificTankDataFunc.DifferentialVacuum(sizingData, uomResults, templateId);
  }
};

const sapDataMapping = {
  erpTable: (sizingData, uomResults, templateId, sapData) => {
    return valveSizingInformationFunc.erpTable(sizingData, uomResults, templateId, sapData);
  }
};

const ValveSummaryMapping = {
  TagNumber: (sizingData, uomResults, templateId) => {
    return tagInfoFunc.TagNumber(sizingData, uomResults, templateId);
  },
  Service: (sizingData, uomResults, templateId) => {
    return sizingDataFunc.get_service(sizingData, uomResults, templateId);
  },
  PIDNumber: (sizingData, uomResults, templateId) => {
    return valveSummaryFunc.PIDNumber(sizingData, uomResults, templateId);
  },
  LineNumber: (sizingData, uomResults, templateId) => {
    return valveSummaryFunc.LineNumber(sizingData, uomResults, templateId);
  },
  EquipmentNumber: (sizingData, uomResults, templateId) => {
    return valveSummaryFunc.EquipmentNumber(sizingData, uomResults, templateId);
  },
  ModelId: (sizingData, uomResults, templateId) => {
    return sizingDataFunc.get_model_id(sizingData, uomResults, templateId);
  },
  Valve_Model_Number: (sizingData, uomResults, templateId) => {
    return subSummaryFunc.Valve_Model_Number(
      sizingData,
      uomResults,
      templateId
    );
  },
  Quantity: (sizingData, uomResults, templateId, sapData) => {
    return subSummaryFunc.Quantity(sizingData, uomResults, templateId, sapData);
  },
  ValveModelNumber: (sizingData, uomResults, templateId) => {
      return subSummaryFunc.Valve_Model_Number(
        sizingData,
        uomResults,
        templateId
      );
  },
  Brand: (sizingData, uomResults, templateId) => {
    return sizingDataFunc.get_brand(sizingData, uomResults, templateId);
  },
  InletSize: (sizingData, uomResults, templateId, sapData) => {
    return valveSummaryFunc.InletSize(sizingData, uomResults, templateId, sapData);
  },
  InletConnection: (sizingData, uomResults, templateId, sapData) => {
    return valveSummaryFunc.InletConnection(sizingData, uomResults, templateId, sapData);
  },
  InletRating: (sizingData, uomResults, templateId, sapData) => {
    return valveSummaryFunc.InletRating(sizingData, uomResults, templateId, sapData);
  },
  InletFinish: (sizingData, uomResults, templateId, sapData) => {
    return valveSummaryFunc.InletFinish(sizingData, uomResults, templateId, sapData);
  },
  OutletSize: (sizingData, uomResults, templateId, sapData) => {
    return valveSummaryFunc.OutletSize(sizingData, uomResults, templateId, sapData);
  },
  OutletConnection: (sizingData, uomResults, templateId, sapData) => {
    return valveSummaryFunc.OutletConnection(sizingData, uomResults, templateId, sapData);
  },
  OutletRating: (sizingData, uomResults, templateId, sapData) => {
    return valveSummaryFunc.OutletRating(sizingData, uomResults, templateId, sapData);
  },
  OutletFinish: (sizingData, uomResults, templateId, sapData) => {
    return valveSummaryFunc.OutletFinish(sizingData, uomResults, templateId, sapData);
  },
  ConnectionsStandard: (sizingData, uomResults, templateId, sapData) => {
    return valveSummaryFunc.ConnectionsStandard(sizingData, uomResults, templateId, sapData);
  },
};
const ValveDimesionsMapping = {
  Ain: (sizingData, uomResults, templateId, sapData) => {
    return valveDimensionsFunc.Ain(sizingData, uomResults, templateId, sapData);
  },
  Bin: (sizingData, uomResults, templateId, sapData) => {
    return valveDimensionsFunc.Bin(sizingData, uomResults, templateId, sapData);
  },
  Cin: (sizingData, uomResults, templateId, sapData) => {
    return valveDimensionsFunc.Cin(sizingData, uomResults, templateId, sapData);
  },
  Din: (sizingData, uomResults, templateId, sapData) => {
    return valveDimensionsFunc.Din(sizingData, uomResults, templateId, sapData);
  },
  Ein: (sizingData, uomResults, templateId, sapData) => {
    return valveDimensionsFunc.Ein(sizingData, uomResults, templateId, sapData);
  },
  Fin: (sizingData, uomResults, templateId, sapData) => {
    return valveDimensionsFunc.Fin(sizingData, uomResults, templateId, sapData);
  },
  Gin: (sizingData, uomResults, templateId, sapData) => {
    return valveDimensionsFunc.Gin(sizingData, uomResults, templateId, sapData);
  },
  Hin: (sizingData, uomResults, templateId, sapData) => {
    return valveDimensionsFunc.Hin(sizingData, uomResults, templateId, sapData);
  },
  Amm: (sizingData, uomResults, templateId, sapData) => {
    return valveDimensionsFunc.Amm(sizingData, uomResults, templateId, sapData);
  },
  Bmm: (sizingData, uomResults, templateId, sapData) => {
    return valveDimensionsFunc.Bmm(sizingData, uomResults, templateId, sapData);
  },
  Cmm: (sizingData, uomResults, templateId, sapData) => {
    return valveDimensionsFunc.Cmm(sizingData, uomResults, templateId, sapData);
  },
  Dmm: (sizingData, uomResults, templateId, sapData) => {
    return valveDimensionsFunc.Dmm(sizingData, uomResults, templateId, sapData);
  },
  Emm: (sizingData, uomResults, templateId, sapData) => {
    return valveDimensionsFunc.Emm(sizingData, uomResults, templateId, sapData);
  },
  Fmm: (sizingData, uomResults, templateId, sapData) => {
    return valveDimensionsFunc.Fmm(sizingData, uomResults, templateId, sapData);
  },
  Gmm: (sizingData, uomResults, templateId, sapData) => {
    return valveDimensionsFunc.Gmm(sizingData, uomResults, templateId, sapData);
  },
  Hmm: (sizingData, uomResults, templateId, sapData) => {
    return valveDimensionsFunc.Hmm(sizingData, uomResults, templateId, sapData);
  },
  Wtlbm: (sizingData, uomResults, templateId, sapData) => {
    return valveDimensionsFunc.Wtlbm(sizingData, uomResults, templateId, sapData);
  },
  Wtkg: (sizingData, uomResults, templateId, sapData) => {
    return valveDimensionsFunc.Wtkg(sizingData, uomResults, templateId, sapData);
  },
  StaticDrawingURL: (sizingData, uomResults, templateId, sapData) => {
    return valveDimensionsFunc.StaticDrawingURL(sizingData, uomResults, templateId, sapData);
  }
};
const NotesMapping = {
  TagNotes: (sizingData, uomResults, templateId) => {
    return notesFunc.TagNotes(sizingData, uomResults, templateId);
  },
  DimensionNotes: (sizingData, uomResults, templateId) => {
    return notesFunc.DimensionNotes(sizingData, uomResults, templateId);
  }
};

module.exports = {
  HeaderMapping,
  SubSummaryMapping,
  SubInputMapping,
  SubEquationMapping,
  FooterMapping,
  SizingDataMapping,
  reportMappingFunc,
  TagInfoMapping,
  SpecificTankDataMapping,
  ValveSizingInformationMapping,
  sapDataMapping,
  ValveSummaryMapping,
  ValveDimesionsMapping,
  NotesMapping
};