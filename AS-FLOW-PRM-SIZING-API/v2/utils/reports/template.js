const { default: axios } = require("axios");
const { getsubtemplateidForSubFlow, getsubtemplateIdForMOC, getsubtemplateIdForsubSIZING, getTheTemplateIDForDataSheet } = require("./datasheet_table");
const { erpCodetableData, getCatalogNumber, generateERPCode } = require("./erpCode");
const { pricingSummarySubTable, internalPricingSummarySubTable, getPricingSummaryData, getInternalPricingSummaryData } = require("./pricingSummarySubTable");
const { getSubTempIdTankSubVesselData521, getSubTempIdTankDrwaing521, getTheSubSummaryIDForTankSheet, getTankDrwaingTankSheet, getTankTypeTankSheet, getTheSubInputIDForTankSheet, getTheSubEqIDForTankSheet} = require("./tanksheet_table");
const { drawingValveImageUrl } = require("./templateV2");

const configReportCellValModification = (data, cellvalue) => {
    if (data.sizingData.code.includes("API 2000")) {
        if (!data.sizingData.pressure_checkbox) {
            if (cellvalue === "Pressure Fluid:") return "";
            if (cellvalue === "Pressure Set Point:") return "";
            if (cellvalue === "Allowed Over Pressure:") return "";
            if (cellvalue === "Max Pressure Flow Capacity:") return "";
        }

        if (!data.sizingData.vaccum_checkbox) {
            if (cellvalue === "Vacuum Fluid:") return "";
            if (cellvalue === "Vacuum Set Point:") return "";
            if (cellvalue === "Allowed Under Pressure:") return "";
            if (cellvalue === "Max Vacuum Flow Capacity:") return "";
        }
    } else {
        if (cellvalue === "Vacuum Fluid:") return "";
        if (cellvalue === "Vacuum Set Point:") return "";
        if (cellvalue === "Allowed Under Pressure:") return "";
        if (cellvalue === "Max Vacuum Flow Capacity:") return "";
    }

    return null;
}
const compareObjects = (obj1, obj2) => {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) {
        return false;
    }

    for (let key of keys1) {
        if (obj1[key] !== obj2[key]) {
            return false
        }
    }

    return true;
}

const getMOCVALUES = (sizingData, sapData) => {
    if (sapData === null) return {};

    // find the correct mapping array
    const moc_mapping_arr = MocJSONDATA.filter(element => element.ModelId == sizingData.Valve_Model_Number.Value).map(element => {
        return element.Data
    })

    // find the required sap-data-value for particular model
    if (!moc_mapping_arr[0]) return {};

    let moc_Data = {}
    moc_mapping_arr[0].forEach(element => {
        let sapDataToCompareWithCondition = {};
        let param_key = Object.keys(element)[0];
        let conditionReFormatting = {};
        element[param_key].Condition.forEach(c => {
            let param_key = Object.keys(c)[0];
            conditionReFormatting[param_key] = c[param_key];
        })

        Object.keys(conditionReFormatting).forEach(key => {
            sapData.outputParameters.char_summary_items.map(sapElement => {
                let sapCharArr = sapElement.SapChar === "" ? [] : sapElement.SapChar.split("_");

                let sapChar = sapCharArr[sapCharArr.length - 1];
                if (sapChar === key) {
                    sapDataToCompareWithCondition[sapChar] = sapElement.CharValue;
                }
            })
        })

        if (compareObjects(sapDataToCompareWithCondition, conditionReFormatting)) {
            if (!(param_key.includes("Accessor"))) {
                moc_Data[param_key] = element[param_key].Value;
            } else {
                moc_Data[param_key] = moc_Data[param_key] === undefined ? [] : moc_Data[param_key];
                moc_Data[param_key].push(element[param_key].Value)
            }
        }
    })

    // remove this code below
    sapData.outputParameters.char_summary_items.forEach(item => {
        if (item.SapChar.includes("CATALOG_NUMBER")) {
            moc_Data.catalogue_number = item.CharValue;
        }
    })

    return moc_Data;
}

const drawingSheetCellValModification = (sizingData, memb) => {
    let message = "";
    if (memb.Id == "9115" && sizingData.drawingSheetResponse.Weight == "") {
        message = "make_pricing_uom_empty"
    }
    if (memb.Id == "9125" && sizingData.drawingSheetResponse.A == "") {
        message = "make_pricing_uom_empty"
    }
    if (memb.Id == "9135" && sizingData.drawingSheetResponse.B == "") {
        message = "make_pricing_uom_empty"
    }
    if (memb.Id == "9145" && sizingData.drawingSheetResponse.C == "") {
        message = "make_pricing_uom_empty"
    }
    if (memb.Id == "9155" && sizingData.drawingSheetResponse.D == "") {
        message = "make_pricing_uom_empty"
    }
    if (memb.Id == "9165" && sizingData.drawingSheetResponse.E == "") {
        message = "make_pricing_uom_empty"
    }
    if (memb.Id == "9175" && sizingData.drawingSheetResponse.F == "") {
        message = "make_pricing_uom_empty"
    }
    if (memb.Id == "9185" && sizingData.drawingSheetResponse.G == "") {
        message = "make_pricing_uom_empty"
    }
    if (memb.Id == "9195" && sizingData.drawingSheetResponse.H == "") {
        message = "make_pricing_uom_empty"
    }
    if (memb.Id == "9118" && sizingData.drawingSheetResponse.Weight_kg == "") {
        message = "make_pricing_uom_empty"
    }
    if (memb.Id == "9128" && sizingData.drawingSheetResponse.A_mm == "") {
        message = "make_pricing_uom_empty"
    }
    if (memb.Id == "9138" && sizingData.drawingSheetResponse.B_mm == "") {
        message = "make_pricing_uom_empty"
    }
    if (memb.Id == "9148" && sizingData.drawingSheetResponse.C_mm == "") {
        message = "make_pricing_uom_empty"
    }
    if (memb.Id == "9158" && sizingData.drawingSheetResponse.D_mm == "") {
        message = "make_pricing_uom_empty"
    }
    if (memb.Id == "9168" && sizingData.drawingSheetResponse.E_mm == "") {
        message = "make_pricing_uom_empty"
    }
    if (memb.Id == "9178" && sizingData.drawingSheetResponse.F_mm == "") {
        message = "make_pricing_uom_empty"
    }
    if (memb.Id == "9188" && sizingData.drawingSheetResponse.G_mm == "") {
        message = "make_pricing_uom_empty"
    }
    if (memb.Id == "9198" && sizingData.drawingSheetResponse.H_mm == "") {
        message = "make_pricing_uom_empty"
    }

    return message;
}

const configReportParamsModification = (memb, data, cellvalue) => {
    if (data.sizingData.code.includes("API 2000")) {
        if (data.sizingData.pressure_checkbox) {
            if (memb.Param === "maxFlowP") {
                return data.sizingData.convertedValues.vMaxP ? Number(data.sizingData.convertedValues.vMaxP).toFixed(3) + " " + data.sizingData.req_pressure_flow_uom.split(".")[1] : "";
            }
            if (memb.Param === "fluid_name_v") return "";
            if (memb.Param === "set_pressure") return `${Number(cellvalue).toFixed(3)} ${data.sizingData.pressure_uom.split(".")[1]}`;
            if (memb.Param === "over_pressure") return `${Number(cellvalue).toFixed(3)} ${data.sizingData.pressure_uom.split(".")[1]}`;
        } else {
            if (memb.Param === "maxFlowP") return "";
            if (memb.Param === "fluid_name") return "";
            if (memb.Param === "set_pressure") return "";
            if (memb.Param === "over_pressure") return "";
        }
    } else {
        if (memb.Param === "maxFlowP") {
            return data.sizingData.vrtd ? Number(data.sizingData.vrtd).toFixed(3) + " " + data.sizingData.req_pressure_flow_uom.split(".")[1] : "";
        }
        if (memb.Param === "fluid_name_v") return "";
        if (memb.Param === "set_pressure") return `${Number(cellvalue).toFixed(3)} ${data.sizingData.pressure_uom.split(".")[1]}`;
        if (memb.Param === "over_pressure") return `${Number(cellvalue).toFixed(3)} ${data.sizingData.pressure_uom.split(".")[1]}`;
    }

    if (data.sizingData.code.includes("API 2000")) {
        if (data.sizingData.vaccum_checkbox) {
            if (memb.Param === "maxFlowV") {
                return data.sizingData.convertedValues.VmaxV ? Number(data.sizingData.convertedValues.VmaxV).toFixed(3) + " " + data.sizingData.req_pressure_flow_uom.split(".")[1] : "";
            }
            if (memb.Param === "fluid_name") return "";
            if (memb.Param === "set_vaccum") return `${Number(cellvalue).toFixed(3)} ${data.sizingData.vaccum_uom.split(".")[1]}`;
            if (memb.Param === "under_press_v") return `${Number(cellvalue).toFixed(3)} ${data.sizingData.vaccum_uom.split(".")[1]}`;
        } else {
            if (memb.Param === "maxFlowV") return "";
            if (memb.Param === "fluid_name_v") return "";
            if (memb.Param === "set_vaccum") return "";
            if (memb.Param === "under_press_v") return "";
        }
    } else {
        if (memb.Param === "maxFlowV") return "";
        if (memb.Param === "fluid_name_v") return "";
        if (memb.Param === "set_vaccum") return "";
        if (memb.Param === "under_press_v") return "";
    }

    return null;
}

const getDateFunc = () => {
    const date = new Date();

    const months = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
}

const getDataSheetImage = (sizingData) => {
    const brandValveType = sizingData.brand[0] + sizingData.valve_type;
    if (brandValveType === "APO") {
        return `${process.env.REACT_APP_REPORT_ENGINE_API_URL}schematic_images/Default.png`
    }
    if (brandValveType === "CCS" || brandValveType === "CBB" || brandValveType === "CBP" || brandValveType === "ACS" || brandValveType === "ABP") {
        return `${process.env.REACT_APP_REPORT_ENGINE_API_URL}schematic_images/SpringOperatedSchematic.png`
    }
    if (sizingData.model === "9300" || sizingData.model === "93" || sizingData.model === "95") {
        return `${process.env.REACT_APP_REPORT_ENGINE_API_URL}schematic_images/9300_93_95.png`
    }
    if (sizingData.model === "9200") {
        return `${process.env.REACT_APP_REPORT_ENGINE_API_URL}schematic_images/9200.png`
    }
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

const GetValidationCheckId = (sizingData, intermediateVal, templateId) => {
    const FlowType = checkFlowType(sizingData.req_pressure_flow_uom);
    const UnitType = sizingData.preference_details.prefCalculationMethod;

    const Omega = intermediateVal.Omega ? intermediateVal.Omega : "";
    const is2phase = sizingData.service_type === "2-Phase";
    const Eta_s = intermediateVal.Eta_s ? intermediateVal.Eta_s : "";
    const Eta_st = intermediateVal.Eta_st ? intermediateVal.Eta_st : "";
    const PR = intermediateVal.PR ? intermediateVal.PR : "";
    const PS = sizingData.vapor_saturation_pressure ? sizingData.vapor_saturation_pressure : "";
    const PO = intermediateVal.Po ? intermediateVal.Po : "";
    const model = sizingData.model ? sizingData.model : "";
    const P2 = intermediateVal.P2 ? intermediateVal.P2 : "";
    const Pc = intermediateVal.Pc ? intermediateVal.Pc : "";
    const over_pressure_per = sizingData.over_pressure_per ? sizingData.over_pressure_per : "";
    const isAsme = sizingData.misc_properties.ka_dataset === "ASME";
    const isApi = sizingData.misc_properties.ka_dataset === "API";
    const P1 = intermediateVal.P1 ? intermediateVal.P1 : "";
    const liftCapacity = sizingData.liftCapacity;

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

const getTemplateId = async (sizingData, reportType, intermediateValues, knex) => {
    // console.log("here------------",sizingData, reportType)
    let idArr;
    // let TankidArr;
    if (reportType === "CalcSheet") {
        const TemplateConditions = await await knex.from("reports_template_conditions")
        idArr = TemplateConditions.filter(e => e["Brand"] === sizingData["brand"] && e["valve_type"] === sizingData["valve_type"] && e["model"] === sizingData["model"] && e["model_id"] == sizingData["model_id"] && e["service_type"] === sizingData["service_type"] && sizingData["service"].includes(e["service"]) && e["sizingMethodology"] === sizingData["code"]).map(e => e.TemplateID)

        if (sizingData["code"] === "Separated Flow Method") {
            idArr = idArr.reverse();
        }
        if (sizingData["code"] === "Non Flashing Liquid + Gas (D.2.1)") { //1.4.3.2
            idArr = idArr.length > 0 ? [21] : []
        }
        if (sizingData["code"] === "Flashing Liquid + lts Vapor (D.2.1)") { //1.4.3.1
            // 1.21 = 20
            // 1.22 = 19
            if (intermediateValues.P1 <= 0.5 || getTempInKelvin(Number(sizingData.relieve_temp), sizingData.temp_uom) <= 0.5) {
                idArr = idArr.length > 0 ? [20] : []
            } else {
                idArr = idArr.length > 0 ? [19] : []
            }
        }
    }

    if (reportType === "DataSheet") {
        idArr = [getTheTemplateIDForDataSheet(sizingData)];
    }

    if (reportType === "TankCalc") {
        // TankidArr = getTheSubEqIDForTankSheet(sizingData);
        if (sizingData.code === "Non-Code (API 2000, 7th Edition)") {
            idArr = [41]
        }
        else {
            return idArr = [42]
        }
    }

    if (reportType === "DrawingSheet") {
        idArr = [39]
    }

    if (reportType === "ConfigSheet") {
        idArr = [40]
    }

    if (reportType === "PricingSummary") {
        idArr = [44]
    }

    if (reportType === "InternalPricingSummary") {
        const datasheetId = getTheTemplateIDForDataSheet(sizingData);
        idArr = [46, datasheetId, 40, 43, 45];
    }

    return idArr;
}

const groupBy = function (xs, key) {
    return xs.reduce(function (rv, x) {
        (rv[x[key]] = rv[x[key]] || []).push(x);
        return rv;
    }, {});
};

const renderMethodFunctions = (sapData, reportType, templateId) => {
    if (reportType === "Config Report") {
        let htmlString = `<table style="border-collapse: collapse;border:1px solid lightgray;width: 100%;text-align:left;">`;
        htmlString += "<tr>";
        htmlString += `<td id="no subHtml Data" data-tempalteId="${templateId}" data-subTemplateId="no subtemplate Id" rowspan="1" colspan="7" style="font-family:Arial;font-size: 10pt;background:#e7e7e7;">Code</td>`;
        htmlString += `<td id="no subHtml Data" data-tempalteId="${templateId}" data-subTemplateId="no subtemplate Id" rowspan="1" colspan="13" style="font-family:Arial;font-size: 10pt;background:#e7e7e7;">Category</td>`;
        htmlString += `<td id="no subHtml Data" data-tempalteId="${templateId}" data-subTemplateId="no subtemplate Id" rowspan="1" colspan="20" style="font-family:Arial;font-size: 10pt;background:#e7e7e7;">Description</td>`;
        htmlString += "</tr>";
        const erpCodeListArr = erpCodetableData(sapData);
        erpCodeListArr.forEach(el => {
            htmlString += "<tr>";
            htmlString += `<td id="no subHtml Data" data-tempalteId="${templateId}" data-subTemplateId="no subtemplate Id" rowspan="1" colspan="7" style="font-family:Arial;font-size: 10pt;">${el.Code}</td>`;
            htmlString += `<td id="no subHtml Data" data-tempalteId="${templateId}" data-subTemplateId="no subtemplate Id" rowspan="1" colspan="13" style="font-family:Arial;font-size: 10pt;">${el.Category}</td>`;
            htmlString += `<td id="no subHtml Data" data-tempalteId="${templateId}" data-subTemplateId="no subtemplate Id" rowspan="1" colspan="20" style="font-family:Arial;font-size: 10pt;">${el.Description}</td>`;
            htmlString += "</tr>";
        })
        return htmlString += `</table>`;
    }
}

//TankCalc521
const tankCalcSubTable521 = (description, sizingData, memb, VCId, templateId, SubTemplatehtml, sapData, reportType) => {
    let subtemplateId = []

    if (description === "Sub - VesselData") {
        subtemplateId = getSubTempIdTankSubVesselData521(sizingData);
    }
    if (description === "Vessel_Image") {
        return getSubTempIdTankDrwaing521(sizingData);
    }
    if (subtemplateId) {
        let groubedByRow = groupBy(SubTemplatehtml.filter(a =>
            a.STId == subtemplateId[0]
            && VCId.includes(a.VCId)), "RowId");
        let htmlString = `<table style="border-collapse: collapse;border:1px solid lightgray;width: 100%;">`;

        Object.keys(groubedByRow).forEach(function (category) {
            htmlString += "<tr>";
            groubedByRow[category].forEach(function (membb, i) {
                htmlString += `<td id="${membb.Id}" data-tempalteId="${templateId}" data-subTemplateId="${subtemplateId[0]}" rowspan="${membb.Rowspan}" colspan="${membb.Colspan}" style="${GetStyle(membb)}" >
                    ${GetCellValue(membb, sizingData, templateId, SubTemplatehtml, VCId, sapData, reportType)}
                </td>`;
            })
            htmlString += "</tr>";
        });
        return htmlString += `</table>`;
    }
}

//TankCalc2000
const tankCalcSubTable = (description, sizingData, memb, VCId, templateId, SubTemplatehtml, sapData, reportType) => {
    let subtemplateId = []

    if (description === "Tank_SubSubmmary") {
        subtemplateId = getTheSubSummaryIDForTankSheet(sizingData);
    }
    if (description === "Tank_Drawing") {
        return getTankDrwaingTankSheet(sizingData);
    }
    if (description === "Tank_Type") {
        subtemplateId = getTankTypeTankSheet(sizingData.sizingData);
    }
    if (description === "Tank_SubInput") {
        subtemplateId = getTheSubInputIDForTankSheet(sizingData);
    }

    if (description === "Tank_SubEq") {
        subtemplateId = getTheSubEqIDForTankSheet(sizingData);
    }

    if (subtemplateId) {
        let groubedByRow = groupBy(SubTemplatehtml.filter(a =>
            a.STId == subtemplateId[0]
            && VCId.includes(a.VCId)), "RowId");
        let htmlString = `<table style="border-collapse: collapse;border:1px solid lightgray;width: 100%;">`;

        Object.keys(groubedByRow).forEach(function (category) {
            htmlString += "<tr>";
            groubedByRow[category].forEach(function (membb, i) {
                htmlString += `<td id="${membb.Id}" data-tempalteId="${templateId}" data-subTemplateId="${subtemplateId[0]}" rowspan="${membb.Rowspan}" colspan="${membb.Colspan}" style="${GetStyle(membb)}" >
                        ${GetCellValue(membb, sizingData, templateId, SubTemplatehtml, VCId, sapData, reportType)}
                    </td>`;
            })
            htmlString += "</tr>";
        });
        return htmlString += `</table>`;
    }
}

const GetStyle = (memb) => {
    var style = "font-family:Arial; font-size: 8pt; padding: 2pt;font-family: 'Microsoft Sans Serif'; " + memb.Style;
    return style;
}

const GetCellValue = (memb, data, templateId, SubTemplatehtml, VCId, sapData, reportType) => {
    // If method Function, put the below in a function of its own
    if (memb.ValueType === "M" && (memb.Description === "SubFlow" || memb.Description === "MOC" || memb.Description === "SubSizingData")) {
        let subTemplateId;
        if (memb.Description === "SubFlow") {
            subTemplateId = getsubtemplateidForSubFlow(templateId, data.sizingData);
        }
        if (memb.Description === "MOC") {
            subTemplateId = getsubtemplateIdForMOC(templateId, data.sizingData);
        }
        if (memb.Description === "SubSizingData") {
            subTemplateId = getsubtemplateIdForsubSIZING(templateId, data.sizingData);
            console.log({ subTemplateId })
        }

        if (subTemplateId.length === 0) return "Work In Progress";

        let htmlString = `<table style="border-collapse: collapse;border:1px solid lightgray;width: 100%;">`;

        let groubedByRow = groupBy(SubTemplatehtml.filter(a => a.STId == subTemplateId[0] && VCId.includes(a.VCId)), "RowId");

        Object.keys(groubedByRow).forEach(function (category) {
            htmlString += "<tr>";
            groubedByRow[category].forEach(function (membb, i) {
                htmlString += `<td id="${membb.Id}" data-tempalteId="${templateId}" data-subTemplateId="${subTemplateId[0]}" rowspan="${membb.Rowspan}" colspan="${membb.Colspan}" style="${GetStyle(membb)}" >
                        ${GetCellValue(membb, data, templateId, SubTemplatehtml, VCId, sapData, reportType)}
                    </td>`;
            })
            htmlString += "</tr>";
        });
        return htmlString += `</table>`;
    }

    if (memb.ValueType === "M" && (memb.Description === "ListConfigDataForSAP")) {
        const erpCodeListHtml = renderMethodFunctions(sapData, "Config Report", templateId);

        return erpCodeListHtml;
    }


    // TankCalc2000
    if (memb.ValueType == "M" &&
        ((memb.Description === "Tank_SubSubmmary") || (memb.Description === "Tank_Drawing") || memb.Description === ("Tank_Type")
            || memb.Description === ("Tank_SubInput") || memb.Description === ("Tank_SubEq"))
    ) {
        cellvalue = tankCalcSubTable(memb.Description, data, memb, VCId, templateId, SubTemplatehtml, sapData, reportType);
        return cellvalue;
    }

    // pricingSummary
    if (memb.ValueType == "M" && memb.Description === "PricingDetails" && reportType === "PricingSummary") {
        cellvalue = pricingSummarySubTable(data.sizingData, templateId);
        return cellvalue;
    }


    // internalPricingSummary
    if (memb.ValueType == "M" && memb.Description === "PricingDetails" && reportType === "InternalPricingSummary") {
        cellvalue = internalPricingSummarySubTable(data.sizingData, templateId);
        return cellvalue;
    }

    //TankCalc521
    if (memb.ValueType == "M" &&
        ((memb.Description === "Sub - VesselData") || (memb.Description === "Vessel_Image"))) {
        cellvalue = tankCalcSubTable521(memb.Description, data, memb, VCId, templateId, SubTemplatehtml, sapData, reportType);
        return cellvalue;
    }

    // If not Method Function
    var cellvalue = memb.CellValue;
    if (memb.ValueType == "P") {
        var propertyName = memb.Param;
        if (!propertyName) return '';
        var params = propertyName.split('.');
        if (data != null && data.sizingData != null && data.sizingData[params[0]] != null) {
            cellvalue = params.length > 1 ? data.sizingData[params[0]][params[1]] : data.sizingData[params[0]];
        }
        if (cellvalue?.length <= 0) {
            // cellvalue = memb.Param; // display the Param itself for debugging
            cellvalue = ""; // display nothing
        }
        // if (isNaN(cellvalue) && (typeof cellvalue === 'string' || cellvalue instanceof String) && params[0] !== "drawingSheetResponse") cellvalue = cellvalue.split(".")[cellvalue.split(".").length - 1];
        if (isNaN(cellvalue) && (typeof cellvalue === 'string' || cellvalue instanceof String) && params[0] !== "drawingSheetResponse" && params[0] !== "reports_general") cellvalue = cellvalue.split(".")[cellvalue.split(".").length - 1];
        if (cellvalue == undefined) cellvalue = "";
        // dynamic params==============
        if (memb.Param === "showDynamicImage") {
            cellvalue = `<img src="${getDataSheetImage(data.sizingData)}" style="width: 85px">`;
        }
        if (memb.Param === "getDataSheetModel") {
            cellvalue = getCatalogNumber(sapData) !== "" ? getCatalogNumber(sapData) : data.sizingData.model;
        }
        if (memb.Description === "<MULTIPLE VALVE APPLICATION>") {
            cellvalue = data.sizingData.singleOrMultivalve === "single" ? "" : "MULTIPLE VALVE APPLICATION"
        }
        if (memb.Param === "getERPCode") {
            cellvalue = generateERPCode(sapData);
        }
        if (memb.Param === "generateDate") {
            cellvalue = getDateFunc();
        }
        if (memb.Param === "drawingValveImageUrl") {
            cellvalue = drawingValveImageUrl(data.sizingData);
        }
        if (memb.Param === "pricingTotalPrice") {
            cellvalue = "$ " + sapData.outputParameters.UnitPrice
        }

        if (memb.Param === "customerTotal" || memb.Param === "transferTotal") {
            cellvalue = "$ " + sapData.outputParameters.UnitPrice
        }

        if (memb.Param === "deliveryTotal") {
            cellvalue = "";
        }
        // config sheet==========
        const configCellVal = configReportParamsModification(memb, data, cellvalue);
        if (reportType === "ConfigSheet" && configCellVal !== null) {
            cellvalue = configCellVal;
        }
        // round of the decimal points
        if (cellvalue && isNaN(cellvalue) === false && params[0] !== "model" && params[0] !== "quantity") {
            cellvalue = Number(cellvalue).toFixed(3);
        }
    }
    if (memb.ValueType == "S") {
        // config sheet==========
        const configCellVal = configReportCellValModification(data, cellvalue);
        if (configCellVal !== null) {
            cellvalue = configCellVal;
        }
        // drawing sheet==========
        if (data.sizingData.drawingSheetResponse.Weight) {
            const drawingSheetCellVal = drawingSheetCellValModification(data.sizingData, memb);
            if (drawingSheetCellVal === "make_pricing_uom_empty") {
                cellvalue = "";
            }
        }
    }
    // cellvalue = cellvalue?.replace("#", "N/A");
    if (memb.ValueType === "M" && reportType === "InternalPricingSummary") {
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
            quantity: sapData.outputParameters.Quantity,
        }
        const char_summary_items = sapData.outputParameters.char_summary_items;
        //pricing items
        const ZIVS = char_summary_items.filter(item => ['ZIVS', 'ZIVM'].includes(item.CondType));
        // discounts
        const ZID4 = char_summary_items.filter(item => item.CondType === 'ZID4');
        // net adders
        const ZIVR = char_summary_items.filter(item => item.CondType === 'ZIVR');
        if (ZIVS.length > 0) {
            calcVal.listPrice = ZIVS.reduce((acc, curr) => {
                const { CondVal } = curr;
                acc += Number(CondVal);
                return acc;
            }, 0);
        }
        if (ZIVR.length > 0) {
            calcVal.netAdders = ZIVR.reduce((acc, curr) => {
                if (!calcVal.currency) {
                    calcVal.currency = curr.Curr;
                }
                const { CondVal } = curr;
                acc += Number(CondVal);
                return acc;
            }, 0);
        }
        if (ZID4.length > 0) {
            calcVal.customerDiscount = ZID4.reduce((acc, curr) => {
                const { CondVal } = curr;
                acc += Number(CondVal.slice(0, -1));
                return acc;
            }, 0);
        }
        if (!calcVal.currency) {
            calcVal.currency = 'USD';
        }
        const propertyName = memb.Param;
        const listData = {
            ZIVS,
            ZIVR,
            ZID4
        }
        const unitPrice = (((Number(calcVal.listPrice) + Number(calcVal.listAdders)) * (1 - Number(calcVal.customerDiscount) / 100))) + Number(calcVal.netAdders);
        const totalPrice = unitPrice * Number(calcVal.quantity);
        calcVal.unitPrice = `${calcVal.currency} ${unitPrice.toFixed(2)}`;
        calcVal.totalPrice = `${calcVal.currency} ${totalPrice.toFixed(2)}`;
        if (Object.keys(calcVal).includes(propertyName)) {
            return calcVal[propertyName];
        }
        if (!propertyName) {
            return '';
        }
        try {
            const [key, keyParam] = propertyName.split('.');
            console.log({ key, keyParam });
            const [keyVal, keyIndex] = key.slice(0, -1).split('[');
            if (keyVal === 'ZID4' && keyParam === 'CondVal' && listData[keyVal][keyIndex][keyParam]) {
                if (memb.Description === 'percentage') {
                    return '%';
                } else {
                    return listData[keyVal][keyIndex][keyParam].slice(0, -1);
                }
            }
            return listData[keyVal][keyIndex][keyParam];
        } catch (err) {
            return '<div style="min-height:1em"></div>';
        }
    }
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
                    data-vcid="${memb.VCId}" rowspan="${memb.Rowspan}" colspan="${memb.Colspan}" style="${GetStyle(memb)}" >
                            ${GetCellValue(memb, data, id, SubTemplatehtml, VCId, sapData, reportType)}
                        </td>`;
                })
                htmlString += "</tr>";
            });
        });
    });
    return htmlString;
}
const calculateAo = (Do) => {
    return (Math.PI * Do * Do) / 4
}
const calculatePo = async (sizingData, calc_result, Do, Ao) => {
    const isEnglish = sizingData.preference_details.prefCalculationMethod === "English";
    const conversionRequests = {
        "conversionRequests": [
            {
                "fromUnit": sizingData.misc_properties.orifice_area,
                "toUnit": isEnglish ? "area.in2" : "area.cm2",
                "value": sizingData.sizing_a,
                "id": "sizing_a"
            },
            {
                "fromUnit": sizingData.atm_pressure_uom,
                "toUnit": isEnglish ? "abspressure.psia" : "abspressure.bara",
                "value": calc_result.P1,
                "id": "P1"
            },
            {
                "fromUnit": sizingData.atm_pressure_uom,
                "toUnit": isEnglish ? "abspressure.psia" : "abspressure.bara",
                "value": calc_result.P2,
                "id": "P2"
            },
            {
                "fromUnit": sizingData.atm_pressure_uom,
                "toUnit": isEnglish ? "abspressure.psia" : "abspressure.bara",
                "value": sizingData.atm_pressure,
                "id": "atm_pressure"
            },
            {
                "fromUnit": sizingData.misc_properties.orifice_area,
                "toUnit": isEnglish ? "area.in2" : "area.cm2",
                "value": Ao,
                "id": "Ao"
            },
            {
                "fromUnit": calc_result.ho_uom,
                "toUnit": isEnglish ? "latentheat.BTUlb" : "latentheat.KJkg",
                "value": calc_result.ho,
                "id": "ho"
            },
            {
                "fromUnit": sizingData.pressure_uom,
                "toUnit": isEnglish ? "pressure.psig" : "pressure.barg",
                "value": sizingData.const_supimp_bk_pressure,
                "id": "const_supimp_bk_pressure"
            },
            {
                "fromUnit": sizingData.pressure_uom,
                "toUnit": isEnglish ? "pressure.psig" : "pressure.barg",
                "value": sizingData.var_supimp_bk_pressure,
                "id": "var_supimp_bk_pressure"
            },
            {
                "fromUnit": "length.in",
                "toUnit": isEnglish ? "length.in" : "length.cm2",
                "value": Do,
                "id": "Do"
            },
        ]
    }

    const response_uom_conversion = await axios({
        method: 'POST',
        url: `${process.env.DATA_API_BASE_URL}/convertUOMBulk`,
        headers: {
            'Content-Type': 'application/json'
        },
        data: conversionRequests
    });

    const convertedObj = {}

    response_uom_conversion.data.forEach(el => {
        convertedObj[el.id] = el.convertedVal.data
    })

    console.log({ convertedObj })

    const payload = {
        "selOrificeArea_A": convertedObj.sizing_a,
        "gasConstant_C": calc_result.C,
        "flowCoeff_Kz": sizingData.misc_properties.ka_dataset === "ASME" ? sizingData.sizing_kd : sizingData.kapi,
        "inletPressure_P1": convertedObj.P1,
        "ruptureDiscCFactor_Kc": sizingData.kc,
        "outletDiameter_Do": "2.067",
        "ratioOfSpHeat_k": sizingData.ratio_SpHeat_k_p,
        "compressibility_z": sizingData.compressibility_p,
        "atmPressure_Patm": convertedObj.atm_pressure,
        "outletArea_Ao": convertedObj.Ao,
        "constant_N34": isEnglish ? 0.00245 : 0.003225,
        "calcMethod": sizingData.preference_details.prefCalculationMethod,
        "napierCFact": calc_result.Kn,
        "superheatcfact": calc_result.K_sh,
        "Supercritical CFact": calc_result.ksc,
        "StagnationEnthalpyAtInlet": convertedObj.ho,
        "CalculatedMaxMass Flow": sizingData.k_a_dataset === "ASME" ? sizingData.wact : sizingData.k_a_dataset === "API" ? sizingData.wrtd : "", //wmaxp wmaxv o vmaxp vmaxv,
        "Gas/VaporMassFracAtExitCon": sizingData.x2,
        "Gas/VaporDenAtExitCon": sizingData.gas_density,
        "LiqDenAtExitCon": sizingData.liquid_density,
        "ViscosityCorFact": sizingData.kv,
        "sizingStd": sizingData.sizing_std,
        "fluidType": sizingData.service_type,
        "Brand": sizingData.brand,
        "valveTypeCode": sizingData.valve_type,
        "workFlow": sizingData.code === "Saturated Water" ? "asmeapp11saturatedwater" : sizingData.code === "Separated Flow Method" ? "asmeapp11saturatedwater" : "",
        "maxMassFlow": sizingData.k_a_dataset === "ASME" ? sizingData.wact : sizingData.k_a_dataset === "API" ? sizingData.wrtd : "", //wmaxp wmaxv o vmaxp vmaxv,
        "constantSuperimposed": convertedObj.const_supimp_bk_pressure,
        "variableSuperimposed": convertedObj.var_supimp_bk_pressure,
        "P2": convertedObj.P2,
        "ActualFlowCoeff": sizingData.k_a_dataset === "ASME" ? sizingData.sizing_kd : sizingData.k_a_dataset === "API" ? sizingData.kapi : "",
        "u": "" // velocity in the reports popup
    }

    try {
        const response = await axios({
            method: "POST",
            url: "https://rulex-dev-v2.azurewebsites.net/v1/api/calculate/Po",
            headers: {
                Authorization: `Bearer ${process.env.AUTH_TOKEN}`,
            },
            data: payload,
        });

        console.log(response.data);
        return response.data;
    } catch (err) {
        console.log(err)
    }
}

const getHtmlTableTemplate = async (params, sapDataBody, data, knex) => {
    const sapData = sapDataBody;
    // heavy calculation, run only once, be careful with below function ========
    let drawingSheetResponse = (params.reportType === "DrawingSheet" || params.reportType === "DataSheet" || params.reportType === "CalcSheet") && sapDataBody ? sapData.dimensionData : {};

    //since they need Do thats why generating them and saving in report engine api
    // drawingSheetResponse.OutletDiameter
    const Do = 2.067;
    const Ao = calculateAo(Do);
    await calculatePo(data.sizingData, data.intermediateValues.calc_result, Do, Ao);
    // await calculateFr();

    // when generating pricing report for multiple config ids later, get this pricingSummaryData from parent of this function where we have array of sapData.
    let pricingSummaryData = params.reportType === "PricingSummary" ? await getPricingSummaryData(data.sizingData, sapDataBody, host) : []
    let internalPricingSummaryData = params.reportType === "InternalPricingSummary" ? await getInternalPricingSummaryData(data.sizingData, sapDataBody, host) : []

    const arrTemplateId = await getTemplateId(data.sizingData, params.reportType, data.intermediateValues.calc_result, req.knex);
    console.log("arrTemplateId", arrTemplateId)
    let MappingSubTemplateWithTemplate = await axios.get(`${host}/htmlRouter/api/getMappingSubTemplateWithTemplate`).then(res => {
        return res.data;
    })
    // console.log("MappingSubTemplateWithTemplate-------",MappingSubTemplateWithTemplate)
    MappingSubTemplateWithTemplate.forEach(e => {
        Object.keys(e).forEach(key => {
            e[key] = Number(e[key])
        })
    })
    // filter out which subtemplateID are required
    const mappingSubtemplateWithTemplateCopy = [...MappingSubTemplateWithTemplate];
    const requiredSubTemplateId = mappingSubtemplateWithTemplateCopy.filter(el => arrTemplateId.some(item => item.toString() === el.TemplateId.toString())).map(el => el.SubTemplateId);

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

    // loop through templateid
    let arrayOfHtmlStrings = arrTemplateId.map((e) => {
        let htmlString = `<table class="main-reports-table" style="border-collapse: collapse;border:1px solid lightgray;width: 100%;">
        <tr class="reports-top-numbers" style="width:100%;height: 0px;"> <td style="width:0.5pt;">1</td><td style="width:0.5pt;">2</td><td style="width:0.5pt;">3</td><td style="width:0.5pt;">4</td><td style="width:0.5pt;">5</td><td style="width:0.5pt;">6</td><td style="width:0.5pt;">7</td><td style="width:0.5pt;">8</td><td style="width:0.5pt;">9</td><td style="width:0.5pt;">10</td><td style="width:0.5pt;">11</td><td style="width:0.5pt;">12</td><td style="width:0.5pt;">13</td><td style="width:0.5pt;">14</td><td style="width:0.5pt;">15</td><td style="width:0.5pt;">16</td><td style="width:0.5pt;">17</td><td style="width:0.5pt;">18</td><td style="width:0.5pt;">19</td><td style="width:0.5pt;">20</td><td style="width:0.5pt;">21</td><td style="width:0.5pt;">22</td><td style="width:0.5pt;">23</td><td style="width:0.5pt;">24</td><td style="width:0.5pt;">25</td><td style="width:0.5pt;">26</td><td style="width:0.5pt;">27</td><td style="width:0.5pt;">28</td><td style="width:0.5pt;">29</td><td style="width:0.5pt;">30</td><td style="width:0.5pt;">31</td><td style="width:0.5pt;">32</td><td style="width:0.5pt;">33</td><td style="width:0.5pt;">34</td><td style="width:0.5pt;">35</td><td style="width:0.5pt;">36</td><td style="width:0.5pt;">37</td><td style="width:0.5pt;">38</td><td style="width:0.5pt;">39</td><td style="width:0.5pt;">40</td></tr>
        `;

        const VCId = GetValidationCheckId(data.sizingData, data.intermediateValues.calc_result, e); //arr of validation check id

        // populate sizingData with moc and intermediate
        const mocData = getMOCVALUES(data.sizingData, sapData); // either {} or mocData
        console.log({ mocData })
        data.sizingData.sapData = mocData;
        data.sizingData.calc_result = data.intermediateValues.calc_result;
        data.sizingData.drawingSheetResponse = drawingSheetResponse;
        data.sizingData.pricingSummaryData = pricingSummaryData;
        data.sizingData.internalPricingSummaryData = internalPricingSummaryData;
        htmlString += GetTableRows(e, MappingSubTemplateWithTemplate, VCId, SubTemplatehtml, data, sapData, params.reportType);
        return htmlString += `</table>`;
    })
    return arrayOfHtmlStrings;
}

module.exports = {
    getHtmlTableTemplate
};