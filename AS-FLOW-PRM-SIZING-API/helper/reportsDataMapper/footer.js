const { getDateFunc } = require("./commonMethodsReports");
const { getRoundedReportsVal, genResPayload } = require("./dataMapperCommonMethods");

const Printed_On = (sizingData, uomResults, templateId) => {
    const val = getDateFunc();

    return genResPayload(val, null, sizingData, uomResults)
}

const SiteName_Environment = (sizingData, uomResults, templateId) => {
    // const val = host.includes("reportengine-dev-v2") ? "PRV2SIZE Online - DEV" : host.includes("prmreports-api-test-v2") ? "PRV2SIZE Online - TEST" : host.includes("prmreports-api") ? "PRV2SIZE Online" : "PRV2SIZE Online - LOCAL";
    const val = "PRV2SIZE Online";

    return genResPayload(val, null, sizingData, uomResults)
}

const Sizing_Id = (sizingData, uomResults, templateId) => {
    const val = getRoundedReportsVal("sizing_id", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Config_Id = (sizingData, uomResults, templateId, sapData) => {
    const val = sapData.outputParameters.configHeaderId;

    return genResPayload(val, null, sizingData, uomResults)
}

module.exports = { Printed_On, SiteName_Environment, Sizing_Id, Config_Id }