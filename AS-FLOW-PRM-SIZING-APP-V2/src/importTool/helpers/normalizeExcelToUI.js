/**
 * Normalize excel-parsed object (server or client) to the UI shape.
 * - Ensures `header`, `tsf`, `itemDetails.data` exist
 * - Normalizes item row keys (trim, replace newlines with spaces)
 */
const normalizeRowKeys = (row) => {
    if (!row || typeof row !== 'object') return row;
    const out = {};
    Object.keys(row).forEach(k => {
        const nk = String(k).replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
        out[nk] = row[k];
    });
    return out;
};

export const normalizeExcelToUI = (excelData) => {
    if (!excelData || typeof excelData !== 'object') return null;

    const header = excelData.header || excelData.headerInfo || null;
    const tsf = excelData.tsf || null;

    let itemDetails = excelData.itemDetails || excelData.items || null;
    if (!itemDetails) {
        itemDetails = { data: [] };
    } else if (Array.isArray(itemDetails)) {
        itemDetails = { data: itemDetails };
    } else if (!Array.isArray(itemDetails.data)) {
        itemDetails.data = [];
    }

    // Normalize keys for each item row
    itemDetails.data = itemDetails.data.map(r => normalizeRowKeys(r || {}));

    // If columns are not provided, infer from first row after normalization
    if (!itemDetails.columns || !Array.isArray(itemDetails.columns) || itemDetails.columns.length === 0) {
        const first = itemDetails.data[0] || {};
        itemDetails.columns = Object.keys(first).map(k => ({ name: k, label: k, options: {} }));
    } else {
        // Also normalize column names if provided
        itemDetails.columns = (itemDetails.columns || []).map(c => ({ ...c, name: String(c.name).replace(/\n/g, ' ').replace(/\s+/g, ' ').trim(), label: c.label || String(c.name) }));
    }

    // Also normalize header nested keys if needed (basic trim)
    const normalizeObjectKeys = (obj) => {
        if (!obj || typeof obj !== 'object') return obj;
        const out = {};
        Object.keys(obj).forEach(k => out[k.trim()] = obj[k]);
        return out;
    };

    const normalizedHeader = {};
    if (header) {
        normalizedHeader.headerInfo = normalizeObjectKeys(header.headerInfo || header);
        normalizedHeader.termsAndShipping = normalizeObjectKeys((header.termsAndShipping || {}));
        normalizedHeader.addresses = normalizeObjectKeys((header.addresses || {}));
        normalizedHeader.documentsAttached = normalizeObjectKeys((header.documentsAttached || {}));
        normalizedHeader.financials = normalizeObjectKeys((header.financials || {}));
        normalizedHeader.commissionDistribution = normalizeObjectKeys((header.commissionDistribution || {}));
        normalizedHeader.footerInfo = normalizeObjectKeys((header.footerInfo || {}));
    }

    return {
        header: normalizedHeader,
        tsf: tsf,
        itemDetails: itemDetails
    };
};

export default normalizeExcelToUI;
