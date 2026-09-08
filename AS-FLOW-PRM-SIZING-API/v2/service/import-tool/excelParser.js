import XLSX from '@e965/xlsx';

const isChecked = (val) => {
    if (val === undefined || val === null || val === '') return false;
    if (typeof val === 'boolean') return val;
    const s = String(val).trim().toLowerCase();
    const validMarks = ['p', 'ü', 'þ', 'x', 'v', '1', 'yes', 'true'];
    return validMarks.includes(s);
};

//Read a single cell value by address (e.g. 'C8')
const cell = (sheet, addr) => {
    const c = sheet[addr];
    if (!c || c.v === undefined || c.v === null) return '';
    if (c.w && String(c.w).trim() !== '') return String(c.w).trim();
    return String(c.v).trim();
};

//Convert Excel serial date number to DD-MMM-YY string
const formatExcelDate = (val) => {
    if (!val || isNaN(val)) return val;
    try {
        const date = XLSX.utils.format_cell({ t: 'n', v: val, z: 'dd-mmm-yy' });
        return date || val;
    } catch (e) {
        return val;
    }
};

//Find a cell value that is directly below a specific label text
const findValueBelowLabel = (sheet, labelText) => {
    const keys = Object.keys(sheet);
    const searchStr = labelText.toLowerCase().replace(':', '').trim();

    for (const key of keys) {
        const cellData = sheet[key];
        if (!cellData || cellData.v === undefined) continue;

        const cellText = String(cellData.v).toLowerCase().trim();
        if (cellText.includes(searchStr)) {
            const col = key.match(/[A-Z]+/)[0];
            const row = parseInt(key.match(/\d+/)[0]);

            // Check Row + 1 and Row + 2
            // Check Current Col, +1 Col, +2 Col, +3 Col (for merged cells)
            const colNum = col.split('').reduce((acc, char) => acc * 26 + char.charCodeAt(0) - 64, 0);

            for (let rOff = 1; rOff <= 2; rOff++) {
                for (let cOff = 0; cOff <= 3; cOff++) {
                    const targetCol = String.fromCharCode(64 + colNum + cOff);
                    const val = cell(sheet, `${targetCol}${row + rOff}`);
                    if (val && val.length > 0) {
                        const finalVal = (searchStr === 'date') ? formatExcelDate(val) : val;

                        return finalVal;
                    }
                }
            }
        }
    }
    return '';
};

const parseHeaderSheet = (sheet) => {
    if (!sheet) return null;
    const v = (addr) => cell(sheet, addr);
    const vOr = (a, b) => v(a) || v(b);
    const chk = (addr) => isChecked(sheet[addr]?.v);

    const findHeaderField = (labelStr, side) => {
        const searchStr = String(labelStr).toLowerCase().replace(/[^a-z0-9]/g, '');
        for (let r = 5; r <= 60; r++) {
            const cols = side === 'left' ? ['A', 'B', 'C', 'D'] : ['E', 'F', 'G', 'H'];
            for (const c of cols) {
                const lbl = cell(sheet, `${c}${r}`);
                if (String(lbl).toLowerCase().replace(/[^a-z0-9]/g, '') === searchStr) {
                    for (let j = 1; j <= 6; j++) {
                        const valColCode = c.charCodeAt(0) + j;
                        if (valColCode > 90) break;
                        const valCol = String.fromCharCode(valColCode);
                        if (side === 'left' && valCol > 'D') break;
                        const val = cell(sheet, `${valCol}${r}`);
                        if (val !== '' && !String(val).toLowerCase().includes('excel for the web')) {
                            if (searchStr.includes('date')) {
                                return formatExcelDate(val);
                            }
                            return val;
                        }
                    }
                }
            }
        }
        return '';
    };



    /** Helper to find address block starting after a label */
    const findAddr = (keywords, side) => {
        const keys = Object.keys(sheet);
        let startRow = -1;

        for (const key of keys) {
            if (!sheet[key]) continue;
            const val = String(sheet[key].v).toLowerCase();
            if (keywords.some(kw => val.includes(kw.toLowerCase()))) {
                startRow = parseInt(key.match(/\d+/)[0]);
                const col = key.match(/[A-Z]+/)[0];
                if (side === 'right' && col < 'E') continue;
                if (side === 'left' && col >= 'E') continue;
                break;
            }
        }

        if (startRow === -1) return {};

        const findField = (fieldLabel) => {
            const searchStr = String(fieldLabel).toLowerCase().replace(/[^a-z0-9]/g, '');
            for (let rOff = 1; rOff <= 20; rOff++) {
                const checkRow = startRow + rOff;
                const colsToSearch = side === 'left' ? ['A', 'B', 'C', 'D'] : ['E', 'F', 'G', 'H', 'I'];

                for (const c of colsToSearch) {
                    const valLbl = cell(sheet, `${c}${checkRow}`);
                    const cleanLbl = String(valLbl).toLowerCase().replace(/[^a-z0-9]/g, '');

                    if (cleanLbl === searchStr) {
                        for (let j = 1; j <= 6; j++) {
                            const valColCode = c.charCodeAt(0) + j;
                            if (valColCode > 90) break;
                            const valCol = String.fromCharCode(valColCode);
                            if (side === 'left' && valCol >= 'E') break; // Prevent bleeding
                            const finalVal = cell(sheet, `${valCol}${checkRow}`);

                            if (finalVal && !finalVal.toLowerCase().includes('excel for the web') && !finalVal.toLowerCase().includes('not support')) {
                                return finalVal;
                            }
                        }
                    }
                }
            }
            return '';
        };

        return {
            companyName: findField('company name'),
            addressLine1: findField('address line 1'),
            addressLine2: findField('address line 2'),
            city: findField('city'),
            state: findField('state/province'),
            postalCode: findField('postal code'),
            country: findField('country')
        };
    };

    return {
        headerInfo: {
            kobType: findHeaderField('KOB Type', 'left'),
            orderDate: findHeaderField('Order date', 'right'),
            orderType: findHeaderField('Order Type', 'left'),
            repOrderNo: findHeaderField('Rep order no', 'right'),
            subBuCode: findHeaderField('Sub-BU code', 'left'),
            revision: findHeaderField('Revision', 'right'),
            currencyCode: findHeaderField('Currency code', 'left'),
            requestDate: findHeaderField('Request date', 'right'),
            partialShipment: String(findHeaderField('Partial shipment', 'left')).toLowerCase().includes('yes'),
            partialShipmentRaw: findHeaderField('Partial shipment', 'left'),
            customerPoNo: findHeaderField('Customer PO no', 'right'),
            freightMode: findHeaderField('Freight mode', 'left'),
            ourQuotationRef: findHeaderField('Our quotation ref', 'right'),
            packingType: findHeaderField('Packing type', 'left'),
            salesmanName: findHeaderField('Salesmans name', 'right'),
            keyAccount: findHeaderField('Key account', 'left'),
            projectName: findHeaderField('Project name', 'right'),
            sicCode: findHeaderField('SIC code', 'left'),
            preparedBy: findHeaderField('Prepared by', 'right'),
            verticalIndustry: findHeaderField('Vertical Industry', 'left'),
            supplyScope: findHeaderField('Supply Scope', 'right')
        },
        termsAndShipping: {
            paymentTerm: findHeaderField('Payment term', 'left'),
            dropshipment: String(findHeaderField('Dropshipment', 'right')).toLowerCase().includes('yes'),
            incoTerm2020: findHeaderField('IncoTerm 2020', 'left'),
            namedPlacePort: findHeaderField('Named place/port', 'left'),
            penaltyApplicable: String(findHeaderField('Penalty DADF Reqd', 'left')).toLowerCase().includes('yes') || String(findHeaderField('Penalty DADE Reqd', 'left')).toLowerCase().includes('yes'),
            penaltyStartDate: findHeaderField('Penalty start date', 'left'),
            penaltyRateAndCap: findHeaderField('Penalty rate & cap', 'right')
        },
        addresses: {
            invoiceTo: findAddr(['Invoice to name'], 'left'),
            shipTo: findAddr(['Ship to name'], 'right'),
            endUser: findAddr(['End User name'], 'left'),
            shippingMark: findHeaderField('Shipping mark', 'right')
        },
        documentsAttached: {
            dealApprovalForm: chk('A43'),
            signedCustomerPo: chk('A44'),
            finalDataSheet: chk('A46'),
            leadTimeQuote: chk('D45'),
            sourcingDeviationForms: chk('A45'),
            customerSuppliedProduct: chk('D43'),
            tcDeviationApproval: chk('D44'),
            tieringMatrix: chk('D46'),
            otherSupportingDocs: chk('G44') ? 'YES' : '',
            otherSupportingDocsSpecify: findValueBelowLabel(sheet, 'Please specify')
        },
        financials: {
            productServiceNetPrice: v('D48'),
            freightInsurance: v('D49'),
            others: v('D50'),
            totalOrderValueBeforeTax: v('D52'),
            totalOrderValueAfterTax: vOr('F52', 'G52'),
            commDeducted: findHeaderField('Comm. deducted?', 'right'),
            vendorDealNumber: vOr('F48', 'G48'),
            payableCommission: findHeaderField('Payable commission', 'right')
        },
        commissionDistribution: {
            purchasing: {
                repCode: v('C54'),
                sharePercentage: v('C55')
            },
            sales: {
                repCode: v('D54'),
                sharePercentage: v('D55')
            },
            engineering: {
                repCode: v('E54'),
                sharePercentage: v('E55')
            },
            territorial: {
                repCode: v('F54'),
                sharePercentage: v('F55')
            }
        },
        footerInfo: {
            forwarderDetails: vOr('C56', 'D56')
        }
    };
};

const parseTSFSheet = (sheet) => {
    if (!sheet) return null;
    const vOr = (a, b) => cell(sheet, a) || cell(sheet, b);
    const fv = (lbl) => findValueBelowLabel(sheet, lbl);

    /** Helper to find address block starting after a label */
    const findAddr = (keywords, side) => {
        const keys = Object.keys(sheet);
        let startRow = -1;

        // Find the section row by checking if cell contains any of the keywords
        for (const key of keys) {
            if (!sheet[key]) continue;
            const val = String(sheet[key].v).toLowerCase();
            if (keywords.some(kw => val.includes(kw.toLowerCase()))) {
                startRow = parseInt(key.match(/\d+/)[0]);
                // If we are looking on the right side, make sure we found the keyword in columns E-Z
                // This prevents "End User" from accidentally matching "User" if there was a typo
                const col = key.match(/[A-Z]+/)[0];
                if (side === 'right' && col < 'E') continue;
                if (side === 'left' && col >= 'E') continue;
                break;
            }
        }

        if (startRow === -1) return {};

        const findField = (fieldLabel) => {
            const searchStr = String(fieldLabel).toLowerCase().replace(/[^a-z0-9]/g, '');
            // Look up to 20 rows below the section header to bypass any warning boxes completely
            for (let rOff = 1; rOff <= 20; rOff++) {
                const checkRow = startRow + rOff;
                const colsToSearch = side === 'left' ? ['A', 'B', 'C', 'D'] : ['E', 'F', 'G', 'H', 'I'];

                for (const c of colsToSearch) {
                    const valLbl = cell(sheet, `${c}${checkRow}`);
                    const cleanLbl = String(valLbl).toLowerCase().replace(/[^a-z0-9]/g, '');

                    if (cleanLbl === searchStr) {
                        // Found label! Value is in the columns to the right
                        for (let j = 1; j <= 6; j++) {
                            const valColCode = c.charCodeAt(0) + j;
                            if (valColCode > 90) break; // Don't go past 'Z'
                            const valCol = String.fromCharCode(valColCode);
                            const finalVal = cell(sheet, `${valCol}${checkRow}`);

                            // Ignore empty cells and warning messages
                            if (finalVal && !finalVal.toLowerCase().includes('excel for the web') && !finalVal.toLowerCase().includes('not support')) {
                                return finalVal;
                            }
                        }
                    }
                }
            }
            return '';
        };

        return {
            companyName: findField('company name'),
            addressLine1: findField('address line 1'),
            addressLine2: findField('address line 2'),
            city: findField('city'),
            state: findField('state/province'),
            postalCode: findField('postal code'),
            country: findField('country')
        };
    };

    const findSection = (sectionKeywords, fields) => {
        const keys = Object.keys(sheet);
        let startRow = -1;

        for (const key of keys) {
            if (!sheet[key]) continue;
            const val = String(sheet[key].v).toLowerCase();
            if (sectionKeywords.some(kw => val.includes(kw.toLowerCase()))) {
                startRow = parseInt(key.match(/\d+/)[0]);
                break;
            }
        }

        if (startRow === -1) return {};

        const result = {};

        for (const field of fields) {
            const searchStr = String(field.label).toLowerCase().replace(/[^a-z0-9]/g, '');
            let foundVal = '';

            for (let rOff = 1; rOff <= 15; rOff++) {
                const checkRow = startRow + rOff;
                const colsToSearch = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

                for (const c of colsToSearch) {
                    const valLbl = cell(sheet, `${c}${checkRow}`);
                    const cleanLbl = String(valLbl).toLowerCase().replace(/[^a-z0-9]/g, '');

                    if (cleanLbl === searchStr) {
                        for (let j = 1; j <= 6; j++) {
                            const valColCode = c.charCodeAt(0) + j;
                            if (valColCode > 90) break;
                            const valCol = String.fromCharCode(valColCode);
                            const finalVal = cell(sheet, `${valCol}${checkRow}`);

                            if (finalVal && !finalVal.toLowerCase().includes('excel for the web') && !finalVal.toLowerCase().includes('not support')) {
                                // Skip if the value is just the "Date:" label
                                if (finalVal.trim().toLowerCase() === 'date:' || finalVal.trim().toLowerCase() === 'date') {
                                    continue;
                                }
                                foundVal = finalVal;
                                break;
                            }
                        }
                    }
                    if (foundVal) break;
                }
                if (foundVal) break;
            }
            result[field.key] = foundVal;
        }

        return result;
    };

    /**
     * Find nearby checkbox-like value for a given label text and return boolean.
     */
    const findCheckboxValue = (label) => {
        const searchStr = String(label).toLowerCase().replace(/[^a-z0-9]/g, '');
        const keys = Object.keys(sheet);


        for (const key of keys) {
            if (!sheet[key] || sheet[key].v === undefined) continue;
            const cellText = String(sheet[key].v).toLowerCase().replace(/[^a-z0-9]/g, '');
            if (cellText === searchStr || cellText.includes(searchStr) || searchStr.includes(cellText)) {
                const col = key.match(/[A-Z]+/)[0];
                const row = parseInt(key.match(/\d+/)[0]);

                // 1. Check if the checkbox is inside the same cell as the label (e.g., Wingdings or Unicode)
                const rawCellStr = String(sheet[key].v).trim().toLowerCase();
                const firstChar = rawCellStr.charAt(0);
                if (['þ', 'ü', 'p', '☑', '✔', 'x', 'v'].includes(firstChar) && rawCellStr.length > 1 && !rawCellStr.startsWith('purchase')) {
                    return true;
                }

                // 2. Check strictly ONE cell to the left
                const leftColCode = col.charCodeAt(0) - 1;
                if (leftColCode >= 65) {
                    const leftAddr = `${String.fromCharCode(leftColCode)}${row}`;
                    if (sheet[leftAddr] && sheet[leftAddr].v !== undefined) {
                        if (isChecked(sheet[leftAddr].v)) {
                            return true;
                        }
                    }
                }

                // 3. Check strictly ONE cell to the right
                const rightColCode = col.charCodeAt(0) + 1;
                if (rightColCode <= 90) {
                    const rightAddr = `${String.fromCharCode(rightColCode)}${row}`;
                    if (sheet[rightAddr] && sheet[rightAddr].v !== undefined) {
                        if (isChecked(sheet[rightAddr].v)) {
                            return true;
                        }
                    }
                }

                // 4. Check strictly ONE cell below
                const bottomAddr = `${col}${row + 1}`;
                if (sheet[bottomAddr] && sheet[bottomAddr].v !== undefined) {
                    if (isChecked(sheet[bottomAddr].v)) {
                        return true;
                    }
                }
            }
        }

        return false;
    };
    const chk = (addr) => {
        const value = sheet[addr]?.v;

        if (typeof value === 'boolean') {
            return value;
        }

        return isChecked(value);
    };

    const getEndUseInfo = (sheet) => ({
        chemicalWeapons: chk('B31'),
        military: chk('C31'),
        rocketsMissiles: chk('D31'),
        nuclear: chk('B33'),
        space: chk('C33'),
        stock: chk('D33'),
        others: chk('E33'),
        othersSpecify: cell(sheet, 'G32')
    });

    return {
        header: {
            date: fv('Date'),
            orderNumber: fv('RFQ Number'),
            projectName: fv('Project Name')
        },
        purchaser: {
            ...findAddr(['Purchaser'], 'left'),
            includedOnPO: findCheckboxValue('Check if included on purchase order or complete below')
        },
        consignee: {
            ...findAddr(['Consignee'], 'right'),
            sameAsPurchaser: findCheckboxValue('Check if same as Block A'),
            includedOnPO: findCheckboxValue('Check if included on purchase order or complete below')
        },
        endUser: {
            ...findAddr(['End User', 'Ultimate Destination'], 'left'),
            sameAsPurchaser: findCheckboxValue('Check if same as A. Purchaser'),
            sameAsConsignee: findCheckboxValue('Check if same as B. Consignee/Ship To'),
            includedOnPO: findCheckboxValue('Check if included on purchase order or complete below')
        },
        additionalParties: {
            ...findAddr(['Additional Parties'], 'right'),
            includedOnPO: findCheckboxValue('Check if included on purchase order or complete below'),
            freightForwarder: findCheckboxValue('Freight Forwarder'),
            other: findCheckboxValue('Other'),
            Bank: findCheckboxValue('Bank'),
            Carrier: findCheckboxValue('Carrier')
        },
        endUseInfo: {
            detailedExplanation: fv('Explain in detail'),
            ...getEndUseInfo(sheet)
        },
        completedBy: findSection(['Form Completed By'], [
            { key: 'name', label: 'Name' },
            { key: 'companyName', label: 'Company Name' },
            { key: 'phone', label: 'Phone' },
            { key: 'email', label: 'Email' },
            { key: 'city', label: 'City' },
            { key: 'stateProvince', label: 'State/Province' },
            { key: 'country', label: 'Country' },
            { key: 'signature', label: 'Signature' }
        ]),
        internalUseOnly: findSection(['For Internal Use Only'], [
            { key: 'reviewedBy', label: 'Reviewed by' },
            { key: 'reviewedDate', label: 'Date' }
        ])
    };
};

const parseItemDetailsSheet = (sheet) => {
    if (!sheet) return { data: [], columns: [] };
    const raw = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
    let headerRowIdx = 0;
    let maxNonEmpty = 0;
    for (let i = 0; i < Math.min(raw.length, 20); i++) {
        const count = (raw[i] || []).filter(v => v !== '' && typeof v === 'string' && v.length > 1).length;
        if (count > maxNonEmpty) { maxNonEmpty = count; headerRowIdx = i; }
    }
    if (maxNonEmpty === 0) return { data: [], columns: [] };
    const headers = (raw[headerRowIdx] || []).map((h, i) => h !== '' && h !== null ? String(h).trim() : `Col_${i + 1}`);
    const data = raw.slice(headerRowIdx + 1)
        .filter(row => (row || []).some(v => v !== '' && v !== null && v !== undefined))
        .map(row => {
            const obj = {};
            headers.forEach((h, i) => { obj[h] = row[i] !== undefined && row[i] !== null ? String(row[i]) : ''; });
            return obj;
        })
        .filter(row => {
            // Filter out Excel helper mapping rows (e.g. Item = Column1)
            const itemVal = String(row["Item"] || '').trim().toLowerCase();
            return itemVal !== 'column1';
        });
    const columns = headers.filter(h => !h.startsWith('Col_')).map(h => ({ name: h, label: h }));
    return { data, columns };
};

export const parseOPSWorkbook = (workbook) => {
    const headerSheet = workbook.Sheets['Header'];
    const tsfSheet = workbook.Sheets['TSF'] || workbook.Sheets['Transaction Screening Form'];
    const itemSheet = workbook.Sheets['Item Details'];
    const headerData = parseHeaderSheet(headerSheet);
    const tsfData = parseTSFSheet(tsfSheet);
    const itemDetails = parseItemDetailsSheet(itemSheet);
    return {
        header: headerData,
        tsf: tsfData,
        itemDetails: itemDetails
    };
};
