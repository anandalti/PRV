const axios = require("axios");
const { mapSizingDataForReports, getSizingData, getIntermediateValveCaluclation } = require("../service/sizing.service");
const { modelSummaryTable } = require("../utils/reports/modelSummary");
const { projectSummaryTable } = require("../utils/reports/projectSummary");
const { getHtmlTableTemplate } = require("../utils/reports/template");
const { getTemplateIdV2, getHtmlTableTemplateV2 } = require("../utils/reports/templateV2");
const { pool } = require("../db/pgsqldb");
const { calculateReactionForceCalculations } = require("../service/calculations/valveCalculation");
const { convertUnit } = require("../utils/helper");

const drawingSheetImages = [
  {
      model: "4020H",
      image: "4020H.png"
  },
  {
      model: "4020HC",
      image: "4020HC.png",
  },
  {
      model: "4020HP",
      image: "4020HP.png"
  },
  {
      model: "4020HV",
      image: "4020HV.png"
  },
  {
      model: "4040H",
      image: "4040H.png"
  },
  {
      model: "4040HC",
      image: "4040HC.png"
  },
  {
      model: "4040HP",
      image: "4040HP.png"
  },
  {
      model: "4040HV",
      image: "4040HV.png"
  },
  {
      model: "4110H",
      image: "4110H.png"
  },
  {
      model: "4110HV",
      image: "4110HV.png"
  },
  {
      model: "4130H",
      image: "4130H.png"
  },
  {
      model: "4130HP",
      image: "4130HP.png"
  },
  {
      model: "4142HF",
      image: "4142HF.png"
  },
  {
      model: "4142HFP",
      image: "4142HFP.png"
  },
  {
      model: "4142HV",
      image: "4142HV.png"
  },
  {
      model: "4142HVV",
      image: "4142HVV.png"
  },
  {
      model: "4410H",
      image: "4410H.png"
  },
  {
      model: "4410HV",
      image: "4410HV.png"
  },
  {
      model: "81",
      image: "AG_60_80.gif"
  },
  {
      model: "83",
      image: "AG_60_80.gif"
  },
  {
      model: "86",
      image: "AG_60_80.gif"
  },
  {
      model: "81P",
      image: "AG_60_80.gif"
  },
  {
      model: "93",
      image: "AG_90.png"
  },
  {
      model: "95",
      image: "AG_90.png"
  },
  {
      model: "253",
      image: "AG_200_400_500_800.gif"
  },
  {
      model: "243",
      image: "AG_200_400_500_800.gif.gif"
  },
  {
      model: "263",
      image: "AG_200_400_500_800.gif"
  },
  {
      model: "259",
      image: "AG_200_400_500_800.gif"
  },
  {
      model: "249",
      image: "AG_200_400_500_800.gif"
  },
  {
      model: "269",
      image: "AG_200_400_500_800.gif"
  },
  {
      model: "453",
      image: "AG_200_400_500_800.gif"
  },
  {
      model: "443",
      image: "AG_200_400_500_800.gif"
  },
  {
      model: "463",
      image: "AG_200_400_500_800.gif"
  },
  {
      model: "546",
      image: "AG_200_400_500_800.gif"
  },
  {
      model: "566",
      image: "AG_200_400_500_800.gif"
  },
  {
      model: "853",
      image: "AG_200_400_500_800.gif"
  },
  {
      model: "843",
      image: "AG_200_400_500_800.gif"
  },
  {
      model: "863",
      image: "AG_200_400_500_800.gif"
  },
  {
      model: "727",
      image: "AG_700.gif"
  },
  {
      model: "5247",
      image: "AG_5200.png"
  },
  {
      model: "9200V SC",
      image: "AG_9200.png"
  },
  {
      model: "9209V SC",
      image: "AG_9200.png"
  },
  {
      model: "9290C SC",
      image: "AG_9200.png"
  },
  {
      model: "9290P SC",
      image: "AG_9200.png"
  },
  {
      model: "9299C SC",
      image: "AG_9200.png"
  },
  {
      model: "9200V DC",
      image: "AG_9200.png"
  },
  {
      model: "9240C DC",
      image: "AG_9200.png"
  },
  {
      model: "9290C DC",
      image: "AG_9200.png"
  },
  // "AG_9200SC",
  {
      model: "9300V SC",
      image: "AG_9300.png"
  },
  {
      model: "9309V SC",
      image: "AG_9300.png"
  },
  {
      model: "9390C SC",
      image: "AG_9300.png"
  },
  {
      model: "9390P SC",
      image: "AG_9300.png"
  },
  {
      model: "9399C SC",
      image: "AG_9300.png"
  },
  {
      model: "9300V DC",
      image: "AG_9300.png"
  },
  {
      model: "9340C DC",
      image: "AG_9300.png"
  },
  {
      model: "9390C DC",
      image: "AG_9300.png"
  },
  // "AG_9300SC",
  {
      model: "BV",
      image: "AG_BV1.gif"
  },
  {
      model: "LCP",
      image: "AG_LCP.gif"
  },
  {
      model: "RAR",
      image: "AG_RA.gif"
  },
  {
      model: "Y1R",
      image: "AG_Y1.gif"
  },
  {
      model: "96A",
      image: "MODEL 96A.jpg"
  },
  // crossby ============================
  {
      model: "900",
      image: "C_900.png"
  },
  {
      model: "BP",
      image: "C_BP.png"
  },
  {
      model: "HCI",
      image: "C_HCI.png"
  },
  {
      model: "HE",
      image: "C_HE.png"
  },
  {
      model: "HSJ",
      image: "C_HSJ.png"
  },
  {
      model: "HSL",
      image: "C_HSL.png"
  },
  {
      model: "JBS-E",
      image: "C_JB.gif"
  },
  {
      model: "JLT-JBS-E",
      image: "C_JB.gif"
  },
  {
      model: "JBS-BP-E",
      image: "C_JB.gif"
  },
  // "C_JBD"
  {
      model: "JOS-E#",
      image: "C_JOSE_J.png"
  },
  {
      model: "JLT-JOS-E",
      image: "C_JOSE_J.png"
  },
  {
      model: "JOS-E",
      image: "C_JOSE_J.png"
  },
  {
      model: "JLT-JOS-E#",
      image: "C_JOSE_J.png"
  },
  {
      model: "JLT-JBS-E#",
      image: "C_JBSE_J.png"
  },
  {
      model: "JLT-JBS-E",
      image: "C_JBSE_J.png"
  },
  {
      model: "JBS-E#",
      image: "C_JBSE_J.png"
  },
  {
      model: "JBS-E",
      image: "C_JBSE_J.png"
  },
  {
      model: "JOS-H-E",
      image: "C_JOHE_J.png"
  },
  {
      model: "JOS-H-E#",
      image: "C_JOHE_J.png"
  },
  // varec=======================
  {
      model: "180",
      image: "V_180_181.gif"
  },
  {
      model: "181",
      image: "V_180_181.gif"
  },
  {
      model: "186",
      image: "V_186_187.gif"
  },
  {
      model: "187",
      image: "V_186_187.gif"
  },
  {
      model: "221P",
      image: "V_221P_221PV.gif"
  },
  {
      model: "221PV",
      image: "V_221P_221PV.gif"
  },
  {
      model: "711",
      image: "V_711.gif"
  },
  {
      model: "2010B",
      image: "V_2010B.gif"
  },
  {
      model: "2020B",
      image: "V_2020B.gif"
  },
  {
      model: "3500B",
      image: "V_3500B.gif"
  },
  {
      model: "3600B",
      image: "V_3600B.gif"
  },
  {
      model: "3650B",
      image: "V_3650B.gif"
  },
  {
      model: "5000",
      image: "V_5000.gif"
  },
  {
      model: "5010",
      image: "V_5010.gif"
  },
  {
      model: "5400A",
      image: "V_5400A.gif"
  },
  {
      model: "2010B+5000",
      image: "V_5810B.gif"
  },
  {
      model: "2020B+5000",
      image: "V_5820B.gif"
  },
  {
      model: "2010B+Series 7",
      image: "V_5910B.gif"
  },
  {
      model: "2020B+Series 7",
      image: "V_5920B.gif"
  },
  {
      model: "7000",
      image: "V_7000.gif"
  },
  {
      model: "7100B",
      image: "V_7100.gif"
  },
]

const PhysicalConfigurationProperty = {
  InletSize: 1,
  InletConnection: 2,
  InletRating: 3,
  InletFinish: 4,
  OutletSize: 5,
  OutletConnection: 6,
  OutletRating: 7,
  OutletFinish: 8,
  Accessory1: 9,
  Accessory2: 10,
  Accessory3: 11,
  Accessory4: 12,
  Accessory5: 13,
  Accessory6: 14,
  Accessory7: 15,
  Accessory8: 16,
  Accessory9: 17,
  Accessory10: 18,
  Base: 20,
  Bellows: 21,
  Body: 22,
  BonnetCap: 23,
  Case: 24,
  Chambers: 25,
  CoreHousingFrame: 26,
  Diaphragm: 27,
  DiaphragmHousing: 28,
  ElementSheets: 29,
  EndHousing: 30,
  Fittings: 31,
  Gaskets: 32,
  Guide: 33,
  Hardware: 34,
  Hood: 35,
  Insert: 36,
  Nozzle: 37,
  Orientation: 38,
  Oring: 39,
  PilotValveBody: 40,
  PilotValveBodyVacuum: 41,
  PilotValveDiaphragm: 42,
  PilotValveDiaphragmVacuum: 43,
  PilotValveSeals: 44,
  PilotValveSealsVacuum: 45,
  PilotValveSeat: 46,
  PilotValveSeatVacuum: 47,
  PilotValveTrim: 48,
  PilotValveTrimVacuum: 49,
  PressureRange: 50,
  PressureSpringMaterial: 51,
  Retainer: 52,
  Seals: 54,
  Seat: 55,
  Screen: 56,
  Spindle: 57,
  Spring: 58,
  SpringVacuum: 59,
  Trim: 60,
  TrimCoating: 61,
  Tubing: 62,
  VacuumRange: 63,
  VacuumSpringMaterial: 64,
  SenseInteriorExterior: 65,
  SenseSize: 66,
  SenseConnection: 67,
  GeneralNozzle: 68,
  Standard: 69,
  ValveFunction: 70,
  SetSpring: 71,
  Cover: 72,
  Pad: 73,
  TrimVacuum: 74,
  InsertVacuum: 75,
  SettingRange: 76,
  Disc: 77,
  OutletDiameter: 78,
  ValveDimensionA: 79,
  ValveDimensionB: 80,
  ValveDimensionC: 81,
  ValveDimensionD: 82,
  ValveDimensionE: 83,
  ValveDimensionF: 84,
  ValveDimensionG: 85,
  ValveDimensionH: 86,
  Weight: 87,
  SoftGoods: 88,
  PilotValveSoftGoods: 89,
  PilotValveSoftGoodsVacuum: 90,
  WeightFactor: 91,
  WeightFactorVacuum: 92,
  NominalSize: 93,
  GeneralBonnet: 95,
  BodyInletAsmeMaterialGroup: 96,
  BodyOutletAsmeMaterialGroup: 97,
  AlternateValveDimensionA: 98,
  AlternateValveDimensionB: 99,
  AlternateValveDimensionC: 100,
  AlternateValveDimensionD: 101,
  AlternateValveDimensionE: 102,
  AlternateValveDimensionF: 103,
  AlternateValveDimensionG: 104,
  AlternateValveDimensionH: 105,
  Sense: 106,
  CapType: 107,
  Nace: 108,
  InletBushing: 109,
  Bonnnet: 110,
  Connections: 111,
  ARCBypassSize: 112,
  ARCBypassConn: 113,
  ARCBypassRating: 114,
  ARCBypassFinish: 115,
  ARCBody: 116,
  ARCBonnet: 117,
  ARCTrim: 118,
  ARCSeat: 119,
  ARCSeals: 120,
  ARCGasket: 121,
  BPRBody: 122,
  BPRSeals: 123,
  ARCNACE: 124,
  ARCSpring: 125,
  BPRSize: 126,
  BPRClass: 127,
  BPRStyle: 128,
  BPRLocation: 129,
  ARCOrientation: 130,
  BodyInletFlangeClass: 131,
  BodyOutletFlangeClass: 132,
  Pallet: 133,
  PressurePallet: 134,
  VacuumPallet: 135,
  PressureLoading: 136,
  VacuumLoading: 137,
  SeatRing: 138,
  GuideTube: 139,
  GuideRod: 140,
  SeatPlate: 141,
  InletScreen: 142,
  SeatRingRetainer: 143,
  RetainerBolts: 144,
  PressureReliefConnection: 145,
  FlangeCap: 146,
  FlangeStudNut: 147,
  LOXCleaned: 148
};

const DimensionKeys = [
  "OutletDiameter",
  "ValveDimensionA",
  "ValveDimensionB",
  "ValveDimensionC",
  "ValveDimensionD",
  "ValveDimensionE",
  "ValveDimensionF",
  "ValveDimensionG",
  "ValveDimensionH",
  "Weight"
];

const getPhysicalProperty = (PhysicalPropertyEnumerationId, PhysicalPropertyItems, sapData, drawingSheetResponse) => {
  const charItems = sapData.outputParameters.char_summary_items.filter(item => ["Valve Configuration", "Valve Accessories", "Special Requirement"].includes(item.Tab));
  let charValuesArray = [];
  let PhysicalProperty = "";
  
  const pprIds = PhysicalPropertyItems.filter(item => item.PhysicalPropertyEnumerationId === PhysicalPropertyEnumerationId)
      .map(item => item.PhysicalPropertyRelationId);
  const distinctPprIds = [...new Set(pprIds)];

  if (distinctPprIds.length > 1) {
      let pprIdcharItems = [];
      distinctPprIds.map(pprId => {
          const PhysicalPropertyItem = PhysicalPropertyItems.filter(item => item.PhysicalPropertyRelationId === pprId)
              .map(item => `${item.Abbr}:${item.ERPCode}`);
          pprIdcharItems.push({ pprId: pprId, items: [...new Set(PhysicalPropertyItem)], count: [...new Set(PhysicalPropertyItem)].length });
      });

      const pprIdcharItemsSorted = pprIdcharItems.sort((a, b) => b.count - a.count);
      pprIdcharItemsSorted.map(item => {
          let validpprId = item.pprId;
          item.items.map(car => {
              const charValue = charItems.filter(charItem => `${charItem.SapChar.split('_').slice(-1)}:${charItem.CharValue}` === car);
              if(PhysicalPropertyEnumerationId === 9) {
                PhysicalProperty = PhysicalPropertyItems.find(item => item.PhysicalPropertyRelationId === validpprId && item.PhysicalPropertyEnumerationId === PhysicalPropertyEnumerationId)?.PhysicalProperty || "";
                charValuesArray.push(PhysicalProperty);
              }  
              if (charValue.length === 0) {
                  validpprId = null;
              }
          });

         // if (validpprId !== null && PhysicalProperty === "") {
          if (validpprId !== null) {
              PhysicalProperty = PhysicalPropertyItems.filter(item => item.PhysicalPropertyRelationId === validpprId && item.PhysicalPropertyEnumerationId === PhysicalPropertyEnumerationId)[0].PhysicalProperty;
          }
      });

      // Store the accessories in drawingSheetResponse
      if (PhysicalPropertyEnumerationId === 9) {
          for (let i = 0; i < 10; i++) {
            drawingSheetResponse[`Accessory${i + 1}`] = charValuesArray[i] || "";
          }
      }
  }   else if (distinctPprIds.length === 1) {
    PhysicalProperty = PhysicalPropertyItems.filter(item => item.PhysicalPropertyEnumerationId === PhysicalPropertyEnumerationId)[0].PhysicalProperty;
    if (PhysicalPropertyEnumerationId === 9) {
      drawingSheetResponse[`Accessory${1}`] = PhysicalProperty || "";
    }

}

  //If PhysicalPropertyEnumerationId is between 10-18, get from stored drawingSheetResponse
  if (PhysicalPropertyEnumerationId >= 9 && PhysicalPropertyEnumerationId <= 18) {
      return drawingSheetResponse[`Accessory${PhysicalPropertyEnumerationId - 8}`] || "";
  }

  return PhysicalProperty;
};


const getPhysicalPropertyDim = (PhysicalPropertyItems, sapData) => {
  const charItems = sapData.outputParameters.char_summary_items.filter(item => ["Valve Configuration", "Valve Accessories", "Special Requirement"].includes(item.Tab));
  let PhysicalProperty = "";
  const PhysicalPropertyEnumerationIds = DimensionKeys.map(k => PhysicalConfigurationProperty[k]);
  const pprIds = PhysicalPropertyItems.filter(item => PhysicalPropertyEnumerationIds.includes(item.PhysicalPropertyEnumerationId))
      .map(item => item.PhysicalPropertyRelationId);
  const distinctPprIds = [...new Set(pprIds)];

  let pprIdcharItems = [];
  distinctPprIds.map(pprId => {
      const PhysicalPropertyItem = PhysicalPropertyItems.filter(item => item.PhysicalPropertyRelationId === pprId)
          .map(item => `${item.Abbr}:${item.ERPCode}`);
      pprIdcharItems.push({ pprId: pprId, items: [...new Set(PhysicalPropertyItem)], count: [...new Set(PhysicalPropertyItem)].length });
  });
  
  const pprIdcharItemsSorted = pprIdcharItems.sort((a, b) => b.count - a.count);
  let values = {};
  for(let i = 0; i < pprIdcharItemsSorted.length; i++) {
    const item = pprIdcharItemsSorted[i];
    // pprIdcharItemsSorted.forEach(item => {
    let validpprId = item.pprId;
    item.items.map(car => {
        const charValue = charItems.filter(charItem => `${charItem.SapChar.split('_')[3]}:${charItem.CharValue}` === car);            
        if (charValue.length === 0) {
            validpprId = null;
        }
    });
    if (validpprId !== null && PhysicalProperty === "") {
        const PhysicalProperties = PhysicalPropertyItems.filter(item => item.PhysicalPropertyRelationId === validpprId);
        values = DimensionKeys.reduce((acc, k) => {
          const val = PhysicalProperties.find(item => item.PhysicalPropertyEnumerationId === PhysicalConfigurationProperty[k])?.PhysicalProperty ?? "";
          acc[k] = val;
          return acc;
        }, {});
    }
    if(Object.keys(values).length > 0) {
      break;
    }
  }
  return values;
}

const getPricingData = (sapData) => {
  const calcVal = {
      netAdders: '0.00',
      listPrice: '0.00',
      listAdders: '0.00',
      customerDiscount: '0.00',
      customerDiscountSign: '%',
      currency: '',
      unitPrice: '0.00',
      delivery: '0.00',
      totalPrice: '0.00',
      quantity: sapData?.outputParameters?.Quantity,
  }
  const char_summary_items = sapData?.outputParameters?.char_summary_items;
  //pricing items
  const ZIVS = char_summary_items?.filter(item => ['ZIVS', 'ZIVM'].includes(item?.CondType));
  // discounts
  const ZID4 = char_summary_items?.filter(item => item?.CondType === 'ZID4');
  // net adders
  const ZIVR = char_summary_items?.filter(item => item?.CondType === 'ZIVR');
  if (ZIVS?.length > 0) {
      calcVal.listPrice = ZIVS?.reduce((acc, curr) => {
          const { CondVal } = curr;
          acc += Number(CondVal);
          return acc;
      }, 0);
  }
  if (ZIVR?.length > 0) {
      calcVal.netAdders = ZIVR?.reduce((acc, curr) => {
          if (!calcVal?.currency) {
              calcVal.currency = curr?.Curr;
          }
          const { CondVal } = curr;
          acc += Number(CondVal);
          return acc;
      }, 0);
  }
  if (ZID4?.length > 0) {
      calcVal.customerDiscount = ZID4?.reduce((acc, curr) => {
          const { CondVal } = curr;
          acc += Number(CondVal?.slice(0, -1));
          return acc;
      }, 0);
  }
  if (!calcVal?.currency) {
      calcVal.currency = 'USD';
  }
  // const propertyName = memb.Param;
  const listData = {
      ZIVS,
      ZIVR,
      ZID4
  }
  const unitPrice = (((Number(calcVal?.listPrice) + Number(calcVal?.listAdders)) * (1 - Number(calcVal?.customerDiscount) / 100))) + Number(calcVal?.netAdders);
  const totalPrice = unitPrice * Number(calcVal?.quantity);
  calcVal.unitPrice = `${calcVal?.currency} ${unitPrice?.toFixed(2)}`;
  calcVal.totalPrice = `${calcVal?.currency} ${totalPrice?.toFixed(2)}`;
  return {calcVal, listData};
  // if (Object.keys(calcVal).includes(propertyName)) {
  //     return calcVal[propertyName];
  // }
  // if (!propertyName) {
  //     return '';
  // }
  // try {
  //     const [key, keyParam] = propertyName.split('.');
  //     const [keyVal, keyIndex] = key.slice(0, -1).split('[');
  //     if (keyVal === 'ZID4' && keyParam === 'CondVal' && listData[keyVal][keyIndex][keyParam]) {
  //         if (memb.Description === 'percentage') {
  //             return '%';
  //         } else {
  //             return listData[keyVal][keyIndex][keyParam].slice(0, -1);
  //         }
  //     }
  //     return listData[keyVal][keyIndex][keyParam];
  // } catch (err) {
  //     return {};
  // }
}

const drawingValveImageUrl = (sizingData) => {
  try {
    const imageModel = drawingSheetImages.find(el => el.model === sizingData.ModelNumber);
    return `drawing_sheet_images/${imageModel.image}`;
  } catch {
    return `drawing_sheet_images/Default.png`;
  }
}
const drawingImage = async (modelId) => {
    try{
        const query = `SELECT "DrawingImage" FROM public."Models" WHERE "ModelId" = $1`;
        const data = await pool.query(query, [modelId]);
        return `drawing_sheet_images_new/${data?.rows?.[0]?.DrawingImage}`;
    }
    catch(err) {
        console.log(err);
        return null;
    }
}

const dataSheetImage = async (modelId) => {
  try{
      const query = `SELECT "SchematicImage" FROM public."Models" WHERE "ModelId" = $1`;
      const data = await pool.query(query, [modelId]);
      return `drawing_sheet_images_new/${data?.rows?.[0]?.SchematicImage}`;
  }
  catch(err) {
      console.log(err);
      return null;
  }
}

const UOM = require("../models/UOM");
const ValveDimensionKeys = [
  "ValveDimensionA",
  "ValveDimensionB",
  "ValveDimensionC",
  "ValveDimensionD",
  "ValveDimensionE",
  "ValveDimensionF",
  "ValveDimensionG",
  "ValveDimensionH"
];
const getDimensionData = async (sapData, modelId, uoms, pool) => {
  const drawingSheetResponse = {};
  const abbrValues = [];
  const codeValues = [];
  sapData.outputParameters?.char_summary_items.forEach((item) => {
    const Abbr = item.SapChar.split("_").slice(-1)[0];
    const Code = item.CharValue;
    if(Abbr !== '') {
      abbrValues.push(Abbr);
      codeValues.push(Code);
    }
  });
  const baseQuery = `Select pp."PhysicalPropertyRelationId", "Abbr", "ERPCode", "PhysicalPropertyEnumerationId", "PhysicalProperty"  from public."PhysicalProperties" pp Inner Join public."PhysicalPropertyRelations" ppr  ON pp."PhysicalPropertyRelationId" = ppr."PhysicalPropertyRelationId" Inner Join public."SectionChoices" sc  ON ppr."SectionChoiceId" = sc."SectionChoiceId" Inner Join public."ConfigurationSections" cs  ON cs."ConfigurationSectionId" = sc."ConfigurationSectionId" WHERE  "ModelId" = $1${abbrValues.length > 0 ? ' AND ("Abbr", "ERPCode") IN (SELECT * FROM unnest($2::text[], $3::text[]))' : ''}`;
  const finalParams = abbrValues.length > 0 ? [modelId, abbrValues, codeValues] : [modelId];
  let data = await pool.query(baseQuery, finalParams);

  Object.keys(PhysicalConfigurationProperty).forEach(key => {
    const s = new Date();
    if(!DimensionKeys.includes(key)) {
      const val = getPhysicalProperty(PhysicalConfigurationProperty[key], data.rows, sapData,drawingSheetResponse);
      const e = new Date();
      drawingSheetResponse[key] = val;
    }
  });  
  
  const filteredData = data.rows;
  const dimensionDataPhysical = filteredData.filter(
      (e) => {
          const dimensionKeys = DimensionKeys.map(v => PhysicalConfigurationProperty[v]);
          return dimensionKeys.includes(parseInt(e.PhysicalPropertyEnumerationId))
  }
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
    const k1 = Object.keys(PhysicalConfigurationProperty).find((k) => PhysicalConfigurationProperty[k] === dimensionDataKeys);
    drawingSheetResponse[k1] = e.PhysicalProperty;
    if(ValveDimensionKeys.includes(k1)) {
      drawingSheetResponse[`${k1}_mm`] = convertUnit(e.PhysicalProperty, uoms.find(u => u.UnitKey === "length.in"), uoms.find(u => u.UnitKey === "length.mm"));
    } else if (["Weight"].includes(k1)) {
      drawingSheetResponse[`${k1}_kg`] = convertUnit(e.PhysicalProperty, uoms.find(u => u.UnitKey === "mass.lbm"), uoms.find(u => u.UnitKey === "mass.kg"));
    }
  });
  return { ...drawingSheetResponse };
}

const getErpPositionMapping = async (modelId, sapData, pool) => {
  const abbrValues = [];
  const codeValues = [];
  sapData.outputParameters.char_summary_items.forEach((item) => {
    const Abbr = item.SapChar.split("_").slice(-1)[0];
    const Code = item.CharValue;
    if(Abbr !== '') {
      abbrValues.push(Abbr);
      codeValues.push(Code);
    }
  });
  const query = `SELECT * FROM public."ConfigurationModels" AS CM
  INNER JOIN public."ConfigurationSections" AS CS
  ON CS."ConfigurationModelId" = CM."ConfigurationModelId"
  INNER JOIN public."SectionChoices" AS SC
  ON SC."ConfigurationSectionId" = CS."ConfigurationSectionId"
  WHERE CM."ModelId" = $1${abbrValues.length > 0 ? ' AND ("Abbr", "ERPCode") IN (SELECT * FROM unnest($2::text[], $3::text[]))' : ''}
  ORDER BY CS."ERPPosition"::INT ASC`;
  const params1 = abbrValues.length > 0 ? [modelId, abbrValues, codeValues] : [modelId];
  const erpPositionMapping = await pool.query(query, params1);

  const query1 = `SELECT SRS."SectionCode", SRSC."SAPDescription", SRSC."ERPCode", SRS."DisplayOrder", SRSC."DisplayOrder" as "display_order1" 
	FROM public."Sections" AS SRS
  INNER JOIN public."SpecialRequirements" AS SRSC
  ON SRS."SectionId" = SRSC."SectionId"${abbrValues.length > 0 ? ' WHERE ("SectionCode", "ERPCode") IN (SELECT * FROM unnest($1::text[], $2::text[]))' : ''}
  ORDER BY SRSC."DisplayOrder" ASC`;
  const params2 = abbrValues.length > 0 ? [abbrValues, codeValues] : [];
  const erpSpecialRequirementsMapping = await pool.query(query1, params2);
  return {
    erpPosition: erpPositionMapping.rows,
    erpSpecialRequirements: erpSpecialRequirementsMapping.rows,
  };
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
    return response.data;
  } catch (error) {
    console.log("error----------------------", error);
    return {error};
  }
};

const getSizingDetails = async (req, res) => {
  try {
    const SizingId = req.query?.SizingId || req.query?.sizingId || req.query?.Sizingid || req.query?.sizingid;
    const start = new Date();
    const q = `SELECT * FROM public."GetSizingDataOnReports"($1)`;
    let data = await pool.query(q, [SizingId]);
    const end = new Date();
    console.log(end - start);
    let sizingDetails = data?.rows[0];
    sizingDetails = sizingDetails?.SelectedValve??data?.rows[0]?.GetSizingDataOnReports
    const drawingImageUrl = await drawingImage(sizingDetails?.SelectedValve[0]?.ModelId);
    const dataSheetImageUrl = await dataSheetImage(sizingDetails?.SelectedValve[0]?.ModelId);
    res.send(
      {
        sizingData: sizingDetails,
        drawingImageUrl,
        dataSheetImageUrl
      }
    );
  } catch (err) {
    // CWE-200: log internally only — do not expose err details to client
    console.error('[getSizingDetails]', err);
    res.status(500).send({ error: 'Reports will not generate without a valid sizing.' });
  }
}
const getConfigDetails = async (req, res) => {
  try {
    const ConfigId = req.body?.ConfigId || req.body?.configId || req.body?.Configid || req.body?.configid;
    const sizingDetails = req.body?.sizingDetails;
    const modelId = sizingDetails?.SelectedValve[0]?.ModelId;
    const modelNumber = sizingDetails?.SelectedValve[0]?.ModelNumber;
    let sapData = {};
    let erpPositionMapping = {};
    let getPriceing = {};
    if (!!ConfigId && ConfigId !== 'null') {
      sapData = await getSapData(ConfigId);
      getPriceing = await getPricingData(sapData);
      const sapModel = sapData?.outputParameters?.SizingModel;
      if(!sapData?.error && modelNumber === sapModel) {
        erpPositionMapping = await getErpPositionMapping(modelId, sapData, pool);
      } else {
        throw new Error();
      }
    }
    res.json(
      {
        sapData,
        erpPositionMapping,
        getPriceing
      }
    );
  }
  catch (err) {
    // CWE-200: log internally only — do not expose err details to client
    console.error('[getConfigDetails]', err);
    res.status(500).send({ error: 'Configuration is invalid or incomplete. Reports will generate without configuration data.' });
  }
}

const getDimensionDetails = async (req, res) => {
  try {
    const ConfigId = req.body?.ConfigId || req.body?.configId || req.body?.Configid || req.body?.configid;
    if(!ConfigId) {
      return res.status(400).send({error: "Configuration is invalid or incomplete. Reports will generate without configuration data."});
    }
    const sapData = await getSapData(ConfigId);
    const sizingDetails = req.body?.sizingDetails;
    const modelId = sizingDetails.SelectedValve[0].ModelId;
    const Id = sizingDetails.SizingDetails[0].Id;
    const uoms = [];
    const uomRes = await pool.query('SELECT * FROM "UOM";');
    uomRes.rows.forEach((data) => {
        uoms.push(new UOM(data));
    });
    const dimensionData = await getDimensionData(sapData, modelId, uoms, pool);
    const inUom = uoms.find(u => u.UnitKey === "length.in");
    const cmUom = uoms.find(u => u.UnitKey === "length.cm");
    Do = { Value: dimensionData?.OutletDiameter, UOM: "in", uomKey: "length.in" };
    r = { Value: 100, UOM: "ft", uomKey: "length.ft" };
    u = { Value: '', UOM: "ft/s", uomKey: "velocity.fts" };
    receivedReactionForceUOM = 'lbf';
    if(sizingDetails.SizingDetails[0]?.DisplayUnitSystem === 'Metric') {
      Do.UOM = "cm";
      Do.uomKey = "length.cm";
      receivedReactionForceUOM =  'N';
      r =  { Value: 30.48, UOM: "m", uomKey: "length.m" }
      u = { Value: '', UOM: "m/s", uomKey: "velocity.ms" };
      Do.Value = convertUnit(Do.Value, inUom, cmUom);
    }
    valveCalculation = await calculateReactionForceCalculations(sizingDetails, Do, r, u, receivedReactionForceUOM, uoms);
    const updateQuery = `UPDATE public."SelectedValve" SET "NoiseForceCalculations" = $1 WHERE "Id" = $2`;
    await pool.query(updateQuery, [JSON.stringify(valveCalculation), Id]);
    res.send(
      {
        dimensionData: {
          ValveConfiguration : dimensionData
        },
        valveCalculation
      }
    );
  } catch (err) {
    // CWE-200: log internally only — do not expose err details to client
    console.error('[getDimensionDetails]', err);
    res.status(500).send({ error: 'Dimension data could not be fetched. Reports will generate without dimension data.' });
  }
}

const performCalculations = async (req, res) => {
  try {
    const { sizingDetails, GasOutletDensity, LiquidDensityOutlet, OutletGasMassFraction, OutletStaticPressure, OutletDiameter, DistanceFromValve, Velocity, ReactionForce } = req.body;
    const uoms = [];
    const uomRes = await pool.query('SELECT * FROM "UOM";');
    uomRes.rows.forEach((data) => {
        uoms.push(new UOM(data));
    });
    const valveCalculation = await calculateReactionForceCalculations(sizingDetails, OutletDiameter, DistanceFromValve, Velocity, ReactionForce.UOM, uoms, true, GasOutletDensity, LiquidDensityOutlet, OutletGasMassFraction, OutletStaticPressure);
    const payload = {
      ...valveCalculation,
      DistanceFromValve,
      OutletDiameter,
      Velocity
    }
    const Id = sizingDetails.SelectedValve[0].Id;
    const updateQuery = `UPDATE public."SelectedValve" SET "NoiseForceCalculations" = $1 WHERE "Id" = $2`;
    await pool.query(updateQuery, [JSON.stringify(payload), Id]);
    res.json(valveCalculation);
  } catch (err) {
    // CWE-200: log internally only — do not expose err details to client
    console.error('[performCalculations]', err);
    res.status(500).send({ error: 'Error during calculation' });
  }
}


const getSizingDataForReports = async (sizingId, reportType, templateId, configId, index, knex) => {
  const reportTypes = {
    "CalcSheet": "1",
    "DataSheet": "2",
    "DrawingSheet": "3",
    "ConfigSheet": "4",
  }
  const reportTypeId = reportTypes[reportType];
  const host = "";
  let selectedTemplateId = index === 3 ? 16.1 : templateId;
  // Step 0) get uom
  const uomResults = await knex.from("report_uoms").select("*");
  // step 1) get sizing data
  let sizingData = await getSizingReportData(
    knex,
    sizingId
  );
  // fetch sapData
  // url 'https://sandbox.gateway.emerson.com/api/aslplm/configurator-dev/v1/configurator?configHeaderId=0200005904_000010'
  let sapData;
  if (configId !== "null") {
    sapData = await getSapData(configId);
    sapData.erpPositionMapping = await getErpPositionMapping(
      sizingData[0].model_id,
      knex
    );
    sapData.dimensionData = await getDimensionData(
      sizingData[0].model_id,
      sapData,
      knex
    );
  } else {
    sapData = {};
  }

  sizingData[0].calc_result.ksc = 1; //hardcoded value
  //    const Po = await reportData.calculatePo(sizingData);
  if (sizingData.length === 0) return res.send({});

  // sizingData[0].outletStaticPressure = Po.data.P_o;
  // sizingData[0].outletStaticPressure_uom = sizingData[0].pressure_uom;
  // step 2) do the mapping for reports
  let reportsResponse = await mapSizingDataForReports(
    sizingData[0],
    uomResults,
    reportTypeId,
    selectedTemplateId,
    sapData,
    host
  );

  return reportsResponse;
}

const getHtmlTableTemplateData = async (req, res) => {
  try {
    const host = (req.headers.host === "localhost:4000" ? "http" : "https") + "://" + req.headers.host;

    let data = null;
    if (["DataSheet", "CalcSheet"].includes(req.params.reportType)) {
      data = await getSizingDataForReports(req.params.sizingId, req.params.reportType, null, req.params.configId, null, req.knex);
    } else if (!['CalcSheet', 'ConfigSheet', 'DrawingSheet'].includes(req.params.reportType)) {
      data = await getSizingDetails(req.params.sizingId, req.knex);
    }
    if (req.params.reportType === "CalcSheet") {
      let arrTemplateId = await getTemplateIdV2(data, req.params.reportType, req.knex);

      if (data.IsLiquid2.Value === 'true') {
        arrTemplateId.push('16');
      }

      let allPromises = arrTemplateId.map((templateId, i) => {
        return new Promise(async (resolve, reject) => {
          data = await getSizingDataForReports(req.params.sizingId, req.params.reportType, templateId, req.params.configId, i, req.knex)

          const arrOfHtmlTable = await getHtmlTableTemplateV2(req.params, req.body.sapData, data, req.knex, [templateId], i);

          resolve(arrOfHtmlTable)
        })
      })

      Promise.all(allPromises).then(data => {
        res.send(data)
      })
    } else if (["DataSheet"].includes(req.params.reportType)) {
      let arrTemplateId = await getTemplateIdV2(data, req.params.reportType, req.knex);

      console.log({ arrTemplateId })

      const arrOfHtmlTable = await getHtmlTableTemplateV2(req.params, req.body.sapData, data, req.knex, arrTemplateId, 0);

      return res.send(arrOfHtmlTable);
    } else if (req.params.reportType === "ModelSummary") {
      const arrOfHtmlTable = [modelSummaryTable(data.sizingData, req.body.sapData)];

      res.json(arrOfHtmlTable);
    } else if (req.params.reportType === "ProjectSummary") {
      const arrOfHtmlTable = [projectSummaryTable(data.sizingData, req.body.sapData)];

      res.json(arrOfHtmlTable);
    } else if (["ConfigSheet", "DrawingSheet"].includes(req.params.reportType)) {
      let arrTemplateId = await getTemplateIdV2(data, req.params.reportType, req.knex);
      data = await getSizingDataForReports(req.params.sizingId, req.params.reportType, arrTemplateId[0], req.params.configId, null, req.knex);
      const arrOfHtmlTable = await getHtmlTableTemplateV2(req.params, req.body.sapData, data, req.knex, arrTemplateId, 0);
      return res.send(arrOfHtmlTable);
    } else {
      const arrOfHtmlTable = await getHtmlTableTemplate(req.params, req.body.sapData, data, req.knex);
      res.send(arrOfHtmlTable)
    }
  } catch (err) {
    // CWE-200/CWE-209: log internally only — never expose err.message or stack to client
    console.error('[getHtmlTableTemplateData]', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
};

module.exports = {
  getSizingDetails,
  getConfigDetails,
  getDimensionDetails,
  performCalculations,
  getHtmlTableTemplateData
};