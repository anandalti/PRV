const axios = require('axios');
const { pool } = require('../../../db/pgsqldb');

// Validate required environment variables
const validateEnv = () => {
    const required = ['CONFIGIT_BOM_SOLVE_API_URL', 'CONFIGIT_BOM_SOLVE_API_KEY'];
    const missing = required.filter(env => !process.env[env]);
    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
};

validateEnv();

const config = {
    apiUrl: process.env.CONFIGIT_BOM_SOLVE_API_URL,
    authorization: `ApiKey ${process.env.CONFIGIT_BOM_SOLVE_API_KEY}`,
    timeout: parseInt(process.env.CONFIGIT_API_TIMEOUT || '30000', 10),
    returnUnavailable: process.env.CONFIGIT_RETURN_UNAVAILABLE === 'true' || false,
    includeProperties: process.env.CONFIGIT_INCLUDE_PROPERTIES === 'true' || false
};

/**
 * Fetch Configit codes by tag IDs
 * @param {number[]} tagIds - Array of tag IDs to query
 * @returns {Promise<Object>} Structured object mapping TagId -> SelectedValveId -> config data
 * @throws {Error} If pool is unavailable or tagIds are invalid
 */
const getConfigitCodeByTagIds = async (tagIds) => {
    // Validate input
    if (!Array.isArray(tagIds) || tagIds.length === 0) {
        throw new Error('tagIds must be a non-empty array');
    }
    if (!tagIds.every(id => Number.isInteger(id) && id > 0)) {
        throw new Error('All tagIds must be positive integers');
    }
    if (!pool) {
        throw new Error('Database pool not initialized');
    }

    const query = `SELECT 
            SV."TagId",
            SV."SelectedValveId",
			T."Prv2SizeTagName",
			M."ModelNumber",
			CPP."ConfigitProductId",
			CPP."PackagePath",
			JSON_AGG(
                JSON_BUILD_OBJECT(
                    'ConfigitAbbr', CS."ConfigitAbbr",
                    'ConfigitCode', SC."ConfigitCode"
                )
                ORDER BY CS."Order"
            ) 
        FILTER (WHERE CS."ConfigitAbbr" IS NOT NULL AND SC."ConfigitCode" IS NOT NULL) AS "ConfigitCodes"
        FROM it."SelectedValve" SV
		INNER JOIN it."Tag" T ON T."TagId" = SV."TagId"
        INNER JOIN it."ConfigDetails" CD 
        ON CD."SelectedValveId" = SV."SelectedValveId"
        INNER JOIN public."SectionChoices" SC
        ON SC."SectionChoiceId" = CD."SectionChoiceId"
        INNER JOIN public."ConfigurationSections" CS 
        ON CS."ConfigurationSectionId" = SC."ConfigurationSectionId"
		LEFT JOIN it."ConfigitPackagePath" CPP 
		ON CPP."ModelId" = SV."ModelId"
        INNER JOIN public."Models" M ON M."ModelId" = SV."ModelId"
		WHERE SV."TagId" = ANY($1::int[])
		GROUP BY SV."TagId", SV."SelectedValveId", T."Prv2SizeTagName", M."ModelNumber", CPP."ConfigitProductId", CPP."PackagePath"
        ORDER BY SV."TagId", M."ModelNumber"`;
    try {
        const result = await pool.query(query, [tagIds]);
        
        if (!result.rows || result.rows.length === 0) {
            return new Map();
            //  return {};
        }

        return result.rows.reduce((acc, row) => {
            if (!acc.has(row.TagId)) {
                acc.set(row.TagId, new Map());
            }
            // Build VariableAssignments efficiently before object creation
            const variableAssignments = (row.ConfigitCodes || []).map(code => ({
                variableId: code.ConfigitAbbr,
                value: code.ConfigitCode
            })).filter(va => va.variableId && va.value);
            
            acc.get(row.TagId).set(row.SelectedValveId, {
                packagePath: row.PackagePath,
                productId: row.ConfigitProductId,
                returnUnavailable: config.returnUnavailable,
                includeProperties: config.includeProperties,
                date: new Date().toISOString(),
                nodes: [
                    {
                        nodeId: "ROOT",
                        VariableAssignments: variableAssignments
                    }
                ]
            });
            return acc;
        }, new Map());
    } catch (error) {
        throw new Error(`Failed to fetch Configit codes: ${error.message}`);
    }
}

/**
 * Solve BOM (Bill of Materials) using Configit API
 * @param {Object} bomData - Input BOM data structure
 * @param {string} packagePath - Package path for the BOM solver
 * @returns {Promise<Object>} Solved BOM data from API
 * @throws {Error} If validation fails or API call fails
 */
const bomSolveResult = async (bomData, packagePath, selectedValveId) => {
    // Validate inputs
    if (!bomData || typeof bomData !== 'object') {
        throw new Error('bomData must be a non-empty object');
    }
    if (!packagePath || typeof packagePath !== 'string') {
        throw new Error('packagePath must be a non-empty string');
    }
    if (!config.apiUrl) {
        throw new Error('CONFIGIT_BOM_SOLVE_API_URL is not configured');
    }
    if (!config.authorization) {
        throw new Error('CONFIGIT_BOM_SOLVE_API_KEY is not configured');
    }

    try {
        const response = await axios.post(
            `${config.apiUrl}?packagePath=${encodeURIComponent(packagePath)}`,
            bomData,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': config.authorization
                },
                timeout: config.timeout
            }
        );
        
        if (!response.data) {
            throw new Error('Empty response from BOM solver API');
        }
        await bomSolveResponseStore(response.data, selectedValveId);
        return response.data;
    } catch (error) {
        const errorMsg = error.response?.data?.message || error.message || 'Unknown error';
        const statusCode = error.response?.status || 'N/A';
        const apiError = new Error(`BOM solver API error [${statusCode}]: ${errorMsg}`);
        apiError.statusCode = statusCode;
        apiError.originalError = error;
        throw apiError;
    }
};

/**
 * Extract and store BOM solve response to PostgreSQL
 * @param {Object} response - BOM solve API response containing Product tree
 * @returns {Promise<Object>} Result with counts of inserted products and bomItems
 * @throws {Error} If database operations fail
 */
const bomSolveResponseStore = async (response, selectedValveId) => {
    if (!response || !response.root) {
        throw new Error('Invalid response: missing root product');
    }

    const results = {
        productsInserted: 0,
        bomItemsInserted: 0,
        errors: []
    };

    try {
        const { root, packagePath } = response;
        const { products, bomItems } = collectBomRows(root, packagePath, selectedValveId);

        if (products.length > 0) {
            const productIdMap = await bulkUpsertProducts(products);

            if (bomItems.length > 0) {
                const resolvedBomItems = bomItems.map(item => ({
                    ...item,
                    BomProductsId: productIdMap.get(item.ProductId) || null,
                    ParentBomProductsId: productIdMap.get(item.ParentProductId) || null
                }));
                await bulkUpsertBomItems(resolvedBomItems);
            }
        }

        results.productsInserted = products.length;
        results.bomItemsInserted = bomItems.length;

        return results;
    } catch (error) {
        throw new Error(`Failed to store BOM response: ${error.message}`);
    }
};

/**
 * Build flattened products and BOM item rows for bulk insertion.
 * @param {Object} root - Root product from response
 * @param {string} packagePath - Package path from response
 * @param {string} selectedValveId - Selected valve ID
 * @returns {{ products: Array<Object>, bomItems: Array<Object> }}
 */
const collectBomRows = (root, packagePath, selectedValveId) => {
    const productsById = new Map();
    const bomItems = [];

    const addProduct = (product, resolvedPackagePath = '') => {
        if (!product || !product.productId) {
            return;
        }

        const existing = productsById.get(product.productId);
        const nextPackagePath = existing?.package_path || resolvedPackagePath || '';

        productsById.set(product.productId, {
            ProductId: product.productId,
            SelectedValveId: selectedValveId || null,
            Type: product.type || null,
            IsConfigurable: product.isConfigurable ?? null,
            State: product.state || null,
            Justification: product.justification || null,
            Solved: product.solved ?? null,
            NodeId: product.nodeId || null,
            QuantityValue: product.quantity?.value ?? null,
            QuantityUnit: product.quantity?.unit || null,
            RequiredVariables: product.requiredVariables || [],
            Properties: product.properties || [],
            PackagePath: nextPackagePath
        });
    };

    const visitBomItems = (items, parentProductId, bomId, parentNodeId, depth) => {
        for (const item of items) {
            addProduct(item, '');

            bomItems.push({
                BomItemId: item.bomItemId,
                ProductId: item.productId,
                ParentProductId: parentProductId,
                BomId: bomId,
                ParentNodeId: parentNodeId,
                SelectedValveId: selectedValveId || null,
                Depth: depth
            });

            if (item.boms && Array.isArray(item.boms)) {
                for (const nestedBom of item.boms) {
                    visitBomItems(
                        nestedBom.bomItems || [],
                        item.productId,
                        nestedBom.bomId,
                        item.nodeId,
                        depth + 1,
                        selectedValveId
                    );
                }
            }
        }
    };

    addProduct(root, packagePath);

    if (root.boms && Array.isArray(root.boms)) {
        for (const bom of root.boms) {
            visitBomItems(
                bom.bomItems || [],
                root.productId,
                bom.bomId,
                root.nodeId,
                1,
            );
        }
    }

    return {
        products: Array.from(productsById.values()),
        bomItems
    };
};

/**
 * Bulk upsert product rows and return a map of ProductId -> BomProductsId.
 * @param {Array<Object>} products - Flattened product rows
 * @returns {Promise<Map<string, number>>} Map of ProductId to BomProductsId
 */
const bulkUpsertProducts = async (products) => {
    const query = `
        INSERT INTO it."BomProducts" (
            "ProductId",
            "SelectedValveId",
            "Type",
            "IsConfigurable",
            "State",
            "Justification",
            "Solved",
            "NodeId",
            "QuantityValue",
            "QuantityUnit",
            "RequiredVariables",
            "Properties",
            "PackagePath"
        )
        SELECT
            src."ProductId",
            src."SelectedValveId",
            src."Type",
            src."IsConfigurable",
            src."State",
            src."Justification",
            src."Solved",
            src."NodeId",
            src."QuantityValue",
            src."QuantityUnit",
            src."RequiredVariables",
            src."Properties",
            src."PackagePath"
        FROM json_to_recordset($1::json) AS src(
            "ProductId" TEXT,
            "SelectedValveId" INTEGER,
            "Type" TEXT,
            "IsConfigurable" BOOLEAN,
            "State" TEXT,
            "Justification" TEXT,
            "Solved" BOOLEAN,
            "NodeId" TEXT,
            "QuantityValue" NUMERIC,
            "QuantityUnit" TEXT,
            "RequiredVariables" JSONB,
            "Properties" JSONB,
            "PackagePath" TEXT
        )
        ON CONFLICT ("ProductId", "SelectedValveId") DO UPDATE SET
            "State" = EXCLUDED."State",
            "Solved" = EXCLUDED."Solved",
            "UpdatedAt" = CURRENT_TIMESTAMP
        RETURNING "BomProductsId", "ProductId"
    `;

    const result = await pool.query(query, [JSON.stringify(products)]);
    const productIdMap = new Map();
    for (const row of result.rows) {
        productIdMap.set(row.ProductId, row.BomProductsId);
    }
    return productIdMap;
};

/**
 * Bulk upsert bom item rows in a single SQL statement.
 * @param {Array<Object>} bomItems - Flattened bom item rows with resolved BomProductsId
 */
const bulkUpsertBomItems = async (bomItems) => {
    const query = `
        INSERT INTO it."BomItems" (
            "BomItemId",
            "BomProductsId",
            "ParentBomProductsId",
            "BomId",
            "SelectedValveId",
            "ParentNodeId",
            "Depth"
        )
        SELECT
            src."BomItemId",
            src."BomProductsId",
            src."ParentBomProductsId",
            src."BomId",
            src."SelectedValveId",
            src."ParentNodeId",
            src."Depth"
        FROM json_to_recordset($1::json) AS src(
            "BomItemId" TEXT,
            "BomProductsId" INTEGER,
            "ParentBomProductsId" INTEGER,
            "BomId" TEXT,
            "SelectedValveId" INTEGER,
            "ParentNodeId" TEXT,
            "Depth" INTEGER
        )
        ON CONFLICT ("BomItemId", "SelectedValveId") DO UPDATE SET
            "UpdatedAt" = CURRENT_TIMESTAMP
    `;

    await pool.query(query, [JSON.stringify(bomItems)]);
};

module.exports = {
    bomSolveResult,
    bomSolveResponseStore,
    getConfigitCodeByTagIds
};