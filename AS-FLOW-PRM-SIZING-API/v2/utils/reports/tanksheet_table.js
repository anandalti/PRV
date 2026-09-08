const {subSummary_conditions,subInput_conditions,subEquation_conditions,} = require("./tanksheet_json");

const verifyFirstLevelCondition = (firstLevelCondition, sizingData) => {
  if (firstLevelCondition === "NA") {
    return true
  };

  let str = "";
   if (sizingData?.flow_rate_capacity_method === "Normal") {
    str += "Normal Venting";
    str += " - " + sizingData?.flow_rate_radio;
    if (sizingData?.pressure_checkbox && sizingData?.vaccum_checkbox) {
      str += " - Pressure & Vacuum";
    } else if (sizingData?.pressure_checkbox && !sizingData?.vaccum_checkbox) {
      str += " - Pressure Only";
    } else {
      str += "Vacuum Only";
    }
  } else {
    str += "Emergency Venting & Normal Vaccum";
    str += " - " + sizingData?.flow_rate_radio;
  }
  if (firstLevelCondition.includes(str)) {
    return true;
  } else {
    false;
  }
};

const verifySecondLevelCondition = (secondLevelConditions, sizingData) => {
  let idArr = [];
  if (!secondLevelConditions) {
    return true
  };
  
  idArr = secondLevelConditions.filter((e) =>
  e["prefCalculationMethod"] != "NA" ? e["tank_shape"] === sizingData["tank_shape"] : false  &&
        e["prefCalculationMethod"] != "NA" ? e["prefCalculationMethod"] === sizingData["prefCalculationMethod"] : false &&
      e["flash_point"] != "NA" ? eval(e["flash_point"]) : false &&
      e["boiling_point"] != "NA" ? eval(e["boiling_point"]) : false &&
      e["set_pressure"] != "NA" ? e["set_pressure"] === sizingData["set_pressure"] : false &&
        // e["Wetted_Surface_Area"] === sizingData["Wetted_Surface_Area"] || (not getting from sizing)
        e["MAWP"] != "NA" ? eval(e["MAWP"]) : false &&
        // e["AWET"] === sizingData["AWET"] ||
        // e["HeatInput"] === sizingData["HeatInput"] || (not getting from sizing)
        e["normal_operating"] != "NA"? e["normal_operating"] === sizingData["normal_operating"] : false &&
        e["normal_operating"] != "NA"? e["product_in_tank"] === sizingData["product_in_tank"] : false 
    ).map((e) => e.TemplateID);
  if (idArr != null) {
    return true;
  } else {
    false;
  }
};
const getTheSubEqIDForTankSheet = (sizingData) => {
  const idArr = [];
  const maindata=sizingData.sizingData
  const sizingObj={
    flow_rate_capacity_method: maindata.flow_rate_capacity_method,
    flow_rate_radio: maindata.flow_rate_radio.value,
    pressure_checkbox: maindata.pressure_checkbox,
    vaccum_checkbox: maindata.vaccum_checkbox,
  }
  const secondsizingObj ={
    tank_shape: maindata.tank_shape,
    prefCalculationMethod: maindata.preference_details.prefCalculationMethod,
    flash_point: maindata.flash_point,
    boiling_point : maindata.boiling_point,
    set_pressure : maindata.set_pressure,
    // Wetted_Surface_Area: maindata
    MAWP: maindata.sys_mawp,
    // AWET: maindata
    // HeatInput: maindata.,
    normal_operating: maindata.normal_operating,
    product_in_tank: maindata.product_in_tank

  }
  subEquation_conditions.forEach((el) => {
  //   let isFirstLevelConditionTrue: true | false = verifyFirstLevelCondition(
  //     el.firstLevelConditions,
  //     sizingObj
  //   );

    let secondLevelCondition = verifySecondLevelCondition(
      el.secondLevelConditions,
      secondsizingObj
    );

    if (secondLevelCondition) {
      idArr.push(el.subTemplateId);
    }
  });
  return idArr;
};

const getTheSubSummaryIDForTankSheet = (sizingData) => {
  
  const maindata=sizingData.sizingData
  const sizingObj={
    flow_rate_capacity_method: maindata.flow_rate_capacity_method,
    flow_rate_radio: maindata.flow_rate_radio.value,
    pressure_checkbox: maindata.pressure_checkbox,
    vaccum_checkbox: maindata.vaccum_checkbox,
  }
  let idArr = [];
  subSummary_conditions.forEach((el) => {
    let conditionTrue = verifyFirstLevelCondition(
      el.subSummary,
      sizingObj
    );
    if (conditionTrue) {
      idArr.push(el.subTemplateId);
    }
  });
  return idArr;
};

const getTheSubInputIDForTankSheet = (sizingData) => {
  const idArr = []; 
  const maindata=sizingData.sizingData
  const sizingObj={
    flow_rate_capacity_method: maindata.flow_rate_capacity_method,
    flow_rate_radio: maindata.flow_rate_radio.value,
    pressure_checkbox: maindata.pressure_checkbox,
    vaccum_checkbox: maindata.vaccum_checkbox,
  }
  subInput_conditions.forEach((el) => {
    let conditionTrue = verifyFirstLevelCondition(
      el.subInput,
      sizingObj
    );
    if (conditionTrue) {
      idArr.push(el.subTemplateId);
    }
  });
 
  return idArr;
};

const getTankDrwaingTankSheet = (sizingData) => {
  if (sizingData.sizingData.tank_shape === "Spherical") {
    return `<img alt='Logo' src='https://prmpa-dev-v2.azurewebsites.net/media/TankSpherical.png'  style='width: 112px'/>`
  }
  if (sizingData.sizingData.tank_shape === "Rectangular") {
    return `<img alt='Logo' src='https://prmpa-dev-v2.azurewebsites.net/media/TankRectangular.png' style='width: 112px'/>`
  }
  if (sizingData.sizingData.tank_shape === "Cylindrical") {
    return `<img alt='Logo' src='https://prmpa-dev-v2.azurewebsites.net/media/TankHorizontalCylinderFlat.png' style='width: 112px'/>`
  }
};

const getTankTypeTankSheet = (sizingData) => {
  let TankType_Id = [218];
  let tankType = {
    // tank_volume: sizingData.isTankDataPanel === null? "calculated": sizingData.isTankDataPanel === true? "Calculated": "User Entered",
    tank_volume: sizingData.isTankDataPanel? true : false,
    tank_shape: sizingData.tank_shape? true : false,
    orientation: sizingData.orientation? true : false,
    ends: sizingData.ends? true : false,
    Tank_Insulation: sizingData.tank_Has_Insulation? true : false,
  };
if(tankType){
  return TankType_Id
}
};

const getSubTempIdTankSubVesselData521 = (sizingData) => {
  const maindata=sizingData.sizingData
  let idArr=[]
  if(maindata.fire_sizing_method === "Wetted"){ 
    idArr.push(277);
  }
  if(maindata.fire_sizing_method==="Unwetted")
  { 
    idArr.push(278);
}
return idArr;
 }

const getSubTempIdTankDrwaing521 = (sizingData) => {
  if (sizingData.sizingData.tank_shape === "Spherical") {
    return `<img alt='Logo' src='data:image/png;base64,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'/>`
  }
  if (sizingData.sizingData.tank_shape === "Cylindrical") {
    return `<img alt='Logo' src='data:image/png;base64,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' />`
  }
};

module.exports = {
    getTheSubEqIDForTankSheet,
    getTheSubSummaryIDForTankSheet,
    getTheSubInputIDForTankSheet,
    getTankDrwaingTankSheet,
    getTankTypeTankSheet,
    getSubTempIdTankSubVesselData521,
    getSubTempIdTankDrwaing521
}
