const { pool } = require("../db/pgsqldb");
const math = require("mathjs");
const { sectionChoicesSAP, MAWPModels } = require("../utils/sapSizingData");

const { mapServiceWithPACode, convertUnit, JSeriesRSModels, Models_MOD_IFR, convertUnitDiffDims } = require("../utils/helper");
const UOM = require("../models/UOM");
const { saveRecordUsingSP } = require("./SaveWorkflowRecordController");

const validateKey = (key, type) => {
  if (
    type == "temp" &&
    key !== undefined &&
    key !== null &&
    key != "null" &&
    key != ""
  ) {
    if (key == "temp.degC") {
      return "C";
    } else if (key == "temp.degF") {
      return "F";
    } else if (key == "temp.degK") {
      return "K";
    } else if (key == "temp.degR") {
      return "R";
    } else {
      // do nothing
    }
  }
  if (key !== undefined && key !== null && key != "null" && key != "") {
    return key.split(".")[1].toUpperCase();
  }
  return key;
};

const sizingDetails = async (req, res) => {
  try {
    const SizingId = req.params.sizingId;
    const itemNumber = req.params.itemNumber;
    const params = [SizingId];
    const response = {}

    let query = `SELECT
      SD."SizingId",
      SV."ModelNumber",
      SD."SizingBasis",
      SD."CalculationMethod",
      PD."AtmPressureUOM",
      PD."PressureUOM",
      PD."PressureUOMVacuum",
      PD."VesselPressure",
      PD."DeltaPressure",
      PD."SetPressure",
      PD."SetVacuum",
      PD."OperatingPressure",
      PD."ConstantSuperimposed",
      PD."OverPressure",
      PD."InletLoss",
      PD."AtmPressure",
      PD."SystemMAWP",
      PD."TotalBackPressure",
			TD."Relieving",
			TD."RelievingforVacuum",
			TD."NormalSystem",
			TD."Operating",
			TD."DesignMin",
			TD."DesignMax",
      TD."TemperatureUOM",
      F."Name" As "FluidType",
			FD."FluidName",
      FD."IsSaturatedSteam",
      FD."IsPressureOnly",
      FD."IsVacuumOnly",
      FD."SpGravity",
      FD."MolWeight",
      SD."IsASMESection8",
      SM."Name",
      SM."Code",
      SV."SizeOrOrifice",
      SV."ReResponse",
      RL."RestrictedLift",
      RL."LiftRestriction",
      FC."Wreq",
      FC."Vreq",
      FC."Qreq",
      FC."VlreqMass",
      FC."FlowCapacityUOM"
		FROM public."SizingDetails" AS SD
		LEFT JOIN public."FluidDetails" AS FD ON FD."SizingId" = SD."Id"
		LEFT JOIN public."PressureDetails" AS PD ON PD."SizingId" = SD."Id"
		LEFT JOIN public."TemperatureDetails" AS TD ON TD."SizingId" = SD."Id"
    LEFT JOIN public."SelectedValve" AS SV ON SV."SizingId" = SD."Id"
    LEFT JOIN public."WorkFlow" AS W ON W."Id" = SD."WorkFlowId"
    LEFT JOIN public."FluidType" AS F ON F."Id" = W."FluidTypeId"
    LEFT JOIN public."SizingMethodology" AS SM ON SM."Id" = W."SizingMethodologyId"
    LEFT JOIN public."RestrictedLiftData" AS RL ON RL."SizingId" = SD."Id"
    LEFT JOIN public."FlowCapacity" AS FC ON FC."SizingId" = SD."Id"
		WHERE SD."SizingId" = $1 `
    if (itemNumber) {
      query += `AND SD."ItemNumber" = $2`
      params.push(itemNumber);
    }
    query += ` ORDER BY SD."Id" DESC LIMIT 1`;
    let data = (await pool.query(query, params)).rows[0];
    if (!data) {
      res.status(400).json({ message: "Sizing ID is not present" });
      return;
    }

    let uoms = [];
    const uomRes = await pool.query('SELECT * FROM "UOM";');
    uomRes.rows.forEach((data) => {
      uoms.push(new UOM(data));
    });

    if (!!data?.TemperatureUOM && data?.TemperatureUOM === "temp.degR") {
      data.TemperatureUOM = "temp.degF";
      const fromUOM = uoms.find(uom => uom.UnitKey === "temp.degR");
      const toUOM = uoms.find(uom => uom.UnitKey === data?.TemperatureUOM);

      data.Relieving = convertUnit(data?.Relieving, fromUOM, toUOM);
      data.RelievingforVacuum = convertUnit(data?.RelievingforVacuum, fromUOM, toUOM);
      data.Operating = convertUnit(data?.Operating, fromUOM, toUOM);
      data.DesignMin = convertUnit(data?.DesignMin, fromUOM, toUOM);
      data.DesignMax = convertUnit(data?.DesignMax, fromUOM, toUOM);
    }


    if (!!data?.PressureUOM) {
      const fromUOM = uoms.find(uom => uom.UnitKey === data?.PressureUOM);
      let toUOM;
      let flag = false;
      if (data.PressureUOM === "pressure.atm") {
        data.PressureUOM = "pressure.psig";
        flag = true;
      }
      if (data.PressureUOM === "pressure.ftwca") {
        data.PressureUOM = "pressure.inwcg";
        flag = true;
      }
      if (data.PressureUOM === "pressure.meterh2og") {
        data.PressureUOM = "pressure.kpascalg";
        flag = true;
      }
      if (flag) {
        toUOM = uoms.find(uom => uom.UnitKey === data.PressureUOM)
        data.SetPressure = convertUnit(data?.SetPressure, fromUOM, toUOM);
        data.OperatingPressure = convertUnit(data?.OperatingPressure, fromUOM, toUOM);
        data.TotalBackPressure = convertUnit(data?.TotalBackPressure, fromUOM, toUOM);
        data.ConstantSuperimposed = convertUnit(data?.ConstantSuperimposed, fromUOM, toUOM);
      }

    }

    if (!!data?.PressureUOMVacuum) {
      const fromUOM = uoms.find(uom => uom.UnitKey === data?.PressureUOMVacuum);
      let toUOM;
      let toUOMKey = false;
      if (data.PressureUOMVacuum === "pressure.atm") {
        toUOMKey = "pressure.psig";
      }
      if (data.PressureUOMVacuum === "pressure.ftwca") {
        toUOMKey = "pressure.inwcg";
      }
      if (data.PressureUOMVacuum === "pressure.meterh2og") {
        toUOMKey = "pressure.kpascalg";
      }
      if (!!toUOMKey) {
        toUOM = uoms.find(uom => uom.UnitKey === toUOMKey)
        data.SetVacuum = convertUnit(data?.SetVacuum, fromUOM, toUOM);
      }
    }
    let receivedFlowCapacityUOM=data?.FlowCapacityUOM;
    const FlowCapacityUOM = data?.CalculationMethod=='English'?"massflow.lbhr" : "massflow.kghr";
    let FlowCapacity;

    if(data?.ModelNumber =='HCI'){
      const inputs={
        MolWeightt:data?.MolWeight,
        SpGravity:data?.SpGravity,
        PressureUOM:data?.PressureUOM,
        AtmPressureUOM:data?.AtmPressureUOM,
        VesselPressure:data?.VesselPressure,
        DeltaPressure:data?.DeltaPressure,
        SetPressure:data?.SetPressure,
        OverPressure:data?.OverPressure,
        InletLoss:data?.InletLoss,
        AtmPressure:data?.AtmPressure,
        Relieving:data?.Relieving,
        RelievingforVacuum:data?.RelievingforVacuum,
        TemperatureUOM:data?.TemperatureUOM,
      }
      FlowCapacity=Number(data?.Wreq ? data?.Wreq : data?.Vreq? data?.Vreq :data?.Qreq ? data?.Qreq : data?.VlreqMass);
      const toUOM = uoms.find(uom => uom.UnitKey === FlowCapacityUOM);
      const fromUOM = uoms.find(uom => uom.UnitKey === receivedFlowCapacityUOM);
      FlowCapacity=convertUnitDiffDims(FlowCapacity, fromUOM, toUOM, uoms, inputs);
      FlowCapacity = math.round(FlowCapacity, 3).toString();
    }
    
    // const mod=JSeriesRSModels.includes(data?.ModelNumber) ? Models_MOD_IFR[data.ModelNumber]?.MOD : undefined;
    let modelnumber=data?.ModelNumber;
    if(JSeriesRSModels.includes(data?.ModelNumber)){
      if(modelnumber=='JLT-JBS-BP-E (Leak Detection)'){
        modelnumber='JLT-JBS-BP-E';
      }else if(modelnumber=='JLT-JBS-E (Leak Detection)'){
        modelnumber='JLT-JBS-E';
      }
      // response['valveModel']=mod;
    }
    let shouldSatSteam = ["HSJ", "HCI", "HE", "HSL", "5247"].includes(data.ModelNumber);
    response.sizingId = data?.SizingId;
    response.modelNumber = modelnumber;
    response.fireCase = data?.SizingBasis === "Fire Case" ? "1" : "0";
    response.saturatedSteam = shouldSatSteam ? (data?.IsSaturatedSteam ? 'Y' : 'N') : null;
    response.pressureUOM = validateKey(data?.PressureUOM);
    response.setPressure = data?.SetPressure ? math.round(data?.SetPressure, 3).toString() : null;
    response.operatingPressure = data?.OperatingPressure ? math.round(data?.OperatingPressure, 3).toString() : null;
    response.constSuperimposed = data?.ConstantSuperimposed ? math.round(data?.ConstantSuperimposed, 3).toString() : "0";
    response.totalBackPressure = data?.TotalBackPressure ? math.round(data?.TotalBackPressure, 3).toString() : "0";
    response.vacuumSet = data?.SetVacuum ? math.round(data?.SetVacuum, 3).toString() : null;
    response.vacuumSetUoM = data?.SetVacuum ? validateKey(data?.PressureUOMVacuum) : null;
    response.relievingTemp = data?.Relieving ? math.round(data?.Relieving, 2).toString() : null;
    response.operatingTemp = data?.Operating ? math.round(data?.Operating, 2).toString() : null;
    response.minDesignTemp = data?.DesignMin ? math.round(data?.DesignMin, 2).toString() : null;
    response.maxDesignTemp = data?.DesignMax ? math.round(data?.DesignMax, 2).toString() : null;
    response.restrictedLift = [...JSeriesRSModels,'HCI'].includes(data?.ModelNumber) ? data?.RestrictedLift.toUpperCase()=="FULLLIFT"?'-':'RL':undefined;
    response.liftRestriction = JSeriesRSModels.includes(data?.ModelNumber) ?data?.RestrictedLift.toUpperCase()=="FULLLIFT"?undefined:parseFloat(data?.LiftRestriction).toFixed(2):undefined;
    // response.mod = mod;
    response.flowCapacity = data?.ModelNumber=='HCI'?FlowCapacity ? math.round(FlowCapacity, 3).toString():'' : undefined;
    response.flowCapacityUOM = data?.ModelNumber=='HCI'?FlowCapacityUOM ? validateKey(FlowCapacityUOM) : '' : undefined;

    // console.log(data?.RestrictedLift)

    response.tempUOM = validateKey(data?.TemperatureUOM, "temp");
    if (['727', '900', 'BP'].includes(data?.ModelNumber)) {
      response.normalSysCDTPTemp = data?.NormalSystem ? math.round(data?.NormalSystem, 2).toString() : null;
    // } else if (['JBS-BP-E', 'JBS-E', 'JBS-E#', 'JLT-JBS-BP-E', 'JLT-JBS-E', 'JLT-JBS-E#', 'JLT-JOS-E', 'JLT-JOS-E#', 'JOS-E', 'JOS-E#', 'JOS-H-E', 'JOS-H-E#'].includes(data?.ModelNumber)) {
    } else if (JSeriesRSModels.includes(data?.ModelNumber)) {
      response.noromalSytemTemp = data?.NormalSystem ? math.round(data?.NormalSystem, 2).toString() : null;
    }

    if (MAWPModels.includes(data?.ModelNumber)) {
      if (data?.ModelNumber === '96A') {
        response.sysDesignPressure = data?.SystemMAWP ? math.round(data?.SystemMAWP, 3).toString() : null;
        response.oprTemp = response.operatingTemp;
        delete response["operatingTemp"];
      } else {
        response.systemDesignPress = data?.SystemMAWP ? math.round(data?.SystemMAWP, 3).toString() : null;
      }
    }
    const vacuumModels = ['9200V DC', '9200V SC', '9209V SC', '9240C DC', '9290C DC', '9290C SC', '9290P SC', '9299C SC', '9300V DC', '9300V SC', '9309V SC', '9340C DC', '9390C DC', '9390C SC', '9390P SC', '9399C SC'];
    if (vacuumModels.includes(data?.ModelNumber)) {
      response['vacRelievingTemp'] = data?.RelievingforVacuum ? math.round(data?.RelievingforVacuum, 2).toString() : null;
    }
    if (data?.ModelNumber === '96A') {
      response['relTempVacRelief'] = data?.RelievingforVacuum ? math.round(data?.RelievingforVacuum, 2).toString() : null;
    }

    //Remove key/value as needed by SAP Z-table
    for (var key of Object.keys(response)) {
      if (response[key] == "null" || response[key] == null) {
        delete response[key];
      }
    }

    if (response.fireCase === 1) {
      // response['relievingTemp'] = response['operatingTemp']
      delete response["relievingTemp"];
    }

    if (
      data?.Code === "ASME Section I - V" &&
      data?.IsSaturatedSteam &&
      data?.Name === "Steam"
    ) {
      delete response["relievingTemp"];
    }
    // console.log(response)
    response.pressRelievingTemp = response.relievingTemp;
    if (data?.IsPressureOnly && !data?.IsVacuumOnly) {
      delete response["vacuumSetUOM"];
      delete response["vacuumSet"];
      delete response["vacRelievingTemp"];
    }
    if (data?.IsVacuumOnly && !data?.IsPressureOnly) {
      delete response["setPressure"];
      delete response["constSuperimposed"];
      delete response["totalBackPressure"];
      delete response["pressRelievingTemp"];
    }
    if (!data?.IsPressureOnly && !data?.IsVacuumOnly) {
      delete response["pressRelievingTemp"];
    }
    // console.log(response)
    // Filter constant superimposed for specific models
    // if (!['63', '81', '83', '900', 'BP', 'JBS-BP-E', 'JBS-E', 'JBS-E#', 'JLT-JBS-BP-E', 'JLT-JBS-E', 'JLT-JBS-E#', 'JLT-JOS-E', 'JLT-JOS-E#', 'JOS-E', 'JOS-E#', 'JOS-H-E', 'JOS-H-E'].includes(data.ModelNumber)) {
    if(!['63', '81', '83', '900', 'BP',...JSeriesRSModels].includes(data.ModelNumber)){
      delete response["constSuperimposed"];
    }
    const sapChoices = sectionChoicesSAP.filter(sc => sc.PAModel === data.ModelNumber);
    // console.log({sapChoices});
    console.log(response)
    sapChoices.forEach(d => {
      let configDataName = String(d.Name);
      // console.log('11111 >>>>>>>>>>>> ',configDataName,d)
      if (d.PACode != undefined && d.PACode != "") {
        //excel logic
        let reFormattedFormula = d.PACode;
        // Properties being used in the PACode, add new variable here as new property gets added
        let Service = mapServiceWithPACode(data.FluidType);
        let Fluid = data.FluidName;
        let SizingBasis = data.SizingBasis;
        let Tn = Number(data.Operating);
        let SectionVIII = String(
          data.IsASMESection8 ? "true" : "false"
        ).toUpperCase();
        let SectionI = String(
          data.Code.includes("SectionI")
        ).toUpperCase();

        let Pset = data?.SetPressure ? convertUnit(data?.SetPressure, uoms.find(uom => uom.UnitKey === data.PressureUOM), uoms.find(uom => uom.UnitKey === "pressure.psig")) : null;
        let Size = data?.SizeOrOrifice;
        let Orifice = data?.SizeOrOrifice;
        Size = Size != null ? Size.replace(/"/g, "") : null;
        Orifice = Orifice != null ? Orifice.replace(/"/g, "") : null;
        // console.log("reFormattedFormula", Orifice, reFormattedFormula);
        // console.log(Size);
        if (eval(reFormattedFormula)) {
          if (!!d?.dynamic) {
            response[configDataName] = data?.ReResponse[d.ERPCode];
          } else {
            response[configDataName] = d.ERPCode ? d.ERPCode.toString() : d.ERPCode;
          }
        }
      } else {
        response[configDataName] = d.ERPCode ? d.ERPCode.toString() : d.ERPCode;
      }
    });
    response.restrictedLift = [...JSeriesRSModels,'HCI'].includes(data?.ModelNumber)?data?.RestrictedLift.toUpperCase()=="FULLLIFT"?'-':data?.ModelNumber=='HCI'?'R':'RL':undefined;
    // console.log(response)
    res.send(response);
  } catch (err) {
    console.log({ err });
    res.status(400).json({ message: "Sizing ID is not present" });
  }

}

const copy = async (req, res) => {
  const oldSizingId = req.body?.sizingId;
  try {
    let data = await pool.query(`SELECT * FROM public."GetSizingDetailsBySizingId"($1)`, [oldSizingId]);
    // res.send({oldSizingId, data: data?.rows[0]});
    data = data?.rows[0]?.SizingDetails[0];

    if (data?.length > 0) {
      // console.log('first query SizingDetails_IN 111111>>>>>>>>>>>>>> ', data[0],data[0].WorkFlowId);
      if (data[0]?.WorkFlowId == 12) {
        data = data[0];
        let popupData = await API521FlowRateReq.getAPI521FlowRateReqBySizingId(data.Id);
        popupData = {
          ...popupData,
          // CalculateTankData:tankData.CalculateTankData==='Calculated'?true:false,

          LengthEndToEnd_ltip: popupData.LengthEndToEnd_lt,
        };
        // console.log('SizingDetailsBySizingId 111111>>>>>>>>>>>>>> ', popupData);
        let tankData = await API2000TankDataAPI521Fire.getAPI2000TankDataAPI521FireBySizingId(data.Id);
        tankData = {
          ...tankData,
          horizontalvertical: tankData.IsHorizontalOrientation ? 'IsHorizontalOrientation' : 'Vertical',
          IsHorizontalOrientation: tankData.IsHorizontalOrientation ? 'Horizontal' : 'Vertical',
        }
        data = { ...popupData, ...tankData, ...data };
      } else if ([3, 23, 24].indexOf(data[0]?.WorkFlowId) !== -1) {
        data = data[0];
        const Wreq1 = data?.Wreq;
        const WreqV1 = data?.WreqV;
        let popupData = await API2000FlowRateReq.getAPI2000FlowRateReqBySizingId(data.Id);
        let tankData = await API2000TankDataAPI521Fire.getAPI2000TankDataAPI521FireBySizingId(data.Id);
        const results = await API2000Results.getAPI2000ResultsBySizingId(data.Id);
        tankData = {
          ...tankData,

          IsHorizontalOrientation: tankData.IsHorizontalOrientation ? 'Horizontal' : 'Vertical',
          Horizontal: tankData.IsHorizontalOrientation,
          Vertical: !tankData.IsHorizontalOrientation,
          FlatEnds: tankData.Ends === 'FlatEnds',
          HemisphericalEnds: tankData.Ends === 'HemisphericalEnds',
        }
        popupData = {
          ...popupData,
          // CalculateTankData:popupData.CalculateTankData==='Calculated'?true:false,
          IsBoilingPointRadio: popupData.IsBoilingPointRadio ? 'BoilingPoint' : 'FlashPoint',
          IsSimpleEmergencyFlowRateCalc: popupData.IsSimpleEmergencyFlowRateCalc === 'true' ? true : false,
        };
        data = { Wreq1, WreqV1, ...popupData, ...tankData, ...results, ...data };
      }
    }
    const { Id, SizingId: OldSizingId, ...oldSizingData } = data;
    const { sizingData: [{SizingId}] } = await saveRecordUsingSP({ ...oldSizingData, ValveType: oldSizingData?.SizingValveType });
    res.status(200).json({
      sizingId: SizingId,
      errorFlag: null,
      errorCode: null,
      errorMsg: null,
    });
  } catch (err) {
    res.status(500).json({
      sizingId: "",
      errorFlag: "Y",
      errorCode: err,
      errorMsg: "Invalid sizing id in request [" + oldSizingId + "]"
    });
  }
}


module.exports = {
  sizingDetails,
  copy
};