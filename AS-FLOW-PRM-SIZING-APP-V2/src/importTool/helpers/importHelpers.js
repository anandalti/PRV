import { gv, isChecked } from './importValueUtils';

/**
 * Expected sheet names for the Emerson OPS import.
 */
export const OPSSheetName = {
    HEADER: "Header",
    TSF: "TSF",
    ITEMDETAILS: "Item Details"
};

/**
 * Validates the uploaded file for format and size.
 * @param {File} file 
 * @returns {Object} { isValid: boolean, error: string }
 */
export const validateImportFile = (file) => {
    // Client-side file validations removed — accept any file and let server validate.
    if (!file) return { isValid: false, error: IMPORT_MESSAGES.FILE_EMPTY };
    return { isValid: true, error: null };
};

/**
 * Reads an Excel file and returns a workbook object.
 * @param {File} file 
 * @returns {Promise<Object>}
 */
export const readExcelFile = (file) => {
    // Only extract base64 in frontend. Parsing is handled by backend.
    return new Promise((resolve, reject) => {
        const b64Reader = new FileReader();
        b64Reader.onload = (e) => {
            try {
                const base64String = e.target.result.split(',')[1];
                resolve({ base64: base64String });
            } catch (err) {
                console.error('[readExcelFile] Failed to read file as base64:', err);
                reject(new Error(IMPORT_MESSAGES.FILE_READ_ERROR));
            }
        };
        b64Reader.onerror = () => reject(new Error(IMPORT_MESSAGES.FILE_READ_ERROR));
        b64Reader.readAsDataURL(file);
    });
};

/**
 * Processes the workbook data and extracts structured order details.
 * @param {Object} workbook 
 * @param {string|null} base64 Original file data in base64 (dev only)
 * @returns {Object}
 */
export const processImportWorkbook = (workbook, base64 = null) => {
    // Client-side workbook processing/validation removed. Return empty success.
    return {
        data: null,
        validation: {
            status: 'success',
            metadata: {
                note: 'Client-side parsing is disabled; server will validate.'
            }
        }
    };
};

/**
 * Validate a structured excel object returned by backend or parser.
 * @param {Object} structured
 * @returns {Object} { data: structured|null, validation: { status, errors?, metadata? } }
 */
export const validateStructuredData = (structured) => {
    // Remove client-side validation — return structured data as-is with success.
    return {
        data: structured,
        validation: {
            status: 'success',
            metadata: { timestamp: new Date().toISOString() }
        }
    };
};

export { gv, isChecked };
