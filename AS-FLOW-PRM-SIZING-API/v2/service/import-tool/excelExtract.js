const e = require('express');
const { pool } = require('../../db/pgsqldb');
const { randomUUID } = require('crypto');

async function ingestExcelPayload(excelData, sourceFileBase64, userID, errorObj) {
    try {
        await pool.query('BEGIN');

        const fileUploadID = randomUUID();
        if (errorObj && errorObj.flag) {
            await insertFileUpload(fileUploadID, sourceFileBase64, userID);
            await insertErrorDetails(fileUploadID, errorObj);
            await pool.query('COMMIT');
            return;
        }
        await insertFileUpload(fileUploadID, sourceFileBase64, userID);

        const rows = Array.isArray(excelData) ? excelData : [excelData];

        const headerTypeID = await getPropertyTypeID("Header");
        const tsfTypeID = await getPropertyTypeID("TSF");

        for (const data of rows) {
            // Process header sections
            const headerSections = ['headerInfo', 'footerInfo'];
            for (const section of headerSections) {
                await processSection(data.header?.[section], headerTypeID, fileUploadID);
            }

            // Process tsf sections
            const tsfSections = ['header', 'completedBy', 'internalUseOnly'];
            for (const section of tsfSections) {
                await processSection(data.tsf?.[section], tsfTypeID, fileUploadID);
            }
        }

        const headerID = await insertHeader(fileUploadID);
        const tsfID = await insertTsf(fileUploadID);

        // Insert address records for header and tsf
        await insertHeaderAddresses(excelData.header?.addresses, headerID);
        await insertTsfAddresses(excelData.tsf, tsfID);

        // Insert related header sections
        await insertTermsAndShipping(excelData.header?.termsAndShipping, headerID);
        await insertDocumentsAttached(excelData.header?.documentsAttached, headerID);
        await insertFinancials(excelData.header?.financials, headerID);
        await insertCommissionDistribution(excelData.header?.commissionDistribution, headerID);

        //Insert related tsf sections
        await insertEndUseInfo(excelData.tsf?.endUseInfo, tsfID);

        await insertItemDetails(excelData.itemDetails, fileUploadID);

        await pool.query("COMMIT");
        return fileUploadID;
    }
    catch (error) {
        await pool.query('ROLLBACK');
        console.error("Error validating Excel data:", error);
        throw error;
    }
}

// Helper functions

async function processSection(section, propertyTypeID, fileUploadID) {
    if (!section) return;
    for (const [key, value] of Object.entries(section)) {
        const propertyID = await insertProperty(key, propertyTypeID);
        await insertFormDetails(propertyID, value, fileUploadID);
    }
}

async function insertHeader(fileUploadID) {
    const result = await pool.query(
        'INSERT INTO it."Header" ("FileUploadID") VALUES ($1) RETURNING "HeaderID"',
        [fileUploadID]
    );
    return result.rows[0].HeaderID;
}

async function insertTsf(fileUploadID) {
    const result = await pool.query(
        'INSERT INTO it."TSF" ("FileUploadID") VALUES ($1) RETURNING "TSFID"',
        [fileUploadID]
    );
    return result.rows[0].TSFID;
}

async function insertHeaderAddresses(addresses, headerID) {
    if (!addresses || !headerID) return;

    const addressMapping = {
        invoiceTo: 'InvoiceTo',
        shipTo: 'ShipTo',
        endUser: 'EndUser'
    };

    const shippingMark = addresses.shippingMark ?? null;

    for (const [key, addressType] of Object.entries(addressMapping)) {
        const address = addresses[key];
        if (!address || isEmptyAddress(address)) continue;

        const addressID = await insertAddress(address, addressType);
        await insertHeaderAddress(headerID, addressID, shippingMark);
    }
}

async function insertTsfAddresses(tsf, tsfID) {
    if (!tsf || !tsfID) return;

    const addressMapping = {
        purchaser: 'InvoiceTo',
        consignee: 'ShipTo',
        endUser: 'EndUser',
        additionalParties: 'AdditionalParties'
    };

    for (const [key, addressType] of Object.entries(addressMapping)) {
        const address = tsf[key];
        if (!address || isEmptyAddress(address)) continue;

        const addressID = await insertAddress(address, addressType);
        await insertTsfAddress(tsfID, addressID, address?.isIncludedPO, address?.isSameAsPurchaser, address?.isSameAsConsignee, address?.bank, address?.carrier, address?.freightForwarder, address?.other);
    }
}

async function insertAddress(address, addressTypeName) {
    if (!address || !addressTypeName) return null;

    const addressTypeID = await getAddressTypeID(addressTypeName);
    const {
        companyName,
        addressLine1,
        addressLine2,
        city,
        state,
        postalCode,
        country
    } = address;

    const result = await pool.query(
        `INSERT INTO it."Address"
            ("AddressTypeID", "CompanyName", "AddressLine1", "AddressLine2", "City", "State", "PostalCode", "Country")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING "AddressID"`,
        [addressTypeID, companyName ?? null, addressLine1 ?? null, addressLine2 ?? null, city ?? null, state ?? null, postalCode ?? null, country ?? null]
    );

    return result.rows[0].AddressID;
}

function isEmptyAddress(address) {
    return [
        address.companyName,
        address.addressLine1,
        address.addressLine2,
        address.city,
        address.state,
        address.postalCode,
        address.country
    ].every(value => value === undefined || value === null || String(value).trim() === '');
}

async function insertHeaderAddress(headerID, addressID, shippingMark) {
    if (!headerID || !addressID) return;

    const sql = `INSERT INTO it."HeaderAddress" ("HeaderAddressID", "ShippingMark", "HeaderID") VALUES ($1, $2, $3)`;
    const params = [addressID, shippingMark, headerID];

    await pool.query(sql, params);
}

async function insertTsfAddress(tsfID, addressID, isIncludedPO, isSameAsPurchaser, isSameAsConsignee, bank, carrier, freightForwarder, other) {
    if (!tsfID || !addressID) return;

    const sql = `INSERT INTO it."TSFAddress" ("TSFID", "IsIncludedOnPO", "IsSameAsPurchaser", "IsSameAsConsignee", "Bank", "Carrier", "FrieghtForwarder", "Other", "TSFAddressID") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`;
    await pool.query(sql, [tsfID, isIncludedPO, isSameAsPurchaser, isSameAsConsignee, bank, carrier, freightForwarder, other, addressID]);
}

async function getAddressTypeID(addressTypeName) {
    const result = await pool.query(
        'SELECT "AddressTypeID" FROM it."AddressType" WHERE "AddressType" = $1',
        [addressTypeName]
    );
    if (result.rows.length === 0) {
        const error = new Error('AddressType not found: ' + addressTypeName);
        error.statusCode = 400;
        throw error;
    }
    return result.rows[0].AddressTypeID;
}

async function getPropertyTypeID(typeName) {
    const result = await pool.query(
        'SELECT "PropertyTypeId" FROM it."PropertyType" WHERE "PropertyName" = $1',
        [typeName]
    );
    if (result.rows.length === 0) {
        const error = new Error('PropertyType not found: ' + typeName);
        error.statusCode = 400;
        throw error;
    }
    return result.rows[0].PropertyTypeId;
}

async function insertProperty(name, propertyTypeID) {
    // Check if exists
    const existing = await pool.query(
        'SELECT "PropertyId" FROM it."Property" WHERE "Name" = $1 AND "PropertyTypeId" = $2',
        [name, propertyTypeID]
    );
    if (existing.rows.length > 0) {
        return existing.rows[0].PropertyId;
    }
    // Insert
    const result = await pool.query(
        'INSERT INTO it."Property" ("Key", "Name", "PropertyTypeId") VALUES ($1, $2, $3) RETURNING "PropertyId"',
        [name, name, propertyTypeID]
    );
    return result.rows[0].PropertyId;
}

async function insertFormDetails(propertyID, value, fileUploadID) {
    await pool.query(
        'INSERT INTO it."FormDetails" ("PropertyID", "Value", "FileUploadID") VALUES ($1, $2, $3)',
        [propertyID, value, fileUploadID]
    );
}

async function insertFileUpload(fileUploadID, fileName, userID) {
    await pool.query(
        'INSERT INTO it."FileUpload" ("FileUploadID", "Document", "UserID", "UploadedAt") VALUES ($1, $2, $3, NOW())',
        [fileUploadID, fileName, userID]
    );
}

async function insertErrorDetails(fileUploadID, errorObj) {
    const sql = `INSERT INTO it."ErrorLog"("FileUploadID", "ErrorType", "ErrorStatusCode", "ErrorMessage") VALUES ($1, $2, $3, $4)`;
    await pool.query(sql, [fileUploadID, errorObj.ErrorType, errorObj.ErrorStatusCode, errorObj.ErrorMessage]);
}

async function insertTermsAndShipping(termsAndShipping, headerID) {
    if (!termsAndShipping) return;
    const {
        paymentTerm,
        dropshipment,
        incoTerm2020,
        namedPlacePort,
        penaltyApplicable,
        penaltyStartDate,
        penaltyRateAndCap
    } = termsAndShipping;

    const sql = `
        INSERT INTO it."TermsAndShipping"
          ("PaymentTerm","DropShipment","IncoTerms","NamedPlacePort","PenaltyApplicable","PenaltyStartDate","PenaltyRateAndCap","HeaderID")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `;
    const vals = [paymentTerm, dropshipment, incoTerm2020, namedPlacePort, penaltyApplicable, penaltyStartDate, penaltyRateAndCap, headerID];
    await pool.query(sql, vals);
}

async function insertDocumentsAttached(documentsAttached, headerID) {
    if (!documentsAttached) return;
    const {
        dealApprovalForm,
        signedCustomerPo,
        finalDataSheet,
        leadTimeQuote,
        sourcingDeviationForms,
        customerSuppliedProduct,
        tcDeviationApproval,
        tieringMatrix,
        otherSupportingDocs
    } = documentsAttached;

    const sql = `
            INSERT INTO it."DocumentsAttached"
              ("DealApprovalForm","SignedCustomerPo","FinalDataSheet","LeadTimeQuote","SourcingDeviationForm","CustomerSuppliedProduct","TcDeviationApproval","TieringMatrix","OtherSupportingDocs","HeaderID")
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `;
    const vals = [dealApprovalForm, signedCustomerPo, finalDataSheet, leadTimeQuote, sourcingDeviationForms, customerSuppliedProduct, tcDeviationApproval, tieringMatrix, otherSupportingDocs, headerID];
    await pool.query(sql, vals);
}

async function insertFinancials(financials, headerID) {
    if (!financials) return;
    const {
        productServiceNetPrice,
        freightInsurance,
        others,
        totalOrderValueBeforeTax,
        totalOrderValueAfterTax,
        commDeducted,
        vendorDealNumber,
        payableCommission
    } = financials;

    const sql = `
        INSERT INTO it."Financials"
          ("ProductServiceNetPrice", "FreightInsurance", "Others", "TotalOrderValueBeforeTax", "TotalOrderValueAfterTax", "CommDeducted", "VendorDealNo", "PayableCommission", "HeaderID")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `;
    const vals = [productServiceNetPrice, freightInsurance, others, totalOrderValueBeforeTax, totalOrderValueAfterTax, commDeducted, vendorDealNumber, payableCommission, headerID];
    await pool.query(sql, vals);
}

async function insertCommissionDistribution(commissionDistribution, headerID) {
    if (!commissionDistribution) return;

    const categories = ['purchasing', 'sales', 'engineering', 'territorial'];
    const params = [];
    const values = [];
    let paramIndex = 1;

    for (const category of categories) {
        const data = commissionDistribution[category];
        if (!data) continue;

        const categoryID = await getCommCategoryID(category);
        params.push(categoryID, headerID, data.repCode ?? null, data.sharePercentage ?? null);
        values.push(`($${paramIndex}, $${paramIndex + 1}, $${paramIndex + 2}, $${paramIndex + 3})`);
        paramIndex += 4;
    }

    if (values.length === 0) return;

    const sql = `INSERT INTO it."CommissionDistribution" ("CategoryID", "HeaderID", "RepCode", "SharePercentage") VALUES ${values.join(',')}`;
    await pool.query(sql, params);
}

async function getCommCategoryID(categoryName) {
    const result = await pool.query(
        'SELECT "CategoryID" FROM it."CommDistCategory" WHERE "Category" = $1',
        [categoryName]
    );
    if (result.rows.length === 0) {
        const error = new Error('Category not found: ' + categoryName);
        error.statusCode = 400;
        throw error;
    }
    return result.rows[0].CategoryID;
}

async function insertEndUseInfo(endUseInfo, tsfID) {
    if (!endUseInfo) return;
    const {
        detailedExplanation,
        chemicalWeapons,
        military,
        rocketsMissiles,
        nuclear,
        space,
        stock,
        othersSpecify
    } = endUseInfo;

    const sql = `
        INSERT INTO it."EndUse"
          ("EndUseDesc", "ChemicalBiological", "Military", "RocketsMissiles", "Nuclear",  "Space", "Stock", "Others", "TSFID")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `;
    const vals = [detailedExplanation, chemicalWeapons, military, rocketsMissiles, nuclear, space, stock, othersSpecify, tsfID];
    await pool.query(sql, vals);
}

async function insertItemDetails(itemDetails, fileUploadID) {
    if (!itemDetails || !Array.isArray(itemDetails.data) || itemDetails.data.length === 0) return;
    const rows = itemDetails.data;
    const params = [];
    const values = rows.map((item, i) => {
        params.push(
            item['Item'] ?? null,
            item['Tag #'] ?? null,
            item['Qty'] ?? null,
            item['Product Number'] ?? null,
            item['Description'] ?? null,
            item['Mfg Location'] ?? null,
            item['Brands'] ?? null,
            item['List Price\nNet Price (Each)'] ?? null,
            item['Unit Price (Local currency w/o VAT)'] ?? null,
            item['Total Price\n(Local Currency w/o VAT)'] ?? null,
            item['Local Multiply Factor'] ?? null,
            item['Boxing& Handling'] ?? null,
            item['Base Discount'] ?? null,
            item['Ext Disc %'] ?? null,
            item['Commission%'] ?? null,
            item['Total Comm.\n(Local currency w/o VAT)'] ?? null,
            item['Unit Price after Comm.\n(local currency w/o VAT)'] ?? null,
            item['Net after Comm.\n(local currency w/o VAT)'] ?? null,
            item['Request Date'] ?? null,
            fileUploadID,
            item['GST QUOTE NO'] ?? null
        );
        const base = i * 21;
        return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6}, $${base + 7}, $${base + 8}, $${base + 9}, $${base + 10}, $${base + 11}, $${base + 12}, $${base + 13}, $${base + 14}, $${base + 15}, $${base + 16}, $${base + 17}, $${base + 18}, $${base + 19}, $${base + 20}, $${base + 21})`;
    }).join(',');

    const sql = `INSERT INTO it."ItemDetails" ("Item", "TagNumber", "Qty", "ProductNumber", "Desc", "MfgLocation", "Brands", "ListPriceNetPrice(Each)", "UnitPrice(Localcurrencyw/oVAT)", "TotalPrice(LocalCurrencyw/oVAT)", "LocalMultiplyFactor", "BoxingHandling", "BaseDiscount", "ExitDisc", "VolumeDiscount", "VolumeDiscount$(Localcurrencyw/oVAT)", "UnitPriceaftervolumediscount.(localcurrencyw/oVAT)", "Netaftervolumediscount.(localcurrencyw/oVAT)", "RequestDate", "FileUploadID", "GSTQuoteNo") VALUES ${values}`;

    await pool.query(sql, params);
}

module.exports = { ingestExcelPayload };