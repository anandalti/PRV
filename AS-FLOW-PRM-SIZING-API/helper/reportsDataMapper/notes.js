const { genResPayload, getReportsVal } = require("./dataMapperCommonMethods");

const TagNotes = (sizingData, uomResults, templateId) => {
    const val = getReportsVal("tag_notes.tagNote", sizingData);
    return genResPayload(val, null, sizingData, uomResults)
}

const DimensionNotes = (sizingData, uomResults, templateId) => {
    const val = `<ul style="padding: 1em 0 0 1em;margin-top: 0;"><li>Accessories not shown</li><li>Actual valve may vary from image</li></ul>`;
    return genResPayload(val, null, sizingData, uomResults)
}

module.exports = {
    TagNotes,
    DimensionNotes
};

