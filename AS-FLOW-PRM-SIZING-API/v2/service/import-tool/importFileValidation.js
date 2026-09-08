const XLSX = require("@e965/xlsx");

const OPSSheetName = {
    HEADER: "Header",
    TSF: "TSF",
    ITEMDETAILS: "Item Details",
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const buildValidationError = (
    errorMessage,
    errorType = "VALIDATION_ERROR",
    errorDetails = [],
    errorStatusCode = 400
) => ({
    flag: true,
    ErrorType: errorType,
    ErrorStatusCode: errorStatusCode,
    ErrorMessage: errorMessage,
    ErrorDetails: errorDetails,
});

const noValidationError = {
    flag: false,
    ErrorType: null,
    ErrorStatusCode: null,
    ErrorMessage: null,
    ErrorDetails: [],
};

const decodeBase64ToBuffer = (sourceFileBase64) => {
    if (!sourceFileBase64 || typeof sourceFileBase64 !== "string") {
        return null;
    }

    const cleanBase64 = sourceFileBase64.includes(",")
        ? sourceFileBase64.split(",").pop()
        : sourceFileBase64;

    return Buffer.from(cleanBase64, "base64");
};

const validateWorkbookSheets = (workbook) => {
    const sheetNames = workbook?.SheetNames || [];

    const hasHeader = sheetNames.includes(OPSSheetName.HEADER);

    const hasTSF =
        sheetNames.includes(OPSSheetName.TSF) ||
        sheetNames.includes("Transaction Screening Form");

    const hasItems = sheetNames.includes(OPSSheetName.ITEMDETAILS);

    const missingSheets = [];

    if (!hasHeader) missingSheets.push(OPSSheetName.HEADER);
    if (!hasTSF) missingSheets.push("TSF or Transaction Screening Form");
    if (!hasItems) missingSheets.push(OPSSheetName.ITEMDETAILS);

    if (missingSheets.length > 0) {
        const message = `Mandatory sheets are missing: ${missingSheets.join(
            ", "
        )}. Please reupload file again.`;
        return {
            isValid: false,
            errors: [message],
            error: buildValidationError(
                message,
                "MANDATORY_SHEETS_MISSING",
                missingSheets,
                400
            ),
        };
    }

    return {
        isValid: true,
        errors: [],
        error: noValidationError,
    };
};

const validateBase64ExcelPayload = ({ sourceFileBase64 }) => {
    if (!sourceFileBase64) {
        const message = "sourceFileBase64 is required.";
        return {
            isValid: false,
            errors: [message],
            error: buildValidationError(message, "SOURCE_FILE_REQUIRED", [], 400),
        };
    }

    const fileBuffer = decodeBase64ToBuffer(sourceFileBase64);

    if (!fileBuffer || fileBuffer.length === 0) {
        const message = "File is empty.";
        return {
            isValid: false,
            errors: [message],
            error: buildValidationError(message, "EMPTY_FILE", [], 400),
        };
    }

    if (fileBuffer.length > MAX_FILE_SIZE) {
        const message = "File size exceeds 10MB limit.";
        return {
            isValid: false,
            errors: [message],
            error: buildValidationError(message, "FILE_SIZE_EXCEEDED", [
                `Max allowed size: ${MAX_FILE_SIZE} bytes`,
                `Actual size: ${fileBuffer.length} bytes`,
            ], 400),
        };
    }

    let workbook;

    try {
        workbook = XLSX.read(fileBuffer, {
            type: "buffer",
            cellDates: true,
            cellNF: true,
            cellText: true,
        });
    } catch (error) {
        const message = "Invalid or corrupted Excel file.";
        return {
            isValid: false,
            errors: [message],
            error: buildValidationError(message, "INVALID_EXCEL_FILE", [error.message], 400),
        };
    }

    const sheetValidation = validateWorkbookSheets(workbook);

    if (!sheetValidation.isValid) {
        return {
            isValid: false,
            errors: sheetValidation.errors,
            error: sheetValidation.error,
        };
    }

    return {
        isValid: true,
        errors: [],
        error: noValidationError,
        workbook,
        fileBuffer,
    };
};

const validateMandatoryFields = (structured) => {
    const missingFields = [];

    const h = structured?.header || {};
    const hInfo = h.headerInfo || {};
    const tAndS = h.termsAndShipping || {};
    const addrs = h.addresses || {};
    const tsf = structured?.tsf || {};

    if (!addrs.invoiceTo?.companyName) missingFields.push("Invoice To");
    if (!addrs.shipTo?.companyName) missingFields.push("Ship To");
    if (!addrs.endUser?.companyName) missingFields.push("End User");

    if (!hInfo.orderType) missingFields.push("Order Type");
    if (!hInfo.customerPoNo) missingFields.push("Customer PO no");
    if (!hInfo.orderDate) missingFields.push("Order Date");
    if (!hInfo.currencyCode) missingFields.push("Currency code");
    if (!hInfo.requestDate) missingFields.push("Request Date");
    if (!hInfo.repOrderNo) missingFields.push("Rep Order No");
    if (!hInfo.partialShipmentRaw) missingFields.push("Partial Shipment");
    if (!hInfo.sicCode) missingFields.push("SIC Code");
    if (!hInfo.salesmanName) missingFields.push("Salesman's name");

    if (!tAndS.incoTerm2020) missingFields.push("INCOTerms");
    if (!hInfo.freightMode) missingFields.push("Freight Mode");
    if (!tAndS.paymentTerm) missingFields.push("Payment Term");

    const hasEndUse =
        tsf.endUseInfo &&
        Object.values(tsf.endUseInfo).some(
            (val) =>
                val === true ||
                (typeof val === "string" && val.trim() !== "")
        );

    if (!hasEndUse) missingFields.push("End-Use Information");

    if (missingFields.length > 0) {
        const uniqueMissing = [...new Set(missingFields)];

        const message = `Mandatory fields are missing: ${uniqueMissing.join(
            ", "
        )}. Please reupload file again.`;
        return {
            isValid: false,
            errors: [message],
            error: buildValidationError(
                message,
                "MANDATORY_FIELDS_MISSING",
                uniqueMissing,
                400
            ),
        };
    }

    return {
        isValid: true,
        errors: [],
        error: noValidationError,
    };
};

module.exports = {
    validateBase64ExcelPayload,
    validateMandatoryFields,
};