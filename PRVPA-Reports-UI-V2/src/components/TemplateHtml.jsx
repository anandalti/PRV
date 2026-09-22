import { Col, Row } from "react-bootstrap";
import { SubTemplatehtml } from './service/SubTemplatehtml';
import { MappingSubTemplateWithTemplate } from './service/MappingSubTemplateWithTemplate';
import { MappingWorkflowToTemplate } from './service/MappingWorkflowToTemplate';
import { useState, useEffect } from 'react';
import { useSelector } from "react-redux";
import { modelData } from "../helper/ModelData";

const CALC_SHEET_REPORT_ROW_DIVIDER = process.env.CALC_SHEET_REPORT_ROW_DIVIDER;

function ValidateExpression(expression, variables) {
  let result = false;
  let im = null;
  // console.log("expression",expression);
  try {
    const func = new Function(...Object.keys(variables), `return ${expression}`);
    result = func(...Object.values(variables));
    if (typeof result === 'number') {
      im = parseFloat(result.toFixed(14));
    } else if (typeof result === 'boolean') {
      im = result ? 'X' : '';
    } else if (typeof result === 'string') {
      im = result;
    } else if (result === null || result === undefined) {
      im = null;
    } else if (typeof result === 'object') {
      im = JSON.stringify(result);
    } else {
      im = null;
    }
  } catch (e) {
    if (e instanceof ReferenceError) {
      if (expression === '!(!!(SoundPressureLevelatDistancefromValve?.Value))' && !(variables?.NoiseLevel?.Value)) {
      return true;
      } 
      else if(expression === '!(!!(NoiseLevel?.Value))' && !(variables?.SoundPressureLevelatDistancefromValve?.Value)){
        return true;
      }
      return false;
    }
    console.log(e);
    return null;
  }
  return im;
}

const getErpPositioningObj = (sapData, erpPositionMapping) => {
    let erpCodesObj = {};
    let erpCodesObjSR = {};
    let erpCodesPositionOnlyObj = {};
    let erpCodesPositionOnlyObjSR = {};
    sapData?.outputParameters?.char_summary_items.filter(el => !['', 'Special Requirements'].includes(el.Tab)).forEach(el => {
        if (!!erpCodesObj[el.SapChar.split("_").slice(-1)[0]]) {
            erpCodesObj[el.SapChar.split("_").slice(-1)[0]] = [...erpCodesObj[el.SapChar.split("_").slice(-1)[0]], {
                erpCode: el.CharValue,
                val: {
                    Code: el.CharValue,
                    Category: el.SapCharDesc,
                    Description: el.SapCharDesc == "Restricted Lift"? el.CharValue !== "-"? "Restricted Lift - Specify" : "Not Restricted Lift" : el.CharValueDesc
                }
            }]
        } else {
            erpCodesObj[el.SapChar.split("_")[el.SapChar.split("_").length - 1]] = [{
                erpCode: el.CharValue,
                val: {
                    Code: el.CharValue,
                    Category: el.SapCharDesc,
                    Description: el.SapCharDesc == "Restricted Lift"? el.CharValue !== "-"? "Restricted Lift - Specify" : "Not Restricted Lift" : el.CharValueDesc
                }
            }]
        }
    })
    sapData?.outputParameters?.char_summary_items.filter(el => ['Special Requirements'].includes(el.Tab)).forEach(el => {
        const abbr = el.SapChar.split("_").slice(-1)[0];
        if (!!erpCodesObjSR[abbr]) {
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
    erpPositionMapping?.erpPosition?.forEach((el => {
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
    erpPositionMapping?.erpSpecialRequirements?.forEach((el => {
        if (erpCodesObjSR[el.SectionCode]) {
            erpCodesObjSR[el.SectionCode].forEach((item) => {
                if (item.Code === el.ERPCode) {
                    if (erpCodesPositionOnlyObjSR[el.SectionCode]) {
                        erpCodesPositionOnlyObjSR[el.SectionCode].val.push({
                            Code: item.Code,
                            Description: item.Description,
                            display_order: el.display_order1
                        })
                        erpCodesPositionOnlyObjSR[el.SectionCode].val.sort((a, b) => a.DisplayOrder - b.DisplayOrder);
                    } else {
                        erpCodesPositionOnlyObjSR[el.SectionCode] = {
                            val: [{
                                Code: item.Code,
                                Description: item.Description,
                                display_order: el.display_order1
                            }],
                            Category: item.Category,
                            erpPosition: el.DisplayOrder,
                        }
                    }
                }
            });
        }
    }))
    erpCodesPositionOnlyObjSR = Object.values(erpCodesPositionOnlyObjSR).sort((a, b) => a.erpPosition - b.erpPosition);
    return { erpCodesPositionOnlyObj, erpCodesPositionOnlyObjSR };
}

const getInternalPricingSummaryData = (sizingValveData) => {
    const { sizingData, sapData, dimensionData } = sizingValveData;
    // heavy calculation, run only once, be careful with below function ========
    let drawingSheetResponse = dimensionData?.ValveConfiguration;
    let CatalogNumber = sapData?.outputParameters?.char_summary_items.find(item => item.SapChar.includes("CATALOG_NUMBER")).CharValue

    let valveType = "";
    modelData.forEach(el => {
        if(sizingData?.SelectedValve[0]?.ModelNumber === el.ModelNumber && sizingData?.SelectedValve[0]?.Brand === el.Brand){
            valveType = el.ValveTypeSummary;
        }
    })

    const pricingSummaryData = {
        tagNumber: sizingData?.SizingDetails[0]?.SizingId,
        modelNumber:  CatalogNumber,
        valveType: valveType,
        inletSize: drawingSheetResponse?.InletSize, //1
        bodyMaterial: drawingSheetResponse?.Body, //22
        qty: "1",
        unitPrice: sapData?.outputParameters?.UnitPrice,
        unitPriceTransfer: sapData?.outputParameters?.UnitPrice,
        delivery: "",
    }

    return [pricingSummaryData];
}

const groupBy = (array, key) => {
    return array.reduce((result, currentValue) => {
        (result[currentValue[key]] = result[currentValue[key]] || []).push(currentValue);
        return result;
    }, {});
};

const TemplateHtml = () => {
    const selectedReportTypeId = useSelector((state) => state.reportTypes.selectedReportType.id);
    const { sizingDetails: { sizingData, valveCalculation, sapData, erpPositionMapping, dimensionData, drawingImageUrl, TagRevisions, dataSheetImageUrl,getPriceing } } = useSelector((state) => state.valveCalculation);
    const projectPropertiesData = useSelector((state) => state.projectProperties.projectPropertiesData);
    const [htmlContent, setHtmlContent] = useState("");
    const sizingValveData = { ...sizingData, sizingData, ...valveCalculation, valveCalculation, ...projectPropertiesData, projectPropertiesData, ...dimensionData, dimensionData, sapData, erpPositionMapping, drawingImageUrl, dataSheetImageUrl, getPriceing };

  useEffect(() => {
    handleGenerateTableClick();
  
  }, [selectedReportTypeId]);

  useEffect(() => {
    getPageUpdate();
  }, [htmlContent]);
  /**
   * Create No Data Message
   * @returns
   */
  function createNoDataMessage() {
    return `
        <tr style="text-align: center;">
            <td style="
                width: 100%; 
                padding: 10px; 
                font-weight: bold; 
                font-family: Arial; 
                font-size: 10pt; 
                color: #555;
            ">
                The requested report is currently unavailable.
            </td>
        </tr>
        `;
  }

  /**
   * Configure Table
   * @param {*} contentTags
   */
  const configureTable = (contentTags, IsSubtemplate) => {
    let htmlString = `
            <table
                 style="
                    border-collapse: collapse;
                    width: 100%;
                    font-family: Arial;
                    font-size: 6.5pt;
                " ${IsSubtemplate ? `` : `class="main-reports-table"`}>
                ${contentTags}
            </table>`;
    return htmlString;
  };

  const getTableSectionData = (templateId, isHeader = false, isFooter = false, sizingValveData) => {
    const validTemplates = MappingSubTemplateWithTemplate.filter(a => 
        !a.IsValid || ValidateExpression(a.IsValid, sizingValveData)
    );
    return groupBy(
        validTemplates.filter(a =>
            a.TemplateId === templateId && a.IsActive && a.IsParent &&
            ((isHeader && a.IsHeader) || (isFooter && a.IsFooter) || (!isHeader && !isFooter && !a.IsHeader && !a.IsFooter))
      ),
      "DisplayOrder"
    );
  };

  /**
   * Combine object rows
   * @param {*} subtemplates
   * @returns
   */
  const combineRows = (subtemplates) => {
    let combineRows = {};
    let rowId = 0;
    Object.keys(subtemplates).forEach(function (st) {
        subtemplates[st].forEach(function (sti, i) {
            const groubedByRow = groupBy(SubTemplatehtml.filter(a => a.SubTemplateId == sti.SubTemplateId), "RowId");
            Object.keys(groubedByRow).forEach(function (category) {
                combineRows[++rowId] = groubedByRow[category];
            });
        });
    });
    return combineRows;
}

/**
   * Generate table rows based on the data
   * @param {*} groupedByRow
   * @param {*} templateId
   * @param {*} pageDetail
   * @param {*} ErpCodeString
   * @returns
   */

  const generateTableContent = (
    groupedByRow,
    templateId,
    sizingValveData,
    pageDetail = {}
  ) => {
    const htmlPieces = [];

    if (groupedByRow) {
      Object.keys(groupedByRow).forEach((category) => {
        htmlPieces.push("<tr>");

        groupedByRow[category].forEach((memb) => {
          const { IsValid, ValueType, Expressions, IsImage, Param } = memb;

          if (IsValid === "" || ValidateExpression(IsValid, sizingValveData)) {
            if (ValueType === "C") {
              const childSubTempId = ValidateExpression(
                IsValid,
                sizingValveData
              );

              const rowIdValue = Param === "" ? 1 : Param;

              const childSubTempRows = groupBy(
                SubTemplatehtml.filter(
                  (a) => a.SubTemplateId == childSubTempId
                ),
                "RowId"
              );

              const childSubTempContent = generateChildSubTempContent(
                childSubTempRows,
                templateId,
                sizingValveData
              );

              const cellData = childSubTempContent.find(
                (a) => a.RowId == rowIdValue
              );

              if (cellData && cellData.HtmlRowString) {
                htmlPieces.push(cellData.HtmlRowString);
              }
            } else {
              const cellImageValue = GetCellValue(
                memb,
                sizingValveData,
                templateId,
                pageDetail
              );

              const cellDataValue = GetCellValue(
                memb,
                sizingValveData,
                templateId,
                pageDetail
              );

              const widthtdpt = Number(memb.Colspan) * 11;

              const extraStyles = IsImage === 'TRUE'
                ? {
                    "background-image": `url(${cellImageValue})`,
                    "background-repeat": "no-repeat",
                    "background-size": "100% 100%",
                  }
                : {};

              const cellContent = IsImage === 'TRUE'
                ? `<img src="${process.env.VITE_APP_URL}/${cellImageValue}" width="${widthtdpt}" style="display:none;">`
                : cellDataValue;

              htmlPieces.push(createTableCell(memb, cellContent, extraStyles));
            }
          } else if (Expressions === "Value") {
            htmlPieces.push(createTableCell(memb, "&nbsp;"));
          }
        });

        htmlPieces.push("</tr>");
      });
    }

    return htmlPieces.join("").replaceAll("<tr></tr>", "");
  };

  const emptyRow = () => {
    let emptyRow = "<tr style='height: 0pt;'>";
    for (let i = 0; i < 40; i++) {
      emptyRow += `<td colspan="1" rowspan="1" width="2.5%"></td>`

    }
    emptyRow += "</tr>";
    return emptyRow;
};

  const generateChildSubTempContent = (childSubTempRows, subTemplateId, sizingValveData) => {
    const htmlString = [];

    if (childSubTempRows) {
      Object.entries(childSubTempRows).forEach(([category, members]) => {
        const rowHtml = members
          .map((memb) => {
            if (
              memb.IsValid === "" ||
              ValidateExpression(memb.IsValid, sizingValveData)
            ) {
              const cellImageValue = GetCellValue(
                memb,
                sizingValveData,
                subTemplateId,
                {}
              );

              const cellDataValue = GetCellValue(
                memb,
                sizingValveData,
                subTemplateId,
                {}
              );

              const widthtdpt = Number(memb.Colspan) * 11;

              const extraStyles = memb.IsImage === 'TRUE'
                ? {
                    "background-image": `url(${cellImageValue})`,
                    "background-repeat": "no-repeat",
                    "background-size": "100% 100%",
                  }
                : {};

              const content = memb.IsImage === 'TRUE'
                ? `<img src="${process.env.VITE_APP_URL}/${cellImageValue}" width="${widthtdpt}" style="display:none;">`
                : cellDataValue;
              return createTableCell(memb, content, extraStyles);
            } else if (memb.Expressions === "Value") {
              return createTableCell(memb, "&nbsp;");
            }
            return "";
          })
          .join("");

        htmlString.push({
          SubTemplateId: subTemplateId,
          RowId: category,
          HtmlRowString: rowHtml,
        });
      });
    }

    return htmlString;
  };
  /**
   * Split the object data based on the page and data config
   * @param {*} tableRows
   * @param {*} tmpRowDivider
   * @param {*} pageNo
   * @returns
   */
  const getPageData = (tableRows, tmpRowDivider, pageNo) => {
    const totalRows = Object.keys(tableRows).length;
    const startIndex = (pageNo - 1) * tmpRowDivider;
    const endIndex = Math.min(startIndex + tmpRowDivider, totalRows);
    const pageRows = Object.keys(tableRows)
      .slice(startIndex, endIndex)
      .reduce((result, key) => {
        result[key] = tableRows[key];
        return result;
      }, {});
    return pageRows;
  };

  /**
   * Get Sub Templates Records
   * @param {*} temlateId
   * @param {*} subTemplateId
   * @returns
   */
  const getSubTemplates = (temlateId, subTemplateId) => {
    let subtemplates = subTemplateId === null
    ? temlateId === null
        ? groupBy(MappingSubTemplateWithTemplate, "TemplateId")
        : groupBy(
            MappingSubTemplateWithTemplate.filter(
                (a) => a.TemplateId === temlateId && a.IsParent && !a.IsHeader && !a.IsFooter && a.IsActive
            ),
            "DisplayOrder"
        )
    : groupBy(
        MappingSubTemplateWithTemplate.filter(
            (a) => a.TemplateId === temlateId && a.SubTemplateId === subTemplateId && a.IsActive
        ),
        "DisplayOrder"
    );
return subtemplates;
}

/**
* Get Row Divider
* @param {*} reportTypeId 
* @returns
*/
const getRowDivider = (reportTypeId) => {
// TODO: Currently, the calc sheet row divider is configured based on the report type ID. Additional report types need to be configured.
switch (reportTypeId) {
    case 1:
        return CALC_SHEET_REPORT_ROW_DIVIDER;
    default:
        return 0;
}
};

/**
* Generate Table Reports
* @param {*} temlateId 
* @param {*} subTemplateId 
* @returns 
*/
const generateTable = (
temlateId,
subTemplateId = null,
reportTypeId = null,
pageDetails = { currentPage: 1, totalPages: 0 },
sizingValveData
) => {
const rowDivider = getRowDivider(reportTypeId);
const subtemplates = getSubTemplates(temlateId, subTemplateId);
const tableRows = combineRows(subtemplates);
let htmlContent = "";

if (!subTemplateId) {
    const noOfPages = rowDivider ? Math.ceil(Object.keys(tableRows).length / rowDivider) : 1;
    const headerRows = combineRows(getTableSectionData(temlateId, true, false, sizingValveData));
    const footerRows = combineRows(getTableSectionData(temlateId, false, true, sizingValveData));

    for (let i = 1; i <= noOfPages; i++) {
        const currentPage = pageDetails.currentPage++;
        const totalPages = pageDetails.totalPages;

        const headerContent = generateTableContent(headerRows, temlateId, sizingValveData);
        const footerContent = generateTableContent(footerRows, temlateId, sizingValveData, { noOfPages: totalPages, currentPage });
        const middleContent = generateTableContent(
            rowDivider ? getPageData(tableRows, rowDivider, i) : tableRows,
            temlateId,
            sizingValveData
        );
        htmlContent += configureTable((headerContent + middleContent + footerContent), false);
    }
} else {
    htmlContent = configureTable(generateTableContent(tableRows, temlateId, sizingValveData), true);
}
return htmlContent;
};

const getERPCode = (sizingValveData) => {
    const { sapData, erpPositionMapping } = sizingValveData;
    const { erpCodesPositionOnlyObj, erpCodesPositionOnlyObjSR } =
      getErpPositioningObj(sapData, erpPositionMapping);

    const ErpCodeString = Object.entries(erpCodesPositionOnlyObj)
      .sort((a, b) => a[1].erpPosition - b[1].erpPosition)
      .map(([_, item]) => item.erpCode)
      .join("");

    const erpRowsArray = [];

    // Preserve header generation
    erpRowsArray.push(
      "<tr>" +
        '<td rowspan="1" colspan="7" style="background:darkgray;border-top:0.5pt solid black;border-left:0.5pt solid black;text-align:left;">Code</td>' +
        '<td rowspan="1" colspan="13" style="background:darkgray;border-top:0.5pt solid black;text-align:left;">Category</td>' +
        '<td rowspan="1" colspan="20" style="background:darkgray;border-top:0.5pt solid black;border-right:0.5pt solid black;text-align:left;">Description</td>' +
        "</tr>"
    );

    // Preserve row generation logic
    Object.entries(erpCodesPositionOnlyObj)
      .sort((a, b) => a[1].erpPosition - b[1].erpPosition)
      .forEach(([_, row]) => {
        erpRowsArray.push(
          "<tr>" +
            `<td colspan="7" style="border-top:0.5pt solid black;border-left:0.5pt solid black;text-align:left;">${row.val.Code}</td>` +
            `<td colspan="13" style="border-top:0.5pt solid black;text-align:left;">${row.val.Category}</td>` +
            `<td colspan="20" style="border-top:0.5pt solid black;border-right:0.5pt solid black;text-align:left;">${row.val.Description}</td>` +
            "</tr>"
        );
      });

    erpCodesPositionOnlyObjSR.forEach((el) => {
      erpRowsArray.push(
        "<tr>" +
          `<td colspan="7" style="border-top:0.5pt solid black;border-left:0.5pt solid black;text-align:left;">${el.val
            .map((e) => e.Code)
            .join("<br/>")}</td>` +
          `<td colspan="13" style="border-top:0.5pt solid black;text-align:left;">${el.Category}</td>` +
          `<td colspan="20" style="border-top:0.5pt solid black;border-right:0.5pt solid black;text-align:left;">${el.val
            .map((e) => e.Description)
            .join("<br/>")}</td>` +
          "</tr>"
      );
    });

    return {
      ErpCodeString,
      ErpCodeTable: erpRowsArray.join(""),
      ErpRows: erpRowsArray.length,
      erpCodetableDataArr: Object.values(erpCodesPositionOnlyObj)
        .sort((a, b) => a.erpPosition - b.erpPosition)
        .map((e) => e.val),
      erpCodesPositionOnlyObjSR,
      ErpRowsArray: erpRowsArray,
    };
  };

  const internalPricingSummarySubTable = (sizingValveData) => {
   let internalPricingSummaryData =  getInternalPricingSummaryData(sizingData, sapData, dimensionData);
    let tableData = '';

    internalPricingSummaryData.forEach(el => {
        tableData += `<tr>`;
        tableData += `
            <td rowspan="1" colspan="8" style="border-top: 0.5pt solid black;border-left: 0.5pt solid black; text-align: center;">${el.tagNumber}</td>
        `
        tableData += `
            <td rowspan="1" colspan="8" style="border-top: 0.5pt solid black;border-left: 0.5pt solid black; text-align: center;">${el.modelNumber}</td>
        `
        tableData += `
            <td rowspan="1" colspan="2" style="border-top: 0.5pt solid black;border-left: 0.5pt solid black; text-align: center;">${el.inletSize}</td>
        `
        tableData += `
            <td rowspan="1" colspan="8" style="border-top: 0.5pt solid black;border-left: 0.5pt solid black; text-align: center;">${el.bodyMaterial}</td>
        `
        tableData += `
            <td rowspan="1" colspan="2" style="border-top: 0.5pt solid black;border-left: 0.5pt solid black; text-align: center;">${el.qty}</td>
        `
        tableData += `
            <td rowspan="1" colspan="4" style="border-top: 0.5pt solid black;border-left: 0.5pt solid black; text-align: center;">$ ${el.unitPrice}</td>
        `
        tableData += `
            <td rowspan="1" colspan="4" style="border-top: 0.5pt solid black;border-left: 0.5pt solid black; text-align: center;">$ ${el.unitPriceTransfer}</td>
        `
        tableData += `
            <td rowspan="1" colspan="4" style="border-top: 0.5pt solid black;border-left: 0.5pt solid black;border-right: 0.5pt solid black; text-align: center;">${el.delivery}</td>
        `
        tableData += `</tr>`;
    })
    return tableData;
  };
  const projectSummarySubTable = (sizingValveData) => {
    //let internalPricingSummaryData = getInternalPricingSummaryData(sizingValveData);
    let internalPricingSummaryData = getInternalPricingSummaryData(sizingData, sapData, dimensionData);
     let tableData = '';
 
     internalPricingSummaryData.forEach(el => {
         tableData += `<tr>`;
         tableData += `
             <td rowspan="1" colspan="8" style="border-top: 0.5pt solid black;border-left: 0.5pt solid black; text-align: center;">${el.tagNumber}</td>
         `
         tableData += `
             <td rowspan="1" colspan="8" style="border-top: 0.5pt solid black;border-left: 0.5pt solid black; text-align: center;">${el.modelNumber}</td>
         `
         tableData += `
         <td rowspan="1" colspan="4" style="border-top: 0.5pt solid black;border-left: 0.5pt solid black; text-align: center;">${el.valveType}</td>
        `
         tableData += `
             <td rowspan="1" colspan="2" style="border-top: 0.5pt solid black;border-left: 0.5pt solid black; text-align: center;">${el.inletSize}</td>
         `
         tableData += `
             <td rowspan="1" colspan="8" style="border-top: 0.5pt solid black;border-left: 0.5pt solid black; text-align: center;">${el.bodyMaterial}</td>
         `
         tableData += `
             <td rowspan="1" colspan="2" style="border-top: 0.5pt solid black;border-left: 0.5pt solid black; text-align: center;">${el.qty}</td>
         `
         tableData += `
             <td rowspan="1" colspan="4" style="border-top: 0.5pt solid black;border-left: 0.5pt solid black; text-align: center;">$ ${el.unitPrice}</td>
         `
         tableData += `
             <td rowspan="1" colspan="4" style="border-top: 0.5pt solid black;border-left: 0.5pt solid black;border-right: 0.5pt solid black; text-align: center;">${el.delivery}</td>
         `
         tableData += `</tr>`;
     })
     return tableData;
   };
  const GetCellValue = (memb, sizingValveData, templateId, pageDetail = {}) => {
    const { sapData, dimensionData, drawingImageUrl, dataSheetImageUrl, getPriceing } = sizingValveData;
    var cellvalue = memb.CellValue;
    if (memb.ValueType == 'P') {
        const expression = memb.Param;
        const currentDate = new Date();
        function formatDate(apiDate) {
            if (!apiDate) return "";
            const [year, month, day] = apiDate.split("-");
            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            return `${parseInt(day)}-${monthNames[parseInt(month) - 1]}-${year}`;
        }
        const dateString = currentDate.getFullYear() + "-" + (currentDate.getMonth() + 1) + "-" + currentDate.getDate();
        const MultiValve = sizingValveData?.SizingDetails[0]?.IsMultivalve ? 'Multiple Valve Application' : '';
        const ConfigValveType = `${sizingValveData?.SelectedValve[0].ModelNumber}, ${sizingValveData?.SelectedValve[0].SizeOrOrifice}`;
        const CatalogueNumber = sapData?.outputParameters?.char_summary_items.find(item => item.SapChar.includes("CATALOG_NUMBER")).CharValue;
        const configId = sapData?.outputParameters?.configHeaderId;
        //const UnitPrice = `$ ${sapData?.outputParameters?.UnitPrice}`;
        // const MaxFlowP = `${sizingValveData?.SelectedValve[0]?.ReResponse?.equationValues?.Wsel ?? sizingValveData?.SelectedValve[0]?.ReResponse?.equationValues?.Vsel ?? sizingValveData?.SelectedValve[0]?.ReResponse?.equationValues?.Qm} ${sizingValveData?.SelectedValve[0]?.ReResponse?.uomReceived?.flowCapacityUOM}`;
        // const MaxFlowV = `${sizingValveData?.SelectedValve[0]?.SelectedValve?.ReResponse_v?.equationValues?.Wsel} ${sizingValveData?.SelectedValve[0]?.ReResponse?.uomReceived?.flowCapacityUOM}`;
        // let TagRevisions = Array.isArray(sizingValveData?.TagRevisions) ? [...[...sizingValveData?.TagRevisions]].filter((item, index) => index < 5) : [];
        const {ErpCodeString} = getERPCode(sizingValveData);
        const InternalPricingSubReport = selectedReportTypeId === 11 ? internalPricingSummarySubTable(sizingValveData) : '';
        const ProjectSummarySubReport = selectedReportTypeId === 10 ? projectSummarySubTable(sizingValveData) : '';
        let TagRevisions = Array.isArray(sizingValveData?.TagRevisions) ? [...sizingValveData?.TagRevisions].filter((item, index) => index < 5).map((item) => ({ ...item, Date: formatDate(item.Date), })) : []; 
        const title = selectedReportTypeId === 2 ? "Pressure Relief Valve Sizing & Selection Report" : selectedReportTypeId === 3 ? "Pressure Relief Valve Dimensional Drawing" : selectedReportTypeId === 5 ? "Pressure Relief Valve Configuration Report" : selectedReportTypeId === 4 ? "API 2000 Tank Capacity Sizing Calculation" : selectedReportTypeId === 7 ? templateId === 39 ? "Pressure Relief Valve Dimensional Drawing" : templateId === 40 ? "Pressure Relief Valve Configuration Report" : templateId === 46 ? "API 2000 Tank Capacity Sizing Calculation": [34, 35, 36, 37, 38].includes(templateId) ? "Pressure Relief Valve Sizing & Selection Report" : "Pressure Relief Valve Calculation Report" : "Pressure Relief Valve Calculation Report";  
        //const DataSheetImage = sizingData?.SelectedValve[0]?.ValveTypeSummary === 'Spring-Op' && !(["9300", "93", "95"].includes(sizingData?.SelectedValve[0]?.ModelNumber)) && !(sizingData?.SelectedValve[0]?.ModelNumber === "9200") ? 'drawing_sheet_images/SpringOperatedSchematic.png' : sizingData?.SelectedValve[0]?.ValveTypeSummary === 'Pilot-Op' && !(["9300", "93", "95"].includes(sizingData?.SelectedValve[0]?.ModelNumber)) && !(sizingData?.SelectedValve[0]?.ModelNumber === "9200") ? 'drawing_sheet_images/PilotOperatedSchematic.png'  : sizingData?.SelectedValve[0]?.ModelNumber === "9200" ? 'drawing_sheet_images/9200.PNG' : ["9300", "93", "95"].includes(sizingData?.SelectedValve[0]?.ModelNumber) ? 'drawing_sheet_images/9300_93_95.PNG' : 'drawing_sheet_images/Default.png'
        const TankShape = sizingValveData?.API2000TankDataAPI521Fire[0]?.TankShape;
        const Ends = sizingValveData?.API2000TankDataAPI521Fire[0]?.Ends;
        const IsHorizontalOrientation = sizingValveData?.API2000TankDataAPI521Fire[0]?.IsHorizontalOrientation ? 'Horizontal' : 'Vertical';
        const API2000Image = TankShape == 'Spherical' ? 'API2000_TankCalcSheet_new/TankSpherical.png' :TankShape == 'Rectangular' ? 'API2000_TankCalcSheet_new/TankRectangular.png' : TankShape == 'Cylindrical' && Ends == 'FlatEnds' && IsHorizontalOrientation !== 'Vertical' ? 'API2000_TankCalcSheet_new/TankHorizontalCylinderFlat.png' : TankShape == 'Cylindrical' && Ends == 'FlatEnds' && IsHorizontalOrientation == 'Vertical' ? 'API2000_TankCalcSheet_new/TankVerticalCylinderFlat.png' : TankShape == 'Cylindrical' && Ends == 'HemisphericalEnds' && IsHorizontalOrientation !== 'Vertical' ? 'API2000_TankCalcSheet_new/TankHorizontalCylinderHemi.png' : TankShape == 'Cylindrical' && Ends == 'HemisphericalEnds' && IsHorizontalOrientation == 'Vertical' ? 'API2000_TankCalcSheet_new/TankVerticalCylinderHemi.png' : 'API2000_TankCalcSheet_new/TankSpherical.png';
        // const WeightKg = convertUnit(Weight, 'lb', 'kg');
        const variables = { ...sizingValveData, date: formatDate(dateString), MultiValve, ConfigValveType, CatalogueNumber, configId, ErpCodeString, TagRevisions, drawingImageUrl, pageDetail, API2000Image, title, InternalPricingSubReport, dataSheetImageUrl, getPriceing, ProjectSummarySubReport, templateId };
        //console.log("variables",variables);
        cellvalue = ValidateExpression(expression, variables);
    }
    else if (memb.ValueType == 'C') {
        const expression = memb.IsValid;
        const variables = { ...sizingValveData };
        const childSubTempId = ValidateExpression(expression, variables);
        //console.log(".....childSubTempId...", childSubTempId);
        cellvalue = generateTable(templateId, childSubTempId, null, null, sizingValveData);
    }
    cellvalue = memb.IsNotes === 'TRUE' ? cellvalue?.length >80 ? cellvalue.replace(/(.{80})/g, "$1 "): cellvalue : cellvalue;
    return cellvalue === 'USD'
      ? '$'
      : cellvalue === undefined ||
        cellvalue === null ||
        cellvalue === false ||
        cellvalue === 'false' ||
        cellvalue?.length == ''
      ? '&nbsp;'
      : cellvalue;
    //return cellvalue?.length == ''  ? '&nbsp;' : cellvalue;
    }
    
    /**
    * Get Template ID
    * @param {*} sizingData 
    * @param {*} ReportTypeId 
    * @returns 
    */
    const getTemplateID = (sizingData, ReportTypeId) => {
    const WorkFlowId = sizingData.SizingDetails[0].WorkFlowId;
    const ModelId = sizingData.SelectedValve[0].ModelId;
    const ShortName = sizingData.SelectedValve[0].ShortName;
    const VPValveType = sizingData.SelectedValve[0].ValveType ?? (sizingData.FluidDetails[0].IsPressureOnly ? sizingData.SelectedValve[0]?.SelectedValve?.VPValveType : sizingData.SelectedValve[0]?.SelectedValve?.VPValveTypeV);
    //const ValveFunction = sizingData.SelectedValve[0].ValveFunction;
    const Service = sizingData.SelectedValve[0].Service ?? (sizingData.FluidDetails[0].IsPressureOnly ? sizingData.SelectedValve[0]?.SelectedValve?.Service : sizingData.SelectedValve[0]?.SelectedValve?.ServiceV);
    const IsPressureOnly = sizingData.FluidDetails[0].IsPressureOnly;
    const IsVacuumOnly = sizingData.FluidDetails[0].IsVacuumOnly;
    const IsCritical = [3,13,22,23].includes(sizingData?.SizingDetails[0]?.WorkFlowId) ? 'TRUE' : sizingData.SelectedValve[0].ReResponse?.equationValues?.IsCritical === false ? 'FALSE' : 'TRUE';
    const ValveFunction = ReportTypeId !== 1 && IsPressureOnly && IsVacuumOnly ? "P" : IsPressureOnly && IsVacuumOnly ? "PV" : IsPressureOnly ? "P" : IsVacuumOnly ? "V" : 'P';
    if (ReportTypeId === 4 && (sizingData?.SizingDetails[0]?.WorkFlowId === 3 || sizingData?.SizingDetails[0]?.WorkFlowId === 23 )){
        const templateId = (sizingData?.API2000FlowRateReq[0]?.RequiredCapacityMethod === 'Normal' && 
            sizingData?.API2000FlowRateReq[0]?.SizingBassis === 'sev_Ed_AnnexA' && 
            sizingData?.FluidDetails[0]?.IsPressureOnly && sizingData?.FluidDetails[0]?.IsVacuumOnly) ? 41 :
        (sizingData?.API2000FlowRateReq[0]?.RequiredCapacityMethod === 'Normal' && 
            sizingData?.API2000FlowRateReq[0]?.SizingBassis === 'sev_Ed_AnnexA' && 
            sizingData?.FluidDetails[0]?.IsPressureOnly && !sizingData?.FluidDetails[0]?.IsVacuumOnly) ? 45 :
        (sizingData?.API2000FlowRateReq[0]?.RequiredCapacityMethod === 'Normal' && 
            sizingData?.API2000FlowRateReq[0]?.SizingBassis === 'sev_Ed_AnnexA' && 
            sizingData?.FluidDetails[0]?.IsVacuumOnly && !sizingData?.FluidDetails[0]?.IsPressureOnly) ? 46 :
        ((sizingData?.API2000FlowRateReq[0]?.RequiredCapacityMethod === 'Emergency') && 
            (sizingData?.API2000FlowRateReq[0]?.SizingBassis === 'sev_Ed_AnnexA' || sizingData?.API2000FlowRateReq[0]?.SizingBassis === 'sev_Ed_Main') && 
                ((sizingData?.FluidDetails[0]?.IsVacuumOnly && !sizingData.FluidDetails[0].IsPressureOnly) || (!sizingData?.FluidDetails[0]?.IsVacuumOnly && sizingData.FluidDetails[0].IsPressureOnly) )) ? 47 :
        (sizingData?.API2000FlowRateReq[0]?.RequiredCapacityMethod === 'Normal' && 
            sizingData?.API2000FlowRateReq[0]?.SizingBassis === 'sev_Ed_Main' && 
            sizingData?.FluidDetails[0]?.IsPressureOnly && sizingData?.FluidDetails[0]?.IsVacuumOnly) ? 48 :
        (sizingData?.API2000FlowRateReq[0]?.RequiredCapacityMethod === 'Normal' && 
            sizingData?.API2000FlowRateReq[0]?.SizingBassis === 'sev_Ed_Main' && 
            sizingData?.FluidDetails[0]?.IsPressureOnly && !sizingData?.FluidDetails[0]?.IsVacuumOnly) ? 49 :
        (sizingData?.API2000FlowRateReq[0]?.RequiredCapacityMethod === 'Normal' && 
            sizingData?.API2000FlowRateReq[0]?.SizingBassis === 'sev_Ed_Main' && 
            sizingData?.FluidDetails[0]?.IsVacuumOnly && !sizingData?.FluidDetails[0]?.IsPressureOnly) ? 50 :
        (sizingData?.API2000FlowRateReq[0]?.RequiredCapacityMethod === 'Emergency' && 
            sizingData?.API2000FlowRateReq[0]?.SizingBassis === 'sev_Ed_AnnexA' && 
            sizingData?.FluidDetails[0]?.IsVacuumOnly) ? 51 :
        (sizingData?.API2000FlowRateReq[0]?.RequiredCapacityMethod === 'Emergency' && 
            sizingData?.API2000FlowRateReq[0]?.SizingBassis === 'sev_Ed_Main' && 
            sizingData?.FluidDetails[0]?.IsVacuumOnly) ? 52 : '';
        return [templateId];
    }
    else if (ReportTypeId === 8){
        return [43];
    }
    else if (ReportTypeId === 9){
        return [44];
    }
    else if (ReportTypeId === 11){
      return [60,61,62];
    }
    else if (ReportTypeId === 10){
      return [63];
    }
    else if (ReportTypeId === 1 && sizingData?.SizingDetails[0]?.WorkFlowId === 21){
      const templateId = sizingData?.SelectedValve[0]?.ReResponse?.ReResponseL2?.inputValues ? [17,15,16,64] : [17,15,16];
      return templateId;
    }
    
    console.log(WorkFlowId, ModelId, ShortName, VPValveType, Service, ReportTypeId, ValveFunction, IsCritical, "filterParams");
    let filteredItems = ValveFunction !== "PV" ? MappingWorkflowToTemplate.filter(
        a =>
            a.WorkflowId == WorkFlowId &&
            a.ModelId == ModelId &&
            a.ShortName == ShortName &&
            a.VPValveType == VPValveType &&
            a.Service == Service &&
            a.ReportTypeId == ReportTypeId &&
            a.ValveFunction == ValveFunction && IsCritical == a.IsCritical
    ) : MappingWorkflowToTemplate.filter(
        a =>
            a.WorkflowId == WorkFlowId &&
            a.ModelId == ModelId &&
            a.ShortName == ShortName &&
            a.VPValveType == VPValveType &&
            a.Service == Service &&
            a.ReportTypeId == ReportTypeId && IsCritical == a.IsCritical
    );
    // const omega_Equ = sizingData.SelectedValve[0]?.SelectedValve?.omega_Equ;
    // if (ReportTypeId === 1 && sizingData?.SizingDetails[0]?.WorkFlowId === 17){
    //   filteredItems = filteredItems.filter(a => {
    //     if(a.omega_Equ == omega_Equ){
    //       //console.log("omega_Equ matched", a);
    //       return true;
    //     }
    //   })
    // }
    let templateId = filteredItems.map(a => a.TemplateId);  
    if (templateId.includes(24)) {
      if (sizingData.SelectedValve[0]?.ReResponse?.equationValues?.omega_Equ === '1.4.0') {
        templateId = [19];
      }
    } else if (templateId.includes(22)) {
      if (sizingData.SelectedValve[0]?.ReResponse?.equationValues?.omega_Equ === '1.31') {
        templateId = [23];
      }
    } else if (templateId.includes(1314) && ValveFunction == "PV") {
          templateId = [1314];
    } else if (templateId.includes(19) && WorkFlowId == 17) {
      if(sizingData.SelectedValve[0]?.SelectedValve?.omega_Equ == 'ωs = 9 * (v9 / v1 - 1)'){
        templateId = [19];
      }else{
        templateId = [20];
      }  
    }

    console.log("templateId", templateId);
    return templateId;
    }
    
    /**
    * Calculate Total Pages
    * @param {*} reportTypeIds 
    * @param {*} sizingData 
    * @returns 
    */
    const calculateTotalPages = (reportTypeIds, sizingData) => {
    let totalPages = 0;
    reportTypeIds.forEach((value) => {
        const templateIds = getTemplateID(sizingData, value);
        if (templateIds) {
            templateIds.forEach((templateId) => {
                const rowDivider = getRowDivider(value);
                const subtemplates = getSubTemplates(templateId, null);
                const tableRows = combineRows(subtemplates);
                const noOfPages = rowDivider ? Math.ceil(Object.keys(tableRows).length / rowDivider) : 1;
                totalPages += noOfPages;
            });
        }
    });
    return totalPages;
    };
    
    /**
    * Generate Combined Template Report
    * @param {*} reportTypeIds 
    * @param {*} sizingData 
    * @param {*} totalPages 
    * @returns 
    */
    const generateCombinedReports = (reportTypeIds, sizingData, totalPages) => {
    let html = '';
    const pageDetails = { currentPage: 1, totalPages };
    
    reportTypeIds.forEach((value) => {
        const templateIds = getTemplateID(sizingData, value);
        if (templateIds) {
            templateIds.forEach((templateId) => {
                html += generateTable(templateId, null, value, pageDetails);
            });
        }
    });
    
    return html;
    };
    
    /**
    * Generate Single Template Report
    * @param {*} templateId 
    * @param {*} reportTypeId 
    * @returns 
    */
    const generateSingleReport = (templateIds, reportTypeId) => {
    let html = '';
    // const templateIdArray = Array.isArray(templateIds) ? templateIds : [templateIds];
    templateIds.forEach((templateId) => {
        const rowDivider = getRowDivider(reportTypeId);
        const subtemplates = getSubTemplates(templateId, null);
        const tableRows = combineRows(subtemplates);
        const noOfPages = rowDivider ? Math.ceil(Object.keys(tableRows).length / rowDivider) : 1;
        const pageDetails = { currentPage: 1, totalPages: noOfPages };
        html += generateTable(templateId, null, reportTypeId, pageDetails);
    });
    
    return html;
    };
    /**
    * Handle report generation
    * @returns
    */
    const handleGenerateTableClick = () => {
    let html = '';
    if (!sizingData?.SelectedValve?.length || !sizingData.SizingDetails?.length) {
        alert('Invalid Sizing Id is entered.');
        setHtmlContent(html);
        return;
    }
    // const ReportTypeId = selectedReportTypeId;
    // if (ReportTypeId === 7) {
    //     const combineReportTypeIds = [2, 1, 3, 5];
    //     const totalPages = calculateTotalPages(combineReportTypeIds, sizingData);
    //     html = generateCombinedReports(combineReportTypeIds, sizingData, totalPages);
    // } else {
    //     const templateIds = getTemplateID(sizingData, ReportTypeId);
    //     if (templateIds) {
    //         html = generateSingleReport(templateIds, ReportTypeId);
    //     } else {
    //         html = configureTable(createNoDataMessage());
    //     }
    // }
    sizingData.SelectedValve.forEach((valve) => {
        const modifiedSizingData = { ...sizingData, SelectedValve: [valve] };
        const ReportTypeId = selectedReportTypeId;
        let combineReportTypeIds = [];
        if (ReportTypeId === 7) {
            combineReportTypeIds = (modifiedSizingData?.API521FlowRateReq[0]?.CalculateTankData)?[2, 4, 1, 3, 5]:[2, 1, 3, 5];
        } else if (ReportTypeId === 11) {
            combineReportTypeIds = [11, 2, 5];
        } else {
            combineReportTypeIds = [ReportTypeId];
        }
        combineReportTypeIds.forEach((reportTypeId) => {
            const templateIds = getTemplateID(modifiedSizingData, reportTypeId);
            if(templateIds){
                templateIds.forEach((templateId) => {
                    html += generateReport(modifiedSizingData, templateId, null, reportTypeId);
                });
            } else {
                html += configureTable(createNoDataMessage());
            }
        });
    });
    setHtmlContent(html);
    };


const generateReport = (
    sizingData,
    temlateId,
    subTemplateId = null,
    reportTypeId = null
  ) => {
    const sizingValveData = { ...sizingData, sizingData, ...valveCalculation, valveCalculation, ...projectPropertiesData, projectPropertiesData, ...dimensionData, dimensionData, sapData, erpPositionMapping, drawingImageUrl, dataSheetImageUrl, getPriceing };
    let htmlContent = "";
    const headerRows = combineRows(getTableSectionData(temlateId, true, false, sizingValveData));
    const headerRowsCount = Object.keys(headerRows).length;
    const bodySubTemplates = getTableSectionData(temlateId, false, false, sizingValveData);
    const bodyRows = combineRows(bodySubTemplates);
    const erpObj = reportTypeId === 5 ? getERPCode(sizingValveData) : null;
    const erpRowsArray = erpObj?.ErpRowsArray || [];
    let erpRowIndex = 0;

    // Preserve body rows count calculation
    const originalBodyRowsCount =
      reportTypeId === 5
        ? Object.keys(bodyRows).length + (erpObj?.ErpRows || 0)
        : Object.keys(bodyRows).length;

    const footerRows = combineRows(getTableSectionData(temlateId, false, true, sizingValveData));
    const footerRowsCount = Object.keys(footerRows).length;
    const numberOfRowsPerPage = reportTypeId === 3 ? 61 - headerRowsCount - footerRowsCount : reportTypeId === 1 ? 66 - headerRowsCount - footerRowsCount : 63 - headerRowsCount - footerRowsCount;
        const numberOfPages = Math.ceil(
      originalBodyRowsCount / numberOfRowsPerPage
    );

    const SubTemplateRows = [];
    const SubtemplateIds = [];

    for (let pageNo = 1; pageNo <= numberOfPages; pageNo++) {
      const currentPage = pageNo;
      const totalPages = numberOfPages;
      const headerContent = generateTableContent(headerRows, temlateId, sizingValveData);
      const footerContent = generateTableContent(footerRows, temlateId, sizingValveData, {
        noOfPages: totalPages,
        currentPage,
      });

      let middleContent = "";
      let bodyRowsUsed = 0;

      // Process non-ERP content
      Object.keys(bodySubTemplates).forEach(function (st) {
        bodySubTemplates[st].forEach(function (sti, i) {
          if (sti.SubTemplateId === 205) return; // Skip ERP template

          const groubedByRow = groupBy(
            SubTemplatehtml.filter(
              (a) =>
                a.SubTemplateId === sti.SubTemplateId &&
                !SubtemplateIds.includes(sti.SubTemplateId)
            ),
            "RowId"
          );

          const subTemplateRowsCount = Object.keys(groubedByRow).length;
          if (subTemplateRowsCount > 0) {
            if (bodyRowsUsed + subTemplateRowsCount <= numberOfRowsPerPage) {
              SubTemplateRows.push({
                Page: pageNo,
                RowCount: subTemplateRowsCount,
                SubTemplateId: sti.SubTemplateId,
              });
              SubtemplateIds.push(sti.SubTemplateId);
              middleContent += generateTableContent(groubedByRow, temlateId, sizingValveData);
              bodyRowsUsed += subTemplateRowsCount;
            }
          }
        });
      });

      // Process ERP content (new pagination logic)
      const remainingRows = numberOfRowsPerPage - bodyRowsUsed;
      const erpChunk = erpRowsArray.slice(
        erpRowIndex,
        erpRowIndex + remainingRows
      );
      erpRowIndex += erpChunk.length;
      middleContent += erpChunk.join("");

      // Preserve empty rows logic
      const emptyRowsNeeded =
        numberOfRowsPerPage - (bodyRowsUsed + erpChunk.length);
      if (emptyRowsNeeded > 0) {
        for (let i = 0; i < emptyRowsNeeded; i++) {
          middleContent +=
            i === 0
              ? '<tr><td colspan="40" style="height:10.2pt;border-top:0.5pt solid black;border-left:0.5pt solid black;border-right:0.5pt solid black;">&nbsp;</td></tr>'
              : '<tr><td colspan="40" style="height:10.2pt;border-left:0.5pt solid black;border-right:0.5pt solid black;">&nbsp;</td></tr>';
        }
      }

      htmlContent += emptyRow() + headerContent + middleContent + footerContent;
    }

    return configureTable(htmlContent, false);
  };

  const getPageUpdate = () => {
    const pageNoTds = document.getElementsByClassName("page-number");
    const pageTotalNoTds = document.getElementsByClassName("total-page-number");
    for(let i = 0; i < pageNoTds.length; i++){
        pageNoTds[i].innerText = (i + 1);
        pageTotalNoTds[i].innerText = pageTotalNoTds.length;
    }
}

return (
<>
    <Row className="mt-3">
        <Col sm="5">
            <h5>Report Template Html</h5>
        </Col>
    </Row>
    <Row className="mt-3">
        <Col sm="12">
            <div style={{ width: '100%', backgroundColor: "white" }} dangerouslySetInnerHTML={{ __html: htmlContent }} />
        </Col>
    </Row>
</>
);
};

export default TemplateHtml;

  // Convert object of styles to CSS string
  const styleString = (styleObj) => {
    const hyphenate = (key) =>
      key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);

    return Object.entries(styleObj)
      .map(([key, value]) => `${hyphenate(key)}:${value};`)
      .join(" ");
  };

  // Generate attributes from object while excluding specific keys
  const generateAttributes = (
    obj,
    excludeKeys = new Set(["StyleTd", "StyleTr"])
  ) => {
    return Object.entries(obj)
      .reduce((attrs, [key, value]) => {
        if (value && !excludeKeys.has(key)) {
          attrs += ` ${key}="${value}"`;
        }
        return attrs;
      }, "")
      .trim();
  };

  const createTableCell = (memb, content, extraStyles = {}) => {
    const dynamicAttributes = generateAttributes(memb);

    const widthtdpt = Number(memb.Colspan) * 11;
    const heighttdpt = Number(memb.Rowspan) * 10.2;

    const styles = {
      height: `${heighttdpt}pt`,
      width: `${widthtdpt}pt`,
      "text-align": "center",
      ...extraStyles,
    };

    const style = [styleString(styles), memb.StyleTd].filter(Boolean).join(" ");

    return `<td style="${style}" ${dynamicAttributes}>
                  ${content}
            </td>`;
  };