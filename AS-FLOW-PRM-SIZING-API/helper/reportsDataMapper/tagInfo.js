const { getDateLocalFunc } = require("./commonMethodsReports");
const { genResPayload, getReportsVal } = require("./dataMapperCommonMethods");

const TagNumber = (sizingData, uomResults, templateId) => {
    const val = getReportsVal("reports_general.tagNumber", sizingData);
    return genResPayload(val, null, sizingData, uomResults)
}
const SizingId = (sizingData, uomResults, templateId) => {
    const val = getReportsVal("sizing_id", sizingData);
    return genResPayload(val, null, sizingData, uomResults)
}
const Revision = (sizingData, uomResults, templateId) => {
    const val = getReportsVal("rev_num", sizingData);
    return genResPayload(val, null, sizingData, uomResults)
}
const LastModified = (sizingData, uomResults, templateId) => {
    const val = getDateLocalFunc();
    return genResPayload(val, null, sizingData, uomResults)
}

const PreparedBy = (sizingData, uomResults, templateId) => {
    const val = getReportsVal("reports_general.preparedBy", sizingData);
    return genResPayload(val, null, sizingData, uomResults)
}

const CheckedBy = (sizingData, uomResults, templateId) => {
    const val = getReportsVal("reports_general.checkedBy", sizingData);
    return genResPayload(val, null, sizingData, uomResults)
}

const ApprovedBy = (sizingData, uomResults, templateId) => {
    const val = getReportsVal("reports_general.approvedBy", sizingData);
    return genResPayload(val, null, sizingData, uomResults)
}

module.exports = {
    TagNumber,
    SizingId,
    Revision,
    LastModified,
    PreparedBy,
    CheckedBy,
    ApprovedBy
};