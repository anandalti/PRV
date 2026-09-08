const { generateERPCode, getCatalogNumber } = require("./erpCode");

const escapeHtml = (str) => {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

const tableHeaders = [
    "Company Name",
    "Project Name",
    "Tag Number",
    "Catalog Number",
    "ERP Code",
    "Set Pressure",
    "Set Pressure Unit",
    "Relieving Temp.-Pressure",
    "Relieving Temp.-Pressure Unit"
]

const tableDataMapping = [
    "sizingData.reports_general.companyName",
    "sizingData.reports_general.project",
    "sizingData.sizing_id",
    "catalogNumber",
    "erpCode",
    "sizingData.set_pressure",
    "sizingData.pressure_uom",
    "sizingData.relieving_forPress ? sizingData.relieving_forPress : sizingData.relieve_temp",
    "sizingData.temp_uom"
]

const modelSummaryTable = (sizingData, sapData) => {
    let tableStart = `
        <table class="main-reports-table" style="border-collapse: collapse;width: 200%;text-align:left;">
    `;
    let tableClose = `</table>`;
    let tableHeader = '';
    let tableData = '';
    tableHeaders.forEach(el => {
        const td = `
            <td style="border: 1px solid #000000;background: #f4f7d5;width: 230px;">${el}</td>
        `
        tableHeader += td;
    })
    tableStart += `<tr>${tableHeader}</tr>`;

    tableDataMapping.forEach(el => {
        if (el === "catalogNumber") {
            tableData += `
                <td style="border: 1px solid #000000;width: 230px;">${escapeHtml(sapData ? getCatalogNumber(sapData) : "")}</td>
            `
        } else if (el === "erpCode") {
            tableData += `
                <td style="border: 1px solid #000000;width: 230px;">${escapeHtml(sapData ? generateERPCode(sapData) : "")}</td>
            `
        } else {
            tableData += `
                <td style="border: 1px solid #000000;width: 230px;">${escapeHtml(eval(el))}</td>
            `
        }
    })
    tableStart += `<tr>${tableData}</tr>`;
    tableStart += tableClose;

    return tableStart;
}

module.exports = {
    modelSummaryTable
};