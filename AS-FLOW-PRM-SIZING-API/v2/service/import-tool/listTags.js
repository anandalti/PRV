const { pool } = require('../../db/pgsqldb');

const getTags = async () => {
    const query = `SELECT T.*, P."Name" As "ProjectName", C."Name" As "CompanyName" FROM it."Tag" T
        INNER JOIN it."Project" P ON T."ProjectId" = P."ProjectId"
        INNER JOIN it."Company" C ON P."CompanyId" = C."CompanyId"
        INNER JOIN it."ImportRequests" IR ON T."ImportRequestId" = IR."ImportRequestId"
        ORDER BY T."TagId" DESC;
    `;
    const result = await pool.query(query);
    return result.rows;
}

const getFilterData = (tagsByUserId) => {
    const filterData = {};
    filterData['companies'] = [];
    const tagIds = [];
    tagsByUserId.forEach(tag => {
        tagIds.push(tag.TagId);
        const { CompanyId, CompanyGuid, CompanyName, ProjectId, ProjectGuid, ProjectName, ...tagDetails } = tag;
        if (!filterData['companies'].find(c => c.companyId === CompanyId)) {
            filterData['companies'].push({
                companyId: CompanyId,
                companyGuid: CompanyGuid,
                companyName: CompanyName,
                projects: []
            });
        }
        if (!filterData['companies'].find(c => c.companyId === CompanyId).projects.find(p => p.projectId === ProjectId)) {
            filterData['companies'].find(c => c.companyId === CompanyId).projects.push({
                projectId: ProjectId,
                projectGuid: ProjectGuid,
                projectName: ProjectName,
                tags: []
            });
        }
        filterData['companies'].find(c => c.companyId === CompanyId).projects.find(p => p.projectId === ProjectId).tags.push({
            tagId: tag.TagId,
            tagGuid: tag.TagGuid,
            tagName: tag.Prv2SizeTagName
        });
    });
    return { filterData, tagIds };
}

const getTagsData = async (tagIds) => {
    const tagDetailsQuery = `SELECT T.*,
                COALESCE(
                    JSON_OBJECT_AGG(
                        PR."Name",
                        COALESCE(TD."Value", '') || CASE 
                        WHEN U."UnitValue" IS NOT NULL THEN ' ' || U."UnitValue" 
                        ELSE '' END
                        ORDER BY PR."Name"
                    ),
                    '{}'::JSON
                ) AS sizing_object
            FROM it."Tag" T
            LEFT JOIN it."TagDetails" TD ON TD."TagId" = T."TagId"
            LEFT JOIN it."Property" PR ON PR."PropertyId" = TD."PropertyId"
            LEFT JOIN it."UnitTable" U ON U."UnitId" = TD."UnitId"
            WHERE T."TagId" = ANY($1::int[])
            GROUP BY T."TagId"`;
    const result = await pool.query(tagDetailsQuery, [tagIds]);
    const sizingDetails = result.rows.map(row => {
        return {
            tagId: row.TagId,
            tagName: row.Prv2SizeTagName,
            ...row.sizing_object
        };
    });
    const tagDetails = result.rows.map(row => {
        const { sizing_object, ...tagInfo } = row;
        return tagInfo;
    });
    return { sizingDetails, tagDetails };
}

const transformPricingData = (pricingObj) => {
    const result = {};

    Object.keys(pricingObj).forEach(key => {
        const value = pricingObj[key];

        if (key === "PricingNotes") {
            result[key] = value;
            return;
        }

        if (Array.isArray(value)) {
            const total = value.reduce((sum, item) => {
                return sum + (Number(item.Value) || 0);
            }, 0);

            result[key] = {
                Items: value,
                Total: total
            };

            return;
        }

        if (typeof value === "object" && value !== null && value.Items) {
            const items = value.Items || [];
            const total = items.reduce((sum, item) => {
                return sum + (Number(item.Value) || 0);
            }, 0);

            result[key] = {
                Items: items,
                Total: total
            };

            return;
        }

        result[key] = value;
    });

    return result;
}

const getConfigData = async (tagIds) => {
    const configDataQuery = `SELECT 
            SV."TagId",
            SV."SelectedValveId",
            T."Prv2SizeTagName",
            M."ModelNumber",
            JSON_AGG(
                JSON_BUILD_OBJECT(
                    'Code', SC."ERPCode",
                    'Category', CS."Name",
                    'Description', SC."Description"
                )
                ORDER BY CS."Order"
            ) AS "SectionChoices",
            COALESCE((ARRAY_AGG(pricingData.pricing_object))[1], '{}'::JSONB) AS "pricing_object"
        FROM it."SelectedValve" SV
        INNER JOIN it."Tag" T ON T."TagId" = SV."TagId"
        INNER JOIN it."ConfigDetails" CD 
            ON CD."SelectedValveId" = SV."SelectedValveId"
        INNER JOIN public."SectionChoices" SC
            ON SC."SectionChoiceId" = CD."SectionChoiceId"
        INNER JOIN public."ConfigurationSections" CS 
            ON CS."ConfigurationSectionId" = SC."ConfigurationSectionId"
        INNER JOIN public."Models" M ON M."ModelId" = SV."ModelId"
        LEFT JOIN (
            SELECT
                pricingObjects."SelectedValveId",
                CASE
                    WHEN COUNT(*) = 1 THEN (ARRAY_AGG(pricingObjects.pricing_object ORDER BY pricingObjects."PricingID"))[1]
                    ELSE JSONB_BUILD_OBJECT(
                        'PricingData',
                        JSONB_AGG(pricingObjects.pricing_object ORDER BY pricingObjects."PricingID")
                    )
                END AS pricing_object
            FROM (
                SELECT
                    P."SelectedValveId",
                    P."PricingID",
                    COALESCE(pricingRecords.pricing_records_object, '{}'::JSONB)
                    || COALESCE(pricingDetails.pricing_details_object, '{}'::JSONB)
                    || COALESCE(pricingNotes.pricing_notes_object, '{}'::JSONB) AS pricing_object
                FROM it."Pricing" P
                LEFT JOIN (
                    SELECT
                        PRC."PricingID",
                        JSONB_OBJECT_AGG(
                            PROP."Name",
                            COALESCE(PRC."Value", '')
                            ORDER BY PROP."Name"
                        ) AS pricing_records_object
                    FROM it."PricingRecords" PRC
                    INNER JOIN it."Property" PROP
                        ON PROP."PropertyId" = PRC."PropertyID"
                    WHERE PROP."Name" IS NOT NULL
                    GROUP BY PRC."PricingID"
                ) pricingRecords ON pricingRecords."PricingID" = P."PricingID"
                LEFT JOIN (
                    SELECT
                        pricingDetailGroups."PricingID",
                        JSONB_OBJECT_AGG(
                            pricingDetailGroups."PricingDetailsType",
                            pricingDetailGroups.details
                            ORDER BY pricingDetailGroups."PricingDetailsType"
                        ) AS pricing_details_object
                    FROM (
                        SELECT
                            PD."PricingID",
                            PDT."PricingDetailsType",
                            JSONB_AGG(
                                JSONB_BUILD_OBJECT(
                                    'RowId', PD."RowId",
                                    'RowName', PD."RowName",
                                    'BIPriceGroupInternalId', PD."BIPriceGroupInternalId",
                                    'BIPriceGroupName', PD."BIPriceGroupName",
                                    'DisplayOrder', PD."DisplayOrder",
                                    'Type', PD."Type",
                                    'Value', PD."Value"
                                )
                                ORDER BY PD."DisplayOrder" NULLS LAST, PD."RowId" NULLS LAST
                            ) AS details
                        FROM it."PricingDetails" PD
                        INNER JOIN it."PricingDetailsType" PDT
                            ON PDT."PricingDetailsTypeID" = PD."PricingDetailsTypeID"
                        WHERE PDT."PricingDetailsType" IS NOT NULL
                        GROUP BY PD."PricingID", PDT."PricingDetailsType"
                    ) pricingDetailGroups
                    GROUP BY pricingDetailGroups."PricingID"
                ) pricingDetails ON pricingDetails."PricingID" = P."PricingID"
                LEFT JOIN (
                    SELECT
                        PN."PricingID",
                        JSONB_BUILD_OBJECT(
                            'PricingNotes',
                            JSONB_AGG(
                                JSONB_BUILD_OBJECT(
                                    'AdditionalNotes', PN."AdditionalNotes",
                                    'DateCreated', PN."DateCreated",
                                    'ApprovedBy', PN."ApprovedBy",
                                    'NoteType', PN."NoteType"
                                )
                                ORDER BY PN."DateCreated" NULLS LAST
                            )
                        ) AS pricing_notes_object
                    FROM it."PricingNotes" PN
                    GROUP BY PN."PricingID"
                ) pricingNotes ON pricingNotes."PricingID" = P."PricingID"
            ) pricingObjects
            GROUP BY pricingObjects."SelectedValveId"
        ) pricingData ON pricingData."SelectedValveId" = SV."SelectedValveId"
        WHERE SV."TagId" = ANY($1::int[])
        GROUP BY SV."TagId", SV."SelectedValveId", T."Prv2SizeTagName", M."ModelNumber"
        ORDER BY SV."TagId", M."ModelNumber"`;

    const result = await pool.query(configDataQuery, [tagIds]);

    return result.rows;
}

const getBomData = async (tagIds) => {
    const bomDataQuery = `SELECT 
            SV."TagId",
            SV."SelectedValveId",
            T."Prv2SizeTagName",
            M."ModelNumber",
            BP."ProductId",
            BP."IsConfigurable",
            BP."State",
            BP."Justification",
            BP."Solved",
            BP."QuantityValue",
            BP."QuantityUnit"
        FROM it."SelectedValve" SV
        INNER JOIN it."Tag" T ON T."TagId" = SV."TagId"
        INNER JOIN public."Models" M ON M."ModelId" = SV."ModelId"
        INNER JOIN it."BomProducts" BP ON BP."SelectedValveId" = SV."SelectedValveId"
        WHERE SV."TagId" = ANY($1::int[])
        ORDER BY SV."TagId", M."ModelNumber", BP."BomProductsId"`;

    const result = await pool.query(bomDataQuery, [tagIds]);
    return result.rows;
}

const getSpecialReqData = async (tagIds) => {
    if (!tagIds || !tagIds.length) return [];
    const query = `
        SELECT 
            TSR."TagId",
            TSR."SelectedValveId",
            TSR."TagSpecialReqId",
            TSR."PropertyId",
            P."Name" AS "PropertyName",
            TSR."SpecialReqId",
            COALESCE(TSR."SectionId", SR."SectionId") AS "SectionId",
            TSR."Value",
            TSR."Comments",
            TSR."Quantity",
            SR."PRVDescription",
            SR."ERPCode"
        FROM it."TagSpecialRequirements" TSR
        LEFT JOIN it."Property" P ON P."PropertyId" = TSR."PropertyId"
        LEFT JOIN public."SpecialRequirements" SR ON SR."SpecialReqId" = TSR."SpecialReqId"
        WHERE TSR."TagId" = ANY($1::int[])
        ORDER BY TSR."TagId", TSR."SpecialReqId"
    `;
    const result = await pool.query(query, [tagIds]);
    return result.rows;
}

exports.listTags = async () => {
    try {
        const tags = await getTags();
        const { filterData, tagIds } = getFilterData(tags);
        const { sizingDetails, tagDetails } = await getTagsData(tagIds);
        const configData = await getConfigData(tagIds);
        const bomData = await getBomData(tagIds);
        const specialReqData = await getSpecialReqData(tagIds);
        const { configDetails, pricingDetails } = configData.reduce((acc, item) => {
            const { TagId, Prv2SizeTagName, ModelNumber, SectionChoices, pricing_object } = item;
            if (acc.configDetails.find(cd => cd.tagId === TagId)) {
                acc.configDetails.find(cd => cd.tagId === TagId).models.push({
                    modelNumber: ModelNumber,
                    sectionChoices: SectionChoices
                });
                acc.pricingDetails.find(pd => pd.tagId === TagId).models.push({
                    modelNumber: ModelNumber,
                    ...transformPricingData(pricing_object)
                });
            } else {
                acc.configDetails.push({
                    tagId: TagId,
                    tagName: Prv2SizeTagName,
                    models: [{
                        modelNumber: ModelNumber,
                        sectionChoices: SectionChoices
                    }]
                })
                acc.pricingDetails.push({
                    tagId: TagId,
                    tagName: Prv2SizeTagName,
                    models: [{
                        modelNumber: ModelNumber,
                        ...transformPricingData(pricing_object)
                    }]
                });
            }
            return acc;
        }, { configDetails: [], pricingDetails: [] });

        const bomDetails = bomData.reduce((acc, row) => {
            const { TagId, Prv2SizeTagName, ModelNumber, SelectedValveId,
                ProductId, IsConfigurable, State, Justification, Solved,
                QuantityValue, QuantityUnit } = row;
            let tagEntry = acc.find(t => t.tagId === TagId);
            if (!tagEntry) {
                tagEntry = { tagId: TagId, tagName: Prv2SizeTagName, models: [] };
                acc.push(tagEntry);
            }
            let modelEntry = tagEntry.models.find(m => m.modelNumber === ModelNumber && m.selectedValveId === SelectedValveId);
            if (!modelEntry) {
                modelEntry = { modelNumber: ModelNumber, selectedValveId: SelectedValveId, products: [] };
                tagEntry.models.push(modelEntry);
            }
            modelEntry.products.push({
                productId: ProductId,
                isConfigurable: IsConfigurable,
                state: State,
                justification: Justification,
                solved: Solved,
                quantityValue: QuantityValue,
                quantityUnit: QuantityUnit
            });
            return acc;
        }, []);

        const specialReqDetails = specialReqData.reduce((acc, row) => {
            const { TagId, SelectedValveId, TagSpecialReqId, PropertyId, PropertyName, SpecialReqId, Value, Comments, Quantity, PRVDescription, ERPCode, SectionId } = row;
            let tagEntry = acc.find(t => t.tagId === TagId);
            if (!tagEntry) {
                tagEntry = { tagId: TagId, specialRequirements: [] };
                acc.push(tagEntry);
            }
            tagEntry.specialRequirements.push({
                tagSpecialReqId: TagSpecialReqId,
                selectedValveId: SelectedValveId,
                propertyId: PropertyId,
                propertyName: PropertyName,
                specialReqId: SpecialReqId,
                value: Value,
                comments: Comments,
                quantity: Quantity,
                prvDescription: PRVDescription,
                erpCode: ERPCode,
                sectionId: SectionId
            });
            return acc;
        }, []);

        return { filterData, sizingDetails, tagDetails, configDetails, pricingDetails, bomDetails, specialReqDetails };
    } catch (error) {
        console.error('Error listing tags by user ID:', error);
        throw error;
    }
}

exports.updateTagNumbersByTagId = async (updates = []) => {
    if (!updates.length) return;
    try {
        const tagIds = updates.map(u => u.TagId);
        const tagNumbers = updates.map(u => u.TagNumber);
        const updateSql = `
            UPDATE it."Tag" AS t
            SET "TagNumber" = v."TagNumber"
            FROM (SELECT unnest($1::int[]) AS "TagId", unnest($2::text[]) AS "TagNumber") AS v
            WHERE t."TagId" = v."TagId";
        `;
        await pool.query(updateSql, [tagIds, tagNumbers]);
    } catch (error) {
        console.error('updateTagNumbers error:', error);
        throw error;
    }
};