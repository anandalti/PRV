const { getCatalogNumber } = require("./erpCode");
const { modelData } = require("./modelData");

const getPricingSummaryData = async (sizingData, sapDataBody) => {
    // heavy calculation, run only once, be careful with below function ========
    let drawingSheetResponse = sapDataBody.dimensionData;

    let valveType = "";
    modelData.forEach(el => {
        if(sizingData.model === el.ModelNumber && sizingData.brand === el.Brand){
            valveType = el.ValveTypeSummary;
        }
    })

    const pricingSummaryData = {
        tagNumber: sizingData.sizing_id,
        modelNumber: getCatalogNumber(sapDataBody),
        valveType: valveType,
        inletSize: drawingSheetResponse.InletSize, //1
        bodyMaterial: drawingSheetResponse.BodyMaterial, //22
        qty: "1",
        unitPrice: sapDataBody.outputParameters.UnitPrice,
        delivery: "",
    }

    return [pricingSummaryData];
}

const pricingSummarySubTable = (sizingData, templateId) => {
    let tableStart = `<table data-tempalteId="${templateId}" style="border-collapse: collapse;width: 100%;">`;
    let tableClose = `</table>`;
    let tableData = '';

    console.log("sizingData.pricingSummaryData", sizingData.pricingSummaryData)

    sizingData.pricingSummaryData.forEach(el => {
        tableData += `<tr>`;
        tableData += `
            <td rowspan="1" colspan="8" style="border: 1px solid black; text-align: center; font-family: 'Microsoft Sans Serif'; font-family:Arial; font-size:8pt;">${el.tagNumber}</td>
        `
        tableData += `
            <td rowspan="1" colspan="8" style="border: 1px solid black; text-align: center; font-family: 'Microsoft Sans Serif'; font-family:Arial; font-size:8pt;">${el.modelNumber}</td>
        `
        tableData += `
            <td rowspan="1" colspan="4" style="border: 1px solid black; text-align: center; font-family: 'Microsoft Sans Serif'; font-family:Arial; font-size:8pt;">${el.valveType}</td>
        `
        tableData += `
            <td rowspan="1" colspan="2" style="border: 1px solid black; text-align: center; font-family: 'Microsoft Sans Serif'; font-family:Arial; font-size:8pt;">${el.inletSize}</td>
        `
        tableData += `
            <td rowspan="1" colspan="8" style="border: 1px solid black; text-align: center; font-family: 'Microsoft Sans Serif'; font-family:Arial; font-size:8pt;">${el.bodyMaterial}</td>
        `
        tableData += `
            <td rowspan="1" colspan="2" style="border: 1px solid black; text-align: center; font-family: 'Microsoft Sans Serif'; font-family:Arial; font-size:8pt;">${el.qty}</td>
        `
        tableData += `
            <td rowspan="1" colspan="4" style="border: 1px solid black; text-align: center; font-family: 'Microsoft Sans Serif'; font-family:Arial; font-size:8pt;">$ ${el.unitPrice}</td>
        `
        tableData += `
            <td rowspan="1" colspan="4" style="border: 1px solid black; text-align: center; font-family: 'Microsoft Sans Serif'; font-family:Arial; font-size:8pt;">${el.delivery}</td>
        `
        tableData += `</tr>`;
    })
    tableStart += tableData;
    tableStart += tableClose;

    return tableStart;
}

const getInternalPricingSummaryData = async (sizingData, sapDataBody) => {
    // heavy calculation, run only once, be careful with below function ========
    let drawingSheetResponse = sapDataBody.dimensionData;

    let valveType = "";
    modelData.forEach(el => {
        if(sizingData.model === el.ModelNumber && sizingData.brand === el.Brand){
            valveType = el.ValveTypeSummary;
        }
    })

    const pricingSummaryData = {
        tagNumber: sizingData.sizing_id,
        modelNumber: getCatalogNumber(sapDataBody),
        valveType: valveType,
        inletSize: drawingSheetResponse.InletSize, //1
        bodyMaterial: drawingSheetResponse.BodyMaterial, //22
        qty: "1",
        unitPrice: sapDataBody.outputParameters.UnitPrice,
        unitPriceTransfer: sapDataBody.outputParameters.UnitPrice,
        delivery: "",
    }

    return [pricingSummaryData];
}

const internalPricingSummarySubTable = (sizingData, templateId) => {
    console.log({sizingData: sizingData.internalPricingSummaryData});
    let tableStart = `<table data-tempalteId="${templateId}" style="border-collapse: collapse;width: 100%;">`;
    let tableClose = `</table>`;
    let tableData = '';

    // console.log("sizingData.pricingSummaryData", sizingData.pricingSummaryData)

    sizingData.internalPricingSummaryData.forEach(el => {
        tableData += `<tr>`;
        tableData += `
            <td rowspan="1" colspan="8" style="border: 1px solid black; text-align: center; font-family: 'Microsoft Sans Serif'; font-family:Arial; font-size:8pt;">${el.tagNumber}</td>
        `
        tableData += `
            <td rowspan="1" colspan="8" style="border: 1px solid black; text-align: center; font-family: 'Microsoft Sans Serif'; font-family:Arial; font-size:8pt;">${el.modelNumber}</td>
        `
        tableData += `
            <td rowspan="1" colspan="2" style="border: 1px solid black; text-align: center; font-family: 'Microsoft Sans Serif'; font-family:Arial; font-size:8pt;">${el.inletSize}</td>
        `
        tableData += `
            <td rowspan="1" colspan="8" style="border: 1px solid black; text-align: center; font-family: 'Microsoft Sans Serif'; font-family:Arial; font-size:8pt;">${el.bodyMaterial}</td>
        `
        tableData += `
            <td rowspan="1" colspan="2" style="border: 1px solid black; text-align: center; font-family: 'Microsoft Sans Serif'; font-family:Arial; font-size:8pt;">${el.qty}</td>
        `
        tableData += `
            <td rowspan="1" colspan="4" style="border: 1px solid black; text-align: center; font-family: 'Microsoft Sans Serif'; font-family:Arial; font-size:8pt;">$ ${el.unitPrice}</td>
        `
        tableData += `
            <td rowspan="1" colspan="4" style="border: 1px solid black; text-align: center; font-family: 'Microsoft Sans Serif'; font-family:Arial; font-size:8pt;">$ ${el.unitPriceTransfer}</td>
        `
        tableData += `
            <td rowspan="1" colspan="4" style="border: 1px solid black; text-align: center; font-family: 'Microsoft Sans Serif'; font-family:Arial; font-size:8pt;">${el.delivery}</td>
        `
        tableData += `</tr>`;
    })
    tableStart += tableData;
    tableStart += tableClose;

    return tableStart;
}

module.exports = {
    getPricingSummaryData,
    pricingSummarySubTable,
    getInternalPricingSummaryData,
    internalPricingSummarySubTable
};