import { useSelector } from "react-redux";
import { toast } from "react-toastify";

export const useExportExcel = () => {
  const { id: reportId } = useSelector(
    (state) => state.reportTypes.selectedReportType
  );

  const exportTableToExcel = async (fName) => {
    const dataType = "application/vnd.ms-excel;charset=utf-8;";
    const tableElements = document.querySelectorAll(".main-reports-table");

    if (tableElements.length === 0) {
      toast.error("No tables found with the selector");
      console.error("No tables found with the selector");
      return;
    }

    let combineTable = "";

    for (const originalTable of tableElements) {
      // Clone table so we can modify it without affecting the original DOM
      const table = originalTable.cloneNode(true);

      // Adjust table: collect all header (S) cells and parameter (P) cells,
      // then rebuild the table with one header row and one value row.
      if (reportId === 9 || reportId === 8) adjustSummaryReport(table);

      adjustFontSize(table);

      const tableHTML = table.outerHTML;
      const utf8BOM = "\uFEFF";
      const encodedHTML = utf8BOM + tableHTML;
      combineTable += encodeURIComponent(encodedHTML);
    }

    const downloadLink = document.createElement("a");
    downloadLink.href = `data:${dataType},${combineTable}`;
    downloadLink.download = fName;
    downloadLink.click();
  };

  return {
    exportTableToExcel,
  };
};

const adjustSummaryReport = (table) => {
  const headerCells = [];
  const valueCells = [];

  // Iterate through every row and cell in the table.
  table.querySelectorAll("tr").forEach((row) => {
    row.querySelectorAll("td").forEach((cell) => {
      const type = cell.getAttribute("valuetype");
      if (type === "S") {
        const th = document.createElement("th");
        th.innerHTML = cell.innerHTML;
        th.style.cssText = cell.style.cssText;
        headerCells.push(th);
      } else if (type === "P") {
        const td = document.createElement("td");
        td.innerHTML = cell.innerHTML;
        td.style.cssText = cell.style.cssText;
        valueCells.push(td);
      }
    });
  });

  // Clear the table contents.
  table.innerHTML = "";

  // Create a single header row and a single value row.
  const headerRow = document.createElement("tr");
  headerCells.forEach((cell) => headerRow.appendChild(cell));

  const valueRow = document.createElement("tr");
  valueCells.forEach((cell) => valueRow.appendChild(cell));

  // Append the new rows to the table.
  table.appendChild(headerRow);
  table.appendChild(valueRow);
};

const adjustFontSize = (table) => {
  const cells = table.getElementsByTagName("td");

  for (let i = 0; i < cells.length; i++) {
    const cell = cells[i];

    const cellId = cell.getAttribute("id");

    if (cellId === "355") cell.style.fontSize = "4pt";
  }
};
