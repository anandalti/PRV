const { randomUUID } = require('crypto');
const { pool } = require('../../db/pgsqldb');
const { bomSolveResult, getConfigitCodeByTagIds } = require('./configit-bom-solve/index.js')

// Retrieves SectionChoiceIds based on ModelId and optional ListConfigData filters
const getSectionChoicesByModelId = async (modelId, listConfigData) => {
  let configDataQuery = `
      SELECT SC."SectionChoiceId"
      FROM public."SectionChoices" SC
      INNER JOIN public."ConfigurationSections" CS 
        ON CS."ConfigurationSectionId" = SC."ConfigurationSectionId"
      INNER JOIN public."ConfigurationModels" CM 
        ON CM."ConfigurationModelId" = CS."ConfigurationModelId"
      WHERE CM."ModelId" = $1
  `;

  const params = [modelId];
  if (listConfigData.length > 0) {
    const sections = listConfigData
      .map((s, idx) => {
        params.push(s.SectionName, s.OptionName);
        return `(CS."Abbr" = $${params.length - 1} AND SC."ERPCode" = $${params.length})`;
      })
      .join(" OR ");

    configDataQuery += ` AND (${sections})`;
  }

  const result = await pool.query(configDataQuery, params);
  return result.rows.map(row => row.SectionChoiceId);
};

// Helper function to normalize ConfigData from object format to array format
const normalizeConfigData = (configData) => {
  if (!configData) return [];
  
  // If already an array, return as is
  if (Array.isArray(configData)) {
    return configData;
  }
  
  // If it's an object, convert to array format
  if (typeof configData === 'object') {
    return Object.entries(configData).map(([sectionName, optionName]) => ({
      SectionName: sectionName,
      OptionName: optionName
    }));
  }
  
  return [];
};

// Main function to ingest the sizing payload and save it to the database with proper relationships and error handling
async function ingestSizingPayload(payload) {
  const createdTagIds = [];
  try {
    await pool.query("BEGIN");
    // User
    const userEmailId = payload?.[0]?.UserEmailId;
    const fullName = payload?.[0]?.FullName ?? null;
    const loginName = payload?.[0]?.LoginName ?? null;

    if (!userEmailId) {
      const error = new Error('UserEmailId is required in the payload');
      error.statusCode = 400;
      throw error;
    }

    const userId = await getOrCreateUserByEmail(userEmailId, fullName, loginName);

    // Import Request
    const requestUuid = randomUUID();
    const importRequestId = await insertImportRequest(userId, payload, requestUuid);

    // Property Types
    await seedPropertyTypes([
      "Pressure",
      "Temperature",
      "FluidProperties",
      "FlowCapacity",
      "ApplicationRequirements",
      "Pricing",
      "SpecialRequirements"
    ]);

    for (const tag of payload) {
      // Company & Project
      const companyId = await findOrCreateCompany({
        CompanyName: tag.CompanyName ?? null,
        CompanyGuid: tag.CompanyGuid ?? null
      });
      const projectId = await findOrCreateProject({
        ProjectName: tag.ProjectName ?? null,
        ProjectGuid: tag.ProjectGuid ?? null
      }, companyId);

      // Tag (with revisioning)
      const { tagId } = await insertOrBumpTag(tag, projectId, importRequestId);
      createdTagIds.push(tagId);

      // Tag Details - SizingData
      const sizingRows = [];
      for (const sd of (tag.SizingData ?? [])) {
        const key = sd.Key ?? null;
        const name = sd.Name ?? key;
        let val = null;
        let unit = null;
        if (sd.Value == null) {
          val = null;
        } else if (typeof sd.Value === "number" || typeof sd.Value === "boolean") {
          val = sd.Value;
        } else if (typeof sd.Value === "string") {
          const rawValue = sd.Value.trim();
          if (rawValue.includes('.')) {
            const parts = rawValue.split(/\s+/);
            val = toNumericOrNull(parts[0]);
            unit = parts.length >= 2 ? parts.slice(1).join(" ") : null;
          } else {
            val = val === '' ? null : rawValue;
          }
        }

        if (isPercentageUnit(unit)) {
          const pct = await mapPercentageSizingValue(key, name, val);
          sizingRows.push({
            tagId,
            propertyId: pct.propertyId,
            unitId: null,
            value: pct.value
          });
          continue;
        }

        const isValuePresent = val != null && val !== '';
        const propertyTypeId = await getPropertyTypeFromUnit(unit);
        const propertyId = await ensureProperty(key, name, propertyTypeId);
        const unitId = isValuePresent ? await ensureUnit(unit) : null;
        if (isValuePresent) {
          sizingRows.push({ tagId, propertyId, unitId, value: val });
        }
      }
      await bulkInsertTagDetails(sizingRows);

      // SelectedValves and related ConfigDetails, SpecialRequirements & PricingDetails
      const selectedValves = tag.SelectedValves ?? [];
      const selectedValveRows = [];
      for (const sv of selectedValves) {
        selectedValveRows.push({
          tagId,
          modelId: sv.ModelId ?? null,
          ref: sv
        });
      }
      const selectedValveIdMap = await bulkInsertSelectedValves(selectedValveRows);

      // Special Requirements (SpecialReqData)
      const specialReqRows = [];
      for (let i = 0; i < selectedValveRows.length; i++) {
        const { ref } = selectedValveRows[i];
        const selectedValveId = selectedValveIdMap[i];
        const specialReqList = ref.SpecialReqData ?? [];
        for (const sr of specialReqList) {
          const propKey = sr.Key ?? (sr.SpecialReqId ? `SpecialReq_${sr.SpecialReqId}` : 'SpecialRequirement');
          const propName = sr.Name ?? sr.SRPRVDescription ?? sr.PRVDescription ?? propKey;
          const propertyTypeId = await ensurePropertyType("SpecialRequirements");
          const propertyId = await ensureProperty(propKey, propName, propertyTypeId);
          specialReqRows.push({
            tagId,
            selectedValveId,
            propertyId,
            specialReqId: sr.SpecialReqId ?? null,
            sectionId: sr.SectionId ?? null,
            value: sr.Value != null ? String(sr.Value) : (sr.SRPRVDescription ?? sr.PRVDescription ?? null),
            comments: sr.Comments ?? null,
            quantity: sr.Quantity ?? null
          });
        }
      }
      for (const sr of (tag.SpecialReqData ?? [])) {
        const propKey = sr.Key ?? (sr.SpecialReqId ? `SpecialReq_${sr.SpecialReqId}` : 'SpecialRequirement');
        const propName = sr.Name ?? sr.SRPRVDescription ?? sr.PRVDescription ?? propKey;
        const propertyTypeId = await ensurePropertyType("SpecialRequirements");
        const propertyId = await ensureProperty(propKey, propName, propertyTypeId);
        specialReqRows.push({
          tagId,
          selectedValveId: null,
          propertyId,
          specialReqId: sr.SpecialReqId ?? null,
          sectionId: sr.SectionId ?? null,
          value: sr.Value != null ? String(sr.Value) : (sr.SRPRVDescription ?? sr.PRVDescription ?? null),
          comments: sr.Comments ?? null,
          quantity: sr.Quantity ?? null
        });
      }
      if (specialReqRows.length) {
        await bulkInsertTagSpecialRequirements(specialReqRows);
      }

      // ConfigDetails
      const configDetailRows = [];
      for (let i = 0; i < selectedValveRows.length; i++) {
        const { ref } = selectedValveRows[i];
        const selectedValveId = selectedValveIdMap[i];
        const configList = normalizeConfigData(ref.ConfigData);
        if (ref.ModelId && configList.length) {
          const sectionChoiceIds = await getSectionChoicesByModelId(ref.ModelId, configList);
          for (const choiceId of sectionChoiceIds) {
            configDetailRows.push({
              selectedValveId,
              sectionChoiceId: choiceId
            });
          }
        }
      }
      await bulkInsertConfigDetails(configDetailRows);

      // PricingDetails
      const pricingHeaderRows = [];
      const pricingDetailsRows = [];
      const pricingNotesRows = [];
      const pricingRecordsRows = [];
      for (let i = 0; i < selectedValveRows.length; i++) {
        const { ref } = selectedValveRows[i];
        const selectedValveId = selectedValveIdMap[i];
        for (const pd of (ref.PricingData ?? [])) {
          pricingHeaderRows.push({ selectedValveId });
          const pricingIndex = pricingHeaderRows.length - 1;

          for (const [key, value] of Object.entries(pd)) {
            const detailsKeys = [
              "PLNetAdders", "PLListAdders", "PLTransferDiscounts",
              "PLSurchargeDiscounts", "PLCustomerDiscounts",
              "PLPOAs", "SplPLPOAs", "PLPriceItems", "PLNetPriceItems"
            ];

            if (detailsKeys.includes(key)) {
              let itemsArray = [];
              if (Array.isArray(value)) {
                itemsArray = value;
              }
              else if (value && Array.isArray(value.Items)) {
                itemsArray = value.Items;
              }

              if (itemsArray.length) {
                const pricingDetailsTypeId = await getPricingDetailsTypeId(key);

                for (const detail of itemsArray) {
                  pricingDetailsRows.push({
                    pricingIndex,
                    rowId: detail.RowId ?? null,
                    rowName: detail.RowName ?? null,
                    biPriceGroupInternalId: detail.BIPriceGroupInternalId ?? null,
                    biPriceGroupName: detail.BIPriceGroupName ?? null,
                    displayOrder: detail.DisplayOrder ?? null,
                    type: detail.Type ?? null,
                    value: detail.Value ?? null,
                    pricingDetailsTypeId
                  });
                }
              }
              continue;
            }

            if (key === "PricingNotes" && Array.isArray(value)) {
              for (const note of value) {
                pricingNotesRows.push({
                  pricingIndex,
                  additionalNotes: note.AdditionalNotes ?? null,
                  dateCreated: note.DateCreated ?? null,
                  approvedBy: note.ApprovedBy ?? null,
                  noteType: note.NoteType ?? null
                });
              }
              continue;
            }

            const propertyTypeId = await ensurePropertyType("Pricing");
            const propertyId = await ensureProperty(key, key, propertyTypeId);

            let finalValue;

            if (Array.isArray(value)) {
              finalValue = value.filter(v => v != null).join(", ");
            } else if (typeof value === "object") {
              finalValue = JSON.stringify(value);
            } else {
              finalValue = String(value);
            }

            pricingRecordsRows.push({
              pricingIndex,
              propertyId,
              value: finalValue
            });
          }
        }
      }

      const pricingIds = await bulkInsertPricingHeaders(pricingHeaderRows);

      pricingDetailsRows.forEach(r => {
        r.pricingId = pricingIds[r.pricingIndex];
      });

      pricingRecordsRows.forEach(r => {
        r.pricingId = pricingIds[r.pricingIndex];
      });

      pricingNotesRows.forEach(r => {
        r.pricingId = pricingIds[r.pricingIndex];
      });

      if (pricingDetailsRows.length) {
        await bulkInsertPricingDetails(pricingDetailsRows);
      }

      if (pricingRecordsRows.length) {
        await bulkInsertPricingRecords(pricingRecordsRows);
      }

      if (pricingNotesRows.length) {
        await bulkInsertPricingNotes(pricingNotesRows);
      }
    }
    await pool.query("COMMIT");
    const bomSolveResult = await runBomSolveForTagIds(createdTagIds);
    return { ImportRequestId: requestUuid, bomSolveResultStatus: bomSolveResult.status };
  } catch (err) {
    console.error('[ingestSizingPayload FAULT] Function: ingestSizingPayload');
    console.error('[ingestSizingPayload Error Message]:', err.message);
    console.error('[ingestSizingPayload Stack Trace]:', err.stack);
    try {
      await pool.query("ROLLBACK");
    } catch (rollbackErr) {
      console.error('[ingestSizingPayload Rollback Error]:', rollbackErr.message);
    }
    throw err;
  }
}

// ---------------------- Helper functions -------------------------

async function getOrCreateUserByEmail(userEmailId, fullName, loginName) {
  const normalizedEmail = userEmailId.trim().toLowerCase();

  const existingUser = await pool.query(
    `SELECT "UserId"
    FROM it."Users"
    WHERE LOWER("Email") = $1
    LIMIT 1;
    `,
    [normalizedEmail]
  );

  if (existingUser.rowCount) {
    return existingUser.rows[0].UserId;
  }

  const insertedUser = await pool.query(
    `
    INSERT INTO it."Users" ("Email", "FullName", "LoginName")
    VALUES ($1, $2, $3)
    RETURNING "UserId";
    `,
    [normalizedEmail, fullName, loginName]
  );

  return insertedUser.rows[0].UserId;
}

// Inserts a new ImportRequest record and returns its ID
async function insertImportRequest(createdBy, payload, requestUuid) {
  const { rows } = await pool.query(
    `
    INSERT INTO it."ImportRequests" ("CreatedBy", "Payload", "Uuid", "CreatedAt")
    VALUES ($1, $2::jsonb, $3::uuid, NOW())
    RETURNING "ImportRequestId";
    `,
    [createdBy, JSON.stringify(payload), requestUuid]
  );
  return rows[0].ImportRequestId;
}

// Upsert logic for Company based on CompanyGuid or Name
async function findOrCreateCompany(company) {
  const name = company?.CompanyName ?? null;
  const guid = company?.CompanyGuid ?? null;

  if (!name && !guid) {
    const error = new Error('CompanyName or CompanyGuid is required');
    error.statusCode = 400;
    throw error;
  }

  if (guid) {
    const up = await pool.query(
      `
      INSERT INTO it."Company" ("Name", "CompanyGuid")
      VALUES ($1, $2::uuid)
      ON CONFLICT ("CompanyGuid") DO UPDATE
      SET "Name" = EXCLUDED."Name",
          "CompanyGuid" = EXCLUDED."CompanyGuid"
      RETURNING "CompanyId";
      `,
      [name, guid]
    );
    return up.rows[0].CompanyId;
  } else {
    // No GUID → try by Name first
    const sel = await pool.query(
      `SELECT "CompanyId" FROM it."Company" WHERE "Name" = $1 LIMIT 1;`,
      [name]
    );
    if (sel.rowCount) return sel.rows[0].CompanyId;

    const ins = await pool.query(
      `
      INSERT INTO it."Company" ("Name","CompanyGuid")
      VALUES ($1, NULL)
      RETURNING "CompanyId";
      `,
      [name]
    );
    return ins.rows[0].CompanyId;
  }
}

// Similar logic for Project, but scoped to CompanyId and with ProjectGuid
async function findOrCreateProject(project, companyId) {
  const name = project?.ProjectName ?? null;
  const guid = project?.ProjectGuid ?? null;

  if (!name && !guid) {
    const error = new Error('ProjectName or ProjectGuid is required');
    error.statusCode = 400;
    throw error;
  }

  if (guid) {
    const up = await pool.query(
      `
    INSERT INTO it."Project" ("ProjectGuid", "Name", "CompanyId")
    VALUES ($1::uuid, $2, $3)
    ON CONFLICT ("ProjectGuid") DO UPDATE
      SET "Name" = COALESCE(EXCLUDED."Name", it."Project"."Name"),
          "CompanyId" = EXCLUDED."CompanyId"
    RETURNING "ProjectId";
    `,
      [guid, name, companyId]
    );
    return up.rows[0].ProjectId;
  } else {
    const sel = await pool.query(
      `SELECT "ProjectId" FROM it."Project" WHERE "CompanyId" = $1 AND "Name" = $2 LIMIT 1;`,
      [companyId, name]
    );
    if (sel.rowCount) return sel.rows[0].ProjectId;

    const ins = await pool.query(
      `
      INSERT INTO it."Project" ("Name", "ProjectGuid", "CompanyId")
      VALUES ($1, NULL, $2)
      RETURNING "ProjectId";
      `,
      [name, companyId]
    );
    return ins.rows[0].ProjectId;
  }
}

// Inserts a new Tag revision or creates the first revision if TagGuid is new
async function insertOrBumpTag(tag, projectId, importRequestId) {
  const tagGuid = tag?.TagGuid;
  if (!tagGuid) {
    const error = new Error('TagGuid is required');
    error.statusCode = 400;
    throw error;
  }

  const sizeTagName = tag?.TagName ?? null;
  const catalogCode = tag?.SelectedValves?.map(sv => sv?.CatalogString).filter(cs => cs != null).join(", ") ?? null;
  const quantity = toIntOrNull(tag?.Quantity);
  const tagNumber = tag?.TagNumbers ?? sizeTagName;
  const erpCode = tag?.ERPCode ?? null;

  const sql = `
    WITH lock AS (
      -- Serialize per-TagGuid within the transaction
      SELECT pg_advisory_xact_lock(hashtext($1::text)) AS locked
    ),
    next_rev AS (
      SELECT COALESCE(MAX("RevisionNumber"), 0) + 1 AS rev
      FROM it."Tag"
      WHERE "TagGuid" = $1::uuid
    )
    INSERT INTO it."Tag" (
      "TagGuid","RevisionNumber","ProjectId","Prv2SizeTagName",
      "CatalogCode","Quantity","TagNumber","ErpCode","Status",
      "ErrorCode","ErrorMessage","ImportRequestId"
    )
    SELECT
      $1::uuid, (SELECT rev FROM next_rev), $2, $3,
      $4, $5, $6, $7, 'NEW',
      NULL, NULL, $8
    RETURNING "TagId","RevisionNumber";
  `;

  const params = [
    tagGuid,
    projectId,
    sizeTagName,
    catalogCode,
    quantity,
    tagNumber,
    erpCode,
    importRequestId
  ];

  const { rows } = await pool.query(sql, params);
  if (!rows.length) {
    const error = new Error('Failed to insert tag revision for TagGuid: ' + tagGuid);
    error.statusCode = 400;
    throw error;
  }
  return { tagId: rows[0].TagId };
}

// Bulk insert for TagDetails with dynamic parameterization
async function bulkInsertTagDetails(rows) {
  if (!rows.length) return;

  const values = [];
  const params = [];

  rows.forEach((r) => {
    params.push(r.tagId, r.propertyId, r.unitId, r.value);
    values.push(`($${params.length - 3}, $${params.length - 2}, $${params.length - 1}, $${params.length})`);
  });

  const sql = `
    INSERT INTO it."TagDetails" ("TagId","PropertyId","UnitId","Value")
    VALUES ${values.join(",")};
  `;

  await pool.query(sql, params);
}

// Bulk insert for SelectedValve with dynamic parameterization
async function bulkInsertSelectedValves(rows) {
  if (!rows.length) return [];

  const params = [];
  const values = [];

  rows.forEach((r) => {
    params.push(r.tagId, r.modelId);
    values.push(`($${params.length - 1}, $${params.length})`);
  });

  const sql = `
        INSERT INTO it."SelectedValve" ("TagId","ModelId")
        VALUES ${values.join(",")}
        RETURNING "SelectedValveId"
    `;

  const { rows: dbRows } = await pool.query(sql, params);
  return dbRows.map(r => r.SelectedValveId);
}

// Bulk insert for ConfigDetails based on SelectedValveId and list of SectionChoiceIds
async function bulkInsertConfigDetails(rows) {
  if (!rows.length) return;

  const params = [];
  const values = [];

  rows.forEach((r) => {
    params.push(r.selectedValveId, r.sectionChoiceId);
    values.push(`($${params.length - 1}, $${params.length})`);
  });

  const sql = `
        INSERT INTO it."ConfigDetails"
        ("SelectedValveId","SectionChoiceId")
        VALUES ${values.join(",")}
    `;

  await pool.query(sql, params);
}

async function bulkInsertPricingHeaders(rows) {
  if (!rows.length) return [];

  const params = [];
  const values = [];

  rows.forEach(r => {
    params.push(r.selectedValveId);
    values.push(`($${params.length})`);
  });

  const sql = `
    INSERT INTO it."Pricing" ("SelectedValveId")
    VALUES ${values.join(",")}
    RETURNING "PricingID"
  `;

  const { rows: dbRows } = await pool.query(sql, params);

  return dbRows.map(r => r.PricingID);
}

async function bulkInsertPricingRecords(rows) {
  if (!rows.length) return;

  const params = [];
  const values = [];

  rows.forEach(r => {
    params.push(r.pricingId, r.propertyId, r.value);

    values.push(
      `($${params.length - 2}, $${params.length - 1}, $${params.length})`
    );
  });

  const sql = `
    INSERT INTO it."PricingRecords"
    ("PricingID","PropertyID","Value")
    VALUES ${values.join(",")}
  `;

  await pool.query(sql, params);
}

async function bulkInsertPricingDetails(rows) {
  if (!rows.length) return;
  const params = [];
  const values = [];
  rows.forEach((r) => {
    params.push(
      r.pricingId,
      r.rowId,
      r.rowName,
      r.biPriceGroupInternalId,
      r.biPriceGroupName,
      r.displayOrder,
      r.type,
      r.value,
      r.pricingDetailsTypeId
    );
    values.push(`($${params.length - 8}, $${params.length - 7}, $${params.length - 6}, $${params.length - 5}, $${params.length - 4}, $${params.length - 3}, $${params.length - 2}, $${params.length - 1}, $${params.length})`);
  });

  const sql = `
      INSERT INTO it."PricingDetails" 
      ("PricingID","RowId","RowName","BIPriceGroupInternalId","BIPriceGroupName","DisplayOrder","Type","Value","PricingDetailsTypeID")
      VALUES ${values.join(",")}
    `;

  await pool.query(sql, params);
}

async function getPricingDetailsTypeId(typeName) {
  const res = await pool.query(
    `SELECT "PricingDetailsTypeID"
     FROM it."PricingDetailsType"
     WHERE "PricingDetailsType" = $1`,
    [typeName]
  );
  return res.rows[0]?.PricingDetailsTypeID;
}

async function bulkInsertPricingNotes(rows) {
  if (!rows.length) return;

  const params = [];
  const values = [];

  rows.forEach(r => {
    params.push(
      r.additionalNotes,
      r.dateCreated,
      r.approvedBy,
      r.noteType,
      r.pricingId
    );

    values.push(
      `($${params.length - 4}, $${params.length - 3}, $${params.length - 2}, $${params.length - 1}, $${params.length})`
    );
  });

  const sql = `
    INSERT INTO it."PricingNotes"
    ("AdditionalNotes","DateCreated","ApprovedBy","NoteType","PricingID")
    VALUES ${values.join(",")}
  `;

  await pool.query(sql, params);
}

async function bulkInsertTagSpecialRequirements(rows) {
  if (!rows || !rows.length) return;

  const params = [];
  const values = [];

  rows.forEach((r) => {
    params.push(r.tagId, r.selectedValveId, r.propertyId, r.specialReqId, r.sectionId, r.value, r.comments, r.quantity);
    values.push(`($${params.length - 7}, $${params.length - 6}, $${params.length - 5}, $${params.length - 4}, $${params.length - 3}, $${params.length - 2}, $${params.length - 1}, $${params.length})`);
  });

  const sql = `
    INSERT INTO it."TagSpecialRequirements" ("TagId", "SelectedValveId", "PropertyId", "SpecialReqId", "SectionId", "Value", "Comments", "Quantity")
    VALUES ${values.join(",")};
  `;

  await pool.query(sql, params);
}

// Seeds the PropertyType table with given names if they don't already exist
async function seedPropertyTypes(names = []) {
  if (!names.length) return;
  for (const n of names) {
    await pool.query(
      `
      INSERT INTO it."PropertyType" ("PropertyName")
      SELECT $1::varchar
      WHERE NOT EXISTS (
        SELECT 1 FROM it."PropertyType" WHERE "PropertyName" = $1::varchar
      );
      `,
      [n]
    );
  }
}

// Ensures a PropertyType exists for the given name and returns its ID
async function ensurePropertyType(propertyTypeName) {
  const sel = await pool.query(
    `SELECT "PropertyTypeId"
         FROM it."PropertyType"
         WHERE "PropertyName" = $1`,
    [propertyTypeName]
  );

  if (!sel.rowCount) {
    const error = new Error('PropertyType not found: ' + propertyTypeName);
    error.statusCode = 400;
    throw error;
  }
  return sel.rows[0].PropertyTypeId;
}

// Ensures a Property exists for the given key, name, and propertyTypeId
async function ensureProperty(key, name, propertyTypeId) {

  if (!propertyTypeId) {
    propertyTypeId = await ensurePropertyType("ApplicationRequirements");
  }

  const sel = await pool.query(`
    SELECT "PropertyId"
    FROM it."Property"
    WHERE "Key" = $1 AND "PropertyTypeId" = $2
    LIMIT 1;
  `, [key, propertyTypeId]);

  if (sel.rowCount) return sel.rows[0].PropertyId;

  try {
    const ins = await pool.query(`
      INSERT INTO it."Property" ("Key","Name","PropertyTypeId")
      VALUES ($1,$2,$3)
      RETURNING "PropertyId"
    `, [key, name, propertyTypeId]);

    return ins.rows[0].PropertyId;
  } catch (e) {
    // retry select on duplicate
    const retry = await pool.query(`
      SELECT "PropertyId"
      FROM it."Property"
      WHERE "Key" = $1 AND "PropertyTypeId" = $2
      LIMIT 1;
    `, [key, propertyTypeId]);

    return retry.rows[0].PropertyId;
  }
}

// Ensures a Unit exists for the given name and value, returns its ID
async function ensureUnit(unitName) {
  if (unitName == null) return null;

  const sel = await pool.query(
    `
    SELECT "UnitId"
    FROM it."UnitTable"
    WHERE "UnitName" = $1
    LIMIT 1;
    `,
    [unitName]
  );
  if (sel.rowCount) return sel.rows[0].UnitId;
}

// Utility to check if a unit is a percentage type and map the value accordingly
async function mapPercentageSizingValue(key, name, rawValue) {
  const value =
    typeof rawValue === 'number'
      ? rawValue
      : toNumericOrNull(
        typeof rawValue === 'string'
          ? rawValue.replace('%', '').trim()
          : rawValue
      );

  const propertyTypeId = await ensurePropertyType('ApplicationRequirements');
  const propertyId = await ensureProperty(key, name, propertyTypeId);

  return {
    propertyId,
    unitId: null,
    value
  };
}

// Retrieves UnitId based on unit name and maps it to a PropertyTypeId for categorization
async function getPropertyTypeFromUnit(unit) {
  if (!unit) {
    return await ensurePropertyType("ApplicationRequirements");
  }

  const sql = `
    SELECT "UnitName"
    FROM it."UnitTable"
    WHERE "UnitName" = $1
    LIMIT 1;
  `;

  const { rows } = await pool.query(sql, [unit]);

  if (!rows.length) {
    console.warn(`Unit not found in UnitTable for unit: ${unit}`);
    return null;
  }

  const category = unit.split('.')[0].toLowerCase();

  const CATEGORY_TO_PROPERTY = {
    absolutepressure: "Pressure",
    pressure: "Pressure",
    temp: "Temperature",
    temperature: "Temperature",
    flowrate: "FlowCapacity",
    massflowrate: "FlowCapacity",
    area: "ApplicationRequirements",
    length: "ApplicationRequirements",
    discharge: "ApplicationRequirements"
  };

  const propertyTypeName = CATEGORY_TO_PROPERTY[category] ?? "ApplicationRequirements";

  return await ensurePropertyType(propertyTypeName);
}

async function runBomSolveForTagIds(tagIds) {
  if (!Array.isArray(tagIds) || tagIds.length === 0) {
    return {
      status: "Skipped",
      reason: "No tag IDs found"
    };
  }

  const bomDataByTagIds = await getConfigitCodeByTagIds(tagIds);

  const solvePromises = [];

  for (const tagId of bomDataByTagIds.keys()) {
    const selectedValveData = bomDataByTagIds.get(tagId);

    for (const selectedValveId of selectedValveData.keys()) {
      const { packagePath, ...bomData } = selectedValveData.get(selectedValveId);

      solvePromises.push(
        bomSolveResult(bomData, packagePath, selectedValveId)
      );
    }
  }

  await Promise.all(solvePromises);

  return {
    status: "Completed",
  };
}

// Utility to convert a value to an integer or return null if it's not a valid integer
function toIntOrNull(v) {
  if (v == null) return null;
  const n = Number(v);
  return Number.isInteger(n) ? n : null;
}

// Utility to convert a value to a number or return null if it's not a valid number
function toNumericOrNull(v) {
  if (v == null || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function isPercentageUnit(unit) {
  if (!unit) return false;
  const u = unit.toLowerCase();
  return (
    u === '%' ||
    u === 'percentage' ||
    u === 'percentage.%' ||
    u === 'percentage.decimal'
  );
}

module.exports = { ingestSizingPayload };