const { pool } = require('../../db/pgsqldb');
const { callCustomerPartyApi } = require('./externalApiClient');
const requestTemplate = require('./RequestSalesOrderAPI.json');
const mappings = require('./LovMapping.json');

const queryRows = async (sql, params = []) => {
    const { rows } = await pool.query(sql, params);
    return rows;
};

const queryFirstRow = async (sql, params = []) => {
    const rows = await queryRows(sql, params);
    return rows[0] || null;
};

const buildCustomerQueryParams = (address) => {
    return {
        CustomerName: address.CompanyName || undefined,
        Address: [address.AddressLine1, address.AddressLine2]
            .filter(Boolean)
            .join(', ') || undefined,
        PostalCode: address.PostalCode || undefined,
        City: address.City || undefined,
        State: address.State || undefined,
        Country: address.Country || undefined,

        DestinationSystem: undefined,
        CustomerNumber: undefined,
        LocationCode: undefined
    };
};

const processAddresses = async (addresses = []) => {
    return await Promise.all(
        addresses.map(async (address) => {
            try {
                const queryParams = buildCustomerQueryParams(address);
                const { responseBody } = await callCustomerPartyApi(queryParams);
                const customerNameFromAddress = address.CompanyName;

                const identifications =
                    responseBody?.CustomerParty?.DataArea?.Identification || [];

                const matchedCustomer = identifications.find(
                    (cust) =>
                        cust.CustomerName &&
                        cust.CustomerName.toLowerCase().trim() ===
                        customerNameFromAddress?.toLowerCase().trim()
                );

                const partySiteId = matchedCustomer?.PartySiteId || null;

                return {
                    ...address,
                    partySiteId
                };

            } catch (error) {
                console.error('Customer API failed:', error.message);

                return {
                    ...address,
                    partySiteId: null
                };
            }
        })
    );
};

const getDefaultValues = async () => {
    try {
        const rows = await queryRows(`
            SELECT "Key", "Value"
            FROM it."DefaultValues"
            WHERE "Status" = 'active'
            ORDER BY "ValueID"
        `);

        return rows.reduce((acc, row) => {
            acc[row.Key] = row.Value;
            return acc;
        }, {});
    } catch (error) {
        if (error?.code === '42P01' || /relation .* does not exist/i.test(error.message || '')) {
            console.warn('DefaultValues table is not available in the current database; continuing with empty defaults.');
            return {};
        }
        throw error;
    }
};

const getHeaderByFileUpload = async (fileUploadID) =>
    queryFirstRow(`SELECT * FROM it."Header" WHERE "FileUploadID" = $1`, [fileUploadID]);

const getTsfByFileUpload = async (fileUploadID) =>
    queryFirstRow(`SELECT * FROM it."TSF" WHERE "FileUploadID" = $1`, [fileUploadID]);

const getHeaderAddressesByFileUpload = async (fileUploadID) =>
    queryRows(
        `
        SELECT
            h."HeaderID",
            ha."ShippingMark",
            a.*
        FROM it."Header" h
        JOIN it."HeaderAddress" ha
            ON ha."HeaderID" = h."HeaderID"
        JOIN it."Address" a
            ON a."AddressID" = ha."HeaderAddressID"
        WHERE h."FileUploadID" = $1
        `,
        [fileUploadID]
    );

const getTermsAndShippingByFileUpload = async (fileUploadID) =>
    queryFirstRow(
        `
        SELECT ts.*
        FROM it."Header" h
        JOIN it."TermsAndShipping" ts
            ON ts."HeaderID" = h."HeaderID"
        WHERE h."FileUploadID" = $1
        `,
        [fileUploadID]
    );

const getEndUseByFileUpload = async (fileUploadID) =>
    queryFirstRow(
        `
        SELECT eu.*
        FROM it."TSF" t
        JOIN it."EndUse" eu
            ON eu."TSFID" = t."TSFID"
        WHERE t."FileUploadID" = $1
        `,
        [fileUploadID]
    );

const  getPropertiesByFileUpload = async (fileUploadID) => {
    const result = await pool.query(
        `
        SELECT
            fd."FileUploadID",
            json_agg(
                json_build_object(
                    'propertyId', p."PropertyId",
                    'key', p."Key",
                    'propertyName', p."Name",
                    'value', fd."Value"
                )
                ORDER BY p."Name"
            ) AS "properties"
        FROM it."FormDetails" fd
        JOIN it."Property" p
            ON fd."PropertyID" = p."PropertyId"
        WHERE fd."FileUploadID" = $1
        GROUP BY fd."FileUploadID";
        `,
        [fileUploadID]
    );

    return result.rows[0];
};

const getItemDetailsByFileUpload = async (fileUploadID) =>
    queryRows(`SELECT * FROM it."ItemDetails" WHERE "FileUploadID" = $1`, [fileUploadID]);

const getSourceDataByFileUpload = async (fileUploadID) => {
    const [
        propertiesResult,
        itemDetails,
        header,
        tsf,
        headerAddresses,
        termsAndShipping,
        endUse
    ] = await Promise.all([
        getPropertiesByFileUpload(fileUploadID),
        getItemDetailsByFileUpload(fileUploadID),
        getHeaderByFileUpload(fileUploadID),
        getTsfByFileUpload(fileUploadID),
        getHeaderAddressesByFileUpload(fileUploadID),
        getTermsAndShippingByFileUpload(fileUploadID),
        getEndUseByFileUpload(fileUploadID)
    ]);

    return {
        fileUploadID,
        properties: propertiesResult?.properties || [],
        header,
        tsf,
        headerAddresses,
        termsAndShipping,
        endUse,
        itemDetails
    };
};

const formatDate = (dateString) => {
    if (!dateString) return "";

    const months = {
        Jan: "01",
        Feb: "02",
        Mar: "03",
        Apr: "04",
        May: "05",
        Jun: "06",
        Jul: "07",
        Aug: "08",
        Sep: "09",
        Oct: "10",
        Nov: "11",
        Dec: "12"
    };

    const [day, month, year] = dateString.split("/");

    if (!day || !month || !year) {
        return dateString; // Return original if format is invalid
    }

    return `${year}-${months[month]}-${day.padStart(2, "0")}`;
};

const removeEmptyFields = (data) => {
    if (Array.isArray(data)) {
        for (let i = data.length - 1; i >= 0; i--) {
            const item = data[i];

            if (item && typeof item === "object") {
                removeEmptyFields(item);

                if (
                    (Array.isArray(item) && item.length === 0) ||
                    (!Array.isArray(item) && Object.keys(item).length === 0)
                ) {
                    data.splice(i, 1);
                }
            } else if (item === "" || item === null || item === undefined) {
                data.splice(i, 1);
            }
        }

        return data;
    }

    if (data && typeof data === "object") {
        Object.keys(data).forEach((key) => {
            const value = data[key];

            if (value === "" || value === null || value === undefined) {
                delete data[key];
                return;
            }

            if (typeof value === "object") {
                removeEmptyFields(value);

                if (
                    (Array.isArray(value) && value.length === 0) ||
                    (!Array.isArray(value) && Object.keys(value).length === 0)
                ) {
                    delete data[key];
                }
            }
        });
    }

    return data;
};

const applyDefaults = (node, defaults) => {
    if (Array.isArray(node)) {
        return node.map(item => applyDefaults(item, defaults));
    }

    if (node && typeof node === 'object') {
        const result = {};

        for (const [key, value] of Object.entries(node)) {
            if (defaults[key] !== undefined && (typeof value === 'string' || typeof value === 'number' || value === null)) {
                result[key] = defaults[key];
            } else {
                result[key] = applyDefaults(value, defaults);
            }
        }

        return result;
    }

    return node;
};

// applies header properties
const applyPropertyMappings = (payload, sourceData) => {
    const properties = Object.fromEntries(
        (sourceData?.properties || []).map(({ key, value }) => [key, value])
    );

    const termsAndShipping = sourceData?.termsAndShipping || {};

    const header = payload?.SalesOrder?.DataArea?.SalesOrderHeader?.[0];

    if (!header) {
        return payload;
    }

    const orderHeader = header.OrderHeader;
    const additionalHdrInfo = header.AdditionalHdrInfo;
    const exportInfo = header.OrderExportInfo;

    //Applying default values for MessageHeader
    payload.SalesOrder.MessageHeader.Sender.ID = "PRV001";
    payload.SalesOrder.MessageHeader.Target.ID = "OGSI";
    payload.SalesOrder.MessageHeader.BusinessGroup = "SSOP";

    // Order Header
    orderHeader.OriginatingSystem = "PRV001";
    orderHeader.DestinationSystem = "EPM_RO_OU_CLUJ1";
    orderHeader.CurrencyCode = properties.currencyCode;
    orderHeader.POReceiptDate = formatDate(properties.orderDate);
    orderHeader.ReceivedDate = formatDate(properties.orderDate);
    orderHeader.OrderType = properties.orderType;
    orderHeader.RequestDate = formatDate(properties.requestDate);
    orderHeader.PreparedBy = properties.preparedBy;
    orderHeader.PreparedByName = properties.preparedBy;
    //orderHeader.SicCode = properties.sicCode;
    orderHeader.SicCode = getCodeFromMapping(
        mappings.SicCode,
        properties.sicCode
    );
    orderHeader.CustomerPONbr = properties.customerPoNo;
    orderHeader.OrderNbr = properties.orderNumber;
    orderHeader.SalesPerson = properties.salesmanName;
    orderHeader.ShipPartial = properties.partialShipment

    // Terms & Shipping values
    orderHeader.PaymentTerms = termsAndShipping.PaymentTerm;
    orderHeader.PenaltyStartDate = formatDate(termsAndShipping.PenaltyStartDate);
    orderHeader.PenaltyMaximum = termsAndShipping.PenaltyRateAndCap;

    // Additional Header Info
    if (additionalHdrInfo) {
        additionalHdrInfo.SIC = getCodeFromMapping(
            mappings.SicCode,
            properties.sicCode
        );
        additionalHdrInfo.RepOrderID = properties.repOrderNo;
        additionalHdrInfo.NamedPlace = termsAndShipping.NamedPlacePort;
    }

    // Order Export Info
    if (exportInfo) {
        exportInfo.DomesticForwarder = properties.forwarderDetails;
        exportInfo.ShipMethod = properties.freightMode;
        console.log("termsAndShipping.IncoTerms", termsAndShipping.IncoTerms);
        exportInfo.INCOTerms = getCodeFromMapping(mappings.INCOTerms, termsAndShipping.IncoTerms);
        exportInfo.PackInstructions = properties.packingType;
    }

    // Project Name
    const faultingService =
        payload?.SalesOrder?.MessageHeader?.FaultNotification?.FaultingService;

    if (faultingService) {
        faultingService.ProjectName = properties.projectName;
    }

    return payload;
};

//applies header address mappings
const applyHeaderAddressMappings = (payload, sourceData) => {
    const addresses = sourceData?.headerAddresses || [];
    const salesOrderHeader = payload?.SalesOrder?.DataArea?.SalesOrderHeader?.[0];

    if (!salesOrderHeader) {
        return payload;
    }

    addresses.forEach((address) => {
        const addressTypeID = Number(address.AddressTypeID);
        const target =
            addressTypeID === 2
                ? salesOrderHeader.OrderHeader?.ShippingProfile
                : addressTypeID === 1
                    ? salesOrderHeader.OrderHeader?.BillingProfile
                    : addressTypeID === 3
                        ? salesOrderHeader.EndUserPartyReference
                        : null;

        if (!target) {
            return;
        }

        target.OrganizationName = address.CompanyName;
        const addr = target.Address ?? target.LocationReference?.Address;
        if (!addr) {
            return;
        }

        addr.LineOne = address.AddressLine1 || '';
        addr.LineTwo = address.AddressLine2 || '';
        addr.CityName = address.City || '';
        addr.StateName = address.State || '';
        addr.PostalCode = address.PostalCode || '';
        addr.CountryName = address.Country || '';
        addr.CountryDesc = address.Country || '';
        addr.CountryCode = address.Country || '';
    });

    return payload;
};

const applyItemDetailsMappings = (payload, sourceData) => {
    const items = sourceData?.itemDetails || [];

    if (!items.length) {
        payload.SalesOrder.DataArea.SalesOrderLine = [];
        return payload;
    }

    const template = payload.SalesOrder.DataArea.SalesOrderLine[0];

    payload.SalesOrder.DataArea.SalesOrderLine = items.map(item => {
        const line = structuredClone(template);

        // OrderLine
        line.OrderLine.LineNbr = item.Item;
        line.OrderLine.Qty = item.Qty;
        line.OrderLine.ProductID = item.ProductNumber;
        line.OrderLine.Description = item.Desc;

        line.OrderLine.ListPrice =
            item["ListPriceNetPrice(Each)"];

        line.OrderLine.UnitPrice =
            item["UnitPrice(Localcurrencyw/oVAT)"];

        line.OrderLine.ExtendedPrice =
            item["TotalPrice(LocalCurrencyw/oVAT)"];

        line.OrderLine.MarkupMultiplier =
            item.LocalMultiplyFactor;

        line.OrderLine.DiscountPrcnt =
            item.BaseDiscount;
        if(item.RequestDate) {
            line.OrderLine.RequestDate = new Date(item.RequestDate).toISOString().split('T')[0];
        }

        // AdditionalLineInfo
        line.AdditionalLineInfo.PreferredItemManfSite =
            item.MfgLocation;

        line.AdditionalLineInfo.ProductGroup =
            item.Brands;

        // URDInfo
        line.URDInfo.Unit[0].Tag.UnitID =
            item.TagNumber;

        return line;
    });

    return payload;
};

const applyEndUseMappings = (payload, sourceData) => {
    const endUse = sourceData?.endUse;

    const exportInfo =
        payload?.SalesOrder?.DataArea?.SalesOrderHeader?.[0]?.OrderExportInfo;

    if (!endUse || !exportInfo) {
        return payload;
    }

    const endUseMap = {
        ChemicalBiological: "Chemical Weapons/Biological Weapons",
        Nuclear: "Nuclear",
        Military: "Military",
        Space: "Space",
        RocketsMissiles: "Rockets/Missiles",
        Stock: "Stock",
        Others: "Others"
    };

    for (const [key, value] of Object.entries(endUseMap)) {
        if (endUse[key]) {
            exportInfo.EndUse = value;

            if (key === "Others") {
                exportInfo.ExplainendUse = endUse.Others || "";
            }

            break;
        }
    }

    return payload;
};

const getCodeFromMapping = (mapping, value) => {
    if (!value) return "";

    const searchValue = value
        .toLowerCase()
        .replace(/[^\w\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    // 1. Exact match
    const exact = Object.entries(mapping).find(
        ([description]) =>
            description
                .toLowerCase()
                .replace(/[^\w\s]/g, " ")
                .replace(/\s+/g, " ")
                .trim() === searchValue
    );

    if (exact) {
        return exact[1];
    }

    const searchWords = searchValue.split(" ");

    // 2. Partial word match
    let bestMatch = "";
    let highestScore = 0;

    for (const [description, code] of Object.entries(mapping)) {
        const normalizedDescription = description
            .toLowerCase()
            .replace(/[^\w\s]/g, " ")
            .replace(/\s+/g, " ")
            .trim();

        const descriptionWords = normalizedDescription.split(" ");

        const score = searchWords.filter(word =>
            descriptionWords.includes(word)
        ).length;

        if (score > highestScore) {
            highestScore = score;
            bestMatch = code;
        }
    }

    return bestMatch;
};

const generatePayload = async (fileUploadID) => {
    const defaults = await getDefaultValues();
    const sourceData = await getSourceDataByFileUpload(fileUploadID);
    let payload = applyDefaults(structuredClone(requestTemplate), defaults);
    sourceData.headerAddresses = await processAddresses(sourceData.headerAddresses);
    payload = applyPropertyMappings(payload, sourceData);
    payload = applyHeaderAddressMappings(payload, sourceData);
    payload = applyItemDetailsMappings(payload, sourceData);
    payload = applyEndUseMappings(payload, sourceData);
    payload = removeEmptyFields(payload);
    return payload;
};

module.exports = {
    generatePayload,
};