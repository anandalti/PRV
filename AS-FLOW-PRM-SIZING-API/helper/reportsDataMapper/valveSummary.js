const { getDateFunc } = require("./commonMethodsReports");
const { getRoundedReportsVal, genResPayload, getReportsVal } = require("./dataMapperCommonMethods");

const PIDNumber = (sizingData, uomResults, templateId) => {
    const val = getReportsVal("reports_general.pAndId", sizingData);
    return genResPayload(val, null, sizingData, uomResults)
}
const LineNumber = (sizingData, uomResults, templateId) => {
    const val = getReportsVal("reports_general.lineNumber", sizingData);
    return genResPayload(val, null, sizingData, uomResults)
}
const EquipmentNumber = (sizingData, uomResults, templateId) => {
    const val = getReportsVal("equipment_number", sizingData);
    return genResPayload(val, null, sizingData, uomResults)
}
const InletSize = (sizingData, uomResults, templateId, sapData) => {
    const val = sapData.dimensionData.InletSize;
    return genResPayload(val, null, sizingData, uomResults)
}

const InletConnection = (sizingData, uomResults, templateId, sapData) => {
    const val = sapData.dimensionData.InletConnection;
    return genResPayload(val, null, sizingData, uomResults);
}
const InletRating = (sizingData, uomResults, templateId, sapData) => {
    const val = sapData.dimensionData.InletRating;
    return genResPayload(val, null, sizingData, uomResults);
}

const InletFinish = (sizingData, uomResults, templateId, sapData) => {
    const val = sapData.dimensionData.InletFinish;
    return genResPayload(val, null, sizingData, uomResults);
}

const OutletSize = (sizingData, uomResults, templateId, sapData) => {
    const val = sapData.dimensionData.OutletSize;
    return genResPayload(val, null, sizingData, uomResults);
}

const OutletConnection = (sizingData, uomResults, templateId, sapData) => {
    const val = sapData.dimensionData.OutletConnection;
    return genResPayload(val, null, sizingData, uomResults);
}

const OutletRating = (sizingData, uomResults, templateId, sapData) => {
    const val = sapData.dimensionData.OutletRating;
    return genResPayload(val, null, sizingData, uomResults);
}

const OutletFinish = (sizingData, uomResults, templateId, sapData) => {
    const val = sapData.dimensionData.OutletFinish;
    return genResPayload(val, null, sizingData, uomResults);
}
 
const ConnectionsStandard = (sizingData, uomResults, templateId, sapData) => {
    const val = sapData.dimensionData.ConnectionsStandard;
    return genResPayload(val, null, sizingData, uomResults);
}

module.exports = {
    PIDNumber,
    LineNumber,
    EquipmentNumber,
    InletSize,
    InletConnection,
    InletRating,
    InletFinish,
    OutletSize,
    OutletConnection,
    OutletRating,
    OutletFinish,
    ConnectionsStandard
};