const { getCatalogNumber } = require("./erpCode")

const escapeHtml = (str) => {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

let tableHeaders = [
    "Company Name",
    "Project Name",
    "Tag Number",
    "P & ID",
    "Service",
    "Line Number",
    "Quantity",
    "Revision Number",
    "Prepared By",
    "Checked By",
    "Approved By",
    "Calculation Method",
    "Valve Type",
    "Model- Size or Orifice",
    "Catalog Number",
    "Sizing Basis",
    "Fluid state - Pressure",
    "Fluid state - Vacuum",
    "Fluid Name - Pressure",
    "Fluid Name - Vacuum",
    "Relieving Temp.- Pressure",
    "Relieving Temp.- Vacuum",
    "OP. Temp.",
    "Atm. Pressure",
    "Op. Pressures",
    "Set Pressure",
    "Set Vacuum",
    "Over Pressure %",
    "Under Pressure %",
    "Build Up BP",
    "Constant SI BP",
    "Variable SI BP",
    "Total BP",
    "Inlet Loss %",
    "Rated Capacity",
    "Actual Capacity",
    "Max. Capacity - Press.",
    "Max. Capacity -Vacuum",
    "Req. Orifice Area - Press.",
    "Req. Orifice Area - Vacuum",
    "Reaction Force",
    "Noise",
    "Rupture Disc CCF",
    "Required Cv",
    "Selected Cv",
    "Supply Pressure",
    "Built Up Over Set",
    "Downstream Press.",
    "Drop Below Set",
    "Delta P - Pressure",
    "Delta P - Vacuum",
    "Vessel Pressure",
    "MV Body",
    "MV Trim",
    "MV Seat",
    "MV Seals",
    "PV Body - Pressure",
    "PV Body - Vacuum",
    "PV Trim - Pressure",
    "PV Seat - Pressure",
    "PV Seat - Pressure",
    "PV Seat - Vacuum",
    "PV Seals - Pressure",
    "PV Diaphragm - Pressure",
    "PV Diaphragm - Vacuum",
    "NACE MR0175",
    "Spring",
    "Bellows",
    "Cap Type",
    "Connections",
    "MV Case",
    "MV Nozzle",
    "MV Soft Goods",
    "PV Soft Goods",
    "PV Soft Goods - Pressure",
    "PV Soft Goods - Vacuum",
    "Hood",
    "End Housing",
    "Elements / Sheets",
    "Diaphragm",
    "Insert",
    "O-Ring",
    "Cover",
    "Inlet Size",
    "Inlet Connection",
    "Inlet Rating",
    "Outlet Size",
    "Outlet Connection",
    "Outlet Rating",
]

const tableDataMapping = [
    "sizingData.reports_general.companyName",
    "sizingData.reports_general.project",
    "sizingData.sizing_id",
    "sizingData.reports_general.pAndId",
    "sizingData.service_type",
    "sizingData.reports_general.lineNumber",
    "sizingData.quantity",
    "sizingData.reports_general.revision",
    "sizingData.reports_general.preparedBy",
    "sizingData.reports_general.checkedBy",
    "sizingData.reports_general.approvedBy",
    "sizingData.preference_details.prefCalculationMethod",
    "sizingData.product_type",
    "sizingData.model",
    "catalogNumber",
    "sizingData.sizing_basis",
    "gefluidState",
    "gefluidState",
    "sizingData.fluid_name",
    "sizingData.fluid_name_v",
    "relievTempPres",
    "sizingData.relieving_forVacc",
    "sizingData.opr_temp",
    "sizingData.atm_pressure",
    "sizingData.opr_pressure",
    "sizingData.set_pressure",
    "sizingData.set_vaccum",
    "sizingData.over_pressure_per",
    "sizingData.under_press_v_per",
    "sizingData.builtUp_bk_pressure",
    "sizingData.const_supimp_bk_pressure",
    "sizingData.var_supimp_bk_pressure",
    "sizingData.total_bk_pressure",
    "sizingData.inlet_pres_loss_per",
    "sizingData.vrtd",
    "sizingData.vact",
    "sizingData.convertedValues.vMaxP",
    "sizingData.convertedValues.VmaxV",
    "sizingData.areq",
    "sizingData.convertedValues.areqV",
    // "reactionForce", /////
    // "noise", /////
    // "sapData.", /////
]

const gefluidState = (sizingData) => {
    if(sizingData.service_type === "Liquid"){
        return "Liquid"
    }else if(sizingData.service_type === "2-Phase"){
        return "TwoPhase"
    }else{
        return "Gas"
    }
}

const relievTempPres = (sizingData) => {
    if(sizingData.code.includes(2000)){
        return sizingData.relieving_forPress
    }else{
        return sizingData.relieve_temp
    }
}

const removeNull = (val) => {
    if(val === null){
        return ""
    }else{
        return val
    }
}

const projectSummaryTable = (sizingData, sapData) => {
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
                <td style="border: 1px solid #000000;width: 230px;">${escapeHtml(getCatalogNumber(sapData))}</td>
            `
        } else if (el === "relievTempPres") {
            tableData += `
                <td style="border: 1px solid #000000;width: 230px;">${escapeHtml(relievTempPres(sizingData))}</td>
            `
        } else if (el === "gefluidState") {
            tableData += `
                <td style="border: 1px solid #000000;width: 230px;">${escapeHtml(gefluidState(sizingData))}</td>
            `
        } else {
            tableData += `
                <td style="border: 1px solid #000000;width: 230px;">${escapeHtml(removeNull(eval(el)))}</td>
            `
        }
    })
    tableStart += `<tr>${tableData}</tr>`;
    tableStart += tableClose;

    return tableStart;
}

module.exports = {
    projectSummaryTable
};