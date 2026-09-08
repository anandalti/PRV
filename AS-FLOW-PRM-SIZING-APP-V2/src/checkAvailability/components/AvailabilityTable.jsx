import React from "react";
import { useProcessedAvailabilityData } from "../hooks/useAvailability";
import { useSelector } from "react-redux";
import Skeleton from "@mui/material/Skeleton";
import { Typography } from "@mui/material";
import FilterDropdown from "./FilterDropdown";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const AvailabilityTable = ({ triggerExport, setTriggerExport }) => {
  const [filters, setFilters] = React.useState({
    materials: [],
  });

  const tableData = useSelector((state) => state.checkAvailability.parentBOMS);
  const childBOMS = useSelector((state) => state.checkAvailability.childBOMS);
  const ParentSapNumber = useSelector(
    (state) => state.checkAvailability.ParentSapNumber,
  );

  const sapQuantity = 1;
  const reqValve = 2;

  const [loading] = useSelector((state) => [state.checkAvailability.loading]);

  //call this fun when triggerExport changes to true, and then set it back to false
  React.useEffect(() => {
    if (triggerExport) {
      exportToCSV();
      setTriggerExport(false);
    }
  }, [triggerExport]);
  function exportToCSV(filename = "table-data.csv") {
    const table = document.getElementById("parent-table");
    const childTable = document.getElementById("child-table");
    let csv = [];

    // Loop through table rows
    for (let row of table.rows) {
      let rowData = [];

      // Loop through each cell
      for (let cell of row.cells) {
        // Escape quotes and wrap in quotes
        let text = cell.innerText.replace(/"/g, '""');
        rowData.push(`"${text}"`);
      }

      csv.push(rowData.join(","));
    }

    // Add a blank line between the two tables
    csv.push("");
    // Loop through child table rows
    for (let row of childTable.rows) {
      let rowData = [];
      // Loop through each cell
      for (let cell of row.cells) {
        // Escape quotes and wrap in quotes
        let text = cell.innerText.replace(/"/g, '""');
        rowData.push(`"${text}"`);
      }
      csv.push(rowData.join(","));
    }

    // Convert array to CSV string
    const csvString = csv.join("\n");

    // Create a Blob and download
    const blob = new Blob([csvString], { type: "text/csv" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="av-table-container">
      <FilterDropdown
        ParentSapNumber={ParentSapNumber}
        filters={filters}
        setFilters={setFilters}
      />

      <table id="parent-table" className="av-table">
        <thead>
          <tr>
            <th style={{ width: "3%" }}>Level</th>
            <th style={{ width: "5%" }}>Item</th>
            <th style={{ width: "5%" }}>Material</th>
            <th style={{ width: "20%" }}>Description</th>
            <th style={{ width: "20%" }}>Basic Material</th>
            <th style={{ width: "5%" }}>Assembly</th>
            <th style={{ width: "5%" }}>Rqd. Qty.</th>
            <th style={{ width: "5%" }}>UOM</th>
            <th style={{ width: "5%" }}>ATP Qty</th>
            <th style={{ width: "5%" }}>Second Qty</th>
            {/* <th style={{ width: '5%' }}>Missing</th> */}
            <th style={{ width: "5%" }}>Availability</th>
            <th style={{ width: "5%" }}>Weeks</th>
          </tr>
        </thead>
        <tbody>
          {loading
            ? Array.from({ length: 8 }).map((_, idx) => (
                <tr key={`skeleton-${idx}`}>
                  <td>
                    <Skeleton variant="text" width="100%" />
                  </td>
                  <td>
                    <Skeleton variant="text" width="100%" />
                  </td>
                  <td>
                    <Skeleton variant="text" width="100%" />
                  </td>
                  <td>
                    <Skeleton variant="text" width="100%" />
                  </td>
                  <td>
                    <Skeleton variant="text" width="100%" />
                  </td>
                  <td>
                    <Skeleton variant="text" width="100%" />
                  </td>
                  <td>
                    <Skeleton variant="text" width="100%" />
                  </td>
                  <td>
                    <Skeleton variant="text" width="100%" />
                  </td>
                  <td>
                    <Skeleton variant="text" width="100%" />
                  </td>
                  <td>
                    <Skeleton variant="text" width="100%" />
                  </td>
                  <td>
                    <Skeleton variant="text" width="100%" />
                  </td>
                  <td>
                    <Skeleton variant="text" width="100%" />
                  </td>
                </tr>
              ))
            : [...tableData]
                .filter((row) => {
                  if (filters.materials.length === 0) return true;
                  return filters.materials.includes(row["Material Number"]);
                })
                .sort((a, b) =>
                  String(a["Material Number"]).localeCompare(
                    String(b["Material Number"]),
                    undefined,
                    { numeric: true },
                  ),
                )
                .map((ele) => {
                  const requiredQuantity = sapQuantity * reqValve;
                  const committed = ele["Committed Quantity"];
                  const secComm = ele["Second Quantity"];
                  const secDate = ele["Second ATP Date"];
                  const fullDate = ele["Full ATP Date"];

                  const isAssembly = childBOMS.filter(
                    (child) =>
                      child["Material Number"] === ele["Material Number"],
                  );

                  if (committed > requiredQuantity) {
                    return {
                      ...ele,
                      requiredQuantity: requiredQuantity,
                      availability: (
                        <CheckCircleIcon
                          style={{ color: "green", fontSize: "1rem" }}
                        />
                      ),
                      isAssembly: isAssembly,
                    };
                  } else if (committed + secComm > requiredQuantity) {
                    return {
                      ...ele,
                      isAssembly: isAssembly.length,
                      availability: secDate ? secDate + "(S)" : "-",
                    };
                  } else {
                    return {
                      ...ele,
                      isAssembly: isAssembly,
                      availability: fullDate ? fullDate + "(F)" : "-",
                    };
                  }
                })
                .map((row, idx) => (
                  <tr
                    key={`${row.materialNumber}-${idx}`}
                    className={row.isMissing ? "av-row-missing" : ""}
                  >
                    <td>{1}</td>
                    <td>{row["BOM Item Number"]}</td>
                    <td>{row["Material Number"]}</td>
                    <td>{row["Material Description"]}</td>
                    <td>{row["Basic Material"]}</td>
                    <td>{row.isAssembly.length <= 1 ? "NO" : "YES"}</td>
                    <td>{row["requiredQuantity"]}</td>
                    <td>{row["Unit of Measure"]}</td>
                    <td>{row["Committed Quantity"]}</td>
                    <td>{row["Second Quantity"]}</td>
                    {/* <td>{row.isMissing ? 'X' : '-'}</td> */}
                    <td>{row.availability || "-"}</td>
                    <td>{row.weeks || "4"}</td>
                  </tr>
                ))}
        </tbody>
      </table>

      <div
        style={{
          margin: "14px 0 10px 8px",
          display: "flex",
          alignItems: "center",
        }}
      >
        <Typography>Child Level BOM</Typography>
      </div>
      <table id="child-table" className="av-table">
        <thead>
          <tr>
            <th style={{ width: "3%" }}>Level</th>
            <th style={{ width: "5%" }}>Item</th>
            <th style={{ width: "5%" }}>Parent Material</th>
            <th style={{ width: "5%" }}>Component Material</th>
            <th style={{ width: "20%" }}>Description</th>
            <th style={{ width: "20%" }}>Basic Material</th>
            {/* <th style={{ width: '5%' }}>Assembly</th> */}
            <th style={{ width: "5%" }}>Rqd. Qty.</th>
            <th style={{ width: "5%" }}>UOM</th>
            <th style={{ width: "5%" }}>ATP Qty</th>
            <th style={{ width: "5%" }}>Second Qty</th>
            {/* <th style={{ width: '5%' }}>Missing</th> */}
            <th style={{ width: "5%" }}>Availability</th>
            <th style={{ width: "5%" }}>Weeks</th>
          </tr>
        </thead>
        <tbody>
          {loading
            ? Array.from({ length: 8 }).map((_, idx) => (
                <tr key={`skeleton-${idx}`}>
                  <td>
                    <Skeleton variant="text" width="100%" />
                  </td>
                  <td>
                    <Skeleton variant="text" width="100%" />
                  </td>
                  <td>
                    <Skeleton variant="text" width="100%" />
                  </td>
                  <td>
                    <Skeleton variant="text" width="100%" />
                  </td>
                  <td>
                    <Skeleton variant="text" width="100%" />
                  </td>
                  <td>
                    <Skeleton variant="text" width="100%" />
                  </td>
                  <td>
                    <Skeleton variant="text" width="100%" />
                  </td>
                  <td>
                    <Skeleton variant="text" width="100%" />
                  </td>
                  <td>
                    <Skeleton variant="text" width="100%" />
                  </td>
                  <td>
                    <Skeleton variant="text" width="100%" />
                  </td>
                  <td>
                    <Skeleton variant="text" width="100%" />
                  </td>
                  <td>
                    <Skeleton variant="text" width="100%" />
                  </td>
                </tr>
              ))
            : [...childBOMS]
                .filter((row) => {
                  if (filters.materials.length === 0) return true;
                  return filters.materials.includes(row["Material Number"]);
                })
                .sort((a, b) =>
                  String(a["Material Number"]).localeCompare(
                    String(b["Material Number"]),
                    undefined,
                    { numeric: true },
                  ),
                )
                .map((ele) => {
                  const requiredQuantity = ele["Component Quantity"] * reqValve;
                  const isSingleChild =
                    childBOMS.filter(
                      (child) =>
                        child["Material Number"] === ele["Material Number"],
                    ).length === 1;

                  if (isSingleChild) {
                    const parent = tableData.find(
                      (parent) =>
                        parent["Material Number"] === ele["Material Number"],
                    );
                    if (parent) {
                      const committed = parent["Committed Quantity"];
                      const secComm = parent["Second Quantity"];
                      const secDate = parent["Second ATP Date"];
                      const fullDate = parent["Full ATP Date"];
                      if (committed > requiredQuantity) {
                        return {
                          ...ele,
                          requiredQuantity: requiredQuantity,
                          availability: (
                            <CheckCircleIcon
                              style={{ color: "green", fontSize: "1rem" }}
                            />
                          ),
                        };
                      } else if (committed + secComm > requiredQuantity) {
                        return {
                          ...ele,
                          requiredQuantity: requiredQuantity,
                          availability: secDate ? secDate + "(S)" : "-",
                        };
                      } else {
                        return {
                          ...ele,
                          requiredQuantity: requiredQuantity,
                          availability: fullDate ? fullDate + "(F)" : "-",
                        };
                      }
                    }
                  } else {
                    const level = ele["Level"];
                    const procurementType = ele["Procurement Type"];

                    if (level === "2" || level === "1") {
                      const committed = ele["Committed Quantity"];
                      const secComm = ele["Second Quantity"];
                      const secDate = ele["Second ATP Date"];
                      const fullDate = ele["Full ATP Date"];
                      if (committed > requiredQuantity) {
                        return {
                          ...ele,
                          requiredQuantity: requiredQuantity,
                          availability: (
                            <CheckCircleIcon
                              style={{ color: "green", fontSize: "1rem" }}
                            />
                          ),
                        };
                      } else if (committed + secComm > requiredQuantity) {
                        return {
                          ...ele,
                          requiredQuantity: requiredQuantity,
                          availability: secDate ? secDate + "(S)" : "-",
                        };
                      } else {
                        return {
                          ...ele,
                          requiredQuantity: requiredQuantity,
                          availability: fullDate ? fullDate + "(F)" : "-",
                        };
                      }
                    }
                    if (procurementType === "E") {
                      if (level === "3") {
                        const committed = ele["Committed Quantity"];
                        const secComm = ele["Second Quantity"];
                        const secDate = ele["Second ATP Date"];
                        const fullDate = ele["Full ATP Date"];
                        if (committed > requiredQuantity) {
                          return {
                            ...ele,
                            requiredQuantity: requiredQuantity,
                            availability: (
                              <CheckCircleIcon
                                style={{ color: "green", fontSize: "1rem" }}
                              />
                            ),
                          };
                        } else if (committed + secComm > requiredQuantity) {
                          return {
                            ...ele,
                            requiredQuantity: requiredQuantity,
                            availability: secDate ? secDate + "(S)" : "-",
                          };
                        } else {
                          return {
                            ...ele,
                            requiredQuantity: requiredQuantity,
                            availability: fullDate ? fullDate + "(F)" : "-",
                          };
                        }
                      }
                    } else if (procurementType === "F") {
                      return {
                        ...ele,
                        requiredQuantity: requiredQuantity,
                        availability: "Never Make a Buy",
                      };
                    }
                  }
                  return { ...ele };
                })
                .map((row, idx) => (
                  <tr
                    key={`${row.materialNumber}-${idx}`}
                    className={row.isMissing ? "av-row-missing" : ""}
                  >
                    <td>{row["Level"]}</td>
                    <td>{row["BOM Item Number"]}</td>
                    <td>{row["Material Number"]}</td>
                    <td>{row["Component Number"]}</td>
                    <td>{row["Component Description"]}</td>
                    <td>{row["Basic Material"]}</td>
                    {/* <td>{row.isAssembly}</td> */}
                    <td>{row["requiredQuantity"]}</td>
                    <td>{row["Component Unit"]}</td>
                    <td>{row["Component Quantity"]}</td>
                    <td>{row["Second Quantity"]}</td>
                    {/* <td>{row.isMissing ? 'X' : '-'}</td> */}
                    <td>{row.availability || "-"}</td>
                    <td>{row.weeks || "-"}</td>
                  </tr>
                ))}
        </tbody>
      </table>
    </div>
  );
};

export default AvailabilityTable;
