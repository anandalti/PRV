const { getDateFunc } = require("./commonMethodsReports");
const { getRoundedReportsVal, genResPayload, getReportsVal } = require("./dataMapperCommonMethods");

const ReportGeneratedDate = (sizingData, uomResults, templateId) => {
    const val = getDateFunc();

    return genResPayload(val, null, sizingData, uomResults)
}

const ReportTitle = (sizingData, uomResults, templateId) => {
    // const val = getReportsVal("reports_general.reportTitle", sizingData);

    return genResPayload("Pressure Relief Valve Calculation Report", null, sizingData, uomResults)
}

const CompanyName = (sizingData, uomResults, templateId) => {
    const val = getReportsVal("preference_details.prefCompany", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Address = (sizingData, uomResults, templateId) => {
    const val = getReportsVal("preference_details.prefAddress", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const City_State_Zip_Country = (sizingData, uomResults, templateId) => {
    const val = getReportsVal("preference_details.prefCountry", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Phone = (sizingData, uomResults, templateId) => {
    const val = getReportsVal("preference_details.prefPhone", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Fax = (sizingData, uomResults, templateId) => {
    const val = getReportsVal("reports_general.fax", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Email_Website = (sizingData, uomResults, templateId) => {
    const val = getReportsVal("preference_details.prefEmail", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Our_Reference_Number = (sizingData, uomResults, templateId) => {
    const val = getReportsVal("reports_general.quoteNumber", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Client = (sizingData, uomResults, templateId) => {
    const val = getReportsVal("reports_general.client", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Multiple_Valve_Application = (sizingData, uomResults, templateId) => {
    const val = getReportsVal("singleOrMultivalve", sizingData);

    return genResPayload(val === "single" ? "" : "MULTI VALVE APPLICATION", null, sizingData, uomResults)
}

const Location = (sizingData, uomResults, templateId) => {
    const val = getReportsVal("reports_general.location", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const End_User_Ref_Number = (sizingData, uomResults, templateId) => {
    const val = getReportsVal("reports_general.endUserRefNo", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Project = (sizingData, uomResults, templateId) => {
    const val = getReportsVal("reports_general.project", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

const Project_Ref_Number = (sizingData, uomResults, templateId) => {
    const val = getReportsVal("reports_general.projectRefNo", sizingData);

    return genResPayload(val, null, sizingData, uomResults)
}

module.exports = { ReportGeneratedDate, ReportTitle, CompanyName, Address, City_State_Zip_Country, Phone, Fax, Email_Website, Our_Reference_Number, Client, Multiple_Valve_Application, Location, End_User_Ref_Number, Project, Project_Ref_Number }