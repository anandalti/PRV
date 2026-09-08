const { getDateFunc } = require("./commonMethodsReports");
const { getRoundedReportsVal, genResPayload, getReportsVal } = require("./dataMapperCommonMethods");

const Ain = (sizingData, uomResults, templateId, sapData) => {
    const val = sapData.dimensionData.A;
    return genResPayload(val, 'length.in', sizingData, uomResults);
}
const Bin = (sizingData, uomResults, templateId, sapData) => {
    const val = sapData.dimensionData.B;
    return genResPayload(val, 'length.in', sizingData, uomResults);
}
const Cin = (sizingData, uomResults, templateId, sapData) => {
    const val = sapData.dimensionData.C;
    return genResPayload(val, 'length.in', sizingData, uomResults);
}
const Din = (sizingData, uomResults, templateId, sapData) => {
    const val = sapData.dimensionData.D;
    return genResPayload(val, 'length.in', sizingData, uomResults);
}
const Ein = (sizingData, uomResults, templateId, sapData) => {
    const val = sapData.dimensionData.E;
    return genResPayload(val, 'length.in', sizingData, uomResults);
}
const Fin = (sizingData, uomResults, templateId, sapData) => {
    const val = sapData.dimensionData.F;
    return genResPayload(val, 'length.in', sizingData, uomResults);
}
const Gin = (sizingData, uomResults, templateId, sapData) => {
    const val = sapData.dimensionData.G;
    return genResPayload(val, 'length.in', sizingData, uomResults);
}
const Hin = (sizingData, uomResults, templateId, sapData) => {
    const val = sapData.dimensionData.H;
    return genResPayload(val, 'length.in', sizingData, uomResults);
}
const Amm = (sizingData, uomResults, templateId, sapData) => {
    const val = sapData.dimensionData.A * 25.4;
    return genResPayload(val, 'length.mm', sizingData, uomResults);
}
const Bmm = (sizingData, uomResults, templateId, sapData) => {
    const val = sapData.dimensionData.B * 25.4;
    return genResPayload(val, 'length.mm', sizingData, uomResults);
}
const Cmm = (sizingData, uomResults, templateId, sapData) => {
    const val = sapData.dimensionData.C * 25.4;
    return genResPayload(val, 'length.mm', sizingData, uomResults);
}
const Dmm = (sizingData, uomResults, templateId, sapData) => {
    const val = sapData.dimensionData.D * 25.4;
    return genResPayload(val, 'length.mm', sizingData, uomResults);
}
const Emm = (sizingData, uomResults, templateId, sapData) => {
    const val = sapData.dimensionData.E * 25.4;
    return genResPayload(val, 'length.mm', sizingData, uomResults);
}
const Fmm = (sizingData, uomResults, templateId, sapData) => {
    const val = sapData.dimensionData.F * 25.4;
    return genResPayload(val, 'length.mm', sizingData, uomResults);
}
const Gmm = (sizingData, uomResults, templateId, sapData) => {
    const val = sapData.dimensionData.G * 25.4;
    return genResPayload(val, 'length.mm', sizingData, uomResults);
}
const Hmm = (sizingData, uomResults, templateId, sapData) => {
    const val = sapData.dimensionData.H * 25.4;
    return genResPayload(val, 'length.mm', sizingData, uomResults);
}
const Wtlbm = (sizingData, uomResults, templateId, sapData) => {
    const val = sapData.dimensionData.Weight;
    return genResPayload(val, "mass.lbm", sizingData, uomResults);
}
const Wtkg = (sizingData, uomResults, templateId, sapData) => {
    const val = sapData.dimensionData.Weight * 0.45359237;
    return genResPayload(val, 'mass.kg', sizingData, uomResults);
}
const StaticDrawingURL = (sizingData, uomResults, templateId, sapData) => {
    const val = getReportsVal("drawing_url", sizingData);
    return genResPayload(val, null, sizingData, uomResults);
}

module.exports = {
    Ain,
    Bin,
    Cin,
    Din,
    Ein,
    Fin,
    Gin,
    Hin,
    Amm,
    Bmm,
    Cmm,
    Dmm,
    Emm,
    Fmm,
    Gmm,
    Hmm,
    Wtlbm,
    Wtkg,
    StaticDrawingURL
};

