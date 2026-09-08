const requiredSheets = ["Revision Log", "TAB INDEX"];

const revisionLogRequiredColumns = [
  "Revision Date",
  "Rev.",
  "Revision Description",
  "Approval/Date",
];

const tabIndexRequiredColumns = ["TAB NAME", "TYPE", "INCLUDE ONLY WITH"];

const errorMessages = {
  missingRequiredSheet: (sheetName) => `sheet ${sheetName} is missing`,
  invalidHeaderInSheet: (sheetName, headerNames) =>
    `sheet ${sheetName} has invalid headers:(${headerNames.join(", ")}). `,
  missingHeadersInSheet: (sheetName, headerNames) =>
    `sheet ${sheetName} is missing required headers: ${headerNames.join(", ")}. `,

  revisionLogMissingHeaderColumns: (columnNames) =>
    `sheet 'Revision Log' is missing required header columns: ${columnNames.join(", ")}. `,

  tabIndexSheetMissing: "sheet 'TAB INDEX' is missing",
  tabIndexStartMissing: "sheet 'TAB INDEX' #START missing",
  tabIndexFinishMissing: "sheet 'TAB INDEX' #FINISH missing",
  revisionLogStartMissing: "sheet 'Revision Log' #START missing",
  revisionLogFinishMissing: "sheet 'Revision Log' #FINISH missing",

  tabIndexMissingHeaderColumns: (columnNames) =>
    `sheet 'TAB INDEX' is missing required header columns: ${columnNames.join(", ")}. `,

  tabIndexTabTypeMissing: "sheet 'TAB INDEX' 'TAB TYPE' missing",

  referencedSheetMissing: (sheetName) => `sheet ${sheetName} is missing`,
  sheetStartMissing: (sheetName) => `sheet "${sheetName}" #START missing`,
  sheetFinishMissing: (sheetName) => `sheet "${sheetName}" #FINISH missing`,
  sapOracleHeadersMissing: (sheetName, missingNames) =>
    `sheet "${sheetName}" must include SAP and Oracle columns; missing: ${missingNames.join(", ")}`,
  sheetNullValueInHeader: (sheetName, headerName, columnNumber) =>
    `(sheet ${sheetName} has null value in header ${headerName} with column number ${columnNumber})`,

  noFileUploaded: "No file uploaded",

  uploadFileNameMissingProductFamily:
    'upload file name must include SAP number and product family name (e.g. "30077 OMNI SuperBOM.xlsx")',

  modelDetailsNotFound: (productFamilyName) =>
    `no ModelNumber found in public."Models" for ProductFamilyId "${productFamilyName}"`,
};
const AcSum_Rules = {
  "200API": {
    filter: { field: "ACC8", excluded: ["XF", "XK", "XL"] },
    snubber: { field: "ACC9", excluded: ["XJ"] },
    unloader: { field: "ACC5", excluded: ["XI"] },
  },
  "200FB": {
    filter: { field: "ACC8", excluded: ["XF", "XK", "XL"] },
    snubber: { field: "ACC9", excluded: ["XJ"] },
    unloader: { field: "ACC5", excluded: ["XI"] },
  },
  "400API": {
    filter: { field: "ACC9", excluded: ["XF", "XL"] },
    snubber: { field: "ACC10", excluded: ["XJ"] },
    unloader: { field: "ACC6", excluded: ["XI"] },
  },
  "400FB": {
    filter: { field: "ACC9", excluded: ["XF", "XL"] },
    snubber: { field: "ACC10", excluded: ["XJ"] },
    unloader: { field: "ACC6", excluded: ["XI"] },
  },
  "800API": {
    filter: { field: "ACC7", excluded: ["XF", "XL"] },
    snubber: { field: "ACC8", excluded: ["XJ"] },
    unloader: { field: "ACC4", excluded: ["XI"] },
  },
  "800FB": {
    filter: { field: "ACC7", excluded: ["XF", "XL"] },
    snubber: { field: "ACC8", excluded: ["XJ"] },
    unloader: { field: "ACC4", excluded: ["XI"] },
  },
};

const MATERIAL_SHEET_NOT_HEADERS = new Set([
  "acsum",
  "sap",
  "oracle",
  "qty",
  "lr",
  "l.pback_e_min_b",
  "l.pback_e_min",
  "l.pback_e_min_uom",
  "l.pback_e_max",
  "l.pback_e_max_uom",
  "l.pback_e_max_b",
  "l.spset_e_min_b",
  "l.spset_e_min",
  "l.spset_e_min_uom",
  "l.spset_e_max",
  "l.spset_e_max_uom",
  "l.spset_e_max_b",
  "quantity",
  "l.pset_e_min_b",
  "l.pset_e_min",
  "l.pset_e_min_uom",
  "l.pset_e_max",
  "l.pset_e_max_uom",
  "l.pset_e_max_b",
  "l.t,tn,tdesignmin_e_min_b",
  "l.t,tn,tdesignmin_e_min",
  "l.t,tn,tdesignmin_e_min_uom",
  "l.t,tn,tdesign_e_max",
  "l.t,tn,tdesign_e_max_uom",
  "l.t,tn,tdesign_e_max_b",
  "l.t_e_min_b",
  "l.t_e_min",
  "l.t_e_min_uom",
  "l.t_e_max",
  "l.t_e_max_uom",
  "l.t_e_max_b",
]);

module.exports = {
  requiredSheets,
  revisionLogRequiredColumns,
  tabIndexRequiredColumns,
  errorMessages,
  AcSum_Rules,
  MATERIAL_SHEET_NOT_HEADERS,
};
