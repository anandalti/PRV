const {
  requiredSheets,
  revisionLogRequiredColumns,
  tabIndexRequiredColumns,
  errorMessages,
  AcSum_Rules,
  MATERIAL_SHEET_NOT_HEADERS,
} = require("./constants.js");
const ExcelJS = require("exceljs");
const { Readable } = require("stream");
const { pool } = require("../../db/pgsqldb.js");
const {
  sql,
  pool: mssqlpool,
  poolConnect,
} = require("../../db/prdprmmssql.js");
const { executeQuery } = require("../../db/prdprmFunctions.js");
const e = require("express");

const STREAM_READER_OPTIONS = {
  worksheets: "emit",
  sharedStrings: "cache",
  hyperlinks: "ignore",
  styles: "ignore",
};

const streamCellToDisplayValue = (cell) => {
  if (cell === null || cell === undefined || cell === "") {
    return null;
  }
  if (cell instanceof Date) {
    return cell;
  }
  if (typeof cell === "number" || typeof cell === "boolean") {
    return cell;
  }
  if (typeof cell === "string") {
    return cell;
  }
  if (typeof cell === "object" && cell !== null) {
    if ("result" in cell) {
      const r = cell.result;
      return r === undefined ? null : r;
    }
    if (Array.isArray(cell.richText)) {
      return cell.richText.map((t) => t.text ?? "").join("");
    }
    if (
      cell.text !== undefined &&
      cell.text !== null &&
      String(cell.text).trim() !== ""
    ) {
      return cell.text;
    }
  }
  return cell;
};

const rowValuesToArray = (values) => {
  if (!values || !Array.isArray(values)) {
    return [];
  }
  const arr = [];
  for (let i = 1; i < values.length; i += 1) {
    const v = streamCellToDisplayValue(values[i]);
    arr.push(typeof v === "string" ? v.trim() : v);
  }
  return arr;
};

const collectWorksheetRows = async (worksheetReader) => {
  const rows = [];
  for await (const row of worksheetReader) {
    rows.push(rowValuesToArray(row.values));
  }
  return rows;
};

const drainWorksheet = async (worksheetReader) => {
  for await (const _row of worksheetReader) {
    // discard row
  }
};

const listWorkbookSheetNames = async (fileBuffer) => {
  const stream = Readable.from(fileBuffer);
  const reader = new ExcelJS.stream.xlsx.WorkbookReader(
    stream,
    STREAM_READER_OPTIONS,
  );
  const names = [];
  for await (const worksheetReader of reader) {
    names.push(worksheetReader.name);
    await drainWorksheet(worksheetReader);
  }
  return names;
};

/** Stream-read only selected worksheets; others are drained without retaining rows. */
const readSheetsFromBufferStreaming = async (fileBuffer, sheetNames) => {
  const want = new Set(
    (sheetNames instanceof Set ? [...sheetNames] : (sheetNames ?? [])).map(
      (name) => String(name).trim().toLowerCase(),
    ),
  );
  const stream = Readable.from(fileBuffer);
  const reader = new ExcelJS.stream.xlsx.WorkbookReader(
    stream,
    STREAM_READER_OPTIONS,
  );
  const sheets = {};

  for await (const worksheetReader of reader) {
    const name = worksheetReader.name;
    const lowerName = String(name).trim().toLowerCase();
    if (want.has(lowerName)) {
      sheets[name] = await collectWorksheetRows(worksheetReader);
    } else {
      await drainWorksheet(worksheetReader);
    }
  }
  return sheets;
};

const getMaterialTabNamesFromTabIndex = (tabData = []) => {
  const startIndex = tabData.findIndex((row) =>
    row.some((cell) => matchesMarker(cell, "#START")),
  );
  const endIndex = tabData.findIndex((row) =>
    row.some((cell) => matchesMarker(cell, "#FINISH")),
  );
  if (startIndex === -1 || endIndex === -1) {
    return [];
  }
  return tabData
    .slice(startIndex + 2, endIndex)
    .map(trimTrailingNulls)
    .filter(([, type]) => ["M", "O"].includes(type))
    .map(([tabName]) => (tabName == null ? "" : String(tabName).trim()))
    .filter((name) => name !== "");
};

const cellToDisplayValue = (cell) => {
  if (!cell) {
    return null;
  }
  const value = cell.value;
  if (value === null || value === undefined) {
    return null;
  }
  const text = cell.text;
  if (text !== undefined && text !== null && String(text).trim() !== "") {
    return text;
  }
  if (value instanceof Date) {
    return value;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return value;
  }
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "object" && value !== null && "result" in value) {
    const r = value.result;
    return r === undefined ? null : r;
  }
  return null;
};

const parseSheetRows = (worksheet) => {
  const maxRow = worksheet.rowCount;
  const maxCol = worksheet.columnCount;
  const rows = [];
  for (let r = 1; r <= maxRow; r++) {
    const row = worksheet.getRow(r);
    const arr = [];
    for (let c = 1; c <= maxCol; c++) {
      arr.push(cellToDisplayValue(row.getCell(c)));
    }
    rows.push(arr);
  }

  return rows.map((row) =>
    Array.isArray(row)
      ? row.map((cell) => (typeof cell === "string" ? cell.trim() : cell))
      : row,
  );
};

const normalizeHeaderCell = (cell) => {
  if (cell === null || cell === undefined || cell === "") {
    return null;
  }
  return String(cell).trim().toLowerCase();
};

const findMissingHeaderColumns = (headerRow, requiredColumns) => {
  const present = new Set(
    (headerRow ?? [])
      .map(normalizeHeaderCell)
      .filter((h) => h !== null && h !== ""),
  );
  return requiredColumns.filter(
    (name) => !present.has(normalizeHeaderCell(name)),
  );
};

const trimTrailingNulls = (row) => {
  if (!Array.isArray(row)) {
    return row;
  }

  let lastIndex = -1;
  for (let i = 0; i < row.length; i += 1) {
    const cell = row[i];
    if (cell !== null && cell !== undefined && String(cell).trim() !== "") {
      lastIndex = i;
    }
  }

  return lastIndex === -1 ? [] : row.slice(0, lastIndex + 1);
};

const parseExpectedHeaders = (headerInput) => {
  if (!headerInput) {
    return null;
  }

  if (Array.isArray(headerInput)) {
    if (
      headerInput.length > 0 &&
      typeof headerInput[0] === "object" &&
      headerInput[0] !== null &&
      ("Abbr" in headerInput[0] || "abbr" in headerInput[0])
    ) {
      const seen = new Set();
      const out = [];
      for (const r of headerInput) {
        const a = (r.Abbr ?? r.abbr ?? "").toString().trim();
        if (!a) {
          continue;
        }
        const lower = a.toLowerCase();
        if (!seen.has(lower)) {
          seen.add(lower);
          out.push(a);
        }
      }
      return out.length ? out : null;
    }
    return headerInput
      .map((header) => (header || "").toString().trim())
      .filter((header) => header !== "");
  }

  if (typeof headerInput === "string") {
    return headerInput
      .split(",")
      .map((header) => header.trim())
      .filter((header) => header !== "");
  }

  return null;
};

const isSapOrOracleHeader = (name) =>
  MATERIAL_SHEET_NOT_HEADERS.has(String(name).trim().toLowerCase());

const isMaterialSheetIgnoredHeader = (name) =>
  MATERIAL_SHEET_NOT_HEADERS.has(String(name).trim().toLowerCase());

const buildCcodeOutputToInputMap = (ccodes) =>
  new Map(
    ccodes.map((c) => [
      String(c.output).trim(),
      {
        inputs: c.inputs || [],
      },
    ]),
  );
const buildAllowedHeaderLowerSet = (expectedHeaders, ccodes) => {
  const allowed = new Set();
  const expectedForDbCompare = (expectedHeaders ?? []).filter(
    (header) => !isSapOrOracleHeader(header),
  );
  for (const header of expectedForDbCompare) {
    allowed.add(String(header).trim().toLowerCase());
  }
  for (const c of ccodes ?? []) {
    allowed.add(c.output.toLowerCase());
    for (const input of c.inputs || []) {
      allowed.add(input.toLowerCase());
    }
  }
  return allowed;
};

const isHeaderAllowed = (header, allowedLowerSet, outputToInputMap) => {
  const trimmed = String(header).trim();
  const lower = trimmed.toLowerCase();
  if (allowedLowerSet.has(lower)) {
    return true;
  }
  const mapped = outputToInputMap.get(trimmed);

  if (!mapped) return false;

  return mapped.inputs.some((inp) => allowedLowerSet.has(inp.toLowerCase()));
};

const validateSheetHeaders = (
  headerRow,
  expectedHeaders,
  sheetName,
  ccodes = [],
) => {
  const errors = [];
  const actualHeaders = (headerRow ?? [])
    .map((cell) =>
      cell === null || cell === undefined ? "" : String(cell).trim(),
    )
    .filter((value) => value !== "");

  const allowedLowerSet = buildAllowedHeaderLowerSet(expectedHeaders, ccodes);
  const outputToInputMap = buildCcodeOutputToInputMap(ccodes);
  const actualLowerSet = new Set(
    actualHeaders.map((header) => String(header).trim().toLowerCase()),
  );
  const invalidHeaders = actualHeaders.filter((header) => {
    if (isSapOrOracleHeader(header) || isMaterialSheetIgnoredHeader(header)) {
      return false;
    }
    return !isHeaderAllowed(header, allowedLowerSet, outputToInputMap);
  });

  const erpMissing = ["SAP", "Oracle"].filter(
    (name) => !actualLowerSet.has(name.toLowerCase()),
  );
  if (erpMissing.length > 0) {
    errors.push(errorMessages.sapOracleHeadersMissing(sheetName, erpMissing));
  }
  if (invalidHeaders.length > 0) {
    errors.push(errorMessages.invalidHeaderInSheet(sheetName, invalidHeaders));
  }
  return { errors, actualHeaders };
};
const matchesMarker = (cell, marker) => {
  if (cell === null || cell === undefined) return false;
  return String(cell).trim().toUpperCase() === marker;
};

const getSheetDataByName = (workbook, sheetName) => {
  if (!workbook || sheetName == null) return undefined;
  if (workbook[sheetName]) return workbook[sheetName];

  const desired = String(sheetName).trim().toLowerCase();
  const actualKey = Object.keys(workbook).find(
    (name) => String(name).trim().toLowerCase() === desired,
  );
  return actualKey ? workbook[actualKey] : undefined;
};

const findMarkerColumnIndex = (row, marker) => {
  if (!Array.isArray(row)) return -1;
  return row.findIndex((cell) => matchesMarker(cell, marker));
};

const isBlankDataCell = (value) =>
  value === null ||
  value === undefined ||
  (typeof value === "string" && value.trim() === "");

const validateBlankCellsBetweenMarkers = (
  sheetName,
  indData,
  startIdx,
  endIdx,
  colFrom,
  colTo,
) => {
  const blankErrors = [];
  if (endIdx <= startIdx + 2) {
    return blankErrors;
  }

  const headerSlice =
    (indData[startIdx + 1] ?? []).slice(colFrom, colTo + 1) ?? [];

  const columnsToCheck = [];
  for (let i = 0; i < headerSlice.length; i += 1) {
    const h = headerSlice[i];
    if (!isBlankDataCell(h)) {
      columnsToCheck.push({
        offset: i,
        excelColumnNumber: colFrom + i + 1,
        headerName: String(h).trim(),
      });
    }
  }

  for (let rowIdx = startIdx + 2; rowIdx < endIdx; rowIdx += 1) {
    const row = indData[rowIdx] ?? [];
    for (const { offset, excelColumnNumber, headerName } of columnsToCheck) {
      const absCol = colFrom + offset;
      const cell = row[absCol];
      if (isBlankDataCell(cell)) {
        blankErrors.push(
          errorMessages.sheetNullValueInHeader(
            sheetName,
            headerName,
            excelColumnNumber,
          ),
        );
      }
    }
  }

  return blankErrors;
};

const validateWorkbook = async (fileBuffer, expectedHeaderInput) => {
  const errors = [];
  const sheetData = {};
  const expectedHeaders = parseExpectedHeaders(expectedHeaderInput);
  const allSheetNames = await listWorkbookSheetNames(fileBuffer);
  const sheetNameMap = new Map(
    allSheetNames.map((name) => [name.toLowerCase(), name]),
  );

  const sheetNames = new Set(allSheetNames.map((n) => n.toLowerCase()));
  requiredSheets.forEach((sheet) => {
    if (!sheetNames.has(sheet.toLowerCase())) {
      errors.push(errorMessages.missingRequiredSheet(sheet));
    }
  });

  const coreSheetNames = [...requiredSheets, "CCodes"]
    .map((name) => sheetNameMap.get(name.toLowerCase()))
    .filter(Boolean);

  const coreSheets = await readSheetsFromBufferStreaming(
    fileBuffer,
    new Set(coreSheetNames),
  );
  const ccodes = coreSheets["CCodes"] ? parsecCodes(coreSheets["CCodes"]) : [];

  const revisionRows = coreSheets["Revision Log"];
  if (revisionRows) {
    const startIndex = revisionRows.findIndex((row) =>
      row.some((cell) => matchesMarker(cell, "#START")),
    );
    const endIndex = revisionRows.findIndex((row) =>
      row.some((cell) => matchesMarker(cell, "#FINISH")),
    );
    if (startIndex === -1) {
      errors.push(`sheet "Revision Log" #START missing`);
    }
    if (endIndex === -1) {
      errors.push(`sheet "Revision Log" #FINISH missing`);
    }
    if (startIndex !== -1 && endIndex !== -1) {
      const headerRow = revisionRows[startIndex + 1] ?? [];
      const missingRevisionCols = findMissingHeaderColumns(
        headerRow,
        revisionLogRequiredColumns,
      );
      if (missingRevisionCols.length > 0) {
        errors.push(
          errorMessages.revisionLogMissingHeaderColumns(missingRevisionCols),
        );
      }
    }
  }
  const tabData = coreSheets["TAB INDEX"];
  if (!tabData) {
    errors.push(errorMessages.tabIndexSheetMissing);
    return { errors, sheetData };
  }
  const startIndex = tabData.findIndex((row) =>
    row.some((cell) => matchesMarker(cell, "#START")),
  );
  const endIndex = tabData.findIndex((row) =>
    row.some((cell) => matchesMarker(cell, "#FINISH")),
  );
  if (startIndex === -1) {
    errors.push(errorMessages.tabIndexStartMissing);
  }
  if (endIndex === -1) {
    errors.push(errorMessages.tabIndexFinishMissing);
  }

  if (startIndex !== -1 && endIndex !== -1) {
    const headers = tabData[startIndex + 1] ?? [];
    const missingTabIndexCols = findMissingHeaderColumns(
      headers,
      tabIndexRequiredColumns,
    );
    if (missingTabIndexCols.length > 0) {
      errors.push(
        errorMessages.tabIndexMissingHeaderColumns(missingTabIndexCols),
      );
    }

    const tabRows = tabData
      .slice(startIndex + 2, endIndex)
      .map(trimTrailingNulls)
      .filter(([, type]) => ["M", "O"].includes(type));

    tabRows.forEach(([tabName]) => {
      if (!sheetNames.has(tabName.toLowerCase())) {
        errors.push(errorMessages.referencedSheetMissing(tabName));
      }
    });

    const materialTabNames = getMaterialTabNamesFromTabIndex(tabData);
    const actualMaterialSheetNames = materialTabNames
      .map((name) => sheetNameMap.get(name.toLowerCase()))
      .filter(Boolean); // remove unmatched

    const materialSheets = await readSheetsFromBufferStreaming(
      fileBuffer,
      new Set(actualMaterialSheetNames),
    );

    tabRows.forEach((tabRow) => {
      const sheetName = tabRow[0];
      const actualName = sheetNameMap.get(sheetName.toLowerCase());
      const indData = actualName ? materialSheets[actualName] : undefined;
      if (!indData) {
        return;
      }
      const startIndex = indData.findIndex((row) =>
        row.some((cell) => matchesMarker(cell, "#START")),
      );
      const endIndex = indData.findIndex((row) =>
        row.some((cell) => matchesMarker(cell, "#FINISH")),
      );
      if (startIndex === -1) {
        errors.push(errorMessages.sheetStartMissing(sheetName));
      }
      if (endIndex === -1) {
        errors.push(errorMessages.sheetFinishMissing(sheetName));
      }
      if (expectedHeaders && startIndex !== -1 && endIndex !== -1) {
        const startMarkerRow = indData[startIndex] ?? [];
        const finishMarkerRow = indData[endIndex] ?? [];
        const startCol = findMarkerColumnIndex(startMarkerRow, "#START");
        const finishCol = findMarkerColumnIndex(finishMarkerRow, "#FINISH");

        if (startCol === -1 || finishCol === -1) {
          const headerRow = indData[startIndex + 1] ?? [];
          const { errors: headerErrors } = validateSheetHeaders(
            headerRow,
            expectedHeaders,
            sheetName,
            ccodes,
          );
          errors.push(...headerErrors);
        } else {
          const colFrom = Math.min(startCol, finishCol);
          const colTo = Math.max(startCol, finishCol);
          const fullHeaderRow = indData[startIndex + 1] ?? [];
          const headerRow = fullHeaderRow.slice(colFrom, colTo + 1);
          const dataRows = indData
            .slice(startIndex + 2, endIndex)
            .map((row) =>
              Array.isArray(row) ? row.slice(colFrom, colTo + 1) : row,
            );
          const { errors: headerErrors, actualHeaders } = validateSheetHeaders(
            headerRow,
            expectedHeaders,
            sheetName,
            ccodes,
          );
          errors.push(...headerErrors);
          errors.push(
            ...validateBlankCellsBetweenMarkers(
              sheetName,
              indData,
              startIndex,
              endIndex,
              colFrom,
              colTo,
            ),
          );
          if (headerErrors.length === 0 && endIndex > startIndex) {
            sheetData[sheetName] = {
              headers: actualHeaders,
              rowCount: dataRows.length,
            };
          }
        }
      }
    });
  }
  return { errors, sheetData };
};
const EXPECTED_HEADERS = "expected_headers";
const getExpectedHeaders = async (productFamilyName) => {
  const trimmed =
    productFamilyName == null ? "" : String(productFamilyName).trim();
  if (!trimmed) {
    return null;
  }
  const poolClient = await pool.connect();
  try {
    await poolClient.query("BEGIN");
    await poolClient.query(
      `CALL ca.get_expected_headers_proc($1, '${EXPECTED_HEADERS}')`,
      [trimmed],
    );
    const { rows } = await poolClient.query(
      `FETCH ALL FROM ${EXPECTED_HEADERS}`,
    );
    await poolClient.query("COMMIT");
    return rows;
  } catch (err) {
    await poolClient.query("ROLLBACK").catch(() => {});
    console.error("Error fetching expected headers from database", err);
    throw err;
  } finally {
    poolClient.release();
  }
};
const getExistingRevisionLogs = async (client, productFamilyId) => {
  const { rows } = await client.query(
    `SELECT * FROM ca.get_revision_logs_proc($1::int)`,
    [productFamilyId],
  );
  return rows.map((r) => ({
    revisionDate: normalizeRevisionDate(r.revisionDate),
    revisionRev: r.revisionRev || null,
    revisionDescription: r.revisionDescription || null,
    approvalDate: r.approvalDate || null,
  }));
};

const normalizeRevisionRow = (r) => ({
  revisionDate: (r.revisionDate ?? "").toString().trim().toLowerCase() || null,
  revisionRev: (r.revisionRev ?? "").toString().trim().toLowerCase() || null,
  revisionDescription:
    (r.revisionDescription ?? "").toString().trim().toLowerCase() || null,
  approvalDate: (r.approvalDate ?? "").toString().trim().toLowerCase() || null,
});

const areRevisionLogsEqual = (existing, incoming) => {
  if (existing.length !== incoming.length) return false;

  const normExisting = existing.map(normalizeRevisionRow);
  const normIncoming = incoming.map(normalizeRevisionRow);

  const sortFn = (a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b));

  normExisting.sort(sortFn);
  normIncoming.sort(sortFn);

  return JSON.stringify(normExisting) === JSON.stringify(normIncoming);
};

const validateFiles = async (req, res) => {
  let uploadedFiles = [];
  if (Array.isArray(req.files) && req.files.length) {
    uploadedFiles = req.files;
  } else if (req.file) {
    uploadedFiles = [req.file];
  } else {
    uploadedFiles = [];
  }

  if (!uploadedFiles.length) {
    return res.status(400).json({
      status: "error",
      message: errorMessages.noFileUploaded,
      results: [],
    });
  }

  const results = [];
  for (const file of uploadedFiles) {
    const { name: productFamilyName } = getNameSapNO(file.originalname);
    const prefixErrors = [];

    if (!productFamilyName || !String(productFamilyName).trim()) {
      prefixErrors.push(errorMessages.uploadFileNameMissingProductFamily);
    }

    let expectedHeaderInput = null;
    if (productFamilyName && String(productFamilyName).trim()) {
      try {
        expectedHeaderInput = await getExpectedHeaders(productFamilyName);
      } catch (e) {
        prefixErrors.push(`failed to load expected headers: ${e.message}`);
      }
    }
    if (
      productFamilyName &&
      String(productFamilyName).trim() &&
      Array.isArray(expectedHeaderInput) &&
      expectedHeaderInput.length === 0
    ) {
      prefixErrors.push(
        errorMessages.modelDetailsNotFound(String(productFamilyName).trim()),
      );
    }
    const { errors, sheetData } = await validateWorkbook(
      file.buffer,
      expectedHeaderInput,
    );
    results.push({
      fileName: file.originalname,
      errors: [...prefixErrors, ...errors],
      sheetData,
    });
  }

  return res.json({
    status: "ok",
    data: results,
  });
};

const extractWorkbookPayload = async (fileBuffer) => {
  const allSheetNames = await listWorkbookSheetNames(fileBuffer);
  const sheetNameMap = new Map(
    allSheetNames.map((name) => [name.toLowerCase(), name]),
  );
  const coreSheetNames = [...requiredSheets, "CCodes"]
    .map((name) => sheetNameMap.get(name.toLowerCase()))
    .filter(Boolean);
  const coreSheets = await readSheetsFromBufferStreaming(
    fileBuffer,
    new Set(coreSheetNames),
  );
  const tabData = coreSheets["TAB INDEX"];
  const materialTabNames = getMaterialTabNamesFromTabIndex(tabData ?? []);
  if (!materialTabNames.length) {
    return { ...coreSheets };
  }
  const actualMaterialSheetNames = materialTabNames
    .map((name) => sheetNameMap.get(name.toLowerCase()))
    .filter(Boolean);
  const materialSheets = await readSheetsFromBufferStreaming(
    fileBuffer,
    new Set(actualMaterialSheetNames),
  );
  return { ...coreSheets, ...materialSheets };
};

const normalizeRevisionDate = (value) => {
  if (value == null || value === "") return null;
  return String(value).trim(); //  keep as string
};
function excelDateToJSDate(value) {
  if (value == null || value === "") return null;

  //  If already string → return trimmed
  if (typeof value === "string") {
    return value.trim();
  }
  //  If number → convert Excel serial
  if (typeof value === "number") {
    const utc_days = Math.floor(value - 25569);
    const utc_value = utc_days * 86400;
    const date_info = new Date(utc_value * 1000);
    const day = String(date_info.getUTCDate()).padStart(2, "0");
    const month = String(date_info.getUTCMonth() + 1).padStart(2, "0");
    const year = date_info.getUTCFullYear();
    return `${day}-${month}-${year}`;
  }
  return String(value).trim();
}
const buildRevisionLogRows = (revisionLogSheetRows = []) => {
  const rows = [];
  const startIndex = revisionLogSheetRows.findIndex((row) =>
    row.some((cell) => matchesMarker(cell, "#START")),
  );

  const finishIndex = revisionLogSheetRows.findIndex((row) =>
    row.some((cell) => matchesMarker(cell, "#FINISH")),
  );

  // Safety check
  if (startIndex === -1 || finishIndex === -1) {
    return rows;
  }
  for (let i = startIndex + 2; i < finishIndex; i++) {
    const row = revisionLogSheetRows[i] ?? [];
    const revisionDate = excelDateToJSDate(row[0]);
    const revisionRev =
      row[1] == null || row[1] === "" ? null : String(row[1]).trim();
    const revisionDescription =
      row[2] == null || row[2] === "" ? null : String(row[2]).trim();
    const approvalDate =
      row[3] == null || row[3] === "" ? null : String(row[3]).trim();
    const isEmptyRow =
      !revisionDate && !revisionRev && !revisionDescription && !approvalDate;
    if (isEmptyRow) continue;

    rows.push({
      revisionDate,
      revisionRev,
      revisionDescription,
      approvalDate,
    });
  }
  return rows;
};

const builProductMaterialRows = async (sheetData, workbook, ccodes) => {
  const startIndexR = sheetData.findIndex((row) =>
    row.some((cell) => matchesMarker(cell, "#START")),
  );
  const finishIndexR = sheetData.findIndex((row) =>
    row.some((cell) => matchesMarker(cell, "#FINISH")),
  );

  const startIndexC = findMarkerColumnIndex(sheetData[startIndexR], "#START");
  const finishIndexC = findMarkerColumnIndex(
    sheetData[finishIndexR],
    "#FINISH",
  );

  if (
    startIndexR === -1 ||
    finishIndexR === -1 ||
    startIndexC === -1 ||
    finishIndexC === -1
  ) {
    console.warn("Invalid markers in TAB INDEX:", sheetData);
    return [];
  }
  const rows = sheetData
    .slice(startIndexR + 2, finishIndexR)
    .map((row) => row.slice(startIndexC, finishIndexC + 1))
    .filter(([, type]) => ["M", "O"].includes(type))
    .map((ele) => ({
      ProductMaterialTabName: ele[0],
      ProductMaterialType: ele[1],
      IncludeOnlyWith: ele[2] || "ALL",
    }));

  const rowsWithHeaders = await Promise.all(
    rows.map(async (row) => ({
      ...row,
      Header: getSheetHeaderValue(workbook, row.ProductMaterialTabName, ccodes),
    })),
  );

  return rowsWithHeaders;
};

const getSheetHeaderValue = (workbook, sheetName, ccodes) => {
  const sheetData = getSheetDataByName(workbook, sheetName);
  if (!sheetData) return [];

  const topRow = sheetData.find((row) =>
    row.some((cell) => matchesMarker(cell, "#START")),
  );
  const lastRow = sheetData.find((row) =>
    row.some((cell) => matchesMarker(cell, "#FINISH")),
  );

  const finishIndexC = findMarkerColumnIndex(lastRow, "#FINISH");

  const headerRow = sheetData[sheetData.indexOf(topRow) + 1]
    .slice(0, finishIndexC + 1)
    .filter((h) => h !== null && h !== undefined && h !== "");
  const filteredHeader = headerRow.filter((h) => {
    const lower = String(h).trim().toLowerCase();
    if (lower === "acsum") {
      return true;
    }
    return !isMaterialSheetIgnoredHeader(h);
  });
  const mappingMap = buildCcodeOutputToInputMap(ccodes);
  const mappedHeaders = filteredHeader.flatMap((header) => {
    const trimmed = String(header).trim();
    const mapping = mappingMap.get(trimmed);

    if (!mapping) {
      return [trimmed];
    }

    return mapping.inputs;
  });
  return [...new Set(mappedHeaders)];
};

const findOrCreateProductFamily = async (client, name, sapno, family_date) => {
  const existing = await client.query(
    `SELECT "ProductFamilyId"
     FROM ca."ProductFamily"
     WHERE "ProductFamilySap" = $1
        AND "ProductFamilyName" = $2 AND $2 IS NOT NULL
     LIMIT 1`,
    [sapno, name],
  );

  if (existing.rowCount) {
    await client.query(
      `UPDATE ca."ProductFamily"
       SET "Product_date" = $1
       WHERE "ProductFamilyId" = $2`,
      [family_date, existing.rows[0].ProductFamilyId],
    );
    return existing.rows[0].ProductFamilyId;
  }

  // Use stored procedure to insert and get OUT param
  const result = await client.query(
    "CALL ca.insert_product_family($1, $2, $3, $4)",
    [name, sapno, family_date, null],
  );
  return result.rows[0].p_product_family_id;
};

const isFileAlreadyUploaded = async (sapno, name, family_date) => {
  const duplicateCheck = await pool.query(
    `SELECT 1
     FROM ca."ProductFamily"
     WHERE "ProductFamilySap" = $1
        AND "ProductFamilyName" = $2 AND $2 IS NOT NULL
     LIMIT 1`,
    [sapno, name],
  );

  return duplicateCheck.rowCount > 0;
};

function transposeCharecters(inp, ccodes) {
  const groupMap = Object.fromEntries(
    (ccodes || []).map((c) => [String(c.output).trim(), c]),
  );

  const result = {};

  for (const [key, values] of Object.entries(inp)) {
    const mapping = groupMap[key];
    // Not a CCodes field → keep as-is
    if (!mapping) {
      result[key] = Array.isArray(values) ? [...values] : values;
      continue;
    }

    const { inputs = [], combinations = [] } = mapping;

    // Create output arrays
    inputs.forEach((inputName) => {
      if (!result[inputName]) {
        result[inputName] = [];
      }
    });
    const searchValues = Array.isArray(values) ? values : [values];
    for (const selectedValue of searchValues) {
      for (const row of combinations) {
        const outputValue = String(row[0]);
        if (outputValue !== String(selectedValue)) {
          continue;
        }
        inputs.forEach((inputName, idx) => {
          const mappedValue = row[idx + 1];
          if (
            mappedValue !== null &&
            mappedValue !== undefined &&
            mappedValue !== ""
          ) {
            result[inputName].push(String(mappedValue));
          }
        });
      }
    }
    // Remove duplicates
    inputs.forEach((inputName) => {
      result[inputName] = [...new Set(result[inputName])];
    });
  }

  return result;
}

function transformMaterials(input, ccodes) {
  const codeLookup = {};

  // Build lookup
  ccodes.forEach(({ output, inputs = [], combinations = [] }) => {
    const valueMaps = inputs.map(() => ({}));

    combinations.forEach((row) => {
      const grpValue = String(row[0]);

      inputs.forEach((inputName, idx) => {
        const inputValue = row[idx + 1];

        if (inputValue == null || inputValue === "") {
          return;
        }

        if (!valueMaps[idx][grpValue]) {
          valueMaps[idx][grpValue] = [];
        }

        valueMaps[idx][grpValue].push(String(inputValue));
      });
    });

    // Remove duplicates while building lookup
    valueMaps.forEach((map) => {
      Object.keys(map).forEach((key) => {
        map[key] = [...new Set(map[key])];
      });
    });

    codeLookup[String(output).trim()] = {
      inputs,
      valueMaps,
    };
  });

  //  Transform input
  return input.map((item) => ({
    ...item,
    MaterialCharecterictics: item.MaterialCharecterictics.map((char) => {
      const newChar = {};

      Object.entries(char).forEach(([key, value]) => {
        const mapping = codeLookup[String(key).trim()];

        // Not a CCode column → keep as-is
        if (!mapping) {
          if (!newChar[key]) {
            newChar[key] = [];
          }
          if (value != null && value !== "") {
            newChar[key].push(String(value));
          }

          return;
        }
        const lookupValue = String(value).trim();
        mapping.inputs.forEach((inputName, idx) => {
          const vals = mapping.valueMaps[idx][lookupValue] || [lookupValue];
          if (!newChar[inputName]) {
            newChar[inputName] = [];
          }
          newChar[inputName].push(...vals);
        });
      });

      // Remove duplicates
      Object.keys(newChar).forEach((k) => {
        newChar[k] = [...new Set(newChar[k])];
      });

      return newChar;
    }),
  }));
}

const insertMaterialMapping = async (client, final, ccodes) => {
  if (!final.length) return [];

  const result = transformMaterials(final, ccodes);
  const payload = result.map((item) => ({
    ProductMaterialId: item.ProductMaterialId,
    MaterialCharecterictics: item.MaterialCharecterictics,
    MaterialSapNumber: item.MaterialSapNumber,
    MaterialOracleNumber: item.MaterialOracleNumber,
    MaterialExpression: "",
  }));
  await client.query(`CALL ca.insert_material_mapping($1)`, [
    JSON.stringify(payload),
  ]);
  return result;
};

const insertProductMaterial = async (
  client,
  productFamilyId,
  productMaterialRows,
) => {
  if (!productMaterialRows.length) return [];

  const { rows } = await client.query(
    `SELECT * 
     FROM ca.insert_product_material_fn($1, $2::jsonb)`,
    [productFamilyId, JSON.stringify(productMaterialRows)],
  );
  return rows;
};

const insertRevisionLogs = async (client, productFamilyId, revisionRows) => {
  if (!revisionRows.length) return 0;
  for (const row of revisionRows) {
    await client.query("CALL ca.insert_revision_log($1, $2, $3, $4, $5)", [
      productFamilyId,
      row.revisionDate,
      row.revisionRev,
      row.revisionDescription,
      row.approvalDate,
    ]);
  }
  return revisionRows.length;
};

function parsecCodes(inp) {
  const result = [];

  let sresult = [];
  let fresult = [];

  // Collect START and FINISH indices
  for (let i = 0; i < inp.length; i++) {
    for (let j = 0; j < inp[i].length; j++) {
      if (matchesMarker(inp[i][j], "#START")) {
        sresult.push([i, j]);
      } else if (matchesMarker(inp[i][j], "#FINISH")) {
        fresult.push([i, j]);
      }
    }
  }

  // Process each block
  sresult.forEach((ele, index) => {
    const startRow = ele[0];
    const startCol = ele[1];

    // safety check
    if (!fresult[index]) return;

    const finishRow = fresult[index][0];
    const finishCol = fresult[index][1];

    const headerRow = inp[startRow + 1]
      .slice(startCol, finishCol + 1)
      .map((h) => (h == null ? "" : String(h).trim()));
    const dataRows = inp
      .slice(startRow + 2, finishRow)
      .map((row) =>
        row
          .slice(startCol, finishCol + 1)
          .map((cell) => (cell == null ? "" : String(cell).trim())),
      );

    const o = {
      output: headerRow[0],
      inputs: headerRow.slice(1).filter(Boolean),
      combinations: dataRows,
    };
    result.push(o);
  });

  return result;
}
const insertCCodes = async (client, parentMatId, ccodes) => {
  if (!Array.isArray(ccodes) || ccodes.length === 0) {
    return "no data";
  }
  await client.query("CALL ca.insert_ccodes($1, $2)", [
    parentMatId,
    JSON.stringify(ccodes),
  ]);
  return ccodes.length;
};

const importFiles = async (req, res) => {
  const uploadedFiles =
    Array.isArray(req.files) && req.files.length
      ? req.files
      : req.file
        ? [req.file]
        : [];

  if (!uploadedFiles.length) {
    return res.status(400).json({
      status: "error",
      message: "No file uploaded",
      results: [],
    });
  }

  try {
    for (const file of uploadedFiles) {
      const fileName = file.originalname;
      const { name, sapno, family_date } = getNameSapNO(fileName);
      const alreadyUploaded = await isFileAlreadyUploaded(
        sapno,
        name,
        family_date,
      );

      const workbookData = await extractWorkbookPayload(file.buffer);
      const revisionRows = buildRevisionLogRows(workbookData["Revision Log"]);
      //const cCodes = parsecCodes(workbookData['CCodes']);
      const cCodes = workbookData["CCodes"]
        ? parsecCodes(workbookData["CCodes"])
        : [];
      const productMaterialRows = await builProductMaterialRows(
        workbookData["TAB INDEX"],
        workbookData,
        cCodes,
      );

      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        const productFamilyId = await findOrCreateProductFamily(
          client,
          name,
          sapno,
          family_date,
        );
        // Clean existing data
        await client.query("CALL ca.remove_product_family_data($1)", [
          productFamilyId,
        ]);
        // Insert new
        await insertRevisionLogs(client, productFamilyId, revisionRows);
        if (cCodes.length > 0) {
          await insertCCodes(client, productFamilyId, cCodes);
        }

        const insertedProductMaterials = await insertProductMaterial(
          client,
          productFamilyId,
          productMaterialRows,
        );
        for (const sheet of insertedProductMaterials) {
          const final = [];
          const sheetName = sheet["ProductMaterialTabName"];
          const ProductMaterialId = sheet["ProductMaterialId"];
          const sheetData = getSheetDataByName(workbookData, sheetName);
          if (!Array.isArray(sheetData) || !sheetData.length) {
            continue;
          }

          const startIndexR = sheetData.findIndex((row) =>
            row.some((cell) => matchesMarker(cell, "#START")),
          );
          const finishIndexR = sheetData.findIndex((row) =>
            row.some((cell) => matchesMarker(cell, "#FINISH")),
          );
          if (
            startIndexR === -1 ||
            finishIndexR === -1 ||
            finishIndexR <= startIndexR
          ) {
            continue;
          }

          const startRow = sheetData[startIndexR];
          const finishRow = sheetData[finishIndexR];
          if (!Array.isArray(startRow) || !Array.isArray(finishRow)) {
            continue;
          }

          const startIndexC = findMarkerColumnIndex(startRow, "#START");
          const finishIndexC = findMarkerColumnIndex(finishRow, "#FINISH");
          if (
            startIndexC === -1 ||
            finishIndexC === -1 ||
            finishIndexC < startIndexC
          ) {
            continue;
          }

          const headers = sheetData
            .slice(startIndexR + 1, startIndexR + 2)
            .map((ele) => ele.slice(startIndexC, finishIndexC + 1));
          if (!headers.length || !headers[0]?.length) {
            continue;
          }

          const rows = sheetData
            .slice(startIndexR + 2, finishIndexR)
            .map((row) => row.slice(startIndexC, finishIndexC + 1));
          if (!rows.length) {
            continue;
          }
          const out = mapArrayToObjects(headers, rows);
          const result = groupBy(out, "SAP");
          Object.keys(result).forEach((sap) => {
            final.push({
              ProductMaterialId: ProductMaterialId,
              MaterialCharecterictics: result[sap],
              MaterialSapNumber: sap,
              MaterialOracleNumber: result[sap][0].Oracle || "",
            });
          });

          await insertMaterialMapping(client, final, cCodes);
          delete workbookData[sheetName];
        }
        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK");
        throw new Error(`Failed importing ${fileName}: ${error.message}`);
      } finally {
        client.release();
      }
    }

    return res.json({
      status: "ok",
      message: "Data Imported Succesfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Failed to import files.",
      details: error.message,
    });
  }
};

const getNameSapNO = (fileName) => {
  const [baseName] = fileName.split(".").slice(0, -1);
  const [sapno, name, family_date] = baseName.split("_");
  return { sapno, name, family_date };
};

function mapArrayToObjects(a, b) {
  const keys = a[0];
  const expressionKeys = [
    "AcSum",
    "QTY",
    "LR",
    "L.SPset_E_MIN_B",
    "L.SPset_E_MIN",
    "L.SPset_E_MIN_UOM",
    "L.SPset_E_MAX",
    "L.SPset_E_MAX_UOM",
    "L.SPset_E_MAX_B",
    "L.Pback_E_MIN_B",
    "L.Pback_E_MIN",
    "L.Pback_E_MIN_UOM",
    "L.Pback_E_MAX",
    "L.Pback_E_MAX_UOM",
    "L.Pback_E_MAX_B",
    "L.Pset_E_MIN_B",
    "L.Pset_E_MIN",
    "L.Pset_E_MIN_UOM",
    "L.Pset_E_MAX",
    "L.Pset_E_MAX_UOM",
    "L.Pset_E_MAX_B",
    "L.T,Tn,TdesignMin_E_MIN_B",
    "L.T,Tn,TdesignMin_E_MIN",
    "L.T,Tn,TdesignMin_E_MIN_UOM",
    "L.T,Tn,Tdesign_E_MAX",
    "L.T,Tn,Tdesign_E_MAX_UOM",
    "L.T,Tn,Tdesign_E_MAX_B",
    "L.T_E_MIN_B",
    "L.T_E_MIN",
    "L.T_E_MIN_UOM",
    "L.T_E_MAX",
    "L.T_E_MAX_UOM",
    "L.T_E_MAX_B",
  ];
  return b.map((row) => {
    const obj = {};
    keys.forEach((key, index) => {
      obj[key] = row[index];
    });
    return obj;
  });
}

function groupBy(array, key) {
  return array.reduce((acc, item) => {
    const groupKey = item[key];
    if (!acc[groupKey]) {
      acc[groupKey] = [];
    }
    acc[groupKey].push(item);
    return acc;
  }, {});
}

function transformInput(input) {
  const result = {};

  input.forEach((item) => {
    Object.keys(item).forEach((key) => {
      const value = item[key];

      if (!(key in result)) {
        result[key] = [value];
      } else if (result[key] !== value) {
        if (!Array.isArray(result[key])) {
          result[key] = [result[key]];
        }
        if (!result[key].includes(value)) {
          result[key].push(value);
        }
      }
    });
  });

  return result;
}

const getSapNo = async (configData, processData, client) => {
  const { GrpMD: model } = configData;
  const { Set_Pressure, Set_Pressure_Unit } = processData;

  try {
    const getProductMaterials = 'SELECT * from ca."ProductMaterial"';
    const { rows: productMaterials } = await client.query(getProductMaterials);

    // Parse headers once
    const result = productMaterials.map((ele) => ({
      ...ele,
      Header: JSON.parse(ele.Header),
    }));

    // Pressure expression regex pattern
    const PRESSURE_REGEX =
      /([\d.]+)\s*([a-zA-Z]+)\s*-\s*([\d.]+)\s*([a-zA-Z]+)/;

    // Process all material lookups in parallel using Promise.all()
    const queryPromises = result.map(async (material) => {
      const configSheet = material.Header.reduce((acc, key) => {
        if (key in configData) acc[key] = [configData[key]];
        return acc;
      }, {});

      // Use parameterized query to prevent SQL injection
      const query = `SELECT *
        FROM ca."MaterialMapping"
        WHERE "ProductMaterialId" = $1
        AND "MaterialCharecterictics" @> $2::jsonb`;

      try {
        const { rows } = await client.query(query, [
          material.ProductMaterialId,
          JSON.stringify(configSheet),
        ]);

        // Process rows and collect matching SAP numbers
        return rows.reduce((sapSet, row) => {
          const expression = row.MaterialExpression;
          console.log("expression", expression, row.ProductMaterialId);

          if (
            !expression ||
            expression.trim() === "-" ||
            expression.trim() === ""
          ) {
            sapSet.add(row.MaterialSapNumber);
          } else {
            const match = expression.match(PRESSURE_REGEX);
            if (match) {
              const minPressure = parseFloat(match[1]);
              const minUnit = match[2];
              const maxPressure = parseFloat(match[3]);
              const maxUnit = match[4];

              if (
                Set_Pressure_Unit === minUnit &&
                Set_Pressure_Unit === maxUnit
              ) {
                if (
                  Set_Pressure >= minPressure &&
                  Set_Pressure <= maxPressure
                ) {
                  sapSet.add(row.MaterialSapNumber);
                }
              }
            }
          }

          return sapSet;
        }, new Set());
      } catch (error) {
        console.error(
          `Error querying material ${material.ProductMaterialId}:`,
          error,
        );
        return new Set();
      }
    });

    // Wait for all queries to complete in parallel
    const allSapSets = await Promise.all(queryPromises);

    // Merge all sets into one
    const sapNumbers = new Set();
    allSapSets.forEach((sapSet) => {
      sapSet.forEach((sap) => sapNumbers.add(sap));
    });

    return Array.from(sapNumbers);
  } catch (err) {
    console.error("getSapNo error:", err);
    return "query failed";
  }

  // const productMaterials = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22];
  // const modelNumber = "900";

  // for (let index = 0; index < productMaterials.length; index++) {
  //   const sheetId = productMaterials[index];
  //   console.log("sheetId",sheetId)
  // }
  // return "12345";
  // const keys = Object.keys(configData).filter(
  //   (key) =>
  //     configData[key] !== undefined &&
  //     configData[key] !== null &&
  //     configData[key] !== "",
  // );

  // if (!keys.length) {
  //   return "At least one filter is required";
  // }

  // const conditions = [];
  // const params = [];

  // keys.forEach((key) => {
  //   const value = String(configData[key]).trim();
  //   const paramKey = `$${params.length + 1}`;
  //   const paramVal = `$${params.length + 2}`;

  //   conditions.push(`
  //     (
  //       ("MaterialCharecterictics" -> ${paramKey}::text) = to_jsonb(${paramVal}::text)
  //       OR
  //       (
  //         jsonb_typeof("MaterialCharecterictics" -> ${paramKey}::text) = 'array'
  //         OR ("MaterialCharecterictics" -> ${paramKey}::text) @> jsonb_build_array(${paramVal}::text)
  //       )
  //     )
  //   `);

  //   params.push(key, value);
  // });

  // const sql = `
  //   SELECT "MaterialSapNumber"
  //   FROM ca."MaterialMapping"
  //   WHERE ${conditions.join(" AND ")}
  // `;

  // try {
  //   const result = await pool.query(sql, params);
  //   return  result.rows.filter(row => row.MaterialSapNumber != 'CUSTOM');
  // } catch (error) {
  //   console.error(error);
  //   return res.status(500).json({ error: "query failed" });
  // }
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const toUuidParam = (value) => {
  if (value == null || value === "") {
    return null;
  }
  const s = String(value).trim();
  if (!UUID_RE.test(s)) {
    return { invalid: true, value: s };
  }
  return s;
};

const saveTPCData = async (req, res) => {
  const client = await pool.connect();

  try {
    const { TPCDataId, TagData, ProcessData, ConfigData, userData } = req.body;

    if (
      !TagData ||
      !ProcessData ||
      !ConfigData ||
      typeof TagData !== "object"
    ) {
      return res.status(400).json({ message: "Invalid payload" });
    }

    const {
      Company_GUID,
      Brand,
      Model_Number,
      Customer_Ref_No,
      Project_Ref_No,
      Line_No,
      Project_GUID,
      Tag_GUID,
      ValveId,
      Customer_Name,
      Project_Name,
      Quote_Number,
      Tag_No,
      Comments,
      Location,
      PurchaseOrder_Number,
      Serial_No,
      Catalog_Code,
      Erp_Code,
      Valve_Quantity,
    } = TagData;

    const isUpdate = Boolean(TPCDataId);
    const tpcDataIdParam = toUuidParam(TPCDataId);
    if (isUpdate && (tpcDataIdParam?.invalid || tpcDataIdParam == null)) {
      return res.status(400).json({
        message: "Invalid TPCDataId: must be a valid UUID for update",
      });
    }

    const companyGuid = toUuidParam(Company_GUID);
    const projectGuid = toUuidParam(Project_GUID);
    const tagGuid = toUuidParam(Tag_GUID);
    const uuidFields = [
      ["Company_GUID", companyGuid],
      ["Project_GUID", projectGuid],
      ["Tag_GUID", tagGuid],
    ];
    for (const [name, parsed] of uuidFields) {
      if (parsed?.invalid) {
        return res.status(400).json({
          message: `Invalid ${name}: must be a valid UUID`,
        });
      }
    }

    const valveId =
      ValveId != null && ValveId !== "" ? parseInt(String(ValveId), 10) : null;

    const { rows } = await client.query(
      `CALL ca.save_tpc_data_proc(
        $1::uuid, $2::uuid, $3, $4, $5, $6, $7, $8::uuid, $9::uuid, $10,
        $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
        $21::jsonb, $22::jsonb, $23::jsonb,$24
      )`,
      [
        isUpdate ? tpcDataIdParam : null,
        companyGuid,
        Brand,
        Model_Number,
        Customer_Ref_No,
        Project_Ref_No,
        Line_No,
        projectGuid,
        tagGuid,
        Number.isNaN(valveId) ? null : valveId,
        Customer_Name,
        Project_Name,
        Quote_Number,
        Tag_No,
        Comments,
        Location,
        PurchaseOrder_Number,
        Serial_No,
        Catalog_Code,
        Erp_Code,
        ProcessData,
        ConfigData,
        userData,
        Valve_Quantity,
      ],
    );
    const tpcDataId = rows[0]?.p_tpcdataid ?? rows[0]?.TPCDataId ?? TPCDataId;
    return res.status(isUpdate ? 200 : 201).json({
      message: isUpdate
        ? "Data updated successfully"
        : "Data saved successfully",
      tpcDataId,
    });
  } catch (error) {
    console.error("saveTPCData error:", error);
    return res.status(500).json({
      message: "Failed to save TPC data",
      error: error.message,
    });
  } finally {
    client.release(); //  Prevent connection leaks
  }
};

function extractRanges(characteristic) {
  const ranges = [];

  for (const key of Object.keys(characteristic)) {
    if (!/_E_MIN$|_MIN$/i.test(key)) continue;

    const prefix = key.replace(/(_E_MIN|_MIN)$/i, "");
    const maxKey =
      characteristic[`${prefix}_E_MAX`] !== undefined
        ? `${prefix}_E_MAX`
        : `${prefix}_MAX`;
    const uomKey =
      characteristic[`${prefix}_E_MIN_UOM`] !== undefined
        ? `${prefix}_E_MIN_UOM`
        : `${prefix}_UOM`;
    ranges.push({
      prefix: prefix.toLowerCase(),
      min: Number(characteristic[key]?.[0]),
      max: Number(characteristic[maxKey]?.[0]),
      uom: String(characteristic[uomKey]?.[0] || "").toLowerCase(),
    });
  }
  return ranges;
}
const rangeValueMap = {
  "l.pset": "Set_Pressure",
  "l.pback": "Total_Back_Pressure",
  "l.spset": "Set_Pressure - Constant_Back_Pressure",
  "l.t": "Relieving_Temp",
  "l.t,tn,tdesign": "Max(Relieving_Temp, Operating_Temp, TMax_Design)",
  "l.t,tn,tdesignmin": "Min(Relieving_Temp, Operating_Temp, TMin_Design)",
  "l.pback_e_min_b": "Total_Back_Pressure",
  "l.pback_e_min": "Total_Back_Pressure",
  "l.pback_e_max": "Total_Back_Pressure",
  "l.spset_e_min_b": "Set_Pressure - Constant_Back_Pressure",
  "l.spset_e_min": "Set_Pressure - Constant_Back_Pressure",
  "l.spset_e_max": "Set_Pressure - Constant_Back_Pressure",
  "l.t_e_min_b": "Relieving_Temp",
  "l.t_e_min": "Relieving_Temp",
  "l.t_e_max": "Relieving_Temp",
  "l.t_e_max_b": "Relieving_Temp",
};

function getRangeValue(prefix, processData) {
  const field = rangeValueMap[prefix];
  if (!field) return null; // Handle unknown prefixes
  switch (field) {
    case "Set_Pressure":
      return Number(processData.Set_Pressure);
    case "Total_Back_Pressure":
      return Number(processData.Total_Back_Pressure);
    case "Constant_Back_Pressure":
      return Number(processData.Constant_Back_Pressure);
    case "Set_Pressure - Constant_Back_Pressure":
      return (
        Number(processData.Set_Pressure || 0) -
        Number(processData.Constant_Back_Pressure || 0)
      );
    case "Relieving_Temp":
      return Number(processData.Relieving_Temp);
    case "Max(Relieving_Temp, Operating_Temp, TMax_Design)":
      return Math.max(
        Number(processData.Relieving_Temp || 0),
        Number(processData.Operating_Temp || 0),
        Number(processData.TMax_Design || 0),
      );
    case "Min(Relieving_Temp, Operating_Temp, TMin_Design)":
      return Math.min(
        Number(processData.Relieving_Temp || 0),
        Number(processData.Operating_Temp || 0),
        Number(processData.TMin_Design || 0),
      );
    default:
      return null;
  }
}
function isCharacteristicMatched(characteristic, processData, configData = {}) {
  for (const [key, values] of Object.entries(characteristic)) {
    if (/(_E_MIN|_E_MAX|_MIN|_MAX|_UOM)$/i.test(key)) {
      continue;
    }
    const configKey = Object.keys(configData).find(
      (k) => k.trim().toUpperCase() === key.trim().toUpperCase(),
    );
    const configValue = configKey != null ? configData[configKey] : undefined;

    if (
      configValue === undefined ||
      configValue === null ||
      configValue === ""
    ) {
      continue;
    }
    const allowedValues = Array.isArray(values)
      ? values.map((v) => String(v).trim().toUpperCase())
      : [String(values).trim().toUpperCase()];

    const actualValue = String(configValue).trim().toUpperCase();

    if (!allowedValues.includes(actualValue)) {
      return false;
    }
  }
  const ranges = extractRanges(characteristic);

  for (const range of ranges) {
    const value = getRangeValue(range.prefix, processData);
    if (value == null) {
      continue;
    }
    if (value < range.min || value >= range.max) {
      return false;
    }
  }
  return true;
}
function parseIncludeOnlyWith(rule) {
  if (!rule) {
    return null;
  }

  const text = String(rule).trim();

  if (!text) {
    return null;
  }

  if (text.toUpperCase() === "ALL") {
    return {
      type: "ALL",
    };
  }

  if (text.toUpperCase() === "SPECIAL DIMENSIONS ONLY") {
    return {
      type: "SPECIAL_DIMENSIONS_ONLY",
    };
  }

  return text;
}
function evaluateAtomicCondition(text, configData) {
  const condition = String(text).trim();

  if (!condition) {
    return true;
  }

  // FIELD<>A,B,C
  const notMatch = condition.match(/^([^<>:]+)\s*<>\s*(.+)$/);

  if (notMatch) {
    const field = notMatch[1].trim();
    const values = notMatch[2].split(",").map((v) => v.trim().toUpperCase());

    const actualValue = String(configData[field] ?? "")
      .trim()
      .toUpperCase();

    return !values.includes(actualValue);
  }

  // FIELD:A,B,C
  const inMatch = condition.match(/^([^<>:]+)\s*:\s*(.+)$/);

  if (inMatch) {
    const field = inMatch[1].trim();

    const values = inMatch[2].split(",").map((v) => v.trim().toUpperCase());

    const actualValue = String(configData[field] ?? "")
      .trim()
      .toUpperCase();

    return values.includes(actualValue);
  }

  return true;
}

function evaluateExpression(expr, configData) {
  let text = expr.trim();

  if (!text) {
    return true;
  }

  // remove outer ()
  if (text.startsWith("(") && text.endsWith(")")) {
    text = text.slice(1, -1);
  }

  // OR block (;;)
  if (text.includes(";;")) {
    return text.split(";;").some((part) =>
      part
        .split(";")
        .filter(Boolean)
        .every((c) => evaluateAtomicCondition(c, configData)),
    );
  }

  // AND block (;)
  return text
    .split(";")
    .filter(Boolean)
    .every((c) => evaluateAtomicCondition(c, configData));
}

function isIncludeOnlyWithMatched(rule, configData) {
  if (!rule) {
    return true;
  }

  const parsed = parseIncludeOnlyWith(rule);

  if (!parsed) {
    return true;
  }

  if (parsed.type === "ALL") {
    return true;
  }

  if (parsed.type === "SPECIAL_DIMENSIONS_ONLY") {
    return true;
  }

  const text = String(parsed);

  // split top-level groups:
  // OR:2,3,4;PT:S;(IS<>16;IF<>F;;OS<>16;OF<>D,E)

  const groups = [];
  let current = "";
  let depth = 0;
  for (const ch of text) {
    if (ch === "(") depth++;
    if (ch === ")") depth--;
    if (ch === ";" && depth === 0) {
      groups.push(current);
      current = "";
      continue;
    }
    current += ch;
  }

  if (current) {
    groups.push(current);
  }
  return groups.every((group) => evaluateExpression(group, configData));
}
function enrichCalculatedHeaders(productFamilyName, configData = {}) {
  const productFamily = String(productFamilyName ?? "")
    .trim()
    .toUpperCase();

  if (configData.AcSum != null) {
    return configData;
  }

  const rule = AcSum_Rules[productFamily];

  if (!rule) {
    return configData;
  }

  const calcPart = ({ field, excluded }) => {
    const value = String(configData[field] ?? "")
      .trim()
      .toUpperCase();

    return excluded.includes(value) ? 0 : 1;
  };

  const acSum =
    calcPart(rule.filter) + calcPart(rule.snubber) + calcPart(rule.unloader);

  return {
    ...configData,
    AcSum: String(acSum),
  };
}

const getSapNoWithModel = async (
  modelNumber,
  configData,
  processData,
  client,
) => {
  const { Set_Pressure } = processData;

  try {
    const query = `SELECT * FROM ca.get_product_materials_by_model($1)`;
    //onst modelParam = String(modelNumber ?? "").trim();

    const modelParam = modelNumber != null ? String(modelNumber).trim() : null;

    const { rows: productMaterials } = await client.query(query, [modelParam]);

    if (!productMaterials.length) {
      return { validSapNumbers: [], latestRev: null };
    }

    const productFamilyId = productMaterials[0]?.ProductFamilyId;
    const { rows: familyRows } = await client.query(
      `SELECT "ProductFamilyName"
        FROM ca."ProductFamily"
        WHERE "ProductFamilyId" = $1`,
      [productFamilyId],
    );
    const productFamilyName = familyRows[0]?.ProductFamilyName;
    const enrichedConfigData = enrichCalculatedHeaders(
      productFamilyName,
      configData,
    );
    // console.log("[#sym:getSapNoWithModel]", {
    //   productFamilyName,
    //   acSum: enrichedConfigData.AcSum,
    // });

    // Fetch revision logs
    const revLogQuery = `SELECT * FROM ca."RevisionLog" WHERE "ProductFamilyId" = $1`;
    const { rows: revisionLogs } = await client.query(revLogQuery, [
      productMaterials[0]?.ProductFamilyId,
    ]);

    const latestRev =
      revisionLogs.length > 0
        ? revisionLogs.reduce((max, item) =>
            item.RevisionLogId > max.RevisionLogId ? item : max,
          )
        : null;

    const materials = productMaterials
      .map((ele) => ({
        ...ele,
        Header: JSON.parse(ele.Header),
      }))
      .filter((material) =>
        isIncludeOnlyWithMatched(material.IncludeOnlyWith, enrichedConfigData),
      );

    const validSapNumbers = new Set();
    const bomQuantitys = {};
    const setPressure = Number(Set_Pressure);

    const conditions = materials.map((material) => {
      const hasAcSumHeader = material.Header.some(
        (h) => String(h).trim().toLowerCase() === "acsum",
      );
      const configSheet = material.Header.reduce((acc, key) => {
        const normalizedKey = String(key).trim();
        const matchedKey = Object.keys(enrichedConfigData).find(
          (k) => String(k).trim().toLowerCase() === normalizedKey.toLowerCase(),
        );
        if (matchedKey) {
          acc[matchedKey] = [String(enrichedConfigData[matchedKey])];
        }
        return acc;
      }, {});

      if (hasAcSumHeader && !configSheet.AcSum) {
        const acSumFromConfig = configData.AcSum;
        if (acSumFromConfig !== undefined && acSumFromConfig !== null) {
          configSheet.AcSum = [String(acSumFromConfig)];
        }
      }

      if (
        hasAcSumHeader &&
        !configSheet.AcSum &&
        enrichedConfigData.AcSum !== undefined &&
        enrichedConfigData.AcSum !== null
      ) {
        configSheet.AcSum = [String(enrichedConfigData.AcSum)];
      }

      return `
      (
        "ProductMaterialId" = ${material.ProductMaterialId}
        AND "MaterialCharecterictics" @>
        '${JSON.stringify([configSheet])}'::jsonb
      )
      `;
    });

    if (!conditions.length) {
      return { validSapNumbers: [], latestRev };
    }

    const q = `SELECT * FROM ca."MaterialMapping" WHERE ${conditions.join(" OR ")}`;
    const { rows } = await client.query(q);

    rows.forEach((row) => {
  const { MaterialCharecterictics, MaterialSapNumber } = row;

  const matchedChar = MaterialCharecterictics.find((char) =>
    isCharacteristicMatched(char, processData, enrichedConfigData),
  );

  if (matchedChar) {
      validSapNumbers.add(MaterialSapNumber);
      bomQuantitys[MaterialSapNumber] = matchedChar?.Quantity?.[0] ?? "1";
}
});
    return {
      validSapNumbers: Array.from(validSapNumbers),
      latestRev,
      bomQuantitys,
    };
  } catch (error) {
    console.error("getSapNoWithModel error:", error);
    return { validSapNumbers: [], latestRev: null };
  }
};

const getLeadTimeData = async (modelNumber, client) => {
  try {
    const { rows } = await client.query(
      `SELECT * FROM ca."LeadTimeControl" WHERE "Product" = $1`,
      [modelNumber],
    );
    return rows;
  } catch (error) {
    console.error("getLeadTimeData error:", error);
    throw error;
  }
};

const getTPCData = async (req, res) => {
  const { TPCDataId } = req.body;

  if (!TPCDataId) {
    return res.status(400).json({ message: "Invalid TPCDataId" });
  }

  const tpcIdStr = String(TPCDataId).trim();
  if (!UUID_RE.test(tpcIdStr)) {
    return res.status(400).json({
      message: "Invalid TPCDataId: must be a valid UUID",
    });
  }

  let client;

  try {
    client = await pool.connect();

    const { rows } = await client.query(
      `SELECT * FROM ca."get_tpc_data"($1::uuid)`,
      [tpcIdStr],
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Record not found" });
    }

    const row = rows[0];

    const configData =
      typeof row.ConfigData === "string"
        ? JSON.parse(row.ConfigData)
        : row.ConfigData;

    const processData =
      typeof row.ProcessData === "string"
        ? JSON.parse(row.ProcessData)
        : row.ProcessData;

    const modelNumber = row.Model_Number;

    // New enhanced SAP logic
    const { validSapNumbers, bomQuantitys, latestRev } =
      await getSapNoWithModel(modelNumber, configData, processData, client);

    const leadTimeData = await getLeadTimeData(modelNumber, client);

    return res.status(200).json({
      message: "success",
      data: {
        ...row,
        sapNO: validSapNumbers,
        bomQuantitys,
        latestRevision: latestRev,
        leadTimeData: leadTimeData,
      },
    });
  } catch (error) {
    console.error("getTPCData error:", error);

    return res.status(500).json({
      message: "Failed to fetch TPC data",
      error: error.message,
    });
  } finally {
    if (client) client.release();
  }
};
const sanitizeArrayForSQL = (arr) => {
  if (!Array.isArray(arr)) return [];
  return arr
    .map((item) => {
      const str = String(item).trim();
      // Escape single quotes by doubling them (SQL standard)
      return str.replace(/'/g, "''");
    })
    .filter((item) => item.length > 0 && /^[A-Z0-9_-]+$/i.test(item)); // Whitelist alphanumeric + dash/underscore
};

const getUpperAndLowerBOMs = async (req, res) => {
  const { sapNos, plant } = req.body;

  if (!Array.isArray(sapNos) || !sapNos.length) {
    return res.status(400).json({
      message: "sapNos must be a non-empty array",
    });
  }

  if (typeof plant !== "string" || !plant.trim()) {
    return res.status(400).json({
      message: "plant must be a non-empty string (e.g., '5GB1')",
    });
  }

  if (plant.includes(",")) {
    return res.status(400).json({
      message: "plant must be a single value without comma separation",
    });
  }

  const plantStr = plant.trim();
  try {
    // Sanitize and validate sapNos
    const sanitizedSapNos = sanitizeArrayForSQL(sapNos);
    if (!sanitizedSapNos.length) {
      return res.status(400).json({
        message: "No valid SAP numbers provided",
      });
    }

    // Build JSON safely with sanitized values
    await poolConnect;
    const request1 = mssqlpool.request();
    request1.input(
      "sapNos",
      sql.NVarChar(sql.MAX),
      JSON.stringify(sanitizedSapNos),
    );
    request1.input("plant", sql.NVarChar(50), plantStr);
    const request2 = mssqlpool.request();
    request2.input(
      "sapNos",
      sql.NVarChar(sql.MAX),
      JSON.stringify(sanitizedSapNos),
    );
    request2.input("plant", sql.NVarChar(50), plantStr);

    const upperQuery = `
  EXEC [SAP_ATP].[usp_get_upper_bill_of_material_json]
    @sapNos,
    @plant
`;

    const lowerQuery = `
  EXEC [SAP_ATP].[usp_get_bill_of_material_json]
    @sapNos,
    @plant
`;

    const [parentResult, childResult] = await Promise.all([
      request1.query(upperQuery),
      request2.query(lowerQuery),
    ]);
    const parent = parentResult.recordset;
    const child = childResult.recordset;

    return res.json({
      message: "success",
      data: { parent, child },
    });
  } catch (error) {
    console.error("getUpperAndLowerBOMs error:", error);
    return res.status(500).json({
      message: "Failed to fetch BOM data",
      error: error.message,
    });
  }
};

const importLeadTimes = async (req, res) => {
  const uploadedFile = req.file;

  // Check if a file was uploaded
  if (!uploadedFile) {
    return res.status(400).json({
      message: "No file uploaded",
    });
  }

  let client;
  try {
    client = await pool.connect();
    const workbook = new ExcelJS.Workbook();

    // Read CSV file from memory
    const stream = Readable.from(uploadedFile.buffer);
    await workbook.csv.read(stream);

    // Get the first worksheet created from the CSV
    const worksheet = workbook.worksheets[0];

    if (!worksheet) {
      return res.status(400).json({
        message: "CSV file is empty",
      });
    }

    const rows = [];

    // Convert worksheet rows into an array
    worksheet.eachRow((row) => {
      rows.push(row.values.slice(1)); // Ignore empty first index
    });

    // Validate minimum rows (header + plants + at least 1 data row)
    if (rows.length < 3) {
      return res.status(400).json({
        message:
          "CSV file must contain header, plant row, and at least one data row",
      });
    }

    // Get Plants from header row (row 0)
    const firstRow = rows[0];
    const plants = firstRow
      .filter((val) => val && val !== null && val !== undefined)
      .slice(1); // Skip first column (product name)

    // Validate we have exactly 3 plants (as expected by the data structure)
    if (plants.length !== 3) {
      return res.status(400).json({
        message: `Expected 3 plants in header, found ${plants.length}`,
      });
    }

    const remData = rows.slice(2); // Skip header row and plant row

    // Build batch insert data
    const insertValues = [];
    const valuePlaceholders = [];
    let paramIndex = 1;

    for (const row of remData) {
      const product = row[0];
      if (!product) continue; // Skip empty product rows

      // Validate row has enough columns (1 product + 3 plants * 3 values each = 10 columns)
      if (row.length < 10) {
        console.warn(`Skipping row with insufficient columns:`, row);
        continue;
      }

      const leadTimeAdder = {
        [`${plants[0]}`]: { Minimum: row[1], Maximum: row[2], Adder: row[3] },
        [`${plants[1]}`]: { Minimum: row[4], Maximum: row[5], Adder: row[6] },
        [`${plants[2]}`]: { Minimum: row[7], Maximum: row[8], Adder: row[9] },
      };

      insertValues.push(product, JSON.stringify(leadTimeAdder));
      valuePlaceholders.push(`($${paramIndex}, $${paramIndex + 1}::jsonb)`);
      paramIndex += 2;
    }

    if (insertValues.length === 0) {
      return res.status(400).json({
        message: "No valid data rows found in CSV",
      });
    }

    // Use transaction for atomicity
    await client.query("BEGIN");

    try {
      // Batch insert all records in a single query
      const batchInsertQuery = `
        INSERT INTO ca."LeadTimeControl" ("Product", "LeadTimeAdder")
        VALUES ${valuePlaceholders.join(", ")}
      `;
      await client.query(
        `truncate table ca."LeadTimeControl" RESTART IDENTITY`,
      );
      await client.query(batchInsertQuery, insertValues);
      await client.query("COMMIT");

      return res.json({
        status: "success",
        importedCount: insertValues.length / 2,
      });
    } catch (insertError) {
      await client.query("ROLLBACK");
      throw insertError;
    }
  } catch (error) {
    console.error("Import error:", error);

    return res.status(500).json({
      status: "error",
      message: "Failed to import CSV file",
      error: error.message,
    });
  } finally {
    if (client) client.release(); // Prevent connection leaks
  }
};

const getLeadTimes = async (req, res) => {
  try {
    const client = await pool.connect();
    const query = `
      SELECT * FROM ca."LeadTimeControl"
    `;
    const result = await client.query(query);

    return res.json({
      status: "success",
      data: result.rows,
    });
  } catch (error) {
    console.error("getLeadTimes error:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch lead times",
      error: error.message,
    });
  }
};

const updateLeadTimes = async (req, res) => {
  const { LeadTimeControlId, Product, LeadTimeAdder } = req.body;

  if (!LeadTimeControlId || !Product || !LeadTimeAdder) {
    return res.status(400).json({
      status: "error",
      message:
        "Missing required fields: LeadTimeControlId, Product, LeadTimeAdder",
    });
  }

  try {
    const client = await pool.connect();
    const query = `
      UPDATE ca."LeadTimeControl"
      SET "Product" = $1, "LeadTimeAdder" = $2
      WHERE "LeadTimeControlId" = $3
    `;
    await client.query(query, [
      Product,
      JSON.stringify(LeadTimeAdder),
      LeadTimeControlId,
    ]);

    return res.json({
      status: "success",
      message: "Lead times updated successfully",
    });
  } catch (error) {
    console.error("updateLeadTimes error:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to update lead times",
      error: error.message,
    });
  }
};

const saveATPResults = async (req, res) => {
  let client;

  try {
    const {
      requestId,
      plantSelected,
      requestedDate,
      atpResults = [],
      tagData = {},
    } = req.body;

    // Validate required fields
    if (!requestId) {
      return res.status(400).json({
        status: "error",
        message: "Request ID is required to save availability results",
      });
    }

    if (!plantSelected) {
      return res.status(400).json({
        status: "error",
        message: "Plant selection is required",
      });
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const finalRequestedDate =
      requestedDate || new Date().toISOString().slice(0, 10);

    if (!dateRegex.test(finalRequestedDate)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid date format. Expected YYYY-MM-DD",
      });
    }

    // Validate atpResults is an array
    if (!Array.isArray(atpResults)) {
      return res.status(400).json({
        status: "error",
        message: "atpResults must be an array",
      });
    }

    // Connect to database
    client = await pool.connect();

    // Begin transaction
    await client.query("BEGIN");

    try {
      // Check if record already exists for this requestId and plantSelected
      const checkQuery = `
        SELECT * FROM ca."ATPResults"
        WHERE "RequestId" = $1 AND "PlantSelected" = $2
        LIMIT 1
      `;

      const { rows: existingRows } = await client.query(checkQuery, [
        requestId,
        plantSelected,
      ]);

      let query;
      let params;
      let isUpdate = false;

      if (existingRows.length > 0) {
        // Record exists, update it
        isUpdate = true;
        query = `
          UPDATE ca."ATPResults"
          SET
            "RequestedDate" = $3,
            "ATPResults" = $4::jsonb,
            "TagData" = $5::jsonb,
            "UpdatedAt" = NOW()
          WHERE "RequestId" = $1 AND "PlantSelected" = $2
          RETURNING *
        `;
        params = [
          requestId,
          plantSelected,
          finalRequestedDate,
          JSON.stringify(atpResults),
          JSON.stringify(tagData),
        ];
      } else {
        // Record doesn't exist, create new one
        query = `
          INSERT INTO ca."ATPResults" (
            "RequestId",
            "PlantSelected",
            "RequestedDate",
            "ATPResults",
            "TagData",
            "CreatedAt"
          ) VALUES ($1, $2, $3, $4::jsonb, $5::jsonb, NOW())
          RETURNING *
        `;
        params = [
          requestId,
          plantSelected,
          finalRequestedDate,
          JSON.stringify(atpResults),
          JSON.stringify(tagData),
        ];
      }

      const { rows } = await client.query(query, params);

      await client.query("COMMIT");

      const savedResult = rows[0];

      return res.status(200).json({
        status: "success",
        message: isUpdate
          ? "ATP results updated successfully"
          : "ATP results saved successfully",
        data: {
          requestId: savedResult.RequestId,
          plantSelected: savedResult.PlantSelected,
          requestedDate: savedResult.RequestedDate,
          atpResults:
            typeof savedResult.ATPResults === "string"
              ? JSON.parse(savedResult.ATPResults)
              : savedResult.ATPResults,
          tagData:
            typeof savedResult.TagData === "string"
              ? JSON.parse(savedResult.TagData)
              : savedResult.TagData,
          savedAt: savedResult.CreatedAt || savedResult.UpdatedAt,
        },
      });
    } catch (insertError) {
      await client.query("ROLLBACK");
      throw insertError;
    }
  } catch (error) {
    console.error("saveATPResults error:", error);

    return res.status(500).json({
      status: "error",
      message: "Failed to save ATP results",
      details: error.message,
    });
  } finally {
    if (client) {
      client.release(); // Prevent connection leaks
    }
  }
};

const getATPResults = async (req, res) => {
  let client;

  try {
    const { requestId } = req.body;

    // Validate required field
    if (!requestId) {
      return res.status(400).json({
        status: "error",
        message: "Request ID is required to fetch ATP results",
      });
    }

    // Connect to database
    client = await pool.connect();

    // Fetch all ATP results for the given requestId
    const query = `
      SELECT * FROM ca."ATPResults"
      WHERE "RequestId" = $1
      ORDER BY "PlantSelected" ASC
    `;

    const { rows } = await client.query(query, [requestId]);

    if (!rows.length) {
      return res.status(404).json({
        status: "error",
        message: "No ATP results found for the provided Request ID",
      });
    }

    // Format the response data
    const formattedResults = rows.map((row) => ({
      requestId: row.RequestId,
      plantSelected: row.PlantSelected,
      requestedDate: row.RequestedDate,
      atpResults:
        typeof row.ATPResults === "string"
          ? JSON.parse(row.ATPResults)
          : row.ATPResults,
      tagData:
        typeof row.TagData === "string" ? JSON.parse(row.TagData) : row.TagData,
      createdAt: row.CreatedAt,
      updatedAt: row.UpdatedAt,
    }));

    return res.status(200).json({
      status: "success",
      message: `Found ${formattedResults.length} ATP result(s) for Request ID: ${requestId}`,
      count: formattedResults.length,
      data: formattedResults,
    });
  } catch (error) {
    console.error("getATPResults error:", error);

    return res.status(500).json({
      status: "error",
      message: "Failed to fetch ATP results",
      details: error.message,
    });
  } finally {
    if (client) {
      client.release(); // Prevent connection leaks
    }
  }
};

module.exports = {
  validateFiles,
  importFiles,
  getSapNo,
  saveTPCData,
  getTPCData,
  getUpperAndLowerBOMs,
  importLeadTimes,
  getLeadTimes,
  updateLeadTimes,
  saveATPResults,
  getATPResults,
};
