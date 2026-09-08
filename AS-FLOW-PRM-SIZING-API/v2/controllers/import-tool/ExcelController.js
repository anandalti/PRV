const { ingestExcelPayload } = require("../../service/import-tool/excelExtract");
const { parseOPSWorkbook } = require("../../service/import-tool/excelParser");
const { validateBase64ExcelPayload, validateMandatoryFields } = require("../../service/import-tool/importFileValidation");

const readExcelData = async (req, res) => {
  const excelBase64 = req.body;
  const sourceFileBase64 = excelBase64.sourceFileBase64;
  const userID = req.user?.userId;
  let fileUploadId;

  let excelData = null;

  let errorObj = {
    flag: false,
    ErrorType: null,
    ErrorStatusCode: null,
    ErrorMessage: null,
    ErrorDetails: [],
  };

  let statusCode = 200;

  try {
    const fileValidation = validateBase64ExcelPayload({ sourceFileBase64 });

    if (fileValidation.error?.flag) {
      errorObj = fileValidation.error;
      statusCode = errorObj.ErrorStatusCode || 400;
    } else {
      const workbook = fileValidation.workbook;
      excelData = await parseOPSWorkbook(workbook);
      const mandatoryValidation = validateMandatoryFields(excelData);

      if (mandatoryValidation.error?.flag) {
        errorObj = mandatoryValidation.error;
        statusCode = errorObj.ErrorStatusCode || 400;
      }
    }
  } catch (error) {
    errorObj = {
      flag: true,
      ErrorType: "EXCEL_PARSING_ERROR",
      ErrorStatusCode: 500,
      ErrorMessage: error.message,
      ErrorDetails: [],
    };

    statusCode = 500;
  }

  try {
    fileUploadId = await ingestExcelPayload( excelData, sourceFileBase64, userID, errorObj);
  } catch (ingestionError) {
    return res.status(500).json({ error: "Failed to ingest Excel payload", details: ingestionError.message});
  }

  if (errorObj.flag) {
    return res.status(statusCode).json({ error: errorObj});
  }
  return res.status(200).json({ message: "Excel data parsed and ingested successfully", excelData, fileUploadId});
};

module.exports = {
  readExcelData,
};
