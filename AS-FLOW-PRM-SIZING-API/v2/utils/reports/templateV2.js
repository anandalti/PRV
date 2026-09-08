const { subSIZING_conditions, subMOC_conditions } = require("./datasheet_json");
const { getsubtemplateidForSubFlow } = require("./datasheet_table");

const defaultValveDimension = {
    A: "",
    B: "",
    C: "",
    D: "",
    E: "",
    F: "",
    G: "",
    H: "",
    Weight: "",
    // 
    InletConnection: "", //2
    OutletConnection: "", //6
    InletFinish: "", //4
    OutletFinish: "", //8
    InletRating: "", //3
    OutletRating: "", //7,
    InletSize: "", //1
    OutletSize: "", //5
    BodyMaterial: "", //22 for pricing summary
    // 
    A_mm: "",
    B_mm: "",
    C_mm: "",
    D_mm: "",
    E_mm: "",
    F_mm: "",
    G_mm: "",
    H_mm: "",
    Weight_kg: "",
    //
    OutletDiameter: ""
};

const ValidationChecks =
    [
        { "Id": 1, "FlowType": "Any", "UnitType": "Any", "Expressions": "null", "Condition": "No Condition" },
        { "Id": 2, "FlowType": "Mass", "UnitType": "English", "Expressions": "null", "Condition": "ME" },
        { "Id": 3, "FlowType": "Mass", "UnitType": "Metric", "Expressions": "null", "Condition": "MM" },
        { "Id": 4, "FlowType": "Volumetric", "UnitType": "English", "Expressions": "null", "Condition": "VE" },
        { "Id": 5, "FlowType": "Volumetric", "UnitType": "Metric", "Expressions": "null", "Condition": "VM" },
        { "Id": 6, "FlowType": "Mass", "UnitType": "Any", "Expressions": "null", "Condition": "Mass Only" },
        { "Id": 7, "FlowType": "Volumetric", "UnitType": "Any", "Expressions": "null", "Condition": "Valumetric Only" },
        { "Id": 8, "FlowType": "Any", "UnitType": "English", "Expressions": "null", "Condition": "English Only" },
        { "Id": 9, "FlowType": "Any", "UnitType": "Metric", "Expressions": "null", "Condition": "Metric Only" },
        { "Id": 10, "FlowType": "Any", "UnitType": "English", "Expressions": "Omega == 0.5 && Eta_s == 1 && is2phase", "Condition": "English Eq. 1.35a >>>" },
        { "Id": 11, "FlowType": "Any", "UnitType": "Any", "Expressions": "Omega == 0.5 && Eta_s != 1 && is2phase", "Condition": "Equation 1.35b >>>" },
        { "Id": 12, "FlowType": "Any", "UnitType": "Any", "Expressions": "Omega != 0.5  && is2phase", "Condition": "<<< Equation 1.35c " },
        { "Id": 13, "FlowType": "Any", "UnitType": "Any", "Expressions": "Eta_s <= Eta_st  && is2phase", "Condition": "if Eta_s ≤ Eta_st (9th only) >>>" },
        { "Id": 14, "FlowType": "Any", "UnitType": "English", "Expressions": "1/PR > 2.859", "Condition": "English Eq. 1.9a " },
        { "Id": 15, "FlowType": "Any", "UnitType": "English", "Expressions": "1/PR <= 2.859", "Condition": "English Eq. 1.9b" },
        { "Id": 16, "FlowType": "Any", "UnitType": "Metric", "Expressions": "1/PR > 2.859", "Condition": "Metric 1.9a" },
        { "Id": 17, "FlowType": "Any", "UnitType": "Metric", "Expressions": "1/PR <= 2.859", "Condition": "Metric 1.9b" },
        { "Id": 18, "FlowType": "Any", "UnitType": "English", "Expressions": "PO <= 0.0", "Condition": "English Eq. 1.18a" },
        { "Id": 19, "FlowType": "Any", "UnitType": "English", "Expressions": "PO > 0.0", "Condition": "English Eq. 1.18b" },
        { "Id": 20, "FlowType": "Any", "UnitType": "Metric", "Expressions": "PO <= 0.0", "Condition": "Metric 1.18a >>>" },
        { "Id": 21, "FlowType": "Any", "UnitType": "Metric", "Expressions": "PO > 0.0", "Condition": "Metric 1.18b >>>" },
        { "Id": 22, "FlowType": "Mass", "UnitType": "Any", "Expressions": "null", "Condition": "Mass (Eng & Met) >>>" },
        { "Id": 23, "FlowType": "Any", "UnitType": "Any", "Expressions": "model != 9200", "Condition": "Not Model 9200" },
        { "Id": 24, "FlowType": "Any", "UnitType": "English", "Expressions": "model == 9200", "Condition": "Model 9200 (Eng) >>>" },
        { "Id": 25, "FlowType": "Any", "UnitType": "Metric", "Expressions": "model == 9200", "Condition": "Model 9200 (Met) >>>" },
        { "Id": 26, "FlowType": "Volumetric", "UnitType": "English", "Expressions": "P2 > Pc", "Condition": "<<< Sub-Crit (V-Eng) " },
        { "Id": 27, "FlowType": "Volumetric", "UnitType": "Metric", "Expressions": "P2 > Pc", "Condition": "Sub-Crit (V-Met) >>>" },
        { "Id": 28, "FlowType": "Mass", "UnitType": "English", "Expressions": "P2 > Pc", "Condition": "Sub-Crit (W-Eng) >>>" },
        { "Id": 29, "FlowType": "Mass", "UnitType": "Metric", "Expressions": "P2 > Pc", "Condition": "Sub-Crit (W-Met) >>>" },
        { "Id": 30, "FlowType": "Any", "UnitType": "English", "Expressions": "over_pressure_per == 10", "Condition": "<<< Pover = 10% " },
        { "Id": 31, "FlowType": "Any", "UnitType": "English", "Expressions": "over_pressure_per != 10", "Condition": " Pover ≠ 10% >>>" },
        { "Id": 32, "FlowType": "Any", "UnitType": "Metric", "Expressions": "over_pressure_per == 10", "Condition": "Metric Pover = 10% >>>" },
        { "Id": 33, "FlowType": "Any", "UnitType": "Metric", "Expressions": "over_pressure_per != 10", "Condition": "Metric Pover ≠ 10% >>>" },
        { "Id": 34, "FlowType": "Any", "UnitType": "English", "Expressions": "isAsme === true", "Condition": "<<< English ASME " },
        { "Id": 35, "FlowType": "Any", "UnitType": "Metric", "Expressions": "isAsme === true", "Condition": "Metric ASME >>>" },
        { "Id": 36, "FlowType": "Any", "UnitType": "English", "Expressions": "isApi == true", "Condition": "English API >>>" },
        { "Id": 37, "FlowType": "Any", "UnitType": "Metric", "Expressions": "isApi == true", "Condition": "Metric API >>>" },
        { "Id": 38, "FlowType": "Any", "UnitType": "English", "Expressions": "P2 <= Pc  && is2phase", "Condition": "<<< English Eq. 1.25" },
        { "Id": 39, "FlowType": "Any", "UnitType": "Metric", "Expressions": "P2 <= Pc  && is2phase", "Condition": " Metric Eq. 1.25 >>>" },
        { "Id": 40, "FlowType": "Any", "UnitType": "English", "Expressions": "P2 > Pc  && is2phase", "Condition": "English Eq. 1.26 >>>" },
        { "Id": 41, "FlowType": "Any", "UnitType": "Metric", "Expressions": "P2 > Pc  && is2phase", "Condition": "Metric Eq. 1.26 >>>" },
        { "Id": 42, "FlowType": "Any", "UnitType": "Any", "Expressions": "null", "Condition": "Restricted Lift CCS or CBB" },
        { "Id": 43, "FlowType": "Any", "UnitType": "English", "Expressions": "null", "Condition": "<<< English Eq. 1.49" },
        { "Id": 44, "FlowType": "Any", "UnitType": "Metric", "Expressions": "null", "Condition": "Metric Eq. 1.49 >>>" },
        { "Id": 45, "FlowType": "Any", "UnitType": "Any", "Expressions": "PS >= (Eta_st*P1)  && is2phase", "Condition": "Low Subcooling" },
        { "Id": 46, "FlowType": "Any", "UnitType": "Any", "Expressions": "PS < (Eta_st*P1)  && is2phase", "Condition": "High Subcooling(do not display block)" },
        { "Id": 47, "FlowType": "Any", "UnitType": "English", "Expressions": "null", "Condition": "<<< English Eq. 1.48 " },
        { "Id": 48, "FlowType": "Any", "UnitType": "Metric", "Expressions": "null", "Condition": "Metric Eq. 1.48 >>>" },
        { "Id": 49, "FlowType": "Any", "UnitType": "English", "Expressions": "(PS >= (Eta_st*P1)) && (P2 > Pc)  && is2phase", "Condition": "English & Low Subcooling & Subcritical" },
        { "Id": 50, "FlowType": "Any", "UnitType": "Any", "Expressions": "P2 <= Pc  && is2phase", "Condition": "Critical" },
        { "Id": 51, "FlowType": "Any", "UnitType": "Metric", "Expressions": "(PS >= (Eta_st*P1)) && (P2 > Pc)  && is2phase", "Condition": "Metric & Low Subcooling & Subcritical" },
        { "Id": 52, "FlowType": "Any", "UnitType": "Metric", "Expressions": "(PS >= (Eta_st*P1)) && (P2 <= Pc)  && is2phase", "Condition": "Metric & Low Subcooling & critical" },
        { "Id": 53, "FlowType": "Any", "UnitType": "English", "Expressions": "(PS < (Eta_st*P1)) && (P2 > Pc)  && is2phase", "Condition": "English & High Subcooling & Subcritical" },
        { "Id": 54, "FlowType": "Any", "UnitType": "English", "Expressions": "(PS < (Eta_st*P1)) && (P2 <= Pc)  && is2phase", "Condition": "English & High  Subcooling & critical" },
        { "Id": 55, "FlowType": "Any", "UnitType": "Metric", "Expressions": "(PS < (Eta_st*P1)) && (P2 > Pc)  && is2phase", "Condition": "Metric & High Subcooling & Subcritical" },
        { "Id": 56, "FlowType": "Any", "UnitType": "Metric", "Expressions": "(PS < (Eta_st*P1)) && (P2 <= Pc)  && is2phase", "Condition": "Metric & High Subcooling & critical" },
        { "Id": 57, "FlowType": "Mass", "UnitType": "Any", "Expressions": "liftCapacity === 'restricted'", "Condition": "<<< Mass Flow Units" },
        { "Id": 58, "FlowType": "Volumetric", "UnitType": "Any", "Expressions": "liftCapacity === 'restricted'", "Condition": "Volumetric Flow Units>>>" },
        { "Id": 59, "FlowType": "Any", "UnitType": "Any", "Expressions": "PS < (Eta_st*P1)  && is2phase", "Condition": "High Subcooling >>>(equation)" },
        { "Id": 60, "FlowType": "Any", "UnitType": "Any", "Expressions": "(PS >= (Eta_st*P1)) && (Eta_s <= Eta_st) && is2phase", "Condition": "Low Subcooling >>> (if Eta_s ≤ Eta_st (9th only) >>>)" },
        { "Id": 61, "FlowType": "Any", "UnitType": "Any", "Expressions": "data['KaDataset'].Value === 'ASME'", "Condition": "<<< ASME Data>>>" },
        { "Id": 62, "FlowType": "Any", "UnitType": "Any", "Expressions": "data['KaDataset'].Value === 'API'", "Condition": "<<< API Data>>>" },
        { "Id": 63, "FlowType": "Any", "UnitType": "Any", "Expressions": "(data['KaDataset'].Value === 'ASME' || data['KaDataset'].Value === 'API Wt.Avg.') && is2phase ", "Condition": "<<< ASME and API Weighted Average Method >>>" },
        { "Id": 64, "FlowType": "Any", "UnitType": "Any", "Expressions": "(data['KaDataset'].Value === 'API Fixed Mixed' || data['KaDataset'].Value === 'API Default') && is2phase", "Condition": "<<< API Fixed Mixed >>>" },
        { "Id": 65, "FlowType": "Any", "UnitType": "Any", "Expressions": "Number(over_pressure_per).toFixed(0) != 10", "Condition": "over pressure % should not be equal to 10" },
        { "Id": 66, "FlowType": "Any", "UnitType": "Any", "Expressions": "templateId == 15", "Condition": "gas" },
        { "Id": 67, "FlowType": "Any", "UnitType": "Any", "Expressions": "templateId == 16", "Condition": "liquid" },
        // { "Id": 68, "FlowType": "Any", "UnitType": "Any", "Expressions": "liftCapacity === 'restricted'", "Condition": "restricted lift" },
        { "Id": 69, "FlowType": "Any", "UnitType": "Any", "Expressions": "!(FlowType === 'Mass' && isApi) && !(FlowType === 'Mass' && isNonCodeFLow)", "Condition": "liquid" },
        { "Id": 70, "FlowType": "Any", "UnitType": "English", "Expressions": "PO > 0", "Condition": "Po non negative" },
        { "Id": 71, "FlowType": "Any", "UnitType": "Metric", "Expressions": "PO > 0", "Condition": "Po non negative" },
        { "Id": 72, "FlowType": "Any", "UnitType": "Any", "Expressions": "PO > 0", "Condition": "Po non negative" },
        { "Id": 73, "FlowType": "English", "UnitType": "Any", "Expressions": "!(FlowType === 'Mass' && isApi) && !(FlowType === 'Mass' && isNonCodeFLow)", "Condition": "liquid" },
        { "Id": 74, "FlowType": "Metric", "UnitType": "Any", "Expressions": "!(FlowType === 'Mass' && isApi) && !(FlowType === 'Mass' && isNonCodeFLow)", "Condition": "liquid" },
    ];
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
const drawingValveImageUrl = (sizingData) => {
    let image = "";
    drawingSheetImages.forEach(el => {
        if (el.model === sizingData.model) {
            image = el.image;
        }
    })

    return `<img src='/drawing_sheet_images/${sizingData.brand}/${image}' style="width: 100%;">`
}

const getTempInKelvin = (val, tempUOM) => {
    const temp_uom = tempUOM.split(".")[1];
    if (temp_uom === "degK") {
        return val
    }

    if (temp_uom === "degC") {
        return val + 273.15
    }

    if (temp_uom === "degR") {
        return val * (5 / 9);
    }

    if (temp_uom === "degF") {
        return (val - 32) * (5 / 9) + 273.15
    }
}

const templateID_conditions = {
    "APO": 34, "ACS": 34, "ABP": 34, "CCS": 34, "CBB": 34, "CBP": 34, //higPressureReport
    "ALP": 35, "AWL": 35, //lowPressureReport
    "VSO": 36, "VWL": 36, //tankVentReport
    "VFA": 37, //flameArresterReport
    "VFV": 38 //freeVentReport
}

const validateConditionsForTempalteID = (conditions, productType) => {
    let checkUndefinedVal = conditions[productType] ? conditions[productType] : "Template ID doesn't exist for this productType"
    return checkUndefinedVal;
}

const getTheTemplateIDForDataSheet = (sizingData) => {
    return validateConditionsForTempalteID(templateID_conditions, sizingData.Brand.Value[0] + sizingData.ValveType.Value)
}


const getTemplateIdV2 = async (data, reportType, knex) => {
    let idArr;

    if (reportType === "CalcSheet") {
        const TemplateConditions = await knex.from("reports_template_conditions")
        const ServiceType = data["ServiceType"].Value === "Steam" ? "S" : data["ServiceType"].Value === "Liquid" ? "L" : "G";
        const isCritical = data["Is_Flow_Critical_Subcritical"].Value === false ? "N" : "Y"
        console.log("result critical-----------", isCritical)
        idArr = TemplateConditions.filter(e =>
            e["Brand"] === data["Brand"].Value &&
            e["valve_type"] === data["ValveType"].Value &&
            e["model"] === data.Valve_Model_Number.Value &&
            e["service_type"] === ServiceType &&
            (!e["is_critical"] || e["is_critical"] === isCritical) &&
            data["Service"].Value.includes(e["service"]) &&
            e["sizingMethodology"] === data["Code"].Value
        ).map(e => e.TemplateID)

        if (data["Code"].Value === "Non Flashing Liquid + Gas (D.2.1)") { //1.4.3.2
            idArr = idArr.length > 0 ? [21] : []
        }
        if (data["Code"].Value === "Flashing Liquid + lts Vapor (D.2.1)") { //1.4.3.1
            // 1.21 = 20
            // 1.22 = 19
            if (data["Inlet_Relieving_Pressure_P1"].Value <= 0.5 || getTempInKelvin(Number(data["Relieving_Temperature_T"].Value), data["Relieving_Temperature_T"].UOM) <= 0.5) {
                idArr = idArr.length > 0 ? [20] : []
            } else {
                idArr = idArr.length > 0 ? [19] : []
            }
        }
    }

    if (reportType === "DataSheet") {
        idArr = [getTheTemplateIDForDataSheet(data)];
    }

    // if (reportType === "TankCalc") {
    //     // TankidArr = getTheSubEqIDForTankSheet(sizingData);
    //     if (sizingData.code === "Non-Code (API 2000, 7th Edition)") {
    //         idArr = [41]
    //     }
    //     else {
    //         return idArr = [42]
    //     }
    // }

    if (reportType === "DrawingSheet") {
        idArr = [39]
    }

    if (reportType === "ConfigSheet") {
        idArr = [40]
    }

    // if (reportType === "PricingSummary") {
    //     idArr = [44]
    // }

    // if (reportType === "InternalPricingSummary") {
    //     const datasheetId = getTheTemplateIDForDataSheet(sizingData);
    //     idArr = [46, datasheetId, 40, 43, 45];
    // }

    return idArr;
}


const GetValidationCheckIdV2 = (data, templateId) => {
    const FlowType = data["MassFlowOrVolumetric"].Value;
    const UnitType = data["CalcMethod"].Value;

    const Omega = data["Omega_ω"].Value;
    const is2phase = data["ServiceType"].Value === "2-Phase";
    const Eta_s = data["Saturation_Pressure_Ratio_ηs"].Value;
    const Eta_st = data["Transition_Saturation_Pressure_Ratio_ηst"].Value;
    const PR = data["PR"].Value;
    const PS = data["Saturation_Pressure_Ps"].Value;
    const PO = data["Po"].Value;
    const model = data.Valve_Model_Number.Value;
    const P2 = data["Outlet_Pressure_P2"].Value;
    const Pc = data["Critical_Pressure_Pc"].Value;
    const over_pressure_per = data["OverPressurePer"].Value;
    const isAsme = data["KaDataset"].Value === "ASME";
    const isApi = data["KaDataset"].Value === "API";
    const P1 = data["Inlet_Relieving_Pressure_P1"].Value;
    const liftCapacity = "full";
    const isNonCodeFLow = data["Code"].Value.includes("Non-Code");

    let idArr = ValidationChecks.filter(e =>
        (e["FlowType"] === "Any" || e["FlowType"] === FlowType)
        &&
        (e["UnitType"] === "Any" || e["UnitType"] === UnitType)
        &&
        (e["Expressions"] == "null" || eval(e["Expressions"]))
    ).map(e => e["Id"]);

    console.log({ idArr })

    return idArr;
}

const groupBy = function (xs, key) {
    return xs.reduce(function (rv, x) {
        (rv[x[key]] = rv[x[key]] || []).push(x);
        return rv;
    }, {});
};


const GetStyle = (memb) => {
    var style = "font-family:Arial; font-size: 8pt; padding: 2pt;font-family: 'Microsoft Sans Serif'; " + memb.Style;
    return style;
}

// // Get SubMoc============================
const getsubtemplateIdForMOC = (templateId, sizingData) => {
    const subTemplateId = subMOC_conditions.filter((element) => (element.brand_valve_type === "NA" || element.brand_valve_type === sizingData.Brand.Value[0] + sizingData.ValveType.Value) && element.templateId === templateId && (element.model === "all" || (eval(element.model))) && (element.service_type === "NA" || element.service_type === sizingData.ServiceType.Value) && (element.pressure_selected ? element.pressure_selected === sizingData.PressureCheckBox.Value : true) && (element.vacuum_selected ? element.vacuum_selected === sizingData.VacuumCheckBox.Value : true)).map(element => {
        return element.subTemplateId;
    })

    console.log("subTemplateIdForMoc", subTemplateId)

    return subTemplateId;
}

const getsubtemplateIdForsubSIZING = (templateId, sizingData) => {
    // const isSuperCritical = () => {
    //     const t = parseFloat(tempData.relievingTemp);
    //     const pcrit = parseFloat(systemData.criticalPressure);
    // }

    const subTemplateId = subSIZING_conditions.filter((element) => element.templateId === templateId && element.service_type === sizingData.ServiceType.Value && (element.code === "all" || eval(element.code)) && (element.expression ? eval(element.expression) : true)).map(element => {
        return element.subTemplateId;
    })

    return subTemplateId;
}

const GetCellValue = (memb, data, templateId, SubTemplatehtml, VCId, sapData, reportType) => {
    // If method Function, put the below in a function of its own
    if (memb.ValueType === "M" && (memb.Description === "SubFlow" || memb.Description === "MOC" || memb.Description === "SubSizingData")) {
        let subTemplateId;
        if (memb.Description === "SubFlow") {
            subTemplateId = getsubtemplateidForSubFlow(templateId, data);
        }
        if (memb.Description === "MOC") {
            subTemplateId = getsubtemplateIdForMOC(templateId, data);
        }
        if (memb.Description === "SubSizingData") {
            subTemplateId = getsubtemplateIdForsubSIZING(templateId, data);
            console.log({ subTemplateId })
        }

        if (subTemplateId.length === 0) return "Work In Progress";

        let htmlString = `<table style="border-collapse: collapse;border:1px solid lightgray;width: 100%;">`;

        let groubedByRow = groupBy(SubTemplatehtml.filter(a => a.STId == subTemplateId[0] && VCId.includes(a.VCId)), "RowId");

        Object.keys(groubedByRow).forEach(function (category) {
            htmlString += "<tr>";
            groubedByRow[category].forEach(function (membb, i) {
                htmlString += `<td id="${membb.Id}" data-tempalteId="${templateId}" data-subTemplateId="${subTemplateId[0]}" rowspan="${membb.Rowspan}" colspan="${membb.Colspan}"${membb.Description === '<#>' ? ` data-pageType='currentPage'` : ''}${membb.Description === '<##>' ? ` data-pageType='totalPage'` : ''} style="${GetStyle(membb)}" >
                        ${GetCellValue(membb, data, templateId, SubTemplatehtml, VCId, sapData, reportType)}
                    </td>`;
            })
            htmlString += "</tr>";
        });
        return htmlString += `</table>`;
    }
    // if (memb.ValueType === "M" && (memb.Description === "ListConfigDataForSAP")) {
    //     const erpCodeListHtml = renderMethodFunctions(sapData, "Config Report", templateId);

    //     return erpCodeListHtml;
    // }


    // TankCalc2000
    // if (memb.ValueType == "M" &&
    //     ((memb.Description === "Tank_SubSubmmary") || (memb.Description === "Tank_Drawing") || memb.Description === ("Tank_Type")
    //         || memb.Description === ("Tank_SubInput") || memb.Description === ("Tank_SubEq"))
    // ) {
    //     cellvalue = tankCalcSubTable(memb.Description, data, memb, VCId, templateId, SubTemplatehtml, sapData, reportType);
    //     return cellvalue;
    // }

    // pricingSummary
    // if (memb.ValueType == "M" && memb.Description === "PricingDetails" && reportType === "PricingSummary") {
    //     cellvalue = pricingSummarySubTable(data.sizingData, templateId);
    //     return cellvalue;
    // }


    // internalPricingSummary
    // if (memb.ValueType == "M" && memb.Description === "PricingDetails" && reportType === "InternalPricingSummary") {
    //     cellvalue = internalPricingSummarySubTable(data.sizingData, templateId);
    //     return cellvalue;
    // }

    //TankCalc521
    // if (memb.ValueType == "M" &&
    //     ((memb.Description === "Sub - VesselData") || (memb.Description === "Vessel_Image"))) {
    //     cellvalue = tankCalcSubTable521(memb.Description, data, memb, VCId, templateId, SubTemplatehtml, sapData, reportType);
    //     return cellvalue;
    // }

    // If not Method Function
    var cellvalue = memb.CellValue;
    if (memb.ValueType == "P") {
        var propertyName = memb.Param_1;
        if (!propertyName) return '';
        var params = propertyName.split('.');
        if (data != null && data[params[0]]) {
            cellvalue = data[params[0]][params[1]];
        }
        if (cellvalue?.length <= 0 || cellvalue == undefined) {
            // cellvalue = memb.Param; // display the Param itself for debugging
            cellvalue = ""; // display nothing
        }
        // dynamic params==============
        // if (memb.Param === "showDynamicImage") {
        //     cellvalue = `<img src="${getDataSheetImage(data.sizingData)}" style="width: 85px">`;
        // }
        // if (memb.Param === "getDataSheetModel") {
        //     cellvalue = getCatalogNumber(sapData) !== "" ? getCatalogNumber(sapData) : data.sizingData.model;
        // }
        // if (memb.Description === "<MULTIPLE VALVE APPLICATION>") {
        //     cellvalue = data.sizingData.singleOrMultivalve === "single" ? "" : "MULTIPLE VALVE APPLICATION"
        // }
        // if (memb.Param === "getERPCode") {
        //     cellvalue = generateERPCode(sapData);
        // }
        // if (memb.Param === "generateDate") {
        //     cellvalue = getDateFunc();
        // }
        if (memb.Param === "drawingValveImageUrl") {
            cellvalue = drawingValveImageUrl({ brand: data.Brand.Value, model: data.ValveModelNumber.Value });
        }
        // if (memb.Param === "pricingTotalPrice") {
        //     cellvalue = "$ " + sapData.outputParameters.UnitPrice
        // }

        // if (memb.Param === "customerTotal" || memb.Param === "transferTotal") {
        //     cellvalue = "$ " + sapData.outputParameters.UnitPrice
        // }

        // if (memb.Param === "deliveryTotal") {
        //     cellvalue = "";
        // }
        // config sheet==========
        // const configCellVal = configReportParamsModification(memb, data, cellvalue);
        // if (reportType === "ConfigSheet" && configCellVal !== null) {
        //     cellvalue = configCellVal;
        // }
        // round of the decimal points
        // if (cellvalue && isNaN(cellvalue) === false && params[0] !== "model" && params[0] !== "quantity") {
        //     cellvalue = Number(cellvalue).toFixed(3);
        // }
    }
    // if (memb.ValueType == "S") {
    //     // config sheet==========
    //     const configCellVal = configReportCellValModification(data, cellvalue);
    //     if (configCellVal !== null) {
    //         cellvalue = configCellVal;
    //     }
    //     // drawing sheet==========
    //     if (data.sizingData.drawingSheetResponse.Weight) {
    //         const drawingSheetCellVal = drawingSheetCellValModification(data.sizingData, memb);
    //         if (drawingSheetCellVal === "make_pricing_uom_empty") {
    //             cellvalue = "";
    //         }
    //     }
    // }
    // cellvalue = cellvalue?.replace("#", "N/A");
    // if (memb.ValueType === "M" && reportType === "InternalPricingSummary") {
    //     const calcVal = {
    //         netAdders: '0.00',
    //         listPrice: '0.00',
    //         listAdders: '0.00',
    //         customerDiscount: '0.00',
    //         customerDiscountSign: '%',
    //         currency: '',
    //         unitPrice: '0.00',
    //         delivery: '0.00',
    //         totalPrice: '0.00',
    //         quantity: sapData.outputParameters.Quantity,
    //     }
    //     const char_summary_items = sapData.outputParameters.char_summary_items;
    //     //pricing items
    //     const ZIVS = char_summary_items.filter(item => ['ZIVS', 'ZIVM'].includes(item.CondType));
    //     // discounts
    //     const ZID4 = char_summary_items.filter(item => item.CondType === 'ZID4');
    //     // net adders
    //     const ZIVR = char_summary_items.filter(item => item.CondType === 'ZIVR');
    //     if (ZIVS.length > 0) {
    //         calcVal.listPrice = ZIVS.reduce((acc, curr) => {
    //             const { CondVal } = curr;
    //             acc += Number(CondVal);
    //             return acc;
    //         }, 0);
    //     }
    //     if (ZIVR.length > 0) {
    //         calcVal.netAdders = ZIVR.reduce((acc, curr) => {
    //             if (!calcVal.currency) {
    //                 calcVal.currency = curr.Curr;
    //             }
    //             const { CondVal } = curr;
    //             acc += Number(CondVal);
    //             return acc;
    //         }, 0);
    //     }
    //     if (ZID4.length > 0) {
    //         calcVal.customerDiscount = ZID4.reduce((acc, curr) => {
    //             const { CondVal } = curr;
    //             acc += Number(CondVal.slice(0, -1));
    //             return acc;
    //         }, 0);
    //     }
    //     if (!calcVal.currency) {
    //         calcVal.currency = 'USD';
    //     }
    //     const propertyName = memb.Param;
    //     const listData = {
    //         ZIVS,
    //         ZIVR,
    //         ZID4
    //     }
    //     const unitPrice = (((Number(calcVal.listPrice) + Number(calcVal.listAdders)) * (1 - Number(calcVal.customerDiscount) / 100))) + Number(calcVal.netAdders);
    //     const totalPrice = unitPrice * Number(calcVal.quantity);
    //     calcVal.unitPrice = `${calcVal.currency} ${unitPrice.toFixed(2)}`;
    //     calcVal.totalPrice = `${calcVal.currency} ${totalPrice.toFixed(2)}`;
    //     if (Object.keys(calcVal).includes(propertyName)) {
    //         return calcVal[propertyName];
    //     }
    //     if (!propertyName) {
    //         return '';
    //     }
    //     try {
    //         const [key, keyParam] = propertyName.split('.');
    //         console.log({ key, keyParam });
    //         const [keyVal, keyIndex] = key.slice(0, -1).split('[');
    //         if (keyVal === 'ZID4' && keyParam === 'CondVal' && listData[keyVal][keyIndex][keyParam]) {
    //             if (memb.Description === 'percentage') {
    //                 return '%';
    //             } else {
    //                 return listData[keyVal][keyIndex][keyParam].slice(0, -1);
    //             }
    //         }
    //         return listData[keyVal][keyIndex][keyParam];
    //     } catch (err) {
    //         return '<div style="min-height:1em"></div>';
    //     }
    // }
    if (!cellvalue) { return '<div style="min-height:1em"></div>' }
    return cellvalue;
}

const GetTableRows = (id, MappingSubTemplateWithTemplate, VCId, SubTemplatehtml, data, sapData, reportType) => {

    // var condition = 2;
    var htmlString = ''
    var subtemplates = groupBy(MappingSubTemplateWithTemplate.filter(a => a.TemplateId == id && a.IsParent === 1), "DisplayOrder");
    Object.keys(subtemplates).forEach(function (st) {
        subtemplates[st].forEach(function (sti, i) {
            var groubedByRow = groupBy(SubTemplatehtml.filter(a => a.STId == sti.SubTemplateId && VCId.includes(a.VCId)), "RowId");
            Object.keys(groubedByRow).forEach(function (category) {
                htmlString += "<tr>";
                const arrOfMemb = groubedByRow[category];
                arrOfMemb.sort((a, b) => a.ColumnId - b.ColumnId);
                arrOfMemb.forEach(function (memb, i) {
                    htmlString += `<td id="${memb.Id}" data-id="${memb.Id}" data-tempalteId="${sti.TemplateId}" data-subTemplateId="${sti.SubTemplateId}"
                    data-vcid="${memb.VCId}" rowspan="${memb.Rowspan}" colspan="${memb.Colspan}"${memb.Description === '<#>' ? ` data-pageType='currentPage'` : ''}${memb.Description === '<##>' ? ` data-pageType='totalPage'` : ''} style="${GetStyle(memb)}" >
                            ${GetCellValue(memb, data, id, SubTemplatehtml, VCId, sapData, reportType)}
                        </td>`;
                })
                htmlString += "</tr>";
            });
        });
    });
    return htmlString;
}

async function getHtmlTableTemplateV2(params, sapDataBody, data, knex, templateId, index) {
    const sapData = sapDataBody;
    // console.log("data.ModelId.Value------------", data.ModelId.Value, "host------", host);
    // data.ModelId.Value------------ 42 host------ http://localhost:4000
    // heavy calculation, run only once, be careful with below function ========
    const valveDimension = (params.reportType === "DrawingSheet" || params.reportType === "DataSheet" || params.reportType === "CalcSheet") && sapDataBody ? sapData.dimensionData : { ...defaultValveDimension };
    //since they need Do thats why generating them and saving in report engine api
    // if (params.reportType === "CalcSheet" && sapDataBody) {
    //     return valveDimension.OutletDiameter;
    // data.Outlet_Diameter_Do.UOM = "length.in"
    // const Ao = calculateAo(valveDimension.OutletDiameter);
    // data.Outlet_Area_AO.Value = Ao;
    // data.Outlet_Area_AO.UOM = "area.in2";

    // const obj = {
    //     "sizingId":params.sizingId,
    //     "outletDiameter": Number(valveDimension.OutletDiameter),
    //     "do_uom": "length.in",
    //     "outletArea_uom":"area.in2",
    //     "outletArea":Ao
    // }

    // try {
    //     const response = await axios({
    //         url: `${host}/htmlRouter/api/SaveReportCalculatedValues`,
    //         method: "POST",
    //         headers: {
    //             'Content-Type': 'application/json',
    //         },
    //         data: obj
    //     });
    //     // return response;
    // } catch (err) {
    //     console.log("err",err)
    //     return err;
    // }
    // }

    // po and fr once RE is checked
    // await calculatePo(data.sizingData, data.intermediateValues.calc_result, valveDimensions.OutletDiameter, Ao);
    // await calculateFr();

    // when generating pricing report for multiple config ids later, get this pricingSummaryData from parent of this function where we have array of sapData.
    // let pricingSummaryData = params.reportType === "PricingSummary" ? await getPricingSummaryData(data.sizingData, sapDataBody, host) : []
    // let internalPricingSummaryData = params.reportType === "InternalPricingSummary" ? await getInternalPricingSummaryData(data.sizingData, sapDataBody, host) : []
    let MappingSubTemplateWithTemplate = await knex.from("reports_mapping_subtemplates_withhtml")
    // console.log("MappingSubTemplateWithTemplate-------",MappingSubTemplateWithTemplate)
    MappingSubTemplateWithTemplate.forEach(e => {
        Object.keys(e).forEach(key => {
            e[key] = Number(e[key])
        })
    })
    // filter out which subtemplateID are required
    const mappingSubtemplateWithTemplateCopy = [...MappingSubTemplateWithTemplate];
    const requiredSubTemplateId = mappingSubtemplateWithTemplateCopy.filter(el => templateId.some(item => item.toString() === el.TemplateId.toString())).map(el => el.SubTemplateId);

    // filter out which subtemplateID are required
    const SubTemplatehtml_response = await knex.from("reports_sub_template_html").whereIn("STId", requiredSubTemplateId);

    // console.log("SubTemplatehtml_response-------",SubTemplatehtml_response)
    const SubTemplatehtml = SubTemplatehtml_response.map(e => {
        Object.keys(e).forEach(key => {
            if (e[key] === null) {
                e[key] = "";
            }
        })

        return {
            ...e,
            Id: Number(e.Id),
            STId: Number(e.STId),
            VCId: Number(e.VCId),
            RowId: Number(e.RowId),
            ColumnId: Number(e.ColumnId)
        }
    })
    // console.log("SubTemplatehtml-------",SubTemplatehtml)
    // console.log("arrTemplateId-------",arrTemplateId) //undefined in case of tankcalc sheet

    // Only for liquid 2 case for calcsheet report
    // if (data.IsLiquid2.Value === 'true') {
    //     arrTemplateId.push('16');
    // }
    // loop through templateid
    let arrayOfHtmlStrings = templateId.map((e, i) => {
        let htmlString = `<table class="main-reports-table" style="border-collapse: collapse;border:1px solid lightgray;width: 100%;">
        <tr class="reports-top-numbers" style="width:100%;height: 0px;display:none;"> <td style="width:0.5pt;">1</td><td style="width:0.5pt;">2</td><td style="width:0.5pt;">3</td><td style="width:0.5pt;">4</td><td style="width:0.5pt;">5</td><td style="width:0.5pt;">6</td><td style="width:0.5pt;">7</td><td style="width:0.5pt;">8</td><td style="width:0.5pt;">9</td><td style="width:0.5pt;">10</td><td style="width:0.5pt;">11</td><td style="width:0.5pt;">12</td><td style="width:0.5pt;">13</td><td style="width:0.5pt;">14</td><td style="width:0.5pt;">15</td><td style="width:0.5pt;">16</td><td style="width:0.5pt;">17</td><td style="width:0.5pt;">18</td><td style="width:0.5pt;">19</td><td style="width:0.5pt;">20</td><td style="width:0.5pt;">21</td><td style="width:0.5pt;">22</td><td style="width:0.5pt;">23</td><td style="width:0.5pt;">24</td><td style="width:0.5pt;">25</td><td style="width:0.5pt;">26</td><td style="width:0.5pt;">27</td><td style="width:0.5pt;">28</td><td style="width:0.5pt;">29</td><td style="width:0.5pt;">30</td><td style="width:0.5pt;">31</td><td style="width:0.5pt;">32</td><td style="width:0.5pt;">33</td><td style="width:0.5pt;">34</td><td style="width:0.5pt;">35</td><td style="width:0.5pt;">36</td><td style="width:0.5pt;">37</td><td style="width:0.5pt;">38</td><td style="width:0.5pt;">39</td><td style="width:0.5pt;">40</td></tr>
        `;
        let VCId = [1];
        if (["CalcSheet", "DataSheet"].includes(params.reportType)) {
            VCId = GetValidationCheckIdV2(data, e); //arr of validation check id

        }

        htmlString += GetTableRows(e, MappingSubTemplateWithTemplate, VCId, SubTemplatehtml, data, sapData, params.reportType);
        return htmlString += `</table>`;
    })
    return arrayOfHtmlStrings;
}

module.exports = {
    getHtmlTableTemplateV2,
    getTemplateIdV2,
    drawingValveImageUrl
}