/**
 * excelParser.js (frontend stub)
 *
 * Client-side Excel parsing has been moved to the backend. This stub keeps
 * the function names used by the frontend but returns safe defaults so the
 * frontend does not require the '@e965/xlsx' package.
 */
export const parseHeaderSheet = () => null;
export const parseTSFSheet = () => null;
export const parseItemDetailsSheet = () => ({ data: [], columns: [] });

export const parseOPSWorkbook = (workbook) => ({
  header: null,
  tsf: null,
  itemDetails: { data: [], columns: [] },
  sheets: Array.isArray(workbook?.SheetNames) ? workbook.SheetNames.map(name => ({ name, data: [] })) : [],
  originalNames: workbook?.SheetNames || []
});
