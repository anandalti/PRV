const { genResPayload, getReportsVal } = require("./dataMapperCommonMethods");

const ValveType = (sizingData, uomResults, templateId) => {
    const val = getReportsVal("model", sizingData);
    return genResPayload(val, null, sizingData, uomResults)
}

const ValveSize = (sizingData, uomResults, templateId) => {
    const val = getReportsVal("size_orifice", sizingData);
    return genResPayload(val, null, sizingData, uomResults)
}

const ValveTypeSize = (sizingData, uomResults, templateId) => {
    const val = `${getReportsVal("model", sizingData)}, ${getReportsVal("size_orifice", sizingData)}`
    return genResPayload(val, null, sizingData, uomResults)
}

const IsCustomConfiguration = (sizingData, uomResults, templateId) => {
    const val = getReportsVal("is_custom_configuration", sizingData);
    return genResPayload(val, null, sizingData, uomResults)
}

const PartNumber = (sizingData, uomResults, templateId, sapData) => {
    if (sapData === null) return "";
    let catalogue_number = "";
    sapData.outputParameters.char_summary_items.forEach(item => {
        if (item.SapChar.includes("CATALOG_NUMBER")) {
            catalogue_number = item.CharValue;
        }
    });
    return genResPayload(catalogue_number, null, sizingData, uomResults)
}

const QuantityToOrder = (sizingData, uomResults, templateId, sapData) => {
    let val = getReportsVal("quantity", sizingData);
    if(!val && sapData && sapData.outputParameters && sapData.outputParameters.Quantity) {
        val = parseInt(sapData.outputParameters.Quantity);
    }
    return genResPayload(val, null, sizingData, uomResults)
}

const MaxPressureFlowCapacityLabel = (sizingData, uomResults, templateId) => {
    const condition = getReportsVal("pressure_checkbox", sizingData);
    let val = '';
    if(condition === "true") {
        val = 'Max Pressure Flow Capacity:'
    }
    return genResPayload(val, null, sizingData, uomResults)
}

const MaxVacuumFlowCapacityLabel = (sizingData, uomResults, templateId) => {
    const condition = getReportsVal("vaccum_checkbox", sizingData);
    let val = '';
    if(condition === "true") {
        val = 'Max Vacuum Flow Capacity:'
    }
    return genResPayload(val, null, sizingData, uomResults)
}

const MaxPressureFlowCapacity = (sizingData, uomResults, templateId) => {
    const condition = getReportsVal("pressure_checkbox", sizingData);
    let val = '';
    if(condition === "true") {
        val = getReportsVal("flowTypeP", sizingData);
    }
    return genResPayload(val, sizingData.req_pressure_flow_uom, sizingData, uomResults)
}

const MaxVacuumFlowCapacity = (sizingData, uomResults, templateId) => {
    const condition = getReportsVal("vaccum_checkbox", sizingData);
    let val = '';
    if(condition === "true") {
        val = getReportsVal("flowTypeV", sizingData);
    }
    return genResPayload(val, sizingData.req_pressure_flow_uom, sizingData, uomResults)
}

const getErpPositioningObj = (sapData) => {
    let erpCodesObj = {};
    let erpCodesObjSR = {};
    let erpCodesPositionOnlyObj = {};
    let erpCodesPositionOnlyObjSR = {};
    sapData.outputParameters.char_summary_items.filter(el => !['', 'Special Requirement'].includes(el.Tab)).forEach(el => {
        if(!!erpCodesObj[el.SapChar.split("_").slice(-1)[0]]) {
            erpCodesObj[el.SapChar.split("_").slice(-1)[0]] = [...erpCodesObj[el.SapChar.split("_").slice(-1)[0]], {
                erpCode: el.CharValue,
                val: {
                    Code: el.CharValue,
                    Category: el.SapCharDesc,
                    Description: el.CharValueDesc
                }
            }]
        } else {
            erpCodesObj[el.SapChar.split("_")[el.SapChar.split("_").length - 1]] = [{
                erpCode: el.CharValue,
                val: {
                    Code: el.CharValue,
                    Category: el.SapCharDesc,
                    Description: el.CharValueDesc
                }
            }]
        }
    })
    sapData.outputParameters.char_summary_items.filter(el => ['Special Requirement'].includes(el.Tab)).forEach(el => {
        const abbr = el.SapChar.split("_").slice(-1)[0];
        if(!!erpCodesObjSR[abbr]) {
            erpCodesObjSR[abbr] = [...erpCodesObjSR[abbr], {
                Code: el.CharValue,
                Category: abbr,
                Description: el.CharValueDesc
            }]
        } else {
            erpCodesObjSR[abbr] = [{
                    Code: el.CharValue,
                    Category: abbr,
                    Description: el.CharValueDesc
            }]
        }
    })
    sapData.erpPositionMapping.erpPosition.forEach((el => {
        if (erpCodesObj[el.Abbr]) {
            erpCodesObj[el.Abbr].forEach((item) => {
                if (item.erpCode === el.ERPCode && el.ERPPosition) {
                    erpCodesPositionOnlyObj[el.Abbr] = {
                        erpCode: item.erpCode,
                        val: item.val,
                        erpPosition: el.ERPPosition
                    }
                }
            });
        }
    }))
    sapData.erpPositionMapping.erpSpecialRequirements.forEach((el => {
        if (erpCodesObjSR[el.section_code]) {
            erpCodesObjSR[el.section_code].forEach((item) => {
                if (item.Code === el.erp_code) {
                    if(erpCodesPositionOnlyObjSR[el.section_code]) {
                        erpCodesPositionOnlyObjSR[el.section_code].val.push({
                            Code: item.Code,
                            Description: item.Description,
                            display_order: el.display_order1
                        })
                        erpCodesPositionOnlyObjSR[el.section_code].val.sort((a,b) => a.display_order - b.display_order);
                    } else {
                       erpCodesPositionOnlyObjSR[el.section_code] = {
                            val: [{
                                Code: item.Code,
                                Description: item.Description,
                                display_order: el.display_order1
                            }],
                            Category: item.Category,
                            erpPosition: el.display_order,
                        }
                    }
                }
            });
        }
    }))
    erpCodesPositionOnlyObjSR = Object.values(erpCodesPositionOnlyObjSR).sort((a,b) => a.erpPosition - b.erpPosition);
    return {erpCodesPositionOnlyObj, erpCodesPositionOnlyObjSR};
}

const ERPCode = (sizingData, uomResults, templateId, sapData) => {
    let {erpCodesPositionOnlyObj} = getErpPositioningObj(sapData);
    let erpCodeString = "";

    // Convert object to array of key-value pairs
    let erpCodesArray = Object.entries(erpCodesPositionOnlyObj);
    // Sort the array based on erpPosition values
    erpCodesArray.sort((a, b) => {
        return parseInt(a[1].erpPosition) - parseInt(b[1].erpPosition);
    });

    erpCodesArray.forEach(item => {
        erpCodeString += item[1].erpCode
    });
    return genResPayload(erpCodeString, null, sizingData, uomResults)
}

const erpTable = (sizingData, uomResults, templateId, sapData) => {
    let {erpCodesPositionOnlyObj, erpCodesPositionOnlyObjSR} = getErpPositioningObj(sapData);
    let erpCodetableObjArr = Object.entries(erpCodesPositionOnlyObj);
    const erpCodetableDataArr = erpCodetableObjArr.sort((a, b) => {
        return parseInt(a[1].erpPosition) - parseInt(b[1].erpPosition);
    }).map(e => e[1].val);
    let htmlString = `<table style="border-collapse: collapse;width: 100%;text-align:left;margin-bottom: 1em">`;
    htmlString += "<tr>";
    htmlString += `<td id="no subHtml Data" data-tempalteId="${templateId}" data-subTemplateId="no subtemplate Id" rowspan="1" colspan="7" style="font-family:Arial;font-size: 10pt;background:#e7e7e7;border-top:1px solid lightgray;">Code</td>`;
    htmlString += `<td id="no subHtml Data" data-tempalteId="${templateId}" data-subTemplateId="no subtemplate Id" rowspan="1" colspan="13" style="font-family:Arial;font-size: 10pt;background:#e7e7e7;border-top:1px solid lightgray;">Category</td>`;
    htmlString += `<td id="no subHtml Data" data-tempalteId="${templateId}" data-subTemplateId="no subtemplate Id" rowspan="1" colspan="20" style="font-family:Arial;font-size: 10pt;background:#e7e7e7;border-top:1px solid lightgray;">Description</td>`;
    htmlString += "</tr>";
    erpCodetableDataArr.forEach(el => {
        htmlString += "<tr>";
        htmlString += `<td id="no subHtml Data" data-tempalteId="${templateId}" data-subTemplateId="no subtemplate Id" rowspan="1" colspan="7" style="font-family:Arial;font-size: 10pt;border-top:1px solid lightgray;vertical-align: top;">${el.Code}</td>`;
        htmlString += `<td id="no subHtml Data" data-tempalteId="${templateId}" data-subTemplateId="no subtemplate Id" rowspan="1" colspan="13" style="font-family:Arial;font-size: 10pt;border-top:1px solid lightgray;vertical-align: top;">${el.Category}</td>`;
        htmlString += `<td id="no subHtml Data" data-tempalteId="${templateId}" data-subTemplateId="no subtemplate Id" rowspan="1" colspan="20" style="font-family:Arial;font-size: 10pt;border-top:1px solid lightgray;vertical-align: top;">${el.Description}</td>`;
        htmlString += "</tr>";
    })
    erpCodesPositionOnlyObjSR.forEach(el => {
        htmlString += "<tr>";
        htmlString += `<td id="no subHtml Data" data-tempalteId="${templateId}" data-subTemplateId="no subtemplate Id" rowspan="1" colspan="7" style="font-family:Arial;font-size: 10pt;border-top:1px solid lightgray;vertical-align: top;">${el.val.map(e => e.Code).join('<br/>')}</td>`;
        htmlString += `<td id="no subHtml Data" data-tempalteId="${templateId}" data-subTemplateId="no subtemplate Id" rowspan="1" colspan="13" style="font-family:Arial;font-size: 10pt;border-top:1px solid lightgray;vertical-align: top;">${el.Category}</td>`;
        htmlString += `<td id="no subHtml Data" data-tempalteId="${templateId}" data-subTemplateId="no subtemplate Id" rowspan="1" colspan="20" style="font-family:Arial;font-size: 10pt;border-top:1px solid lightgray;vertical-align: top;">${el.val.map(e => e.Description).join('<br/>')}</td>`;
        htmlString += "</tr>";
    })
    htmlString += `</table>`;
    return genResPayload(htmlString, null, sizingData, uomResults);
}

module.exports = {
    ValveType,
    ValveSize,
    ValveTypeSize,
    IsCustomConfiguration,
    PartNumber,
    QuantityToOrder,
    MaxPressureFlowCapacityLabel,
    MaxVacuumFlowCapacityLabel,
    MaxPressureFlowCapacity,
    MaxVacuumFlowCapacity,
    ERPCode,
    erpTable
};