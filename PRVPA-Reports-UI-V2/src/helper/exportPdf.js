import html2pdf from "html2pdf.js";

export const ExportTableToPdf = (filename) => {
  const tableCollection = Array.from(document.getElementsByTagName("table"));
  const parentTables = tableCollection.filter(
    (table) => table.parentElement.closest("table") === null
  );

  if (parentTables.length) {
    const div = document.createElement("div");
    div.style.width = "100%";
    div.style.backgroundColor = "white";

    parentTables.forEach((element, index) => {
      const clonedTable = element.cloneNode(true);
      adjustCellData(clonedTable);
      div.appendChild(clonedTable);
    
      // Add a page breaker after each table
      if (index < parentTables.length - 1) {
      const pageBreaker = document.createElement("p");
      pageBreaker.style.pageBreakAfter = "always";
      pageBreaker.style.height = "0";
      pageBreaker.style.visibility = "hidden";
      div.appendChild(pageBreaker);
      }
    });
    
    const opt = {
      margin: 0.5,
      filename: `${filename}.pdf`,
      image: { type: "jpeg", quality: 0.5 },
      pagebreak: { mode: ["avoid-all", "css", "legacy"] },
      html2canvas: { scale: 1.5 },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    };

    html2pdf()
      .set(opt)
      .from(div)
      .save()
      .then(() => {
        const tableElements =
          document.getElementsByClassName("main-reports-table");
        for (let i = 0; i < tableElements.length; i++) {
          const table = tableElements[i];
          document.getElementById(`reportsection-${i}`).append(table);
        }
      });
  }
};

const adjustCellData = (tableElement) => {
  const cells = tableElement.getElementsByTagName("td");

  const targetStrings = ["Automation Solutions", "All rights reserved"];

  for (let i = 0; i < cells.length; i++) {
    const cell = cells[i];

    //if (cell.id === "1" || cell.id === "11448" || cell.id === "11306" || cell.id === "9221" || cell.id === "11556" ) cell.style.backgroundImage = "url(emersonlogo.png)";
    if (["1","11448","11306","9221","11556"].includes(cell.id) ) cell.style.backgroundImage = "url(emersonlogo.png)";
    if (targetStrings.some((str) => cell.textContent.includes(str))) {
      cell.style.fontSize = "6.5px";
    }
    if (["68","976","1316","1862","2032","2434","4397","4836"].includes(cell.id) ){
      const trimmed = cell.textContent.trim();
      cell.textContent = trimmed.substring(0, 17);
    }
    if (cell.id === "356") {
      const parentRow = cell.parentElement; // Get the parent row of the cell
      const newRow = document.createElement("tr"); // Create a new empty row
      const emptyCell = document.createElement("td"); // Create an empty cell
      emptyCell.colSpan = parentRow.children.length; // Span the entire row
      newRow.appendChild(emptyCell); // Add the empty cell to the new row
      parentRow.parentElement.insertBefore(newRow, parentRow.nextSibling); // Insert the new row after the current row

      // Alternatively, add a <br> element
      // const br = document.createElement("br");
      // cell.appendChild(br);
    }
  }
};