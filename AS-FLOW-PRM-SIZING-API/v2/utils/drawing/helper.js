const builder = require("xmlbuilder");
const { locations } = require("./locations");
const { languages } = require("./languages");

function generateXMLFile(payload) {
  const xml = builder.create("ThomasNetXML", { encoding: "utf-16" });

  function addElement(name, value) {
    xml.ele("Param", { Name: name, Value: value || "" });
  }

  const locationMap = new Map(locations.map((loc) => [loc.label, loc.id]));
  const languageMap = new Map(languages.map((lang) => [lang.label, lang.id]));

  addElement("Notes", payload?.notes);
  addElement("NAME1", payload?.customer);
  addElement("ZZPROJN", payload?.projectName);
  addElement("BSTNK", payload?.poNumber);
  addElement("Model_Number", payload?.catalogString);
  addElement("Z106", payload?.serialNumber);
  addElement("Z102", payload?.tagNumber);
  addElement("Title", payload?.title);
  addElement("VBELN-POSNR", payload?.assemblyNo);
  addElement("VBELN", payload?.salesOrder);
  addElement("Requested_By", payload?.requestedBy);
  addElement("VIN", payload?.vin);
  addElement("Set_Pressure", payload?.setPressure);
  addElement("Set_Pressure_UOM", payload?.setPressureUOM);
  addElement("LOC", locationMap.get(payload?.location));
  addElement("LANG", languageMap.get(payload?.language));

  Object.entries(payload?.charSummaryItems || {}).forEach(([key, value]) => {
    if (value) addElement(key, value);
  });

  addElement("DNU_Tag_Name", payload?.tagNumber);
  addElement("DNU_Tag_Company", payload?.customer);
  addElement("DNU_Tag_Project", payload?.projectName);
  addElement("DNU_Tag_Quantity", payload?.quantity);
  addElement("DNU_PRV2SIZE_ModelNumber", payload?.model);

  const xmlString = xml.end({ pretty: true });

  return xmlString;
}

module.exports = { generateXMLFile };
