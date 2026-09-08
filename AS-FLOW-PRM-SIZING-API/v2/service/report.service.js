//alltable data consolidated colums
//Report detail api data
const axios = require("axios");
// const {
//   get_sizing_std,
// } = require("../helper/reportsDataMapper/commonMethodsReports");
// const sizingService = require("../service/sizing.service");
// const {
//   convertUOM,
// } = require("../helper/reportsDataMapper/dataMapperCommonMethods");

const getSizingReportData = async (db, sizingId) => {
  // console.log("sizingId checkkkkkkkkkk", sizingId);
  try {
    let data = await db
      .from("sizing_data")
      .select(
        "sizing_data.sd_id",
        "sizing_data.sizing_id",
        "sizing_data.sizing_basis",
        "sizing_data.product_type",
        "sizing_data.service_type",
        "sizing_data.code",
        "sizing_data.k_a_dataset",
        "sizing_data.model",
        "sizing_data.service",
        "sizing_data.tag_num",
        "sizing_data.2Phase_API_DisCoeff",
        "sizing_data.model_id",
        "sizing_data.user_email",
        "sizing_data.brand",
        "sizing_data.valve_type",
        "sizing_data.size_orifice",
        "sizing_data.a",
        "sizing_data.aapi",
        "sizing_data.areq",
        "sizing_data.k",
        "sizing_data.kapi",
        "sizing_data.kb",
        "sizing_data.kd",
        "sizing_data.kmax",
        "sizing_data.vact",
        "sizing_data.valve_function",
        "sizing_data.valve_orifice",
        "sizing_data.vrtd",
        "sizing_data.wact",
        "sizing_data.wrtd",
        "sizing_data.newv",
        "sizing_data.kdr",
        "sizing_data.qm",
        "sizing_data.r",
        "sizing_data.rmax",
        "sizing_data.reports_general",
        "sizing_data.b",
        "sizing_data.m",
        "sizing_data.quantity",
        "sizing_data.K2phi",
        "sizing_data.p_id",
        "sizing_data.inlet_size",
        "sizing_data.outlet_size",
        "sizing_data.modeldata_gas",
        "sizing_data.modeldata_liquid",
        "sizing_data.modeldata_liquid2",
        "sizing_data.tp",
        "sizing_data.e",
        "sizing_data.aV",
        "sizing_data.kmaxV",
        "sizing_data.tpV",
        "sizing_data.eV",
        "sizing_data.Kbw",
        "sizing_data.Qm",
        "sizing_data.b",
        "sizing_data.m",
        "sizing_data.VmaxP",
        "sizing_data.VmaxV",
        "sizing_data.WmaxP",
        "sizing_data.WmaxV",
        "sizing_data.calc_method",
        "sizing_data.display_unit_system",
        "sizing_data.singleOrMultivalve",
        "sizing_data.flowTypeP",
        "sizing_data.flowTypeV",
        "sizing_data.partialReqAreaGas",
        "sizing_data.partialReqAreaLiq1",
        "sizing_data.partialReqAreaLiq2",
        "sizing_data.areqV",
        "sizing_data.convertedValues",
        "sizing_data.is_critical"
      )
      .innerJoin("fluid_props", "sizing_data.sd_id", "fluid_props.sd_id")
      .select("fluid_props.*")
      .innerJoin("temp_data", "sizing_data.sd_id", "temp_data.sd_id")
      .select(
        "temp_data.temp_id",
        "temp_data.sd_id",
        "temp_data.relieve_temp",
        "temp_data.relieve_temp_v",
        "temp_data.temp_uom",
        "temp_data.relieving_forPress",
        "temp_data.relieving_forVacc",
        "temp_data.boiling_point",
        "temp_data.flash_point",
        "temp_data.designMin_temp",
        "temp_data.designMax_temp",
        "temp_data.opr_temp",
        "temp_data.NormalSys_temp"
      )
      .innerJoin(
        "sizing_misc_data",
        "sizing_data.sd_id",
        "sizing_misc_data.sd_id"
      )
      .select(
        "sizing_misc_data.misc_id",
        "sizing_misc_data.vaccum_flow",
        "sizing_misc_data.req_pressure_flow",
        "sizing_misc_data.req_pressure_flow_uom",
        "sizing_misc_data.has_rupture_disc",
        "sizing_misc_data.flow_capacity_uom",
        "sizing_misc_data.kc",
        "sizing_misc_data.kv",
        "sizing_misc_data.tag_notes",
        "sizing_misc_data.gas_flow",
        "sizing_misc_data.vapor_flow",
        "sizing_misc_data.liquid_flow",
        "sizing_misc_data.liquid_two_flow",
        "sizing_misc_data.misc_properties",
        "sizing_misc_data.preference_details",
        "sizing_misc_data.fd",
        "is_section_VIII"
      )
      // .innerJoin("tank_data", "sizing_data.sd_id", "tank_data.sd_id")
      .leftJoin(
        "reports_valve_calculations",
        "sizing_data.sizing_id",
        "reports_valve_calculations.sizingId"
      )
      .select(
        "reports_valve_calculations.reactionForce",
        "reports_valve_calculations.noiseLp",
        "reports_valve_calculations.distanceFromValve",
        "reports_valve_calculations.velocity",
        "reports_valve_calculations.soundPowerLevel",
        "reports_valve_calculations.soundPressureLevel",
        "reports_valve_calculations.lp_uom",
        "reports_valve_calculations.do_uom",
        "reports_valve_calculations.fr_uom",
        "reports_valve_calculations.r_uom",
        "reports_valve_calculations.outletDiameter",
        "reports_valve_calculations.velocity_uom",
        "reports_valve_calculations.soundPowerLevel_uom",
        "reports_valve_calculations.soundPressureLevel_uom",
        "reports_valve_calculations.outletArea",
        "reports_valve_calculations.r_uom",
        "reports_valve_calculations.outletArea_uom",
        "reports_valve_calculations.outletStaticPressure",
        "reports_valve_calculations.outletStaticPressure_uom",
        "reports_valve_calculations.gasOutletDensity",
        "reports_valve_calculations.outletGasMassFraction",
        "reports_valve_calculations.liquidOutletDensity",
        "reports_valve_calculations.gasOutletDensity_uom",
        "reports_valve_calculations.liquidOutletDensity_uom",
        "reports_valve_calculations.L100",
        "reports_valve_calculations.updated"
      )
      .innerJoin(
        "required_flow_data",
        "sizing_data.sd_id",
        "required_flow_data.sd_id"
      )
      .select(
        "required_flow_data.fire_sizing_method",
        "required_flow_data.fire_sizing_factor",
        "required_flow_data.environmental_factor_tank",
        "required_flow_data.wetted_area",
        "required_flow_data.surface_area",
        "required_flow_data.area_unit",
        "required_flow_data.vol_flow_v",
        "required_flow_data.vol_flow_calc_uom",
        "required_flow_data.latent_heat_req_flow",
        "required_flow_data.latent_heat_unit_req_flow",
        "required_flow_data.latent_heat_tank",
        "required_flow_data.wetted_area_tank",
        "required_flow_data.area_unit_tank"
      )
      .innerJoin("system_data", "sizing_data.sd_id", "system_data.sd_id")
      .select(
        "system_data.boiling_range",
        "system_data.system_condition",
        "system_data.critTemp"
      )
      .innerJoin("flow_rate_data", "sizing_data.sd_id", "flow_rate_data.sd_id")
      .select("flow_rate_data.*")
      .innerJoin(
        "calc_intermedi_value",
        "sizing_data.sizing_id",
        "calc_intermedi_value.sizing_id"
      )
      .select("calc_intermedi_value.calc_result")
      .innerJoin("pressure_data", "sizing_data.sd_id", "pressure_data.sd_id")
      .select(
        "pressure_data.vaccum_uom",
        "pressure_data.atm_pressure",
        "pressure_data.atm_pressure_uom",
        "pressure_data.sys_mawp",
        "pressure_data.sys_mawv",
        "pressure_data.opr_pressure",
        "pressure_data.set_pressure",
        "pressure_data.over_pressure_per",
        "pressure_data.over_pressure",
        "pressure_data.builtUp_bk_pressure",
        "pressure_data.total_bk_pressure",
        "pressure_data.inlet_pres_loss",
        "pressure_data.pressure_uom",
        "pressure_data.set_vaccum",
        "pressure_data.inlet_pressure",
        "pressure_data.const_supimp_bk_pressure",
        "pressure_data.var_supimp_bk_pressure",
        "pressure_data.delta_press",
        "pressure_data.delta_vaccum",
        "pressure_data.under_press_v_per",
        "pressure_data.under_press_v"
      )
      // .innerJoin("sizing_errors", "sizing_data.sd_id", "sizing_errors.sd_id")
      // .select("sizing_errors.*")

      .where("sizing_data.sizing_id", sizingId);
    // console.log("data--------------",data)
    return data;
  } catch (error) {
    console.log("error", error);
    return error;
  }
};

const getSapData = async (configId) => {
  try {
    const response = await axios({
      method: "GET",
      url: `${process.env.CONFIGURATOR_API}?configHeaderId=${configId}`,
      headers: {
        Accept: "application/json",
        Client_id: `${process.env.CONFIGURATOR_API_CLIENT_ID}`,
        Client_secret: `${process.env.CONFIGURATOR_API_CLIENT_SECRET}`,
        Senderid: `${process.env.CONFIGURATOR_API_SENDER_ID}`,
        Targetid: `${process.env.CONFIGURATOR_API_TARGET_ID}`,
        BusinessGroup: `${process.env.CONFIGURATOR_API_BUSINESS_GROUP}`,
        "Ocp-Apim-Subscription-Key": `${process.env.CONFIGURATOR_API_OCP_APIM_SUBSCRIPTION_KEY}`,
      },
    });
    console.log("response", response.data);
    return response.data;
  } catch (error) {
    console.log("error", error);
    return error;
  }
};

const getErpPositionMapping = async (modelId, db) => {
  const query = `SELECT * FROM public.configuration_models AS CM
  INNER JOIN public.configuration_sections AS CS
  ON CS."ConfigurationModelId" = CM."ConfigurationModelId"
  INNER JOIN public.section_choices AS SC
  ON SC."ConfigurationSectionId" = CS."ConfigurationSectionId"
  WHERE CM."ModelId" = ?
  ORDER BY CS."ERPPosition"::INT ASC`;
  const erpPositionMapping = await db.raw(query, [modelId]);

  const query1 = `SELECT SRS.section_code, SRSC.sap_description, SRSC.erp_code, SRS.display_order, SRSC.display_order as "display_order1" FROM public.special_requirements_section AS SRS
  INNER JOIN public.special_requirements_section_choice AS SRSC
  ON SRS.special_requirements_section_id = SRSC.special_requirements_section_id
  ORDER BY SRSC.display_order ASC`;
  const erpSpecialRequirementsMapping = await db.raw(query1);

  return {
    erpPosition: erpPositionMapping.rows,
    erpSpecialRequirements: erpSpecialRequirementsMapping.rows,
  };
};

const getDimensionData = async (modelId, sapData, db) => {
  const drawingSheetResponse = {};
  // create query
  const queryParams = [modelId];
  const query = `Select * from physical_properties pp 
  Inner Join physical_properties_relation ppr 
  ON pp."PhysicalPropertyRelationId" = ppr."PhysicalPropertyRelationId"
  Inner Join section_choices sc 
  ON ppr."SectionChoiceId" = sc."SectionChoiceId"
  Inner Join configuration_sections cs 
  ON cs."ConfigurationSectionId" = sc."ConfigurationSectionId"
  WHERE  "ModelId" = ?`;

  let subQuery = sapData.outputParameters.char_summary_items.map((e) => {
    const sapCharAbbr = e.SapChar.split("_").slice(-1)[0];
    queryParams.push(sapCharAbbr, e.CharValue);
    return `("Abbr" = ? AND "ERPCode" = ?)`;
  });
  let str = `(1 = 1)`;
  if (subQuery.length === 0) {
    subQuery = [str];
  }
  const dimensionDataQuery = `${query} AND (${subQuery.join(" OR ")})`;
  const dimensionData = await db.raw(dimensionDataQuery, queryParams);
  dimensionData.rows.forEach((e) => {
    if (e.PhysicalPropertyEnumerationId === "2") {
      drawingSheetResponse.InletConnection = e.PhysicalProperty;
    }
    if (e.PhysicalPropertyEnumerationId === "6") {
      drawingSheetResponse.OutletConnection = e.PhysicalProperty;
    }
    if (e.PhysicalPropertyEnumerationId === "4") {
      drawingSheetResponse.InletFinish = e.PhysicalProperty;
    }
    if (e.PhysicalPropertyEnumerationId === "8") {
      drawingSheetResponse.OutletFinish = e.PhysicalProperty;
    }
    if (e.PhysicalPropertyEnumerationId === "3") {
      drawingSheetResponse.InletRating = e.PhysicalProperty;
    }
    if (e.PhysicalPropertyEnumerationId === "7") {
      drawingSheetResponse.OutletRating = e.PhysicalProperty;
    }
    if (e.PhysicalPropertyEnumerationId === "1") {
      drawingSheetResponse.InletSize = e.PhysicalProperty;
    }
    if (e.PhysicalPropertyEnumerationId === "5") {
      drawingSheetResponse.OutletSize = e.PhysicalProperty;
    }
    if (e.PhysicalPropertyEnumerationId === "22") {
      drawingSheetResponse.BodyMaterial = e.PhysicalProperty;
    }
    if (e.PhysicalPropertyEnumerationId === "69") {
      drawingSheetResponse.ConnectionsStandard = e.PhysicalProperty;
    }

  });
  const dimensionDataPhysical = dimensionData.rows.filter(
    (e) => 78 <= parseInt(e.PhysicalPropertyEnumerationId) <= 87
  );
  const groupedData = {};
  dimensionDataPhysical.forEach((e) => {
    if (groupedData[e.PhysicalPropertyRelationId]) {
      groupedData[e.PhysicalPropertyRelationId].push(e);
    } else {
      groupedData[e.PhysicalPropertyRelationId] = [e];
    }
  });

  let finalData = [];
  let maxLength = 0;
  Object.values(groupedData).forEach((e) => {
    maxLength = e.length > maxLength ? e.length : maxLength;
    finalData = e.length === maxLength ? e : finalData;
  });
  finalData.forEach((e) => {
    const dimensionDataKeys = e.PhysicalPropertyEnumerationId;
    if (dimensionDataKeys.includes("79")) {
      drawingSheetResponse.A = e.PhysicalProperty;
    } else if (dimensionDataKeys.includes("80")) {
      drawingSheetResponse.B = e.PhysicalProperty;
    } else if (dimensionDataKeys.includes("81")) {
      drawingSheetResponse.C = e.PhysicalProperty;
    } else if (dimensionDataKeys.includes("82")) {
      drawingSheetResponse.D = e.PhysicalProperty;
    } else if (dimensionDataKeys.includes("83")) {
      drawingSheetResponse.E = e.PhysicalProperty;
    } else if (dimensionDataKeys.includes("84")) {
      drawingSheetResponse.F = e.PhysicalProperty;
    } else if (dimensionDataKeys.includes("85")) {
      drawingSheetResponse.G = e.PhysicalProperty;
    } else if (dimensionDataKeys.includes("86")) {
      drawingSheetResponse.H = e.PhysicalProperty;
    } else if (dimensionDataKeys.includes("87")) {
      drawingSheetResponse.Weight = e.PhysicalProperty;
    }
     else if (dimensionDataKeys.includes("78")) {
      drawingSheetResponse.OutletDiameter = e.PhysicalProperty;
    }
  });
  return { ...drawingSheetResponse };
};



module.exports = {
  getSizingReportData,
  getSapData,
  getErpPositionMapping,
  getDimensionData,
};
