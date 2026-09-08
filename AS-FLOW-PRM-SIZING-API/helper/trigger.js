const axios = require("axios");

const generateNoiseReqPayload = (sizingData) => {
  const noiseReqPayload = {
    Brand: sizingData.Brand.Value_Seven_Decimal,
    CalculatedMassFlow_W:
      sizingData.KaDataset.Value === "ASME"
        ? sizingData.Mass_Flow_for_Noise_Calc_W.Value
        : sizingData.NoisepayloadW_Api.Value,
    P1: sizingData.Inlet_Relieving_Pressure_P1.Value_Seven_Decimal,
    U: sizingData.Outlet_Velocity_u.Value_Seven_Decimal, // velocity in the reports popup
    ValveTypeCode: sizingData.ValveType.Value_Seven_Decimal,
    calcMethod: sizingData.CalcMethod.Value_Seven_Decimal,
    constant_N7:
      sizingData.CalcMethod.Value_Seven_Decimal === "Metric" ? 1.1552 : 0.29354,
    constant_N8:
      sizingData.CalcMethod.Value_Seven_Decimal === "Metric" ? 30 : 100,
    distance_r: sizingData.Distance_from_Valve_noise_r.Value_Eq_Seven_Decimal,
    fluidType:
      sizingData.ServiceType.Value_Seven_Decimal === "2-Phase"
        ? "2Phase"
        : sizingData.ServiceType.Value_Seven_Decimal,
    molWeight_M: sizingData.Molecular_Mass_M.Value_Seven_Decimal
      ? sizingData.Molecular_Mass_M.Value_Seven_Decimal
      : "",
    pressureRatio_PR: sizingData.Absolute_Pressure_Ratio_PR.Value_Seven_Decimal,
    ratioOfSpHeat_k: sizingData.Ratio_of_Specific_Heats_k.Value_Seven_Decimal
      ? sizingData.Ratio_of_Specific_Heats_k.Value_Seven_Decimal
      : "",
    relTemp_T: sizingData.Relieving_Temperature_T.Value_Eq_Seven_Decimal,
    sizingStd: sizingData.Code.Value_Seven_Decimal.includes("API 2000")
      ? "API 2000"
      : sizingData.Code.Value_Seven_Decimal.includes("ISO 4126")
      ? "ISO 4126"
      : sizingData.Sizing_Std.Value_Seven_Decimal,
  };
  console.log({ noiseReqPayload });
  return noiseReqPayload;
};
const calculateNoiseLp = async (sizingData) => {
  try {
    const noiseReqPayload = generateNoiseReqPayload(sizingData);
    let noiseLpRes = await axios({
      method: "POST",
      url: `${process.env.RULE_ENGIN_URL}/calc/noise/otherflows`,
      headers: {
        Authorization: `Bearer ${process.env.AUTH_TOKEN}`,
      },
      data: noiseReqPayload,
    });
    let noisePayloadObj = noiseLpRes.data.data;
    console.log({ noisePayloadObj });
    return noisePayloadObj;
  } catch (error) {
    console.log(error);
    return null;
  }
};

const calculateAo = (Do) => {
  return (Math.PI * Do * Do) / 4;
};

const generatePoReqPayload = (sizingData, Ao) => {
  const PoPayload = {
    selOrificeArea_A: sizingData.Orifice_Area_A.Value_Eq_Seven_Decimal,
    gasConstant_C: sizingData.Gas_Constant_C.Value_Seven_Decimal,
    flowCoeff_Kz:
      sizingData.KaDataset.Value_Seven_Decimal === "ASME"
        ? sizingData.Discharge_Coefficient_Kd.Value_Seven_Decimal
        : sizingData.KaDataset.Value_Seven_Decimal === "API"
        ? sizingData.Discharge_Coefficient_API_KAPI.Value_Seven_Decimal
        : "",
    inletPressure_P1:
      sizingData.Inlet_Relieving_Pressure_P1.Value_Seven_Decimal,
    ruptureDiscCFactor_Kc: sizingData.Rupture_Disc_CCF_Kc.Value_Seven_Decimal,
    outletDiameter_Do: sizingData.Outlet_Diameter_Do.Value_Eq_Seven_Decimal, //convert to cm for metric
    ratioOfSpHeat_k: sizingData.Ratio_of_Specific_Heats_k.Value_Seven_Decimal
      ? sizingData.Ratio_of_Specific_Heats_k.Value_Seven_Decimal
      : "",
    compressibility_z: sizingData.Compressibility_Z.Value_Seven_Decimal
      ? sizingData.Compressibility_Z.Value_Seven_Decimal
      : "",
    atmPressure_Patm:
      sizingData.Atmospheric_Pressure_Patm.Value_Eq_Seven_Decimal,
    outletArea_Ao: Ao,
    constant_N21:
      sizingData.CalcMethod.Value_Seven_Decimal === "Metric" ? 1914.3 : 823,
    constant_N20:
      sizingData.CalcMethod.Value_Seven_Decimal === "Metric"
        ? 0.018120214
        : 0.027635555,
    calcMethod: sizingData.CalcMethod.Value_Seven_Decimal,
    napierCFact: sizingData.Napier_Correction_Factor_Kn.Value_Seven_Decimal,
    superheatcfact:
      sizingData.Superheat_Correction_Factor_Ksh.Value_Seven_Decimal,
    "Supercritical CFact":
      sizingData.SuperCriticalCFact_ksc.Value_Seven_Decimal,
    StagnationEnthalpyAtInlet:
      sizingData.Inlet_Stagnation_Enthalpy_ho.Value_Seven_Decimal,
    "CalculatedMaxMass Flow":
      sizingData.KaDataset.Value_Seven_Decimal === "ASME"
        ? sizingData.Mass_Flow_for_Noise_Calc_W.Value_Seven_Decimal
        : sizingData.KaDataset.Value_Seven_Decimal === "API"
        ? sizingData.Volumetric_Critical_Flow_V.Value_Seven_Decimal
        : "",
    "Gas/VaporMassFracAtExitCon":
      sizingData.Outlet_Gas_Mass_Fraction_x2.Value_Seven_Decimal === null
        ? 0
        : sizingData.Outlet_Gas_Mass_Fraction_x2.Value_Seven_Decimal,
    "Gas/VaporDenAtExitCon": sizingData.Gas_Vapor_Density_at_Outlet_rhog2
      .Value_Seven_Decimal
      ? sizingData.Gas_Vapor_Density_at_Outlet_rhog2.Value_Seven_Decimal
      : "",
    LiqDenAtExitCon: sizingData.Liquid_Density_at_Inlet_rhol1
      .Value_Seven_Decimal
      ? sizingData.Liquid_Density_at_Inlet_rhol1.Value_Seven_Decimal
      : "",
    ViscosityCorFact:
      sizingData.Viscosity_Correction_Factor_Kv.Value_Seven_Decimal,
    sizingStd: sizingData.Code.Value_Seven_Decimal.includes("API 2000")
      ? "API 2000"
      : sizingData.Code.Value_Seven_Decimal.includes("ISO 4126")
      ? "ISO 4126"
      : "API 520",
    fluidType:
      sizingData.Fluid_State_at_Inlet.Value_Seven_Decimal === "2-Phase"
        ? "2Phase"
        : sizingData.Fluid_State_at_Inlet.Value_Seven_Decimal,
    Brand: sizingData.Brand.Value_Seven_Decimal,
    valveTypeCode: sizingData.ValveType.Value_Seven_Decimal
      ? sizingData.ValveType.Value_Seven_Decimal
      : -1,
    workFlow: workFlow(sizingData),
    maxMassFlow:
      sizingData.KaDataset.Value_Seven_Decimal === "ASME"
        ? sizingData.Mass_Flow_for_Noise_Calc_W.Value_Seven_Decimal //wact
        : sizingData.KaDataset.Value_Seven_Decimal === "API"
        ? sizingData.Volumetric_Critical_Flow_V.Value_Seven_Decimal //wrtd
        : "",
    constantSuperimposed:
      sizingData.Superimposed_Back_Pressure_Absolute_PU.Value_Seven_Decimal,
    variableSuperimposed:
      sizingData.Variable_Superimposed_BP_Psiv.Value_Seven_Decimal,
    P2: sizingData.Outlet_Pressure_P2.Value_Seven_Decimal,
    ActualFlowCoeff:
      sizingData.KaDataset.Value_Seven_Decimal === "ASME"
        ? sizingData.Discharge_Coefficient_acutal_Kd.Value_Seven_Decimal
        : sizingData.KaDataset.Value_Seven_Decimal === "API"
        ? sizingData.Discharge_Coefficient_API_KAPI.Value_Seven_Decimal
        : "",
    u: sizingData.Outlet_Velocity_u
      ? sizingData.Outlet_Velocity_u.Value_Seven_Decimal
      : 0,
    constant_N34:
      sizingData.CalcMethod.Value_Seven_Decimal === "Metric"
        ? 0.003225
        : 0.00245,
  };
  console.log({ PoPayload });
  return PoPayload;
};
const outletStaticPressure = async (sizingData, Ao) => {
  try {
    const PoReqPayload = generatePoReqPayload(sizingData, Ao);
    let PoRes = await axios({
      method: "POST",
      url: `${process.env.RULE_ENGIN_URL}/calculate/Po`,
      headers: {
        Authorization: `Bearer ${process.env.AUTH_TOKEN}`,
      },
      data: PoReqPayload,
    });

    let Po = PoRes.data.data["P_o"] ? PoRes.data.data["P_o"].toFixed(3) : 0;
    console.log({ Po });
    return Po ? Po : null;
  } catch (error) {
    console.log(error);
    return null;
  }
};

const workFlow = (sizingData) => {
  let workFLowName = "";
  if (
    sizingData.Fluid_State_at_Inlet.Value_Seven_Decimal == "2-Phase" &&
    sizingData.Code.Value_Seven_Decimal ==
      "Mass Flux from Direct Integration (C.2.1)"
  ) {
    workFLowName = "api520p1ed9massfluxc21";
  } else if (
    sizingData.Fluid_State_at_Inlet.Value_Seven_Decimal == "2-Phase" &&
    sizingData.Code.Value_Seven_Decimal ==
      "2-Phase, Flashing / Non-Flashing 2-Phase (C.2.2)"
  ) {
    workFLowName = "api520p1ed9flashingc22";
  } else if (
    sizingData.Fluid_State_at_Inlet.Value_Seven_Decimal == "2-Phase" &&
    sizingData.Code.Value_Seven_Decimal ==
      "Sub-cooled / Saturated Liquid (C.2.3)"
  ) {
    workFLowName = "api520p1ed9subcoolsatliquidc23";
  } else if (
    sizingData.Code.Value_Seven_Decimal === "Saturated Water" &&
    sizingData.Fluid_State_at_Inlet.Value_Seven_Decimal === "2-Phase"
  ) {
    workFLowName = "asmeapp11saturatedwater";
  } else if (
    sizingData.Code.Value_Seven_Decimal === "Separated Flow Method" &&
    sizingData.Fluid_State_at_Inlet.Value_Seven_Decimal === "2-Phase"
  ) {
    workFLowName = "api520p1ed6sepflowmethod";
  } else if (
    sizingData.Fluid_State_at_Inlet.Value_Seven_Decimal === "2-Phase" &&
    sizingData.Code.Value_Seven_Decimal ===
      "Flashing Liquid + lts Vapor (D.2.1)"
  ) {
    workFLowName = "api520p1ed7flashliqVapd21";
  } else if (
    sizingData.Fluid_State_at_Inlet.Value_Seven_Decimal === "2-Phase" &&
    sizingData.Code.Value_Seven_Decimal === "Non Flashing Liquid + Gas (D.2.1)"
  ) {
    workFLowName = "api520p1ed7nonflashliqgasd21";
  } else if (
    sizingData.Fluid_State_at_Inlet.Value_Seven_Decimal === "2-Phase" &&
    sizingData.Code.Value_Seven_Decimal ===
      "Sub-cooled / Saturated Liquid (D.2.2)"
  ) {
    workFLowName = "api520p1ed7subcoolsatliqd22";
  } else if (
    sizingData.Fluid_State_at_Inlet.Value_Seven_Decimal === "2-Phase" &&
    sizingData.Code.Value_Seven_Decimal ===
      "Flashing Liquid + Vapor + Gas (D.2.3)"
  ) {
    workFLowName = "api520p1ed7flashliqvapgasd23";
  } else {
    workFLowName = "";
  }

  return workFLowName;
};

const calculateReactionForce = async (sizingData, Po, Ao) => {
  try {
    const reactionForcePayload = {
      selOrificeArea_A: sizingData.Orifice_Area_A.Value_Eq_Seven_Decimal,
      gasConstant_C: sizingData.Gas_Constant_C.Value_Seven_Decimal,
      flowCoeff_Kz:
        sizingData.KaDataset.Value_Seven_Decimal === "ASME"
          ? sizingData.Discharge_Coefficient_Kd.Value_Seven_Decimal
          : sizingData.KaDataset.Value_Seven_Decimal === "API"
          ? sizingData.Discharge_Coefficient_API_KAPI.Value_Seven_Decimal
          : "",
      inletPressure_P1:
        sizingData.Inlet_Relieving_Pressure_P1.Value_Seven_Decimal,
      ruptureDiscCFactor_Kc: sizingData.Rupture_Disc_CCF_Kc.Value_Seven_Decimal,
      outletDiameter_Do: sizingData.Outlet_Diameter_Do.Value_Eq_Seven_Decimal, //convert to cm for metric,
      ratioOfSpHeat_k: sizingData.Ratio_of_Specific_Heats_k.Value_Seven_Decimal
        ? sizingData.Ratio_of_Specific_Heats_k.Value_Seven_Decimal
        : "",
      compressibility_z: sizingData.Compressibility_Z.Value_Seven_Decimal
        ? sizingData.Compressibility_Z.Value_Seven_Decimal
        : "",
      atmPressure_Patm:
        sizingData.Atmospheric_Pressure_Patm.Value_Seven_Decimal,
      outletArea_Ao: Ao,
      outletStaticPres_Po: Po,
      constant_N34:
        sizingData.CalcMethod.Value_Seven_Decimal === "Metric"
          ? 0.003225
          : 0.00245,
      calcMethod: sizingData.CalcMethod.Value_Seven_Decimal,
      napierCFact: sizingData.Napier_Correction_Factor_Kn.Value_Seven_Decimal,
      superheatcfact:
        sizingData.Superheat_Correction_Factor_Ksh.Value_Seven_Decimal,
      "Supercritical CFact":
        sizingData.SuperCriticalCFact_ksc.Value_Seven_Decimal,
      StagnationEnthalpyAtInlet:
        sizingData.Inlet_Stagnation_Enthalpy_ho.Value_Eq_Seven_Decimal,
      "CalculatedMaxMass Flow":
        sizingData.KaDataset.Value_Seven_Decimal === "ASME"
          ? // ? sizingData.wact
            sizingData.Mass_Flow_for_Noise_Calc_W.Value_Seven_Decimal
          : sizingData.KaDataset.Value_Seven_Decimal === "API"
          ? sizingData.Volumetric_Critical_Flow_V.Value_Seven_Decimal
          : // ? sizingData.wrtd
            "",
      "Gas/VaporMassFracAtExitCon":
        sizingData.Outlet_Gas_Mass_Fraction_x2.Value_Seven_Decimal === null
          ? 0
          : sizingData.Outlet_Gas_Mass_Fraction_x2.Value_Seven_Decimal,
      "Gas/VaporDenAtExitCon": sizingData.Gas_Vapor_Density_at_Outlet_rhog2
        .Value_Seven_Decimal
        ? sizingData.Gas_Vapor_Density_at_Outlet_rhog2.Value_Seven_Decimal
        : "",
      LiqDenAtExitCon: sizingData.Liquid_Density_at_Inlet_rhol1
        .Value_Seven_Decimal
        ? sizingData.Liquid_Density_at_Inlet_rhol1.Value_Seven_Decimal
        : "",
      ViscosityCorFact:
        sizingData.Viscosity_Correction_Factor_Kv.Value_Seven_Decimal,
      sizingStd: sizingData.Code.Value_Seven_Decimal.includes("API 2000")
        ? "API 2000"
        : sizingData.Code.Value_Seven_Decimal.includes("ISO 4126")
        ? "ISO 4126"
        : "API 520",
      fluidType:
        sizingData.Fluid_State_at_Inlet.Value_Seven_Decimal === "2-Phase"
          ? "2Phase"
          : sizingData.Fluid_State_at_Inlet.Value_Seven_Decimal,
      Brand: sizingData.Brand.Value_Seven_Decimal,
      valveTypeCode: sizingData.ValveType.Value_Seven_Decimal
        ? sizingData.ValveType.Value_Seven_Decimal
        : -1,
      workFlow: workFlow(sizingData),
      maxMassFlow:
        sizingData.KaDataset.Value_Seven_Decimal === "ASME"
          ? sizingData.Mass_Flow_for_Noise_Calc_W.Value_Seven_Decimal //wact
          : sizingData.KaDataset.Value_Seven_Decimal === "API"
          ? sizingData.Volumetric_Critical_Flow_V.Value_Seven_Decimal //wrtd
          : "",
      constantSuperimposed:
        sizingData.Superimposed_Back_Pressure_Absolute_PU.Value_Seven_Decimal,
      variableSuperimposed:
        sizingData.Variable_Superimposed_BP_Psiv.Value_Seven_Decimal,
      P2: sizingData.Outlet_Pressure_P2.Value_Seven_Decimal,
      ActualFlowCoeff:
        sizingData.KaDataset.Value_Seven_Decimal === "ASME"
          ? sizingData.Discharge_Coefficient_acutal_Kd.Value_Seven_Decimal
          : sizingData.KaDataset.Value_Seven_Decimal === "API"
          ? sizingData.Discharge_Coefficient_API_KAPI.Value_Seven_Decimal
          : "",
      u: sizingData.Outlet_Velocity_u.velocity
        ? sizingData.Outlet_Velocity_u.velocity
        : "",
    };

    let reactionForceRes = await axios({
      method: "POST",
      url: `${process.env.RULE_ENGIN_URL}/calculate/reactionforce`,
      headers: {
        Authorization: `Bearer ${process.env.AUTH_TOKEN}`,
      },
      data: reactionForcePayload,
    });
    let reactionForce = reactionForceRes.data.data["F_R"]
      ? reactionForceRes.data.data["F_R"].toFixed(3)
      : 0;
    console.log({ reactionForce });
    return reactionForce && reactionForce > 0 ? reactionForce : null;
  } catch (error) {
    console.log(error);
    return null;
  }
};

module.exports = async (sizingData) => {
  const noiseResponse = await calculateNoiseLp(sizingData);
  const AoResponse = calculateAo(
    sizingData.Outlet_Diameter_Do.Value_Seven_Decimal
  );
  const pressureResponse = await outletStaticPressure(sizingData, AoResponse);
  const FrResponse = await calculateReactionForce(
    sizingData,
    pressureResponse,
    AoResponse
  );
  console.log({ noiseResponse, AoResponse, pressureResponse, FrResponse });
  return {
    noiseResponse,
    pressureResponse,
    FrResponse,
    AoResponse,
  };
};
