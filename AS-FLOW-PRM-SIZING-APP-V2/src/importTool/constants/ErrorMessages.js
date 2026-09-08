/**
 * messages.js
 * 
 * Centralized static strings and system messages for the Import Tool.
 */

export const IMPORT_MESSAGES = {
    // Validation Status
    VALIDATION_SUCCESS_TITLE: "Validation Successful",
    VALIDATION_SUCCESS_DESC: "All mandatory fields were found and data integrity check passed.",
    VALIDATION_FAILED_TITLE: "Validation Failed",
    VALIDATION_FAILED_DESC: "We found some issues in your order sheet. Please fix them and re-upload.",

    // File Errors
    INVALID_FILE_FORMAT: "Invalid file format. Please upload a valid .xlsx or .xlsb file.",
    FILE_EMPTY: "The file is empty. Please upload a valid order sheet.",
    FILE_TOO_LARGE: "File size exceeds 10MB limit.",
    FILE_PARSE_ERROR: "Failed to process Excel file. Please ensure it is a valid .xlsx or .xlsb file.",
    FILE_READ_ERROR: "Error reading file.",

    // Workbook Errors
    MISSING_MANDATORY_SHEETS: "Missing mandatory sheets: {sheets}. Please use the official template.",
    NO_DATA_AVAILABLE: "No data available.",
    NO_HEADER_DATA: "No Header data found in this file.",
    NO_TSF_DATA: "No TSF data found in this file.",
    NO_ITEMS_DATA: "No Item Details found in this file.",

    // UI Helpers
    SUBMIT_SUCCESS: "Order Successfully Submitted!",
    PROCESSING_WORKBOOK: "Validating order sheet...",
    EXTRACTING_DATA: "Extracting form data from your file."
};

export const FORM_TITLES = {
    ORDER_PROCESSING_SHEET: "Order Processing Sheet",
    TRANSACTION_SCREENING_FORM: "Transaction Screening Form (TSF)",
    ITEM_DETAILS: "Item Details"
};
