import React, { useState, useMemo, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Box,
  Typography,
  Chip,
  Badge,
  Skeleton,
  Stack,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DangerousIcon from "@mui/icons-material/Dangerous";
import ReportIcon from "@mui/icons-material/Report";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import CloseFullscreenIcon from "@mui/icons-material/CloseFullscreen";
import FilterDropdown from "./components/FilterDropdown";
import { useAvailabilityTagdata } from "../checkAvailability/hooks/useAvailability";

import { ExpandMore, ExpandLess, ChevronRight } from "@mui/icons-material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
  Image,
} from "@react-pdf/renderer";

import { getSimplifiedATPLogic } from "./utils/getSimplifiedATPLogic";
import { updateTagdata } from "../checkAvailability/store/slices/checkAvailabilitySlice";
import { factoryCodes } from "../../src/checkAvailability/store/slices/checkAvailabilitySlice";

const ParentChildTable = ({
  triggerExport,
  setTriggerExport,
  triggerPDFParentExport,
  setTriggerPDFParentExport,
  triggerPDFParentChildExport,
  setTriggerPDFParentChildExport,
}) => {
  const dispatch = useDispatch();
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const [filters, setFilters] = React.useState({
    materials: [],
    lmaterials: [],
    availability: [],
  });

  // const [searchTerm, setSearchTerm] = useState("");
  // const [filterType, setFilterType] = useState("");
  // const [filterStatus, setFilterStatus] = useState("All");
  const [expandAll, setExpandAll] = useState(false);

  const tableData = useSelector((state) => state.checkAvailability.parentBOMS);
  const childBOMS = useSelector((state) => state.checkAvailability.childBOMS);
  const [loading] = useSelector((state) => [state.checkAvailability.loading]);
  const ParentSapNumber = useSelector(
    (state) => state.checkAvailability.ParentSapNumber,
  );
  const factorySelected = useSelector(
    (state) => state.checkAvailability.factorySelected,
  );
  const rev = useSelector((state) => state.checkAvailability.revisionData);
  const TagData = useAvailabilityTagdata();
  const valveQty = useSelector((state) => [state.checkAvailability.valveQty]);
  const TPCDataId = useSelector((state) => state.checkAvailability.TPCDataId);

  const leadTimeData = useSelector((state) => [
    state.checkAvailability.leadTimeData,
  ]);

  const getRemainingWeeks = (targetDate) => {
    if (!targetDate) return "";

    const reportDate = new Date(); // PDF generation date
    const commitmentDate = new Date(targetDate);

    const diffMs = commitmentDate - reportDate;
    const diffWeeks = Math.max(
      0,
      Math.ceil(diffMs / (1000 * 60 * 60 * 24 * 7)),
    );

    return diffWeeks;
  };

  function getFactoryCode(factoryMap, searchValue) {
    if (!factoryMap || typeof factoryMap !== "object" || !searchValue) {
      return undefined;
    }

    const normalizedSearchValue = String(searchValue).toLowerCase();
    const match = Object.entries(factoryMap).find(([key]) => {
      return key && String(key).toLowerCase().includes(normalizedSearchValue);
    });

    return match ? match[1] : undefined;
  }
  const pc = getFactoryCode(factoryCodes, factorySelected);

  const isCustomValve =
    Array.isArray(ParentSapNumber) && ParentSapNumber.includes("CUSTOM");
  const getCommitmentDate = (oos_parents) => {
    if (!oos_parents || oos_parents.length === 0) {
      return null; // or whatever default you prefer
    }

    return oos_parents.reduce((maxItem, currentItem) => {
      const maxDate = new Date(maxItem["Lead Time"]);
      const currentDate = new Date(currentItem["Lead Time"]);

      return currentDate > maxDate ? currentItem : maxItem;
    });
  };

  function restructureMultipleBOM(parentsArray) {
    if (!Array.isArray(parentsArray)) return [];

    const result = [];

    parentsArray.forEach((parentObj) => {
      const children = parentObj.Children || [];

      // Pre-group by Level
      const levelMap = {
        1: [],
        2: [],
        3: [],
      };

      // Group Level 2 and 3 by parent for quick lookup
      const level2ByParent = {};
      const level3ByParent = {};

      children.forEach((item) => {
        const level = item.Level;
        levelMap[level]?.push(item);

        if (level === "2") {
          const parent = item["Component Parent"];
          if (!level2ByParent[parent]) level2ByParent[parent] = [];
          level2ByParent[parent].push(item);
        }

        if (level === "3") {
          const parent = String(item["Component Parent"]);
          if (!level3ByParent[parent]) level3ByParent[parent] = [];
          level3ByParent[parent].push(item);
        }
      });

      const level1 = levelMap["1"];

      const getNewLevel12 = (compNumber) => {
        const level2Items = level2ByParent[compNumber] || [];

        return level2Items.map((lvl2) => {
          const lvl3Children =
            level3ByParent[String(lvl2["Component Number"])] || [];

          return {
            ...lvl2,
            Level: "1",
            "Component Parent": null,
            Children: lvl3Children.map((lvl3) => ({
              ...lvl3,
              Level: "2",
            })),
          };
        });
      };

      const newParent = level1.map((ele) => ({
        Id: `${parentObj.Id}${ele.Id}p`,
        Plant: ele.Plant,
        "Material Number": ele["Component Number"],
        "Material Description": ele["Component Description"],
        "Basic Material": ele["Basic Material"],
        "Unit of Measure": ele["Component Unit"],
        "Legacy Material Number": ele["Legacy Material Number"],
        "MRP Type": ele["MRP Type"],
        "Committed Quantity": ele["Committed Quantity"],
        "Second Quantity": ele["Second Quantity"],
        "Second ATP Date": ele["Second ATP Date"],
        "Full ATP Date": ele["Full ATP Date"],
        "Procurement Type": ele["Procurement Type"],
        "Planned Delivery Time": ele["Planned Delivery Time"],
        "Total Replinishment Time": ele["Total Replinishment Time"],
        "In House Production Time": ele["In House Production Time"],
        "Refreshed Date": ele["Refreshed Date"],
        IsUpperItem: 1,
        BOMQty: parentObj.BOMQty,
        Children: getNewLevel12(ele["Component Number"]),
      }));

      result.push(...newParent);
    });

    return result;
  }

  const rawData = useMemo(() => {
    const parents = Array.isArray(tableData) ? tableData : [];
    const children = Array.isArray(childBOMS) ? childBOMS : [];

    const rawDataT = parents.map((p, parentIndex) => {
      const { ["Material Number"]: mtrNumber, Plant: plant } = p;

      let filteredChildren = children.filter(
        (c) => c["Material Number"] === mtrNumber,
      );

      if (plant === "3011") {
        // Group by Component Number
        const grouped = {};

        filteredChildren.forEach((child) => {
          const comp = child["Component Number"];
          const bomItem = child["BOM Item Number"];

          if (!grouped[comp]) {
            grouped[comp] = child;
          } else {
            // Prefer BOM Item Number 0010 / 10 over 0020 / 20
            const existingBom = grouped[comp]["BOM Item Number"];

            const isPreferred = (val) => val === "0010" || val === "10";
            const isLessPreferred = (val) => val === "0020" || val === "20";

            if (
              isPreferred(bomItem) ||
              (isLessPreferred(existingBom) && !isLessPreferred(bomItem))
            ) {
              grouped[comp] = child;
            }
          }
        });

        // Convert back to array
        filteredChildren = Object.values(grouped);
      }

      const childCount = filteredChildren.length;

      return {
        Id: parentIndex + 1,
        ...p,
        BOMQty: 1,
        Assembly: childCount > 1 ? "YES" : "No",
        Children: filteredChildren.map((ele, childIndex) => ({
          Id: childIndex + 1,
          ...ele,
        })),
      };
    });

    const nonphm = rawDataT.filter(
      (ele) => !ele["Material Description"].includes("PHM"),
    );
    const phm = rawDataT.filter((ele) =>
      ele["Material Description"].includes("PHM"),
    );

    const newPhm = restructureMultipleBOM(phm);

    const nrawDataT = [...nonphm, ...newPhm];
    const minLeadTimeVal = Array.isArray(leadTimeData)
      ? (leadTimeData?.[0]?.[0]?.LeadTimeAdder?.[pc]?.Minimum ?? null)
      : null;

    // const temp = getAtpLogic(valveQty, nrawDataT, minLeadTimeVal);
    const temp = getSimplifiedATPLogic(valveQty, nrawDataT, minLeadTimeVal);

    return temp.map((parent) => {
      const children = Array.isArray(parent.Children) ? parent.Children : [];

      const firstLevel = children.filter((child) => child.Level === "1");
      const secondLevel = children.filter((child) => child.Level === "2");
      const thirdLevel = children.filter((child) => child.Level === "3");

      const secondWithThird = secondLevel.map((second) => ({
        ...second,
        Children: thirdLevel.filter(
          (third) => third["Component Parent"] == second["Component Number"],
        ),
      }));

      const firstWithSecond = firstLevel.map((first) => ({
        ...first,
        Children: secondWithThird.filter(
          (second) => second["Component Parent"] == first["Component Number"],
        ),
      }));

      return { ...parent, Children: firstWithSecond };
    });
  }, [tableData, childBOMS]);

  const LeacyMaterialNumber = Array.isArray(tableData)
    ? tableData.map((ele) => ele["Legacy Material Number"])
    : [];

  const filteredData = rawData;

  useEffect(() => {
    if (!rawData?.length) return;

    const overallCommitmentDate = getCommitmentDate(
      rawData.filter((item) => item["Availabilty"] === "OUT OF STOCK"),
    );

    dispatch(
      updateTagdata({
        overallCommitmentDate: overallCommitmentDate?.["Lead Time"] || "",
      }),
    );
  }, [rawData, dispatch]);

  const isRowVisible = (row) => {
    const hasMaterials = filters.materials.length > 0;
    const hasLegacyMaterials = filters.lmaterials.length > 0;
    const hasAvailability = filters.availability.length > 0;

    const materialMatch =
      hasMaterials && filters.materials.includes(row["Material Number"]);
    const legacyMaterialMatch =
      hasLegacyMaterials &&
      filters.lmaterials.includes(row["Legacy Material Number"]);
    const availabilityMatch =
      hasAvailability && filters.availability.includes(row["Availabilty"]);

    let materialCondition = true;
    if (hasMaterials && hasLegacyMaterials) {
      materialCondition = materialMatch || legacyMaterialMatch;
    } else if (hasMaterials) {
      materialCondition = materialMatch;
    } else if (hasLegacyMaterials) {
      materialCondition = legacyMaterialMatch;
    }

    if (hasAvailability) {
      return materialCondition && availabilityMatch;
    }

    return materialCondition;
  };

  const visibleParentData = filteredData.filter(isRowVisible);

  React.useEffect(() => {
    if (triggerExport) {
      exportToCSV();
      setTriggerExport(false);
    }
  }, [triggerExport]);

  React.useEffect(() => {
    if (triggerPDFParentExport) {
      exportOnlyParentPDF()
        .catch((error) => console.error("Parent PDF export failed:", error))
        .finally(() => setTriggerPDFParentExport(false));
    }
  }, [triggerPDFParentExport]);

  React.useEffect(() => {
    if (triggerPDFParentChildExport) {
      exportParentChildPDF()
        .catch((error) =>
          console.error("Parent & child PDF export failed:", error),
        )
        .finally(() => setTriggerPDFParentChildExport(false));
    }
  }, [triggerPDFParentChildExport]);

  const formatMMDDYYyyhhmmss = (date) => {
    const pad = (num) => String(num).padStart(2, "0");

    return (
      pad(date.getMonth() + 1) +
      pad(date.getDate()) +
      String(date.getFullYear()).slice(-2) +
      pad(date.getHours()) +
      pad(date.getMinutes()) +
      pad(date.getSeconds())
    );
  };

  function exportToCSV(
    filename = `${TagData["Catalog_Code"]}_${formatMMDDYYyyhhmmss(new Date())}.csv`,
  ) {
    const escapeCSV = (value) => {
      const text = value === null || value === undefined ? "" : String(value);
      return `${text.replace(/"/g, '""')}`;
    };

    const getAvailabilityText = (item) => {
      if (item["Availabilty"] === "IN STOCK") {
        return "IN STOCK";
      }
      if (item["Availabilty"] === "OUT OF STOCK") {
        return "OUT OF STOCK";
      }
      return item["Availabilty"] || "";
    };

    const getWeeksText = (item, defaultValue = "4 WEEKS") => {
      if (item["Availabilty"] === "IN STOCK") {
        return item["Lead Time"] ? String(item["Lead Time"]) : defaultValue;
      }
      if (item["Availabilty"] === "OUT OF STOCK") {
        return item["Lead Time"]
          ? `${getRemaingWeeks(item["Lead Time"])} Weeks`
          : defaultValue;
      }
      return item["Lead Time"] ? String(item["Lead Time"]) : defaultValue;
    };

    const qtyMultiplier = Array.isArray(valveQty)
      ? (valveQty[0] ?? 0)
      : valveQty;

    const headers = [
      "Level",
      "Parent",
      "Material Number",
      "Legacy Material Number",
      "Description",
      "Basic Material",
      "Qty",
      "UOM",
      "ATP Qty",
      "Availability",
      "Weeks",
    ];

    const isFilterApplied =
      filters.materials.length > 0 ||
      filters.lmaterials.length > 0 ||
      filters.availability.length > 0;

    const metaData = [
      [],
      ["Request ID", TagData?.Request_ID],
      ["Customer", TagData?.Customer_Name],
      ["Project", TagData?.Project_Name],
      ["Tag", TagData?.Tag_No],
      ["Catalog Code", TagData?.Catalog_Code],
      ["ERP Code", TagData?.Erp_Code],
      ["Factory", factorySelected],
      ["Requested Lead Time", "4 Weeks"],
      ["BOM Version", rev.RevisionRev],
      [
        "Overall Commitment Date",
        TagData?.overallCommitmentDate
          ? `${TagData.overallCommitmentDate} (${getRemainingWeeks(
              TagData.overallCommitmentDate,
            )} Weeks)`
          : "",
      ],

      ...(isFilterApplied
        ? [
            [],
            [
              "***THIS REPORT CONTAINS FILTERED RESULTS. NOT ALL BOM DATA IS PRESENT.***",
            ],
          ]
        : []),

      [],
    ];

    const csv = [...metaData, headers.map(escapeCSV)];

    const flattenChildRows = (children, parentLevel) => {
      const rows = [];
      if (!Array.isArray(children)) return rows;

      children.forEach((child) => {
        const level = child["Level"] ? `L${child["Level"]}` : parentLevel;
        rows.push([
          level,
          child["Level"] === 1 || child["Level"] === "1"
            ? child["Material Number"]
            : child["Component Parent"],
          child["Component Number"] || "",
          child["Legacy Number"] || "",
          child["Component Description"] || "",
          child["Basic Material"] || "",
          child["Component Quantity"]
            ? child["Component Quantity"] * qtyMultiplier
            : "",
          child["Component Unit"] || child["Unit of Measure"] || "",
          child["Committed Quantity"] ?? "",
          getAvailabilityText(child) === "OUT OF STOCK"
            ? child["Lead Time"]
            : getAvailabilityText(child),
          getWeeksText(child),
        ]);

        if (Array.isArray(child.Children) && child.Children.length > 0) {
          rows.push(...flattenChildRows(child.Children, level));
        }
      });

      return rows;
    };

    [...filteredData].filter(isRowVisible).forEach((parent) => {
      csv.push(
        [
          "P",
          "-",
          parent["Material Number"] || "",
          parent["Legacy Material Number"] || "",
          parent["Material Description"] || "",
          parent["Basic Material"] || "",
          parent["BOMQty"] ? parent["BOMQty"] * qtyMultiplier : "",
          parent["Unit of Measure"] || "",
          parent["Committed Quantity"] ?? "",
          getAvailabilityText(parent) === "OUT OF STOCK"
            ? parent["Lead Time"]
            : getAvailabilityText(parent),
          getWeeksText(parent),
        ].map(escapeCSV),
        // .join(","),
      );

      csv.push(...flattenChildRows(parent.Children || []));
      // csv.push([]);
    });

    const csvString = csv
      .map((row) =>
        row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");

    const blob = new Blob([csvString], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  const formatBasicMaterial = (value) => {
    if (!value) return "";

    return String(value).replace(/\//g, "/\n");
  };
  const exportOnlyParentPDF = async () => {
    const parentRows = filteredData.filter(isRowVisible);
    const styles = StyleSheet.create({
      page: {
        paddingTop: 25,
        paddingBottom: 45,
        paddingHorizontal: 16,
        fontSize: 6.5,
        fontFamily: "Helvetica",
      },
      section: { marginBottom: 4 },
      filteredBanner: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#eef4ff",
        borderWidth: 1,
        borderColor: "#c7d8ff",
        paddingVertical: 6,
        paddingHorizontal: 10,
        marginBottom: 12,
      },
      infoIcon: {
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: "#2563eb",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 8,
      },
      infoIconText: {
        color: "#ffffff",
        fontSize: 9,
        fontWeight: "bold",
      },
      filteredBannerText: {
        flex: 1,
        fontSize: 8,
        color: "#374151",
      },
      filteredBannerTextBold: {
        color: "#1e40af",
        fontSize: 8,
        fontWeight: "bold",
      },
      title: {
        fontSize: 9,
        marginBottom: 6,
        fontWeight: "bold",
        textAlign: "center",
      },
      bigTitle: {
        fontSize: 12,
        marginBottom: 6,
        fontWeight: "bold",
        textAlign: "center",
      },
      metadataRow: { flexDirection: "row", marginBottom: 3, flexWrap: "wrap" },
      metaKey: { width: "30%", fontSize: 7, fontWeight: "bold" },
      metaValue: { width: "70%", fontSize: 7 },
      banner: {
        backgroundColor: "#013B84", // Emerson blue from logo
        color: "#ffffff",
        paddingVertical: 12,
        paddingHorizontal: 10,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 8,
        marginBottom: 10,
      },
      logo: {
        width: 65,
        height: 43,
        marginRight: 8,
        resizeMode: "contain",
      },
      bannerTitle: {
        flex: 1,
        fontSize: 14,
        fontWeight: "bold",
        color: "#ffffff",
        marginRight: 8,
        textAlign: "center",
      },
      bannerDate: {
        fontSize: 8,
        color: "#ffffff",
        textAlign: "right",
      },
      headerRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        borderBottomWidth: 1,
        borderBottomColor: "#000",
        borderBottomStyle: "solid",
        paddingBottom: 4,
        marginBottom: 4,
      },
      headerCell: {
        fontSize: 6,
        fontWeight: "bold",
        paddingRight: 3,
        paddingVertical: 2,
        flex: 1,
        flexShrink: 1,
        minWidth: 40,
        borderRightWidth: 1,
        borderRightColor: "#d1d5db",
        borderRightStyle: "solid",
        textAlign: "center",
        flexWrap: "wrap",
      },
      row: {
        flexDirection: "row",
        flexWrap: "nowrap", // Prevent wrapping to keep columns aligned
        borderBottomWidth: 1,
        borderBottomColor: "#d1d5db",
        borderBottomStyle: "solid",
        paddingVertical: 2,
      },
      cell: {
        fontSize: 5.8,
        paddingRight: 2,
        paddingLeft: 2,
        paddingVertical: 2,
        flex: 1,
        flexShrink: 1,
        minWidth: 40,
        lineHeight: 1.2,
        borderRightWidth: 1,
        borderRightColor: "#d1d5db",
        borderRightStyle: "solid",
        textAlign: "center",
      },
      // descriptionCell: {
      //   flex: 2,
      //   flexShrink: 1,
      //   minWidth: 80,
      //   flexWrap: "wrap",
      //   wordBreak: "break-all",
      //   overflowWrap: "anywhere",
      // },
      // Column-specific styles for better width control
      materialNumberCell: {
        flex: 0.75,
        flexShrink: 1,
        minWidth: 38,
      },
      legacyMaterialCell: {
        flex: 0.9,
        flexShrink: 1,
        minWidth: 42,
      },
      descriptionCell: {
        flex: 2.2,
        flexShrink: 1,
        minWidth: 90,
      },
      basicMatCell: {
        flex: 1.35,
        flexShrink: 1,
        minWidth: 75,
      },
      qtyCell: {
        flex: 0.4,
        flexShrink: 1,
        minWidth: 18,
      },
      uomCell: {
        flex: 0.25,
        flexShrink: 1,
        minWidth: 14,
      },
      atpQtyCell: {
        flex: 0.35,
        flexShrink: 1,
        minWidth: 18,
      },
      availabilityCell: {
        flex: 0.75,
        flexShrink: 1,
        minWidth: 40,
      },
      weeksCell: {
        flex: 0.55,
        flexShrink: 1,
        minWidth: 28,
      },
      footer: {
        position: "absolute",
        bottom: 20,
        left: 16,
        right: 16,
        fontSize: 6,
        flexDirection: "column",
      },
    });

    const pdfDocument = (
      <Document>
        <Page size="A4" style={styles.page} wrap>
          <View style={styles.banner}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                minWidth: 0,
                flex: 1,
              }}
            >
              <Image style={styles.logo} src="/Emerson logo.png" />
              <Text style={styles.bannerTitle} numberOfLines={1}>
                PRV Availability Check - Parent Only Report
              </Text>
            </View>
            <Text style={styles.bannerDate}>{new Date().toLocaleString()}</Text>
          </View>
          <View style={styles.filteredBanner}>
            <View style={styles.infoIcon}>
              <Text style={styles.infoIconText}>i</Text>
            </View>
            <Text style={styles.filteredBannerText}>
              <Text style={styles.filteredBannerTextBold}>
                This report contains filtered results.
              </Text>{" "}
              Not all BOM data is present.
            </Text>
          </View>
          <View style={styles.section}>
            <View style={styles.metadataRow}>
              <Text style={styles.metaKey}>Request ID:</Text>
              <Text style={styles.metaValue}>{TagData?.Request_ID || "-"}</Text>
            </View>
            <View style={styles.metadataRow}>
              <Text style={styles.metaKey}>Customer:</Text>
              <Text style={styles.metaValue}>
                {TagData?.Customer_Name || "-"}
              </Text>
            </View>
            <View style={styles.metadataRow}>
              <Text style={styles.metaKey}>Project:</Text>
              <Text style={styles.metaValue}>
                {TagData?.Project_Name || "-"}
              </Text>
            </View>
            <View style={styles.metadataRow}>
              <Text style={styles.metaKey}>Catalog Code:</Text>
              <Text style={styles.metaValue}>
                {TagData?.Catalog_Code || "-"}
              </Text>
            </View>
            <View style={styles.metadataRow}>
              <Text style={styles.metaKey}>Factory:</Text>
              <Text style={styles.metaValue}>{factorySelected || "-"}</Text>
            </View>
            <View style={styles.metadataRow}>
              <Text style={styles.metaKey}>Requested Quantity:</Text>
              <Text style={styles.metaValue}>
                {Array.isArray(valveQty) ? (valveQty[0] ?? 0) : valveQty}
              </Text>
            </View>
            <View style={styles.metadataRow}>
              <Text style={styles.metaKey}>Overall Commitment Date:</Text>
              <Text style={styles.metaValue}>
                {TagData?.overallCommitmentDate
                  ? `${TagData.overallCommitmentDate} (${getRemainingWeeks(
                      TagData.overallCommitmentDate,
                    )} Weeks)`
                  : "-"}
              </Text>
            </View>
          </View>
          <View wrap={false}>
            <View style={styles.headerRow}>
              <Text style={[styles.headerCell, styles.materialNumberCell]}>
                Material Number
              </Text>
              <Text style={[styles.headerCell, styles.legacyMaterialCell]}>
                Legacy Material
              </Text>
              <Text style={[styles.headerCell, styles.descriptionCell]}>
                Description
              </Text>
              <Text style={[styles.headerCell, styles.basicMatCell]}>
                Basic Mat.
              </Text>
              <Text style={[styles.headerCell, styles.qtyCell]}>Qty</Text>
              <Text style={[styles.headerCell, styles.uomCell]}>UOM</Text>
              <Text style={[styles.headerCell, styles.atpQtyCell]}>
                ATP Qty
              </Text>
              <Text style={[styles.headerCell, styles.availabilityCell]}>
                Availability
              </Text>
              <Text style={[styles.headerCell, styles.weeksCell]}>Weeks</Text>
            </View>
          </View>
          {parentRows.map((parent, index) => (
            <View
              key={`parent-pdf-row-${index}`}
              style={styles.row}
              wrap={false}
              minPresenceAhead={40}
            >
              <Text style={[styles.cell, styles.materialNumberCell]}>
                {parent["Material Number"] || ""}
              </Text>
              <Text style={[styles.cell, styles.legacyMaterialCell]}>
                {parent["Legacy Material Number"] || ""}
              </Text>
              <Text style={[styles.cell, styles.descriptionCell]}>
                {parent["Material Description"] || ""}
              </Text>
              <Text style={[styles.cell, styles.basicMatCell]}>
                {formatBasicMaterial(parent["Basic Material"])}
              </Text>
              <Text style={[styles.cell, styles.qtyCell]}>
                {parent["BOMQty"]
                  ? parent["BOMQty"] *
                    (Array.isArray(valveQty) ? (valveQty[0] ?? 0) : valveQty)
                  : ""}
              </Text>
              <Text style={[styles.cell, styles.uomCell]}>
                {parent["Unit of Measure"] || ""}
              </Text>
              <Text style={[styles.cell, styles.atpQtyCell]}>
                {parent["Committed Quantity"] ?? ""}
              </Text>

              <Text style={[styles.cell, styles.availabilityCell]}>
                {parent["Availabilty"] === "IN STOCK"
                  ? "IN STOCK"
                  : parent["Lead Time"]}
              </Text>
              <Text style={[styles.cell, styles.weeksCell]}>
                {parent["Availabilty"] === "OUT OF STOCK"
                  ? `${getRemaingWeeks(parent["Lead Time"])} Weeks`
                  : parent["Lead Time"] || ""}
              </Text>
            </View>
          ))}
          <View style={styles.footer}>
            <Text
              style={{
                fontSize: 7,
                marginBottom: 4,
                textAlign: "center",
                fontWeight: "bold",
              }}
            >
              NOTE: Materials will not be reserved based on availability check.
              A committed sales order is required.
            </Text>
            {/* <Text style={{ fontSize: 6, marginBottom: 2 }}>
              Disclaimer: This report is provided for reference purposes only
              and may not reflect final availability. Please confirm with the
              ERP system for ordering.
            </Text> */}
            {/* <Text style={{ fontSize: 6, marginTop: 4 }}>
              <Text style={{ fontWeight: "bold" }}>Reference Number: </Text>
              {TPCDataId}
            </Text> */}
            <View style={{ flexDirection: "row", marginTop: 4 }}>
              <Text style={{ width: "70%", fontSize: 6 }}>
                <Text style={{ fontWeight: "bold" }}>ERP Code: </Text>
                {TagData?.Erp_Code || "-"}
              </Text>
              <Text style={{ width: "30%", fontSize: 6, textAlign: "right" }}>
                <Text style={{ fontWeight: "bold" }}>BOM Version: </Text>
                {rev?.RevisionRev || "-"}
              </Text>
            </View>
          </View>
        </Page>
      </Document>
    );

    const blob = await pdf(pdfDocument).toBlob();
    const filename = `${TagData?.Catalog_Code || "availability"}_${formatMMDDYYyyhhmmss(new Date())}.pdf`;
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportParentChildPDF = async () => {
    const parentRows = filteredData.filter(isRowVisible);
    const qtyMultiplier = Array.isArray(valveQty)
      ? (valveQty[0] ?? 0)
      : valveQty;

    const styles = StyleSheet.create({
      page: {
        paddingTop: 25,
        paddingBottom: 45,
        paddingHorizontal: 16,
        fontSize: 6.5,
        fontFamily: "Helvetica",
      },
      section: { marginBottom: 4 },
      filteredBanner: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#eef4ff",
        borderWidth: 1,
        borderColor: "#c7d8ff",
        paddingVertical: 6,
        paddingHorizontal: 10,
        marginBottom: 12,
      },
      infoIcon: {
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: "#2563eb",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 8,
      },
      infoIconText: {
        color: "#ffffff",
        fontSize: 9,
        fontWeight: "bold",
      },
      filteredBannerText: {
        flex: 1,
        fontSize: 8,
        color: "#374151",
      },
      filteredBannerTextBold: {
        color: "#1e40af",
        fontSize: 8,
        fontWeight: "bold",
      },
      title: {
        fontSize: 9,
        marginBottom: 6,
        fontWeight: "bold",
        textAlign: "center",
      },
      bigTitle: {
        fontSize: 12,
        marginBottom: 6,
        fontWeight: "bold",
        textAlign: "center",
      },
      metadataRow: { flexDirection: "row", marginBottom: 3, flexWrap: "wrap" },
      metaKey: { width: "30%", fontSize: 7, fontWeight: "bold" },
      metaValue: { width: "70%", fontSize: 7 },
      banner: {
        backgroundColor: "#013B84", // Emerson blue from logo
        color: "#ffffff",
        paddingVertical: 12,
        paddingHorizontal: 10,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 8,
        marginBottom: 10,
      },
      logo: {
        width: 65,
        height: 43,
        marginRight: 8,
        resizeMode: "contain",
      },
      bannerTitle: {
        flex: 1,
        fontSize: 14,
        fontWeight: "bold",
        color: "#ffffff",
        marginRight: 8,
        textAlign: "center",
      },
      bannerDate: {
        fontSize: 8,
        color: "#ffffff",
        textAlign: "right",
      },
      headerRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        borderBottomWidth: 1,
        borderBottomColor: "#000",
        borderBottomStyle: "solid",
        paddingBottom: 4,
        marginBottom: 4,
      },
      headerCell: {
        fontSize: 6,
        fontWeight: "bold",
        paddingRight: 3,
        paddingVertical: 2,
        flex: 1,
        flexShrink: 1,
        minWidth: 40,
        borderRightWidth: 1,
        borderRightColor: "#d1d5db",
        borderRightStyle: "solid",
        textAlign: "center",
        flexWrap: "wrap",
      },
      parentRow: {
        flexDirection: "row",
        flexWrap: "nowrap", // Prevent wrapping to keep columns aligned
        borderBottomWidth: 1,
        borderBottomColor: "#cbd5e1",
        borderBottomStyle: "solid",
        backgroundColor: "#edf2ff",
        paddingVertical: 3,
      },
      childRow: {
        flexDirection: "row",
        flexWrap: "nowrap", // Prevent wrapping to keep columns aligned
        borderBottomWidth: 1,
        borderBottomColor: "#e2e8f0",
        borderBottomStyle: "solid",
        backgroundColor: "#ffffff",
        paddingVertical: 2,
      },
      cell: {
        fontSize: 5.8,
        paddingRight: 2,
        paddingLeft: 2,
        paddingVertical: 2,
        flex: 1,
        flexShrink: 1,
        minWidth: 40,
        lineHeight: 1.2,
        borderRightWidth: 1,
        borderRightColor: "#d1d5db",
        borderRightStyle: "solid",
        textAlign: "center",
      },
      parentCell: {
        fontSize: 6,
        paddingRight: 3,
        paddingVertical: 2,
        flex: 1,
        flexShrink: 1,
        minWidth: 40,
        lineHeight: 1.1,
        borderRightWidth: 1,
        borderRightColor: "#d1d5db",
        borderRightStyle: "solid",
        textAlign: "center",
        fontWeight: "bold",
      },
      childCell: {
        fontSize: 6,
        paddingRight: 3,
        paddingVertical: 2,
        flex: 1,
        flexShrink: 1,
        minWidth: 40,
        lineHeight: 1.1,
        borderRightWidth: 1,
        borderRightColor: "#e2e8f0",
        borderRightStyle: "solid",
        textAlign: "center",
        color: "#475569",
      },
      markerCell: {
        fontSize: 6,
        paddingRight: 3,
        paddingVertical: 2,
        flex: 0.8,
        flexShrink: 1,
        minWidth: 32,
        lineHeight: 1.1,
        borderRightWidth: 1,
        borderRightColor: "#d1d5db",
        borderRightStyle: "solid",
        textAlign: "center",
        fontWeight: "bold",
      },
      // descriptionCell: {
      //   flex: 2,
      //   flexShrink: 1,
      //   minWidth: 80,
      //   flexWrap: "wrap",
      //   wordBreak: "break-all",
      //   overflowWrap: "anywhere",
      // },
      // Column-specific styles for better width control
      materialNumberCell: {
        flex: 0.75,
        flexShrink: 1,
        minWidth: 38,
      },
      legacyMaterialCell: {
        flex: 0.9,
        flexShrink: 1,
        minWidth: 42,
      },
      descriptionCell: {
        flex: 2.2,
        flexShrink: 1,
        minWidth: 90,
      },
      basicMatCell: {
        flex: 1.35,
        flexShrink: 1,
        minWidth: 75,
      },
      qtyCell: {
        flex: 0.4,
        flexShrink: 1,
        minWidth: 18,
      },
      uomCell: {
        flex: 0.25,
        flexShrink: 1,
        minWidth: 14,
      },
      atpQtyCell: {
        flex: 0.35,
        flexShrink: 1,
        minWidth: 18,
      },
      availabilityCell: {
        flex: 0.75,
        flexShrink: 1,
        minWidth: 40,
      },
      weeksCell: {
        flex: 0.55,
        flexShrink: 1,
        minWidth: 28,
      },
      footer: {
        position: "absolute",
        bottom: 20,
        left: 16,
        right: 16,
        fontSize: 6,
        flexDirection: "column",
      },
      indent: {
        paddingLeft: 8,
      },
    });

    const buildChildRows = (children, nestingLevel = 1, parentKey = "") => {
      if (!Array.isArray(children)) return [];

      return children.flatMap((child, index) => {
        const rowKey = `${parentKey}-${nestingLevel}-${index}`;
        const currentRow = (
          <View
            key={`child-row-${rowKey}`}
            style={styles.childRow}
            wrap={false}
            minPresenceAhead={40}
          >
            <Text style={[styles.markerCell]}>
              {child["Level"] ? `L${child["Level"]}` : `L${nestingLevel}`}
            </Text>
            <Text
              style={[
                styles.childCell,
                styles.materialNumberCell,
                { textAlign: "center" },
              ]}
            >
              {child["Component Number"] || ""}
            </Text>
            <Text style={[styles.childCell, styles.legacyMaterialCell]}>
              {child["Legacy Material Number"] || ""}
            </Text>
            <Text style={[styles.childCell, styles.descriptionCell]}>
              {child["Component Description"] || ""}
            </Text>
            <Text style={[styles.childCell, styles.basicMatCell]}>
              {formatBasicMaterial(child["Basic Material"])}
            </Text>
            <Text style={[styles.childCell, styles.qtyCell]}>
              {child["Component Quantity"]
                ? child["Component Quantity"] * qtyMultiplier
                : ""}
            </Text>
            <Text style={[styles.childCell, styles.uomCell]}>
              {child["Component Unit"] || child["Unit of Measure"] || ""}
            </Text>
            <Text style={[styles.childCell, styles.atpQtyCell]}>
              {child["Committed Quantity"] ?? ""}
            </Text>
            <Text style={[styles.childCell, styles.availabilityCell]}>
              {child["Availabilty"] === "IN STOCK"
                ? "IN STOCK"
                : child["Availabilty"] === "OUT OF STOCK"
                  ? child["Lead Time"]
                  : child["Availabilty"] || ""}
            </Text>
            <Text style={[styles.childCell, styles.weeksCell]}>
              {child["Availabilty"] === "OUT OF STOCK"
                ? `${getRemaingWeeks(child["Lead Time"])} Weeks`
                : child["Lead Time"] || ""}
            </Text>
          </View>
        );

        const nestedRows = buildChildRows(
          child.Children,
          nestingLevel + 1,
          rowKey,
        );

        return [currentRow, ...nestedRows];
      });
    };

    const pdfDocument = (
      <Document>
        <Page size="A4" style={styles.page} wrap>
          <View style={styles.banner}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                minWidth: 0,
                flex: 1,
              }}
            >
              <Image style={styles.logo} src="/Emerson logo.png" />
              <Text style={styles.bannerTitle} numberOfLines={1}>
                PRV Availability Check - Parent and Child Report
              </Text>
            </View>
            <Text style={styles.bannerDate}>{new Date().toLocaleString()}</Text>
          </View>
          <View style={styles.filteredBanner}>
            <View style={styles.infoIcon}>
              <Text style={styles.infoIconText}>i</Text>
            </View>
            <Text style={styles.filteredBannerText}>
              <Text style={styles.filteredBannerTextBold}>
                This report contains filtered results.
              </Text>{" "}
              Not all BOM data is present.
            </Text>
          </View>
          <View style={styles.section}>
            <View style={styles.metadataRow}>
              <Text style={styles.metaKey}>Request ID:</Text>
              <Text style={styles.metaValue}>{TagData?.Request_ID || "-"}</Text>
            </View>
            <View style={styles.metadataRow}>
              <Text style={styles.metaKey}>Customer:</Text>
              <Text style={styles.metaValue}>
                {TagData?.Customer_Name || "-"}
              </Text>
            </View>
            <View style={styles.metadataRow}>
              <Text style={styles.metaKey}>Project:</Text>
              <Text style={styles.metaValue}>
                {TagData?.Project_Name || "-"}
              </Text>
            </View>
            <View style={styles.metadataRow}>
              <Text style={styles.metaKey}>Catalog Code:</Text>
              <Text style={styles.metaValue}>
                {TagData?.Catalog_Code || "-"}
              </Text>
            </View>
            <View style={styles.metadataRow}>
              <Text style={styles.metaKey}>Factory:</Text>
              <Text style={styles.metaValue}>{factorySelected || "-"}</Text>
            </View>
            <View style={styles.metadataRow}>
              <Text style={styles.metaKey}>Requested Quantity:</Text>
              <Text style={styles.metaValue}>
                {Array.isArray(valveQty) ? (valveQty[0] ?? 0) : valveQty}
              </Text>
            </View>
            <View style={styles.metadataRow}>
              <Text style={styles.metaKey}>Overall Commitment Date:</Text>
              <Text style={styles.metaValue}>
                {TagData?.overallCommitmentDate
                  ? `${TagData.overallCommitmentDate} (${getRemainingWeeks(
                      TagData.overallCommitmentDate,
                    )} Weeks)`
                  : "-"}
              </Text>
            </View>
          </View>
          <View wrap={false}>
            <View style={styles.headerRow}>
              <Text style={[styles.headerCell, styles.markerCell]}>Level</Text>
              <Text style={[styles.headerCell, styles.materialNumberCell]}>
                Material Number
              </Text>
              <Text style={[styles.headerCell, styles.legacyMaterialCell]}>
                Legacy Material
              </Text>
              <Text style={[styles.headerCell, styles.descriptionCell]}>
                Description
              </Text>
              <Text style={[styles.headerCell, styles.basicMatCell]}>
                Basic Mat.
              </Text>
              <Text style={[styles.headerCell, styles.qtyCell]}>Qty</Text>
              <Text style={[styles.headerCell, styles.uomCell]}>UOM</Text>
              <Text style={[styles.headerCell, styles.atpQtyCell]}>
                ATP Qty
              </Text>
              <Text style={[styles.headerCell, styles.availabilityCell]}>
                Availability
              </Text>
              <Text style={[styles.headerCell, styles.weeksCell]}>Weeks</Text>
            </View>
          </View>
          {parentRows.map((parent, index) => (
            <React.Fragment key={`parent-child-pdf-${index}`}>
              <View style={styles.parentRow} wrap={false} minPresenceAhead={40}>
                <Text style={[styles.markerCell]}>P</Text>
                <Text style={[styles.parentCell, styles.materialNumberCell]}>
                  {parent["Material Number"] || ""}
                </Text>
                <Text style={[styles.parentCell, styles.legacyMaterialCell]}>
                  {parent["Legacy Material Number"] || ""}
                </Text>
                <Text style={[styles.parentCell, styles.descriptionCell]}>
                  {parent["Material Description"] || ""}
                </Text>
                <Text style={[styles.parentCell, styles.basicMatCell]}>
                  {formatBasicMaterial(parent["Basic Material"])}
                </Text>
                <Text style={[styles.parentCell, styles.qtyCell]}>
                  {parent["BOMQty"] ? parent["BOMQty"] * qtyMultiplier : ""}
                </Text>
                <Text style={[styles.parentCell, styles.uomCell]}>
                  {parent["Unit of Measure"] || ""}
                </Text>
                <Text style={[styles.parentCell, styles.atpQtyCell]}>
                  {parent["Committed Quantity"] ?? ""}
                </Text>
                <Text style={[styles.parentCell, styles.availabilityCell]}>
                  {parent["Availabilty"] === "IN STOCK"
                    ? "IN STOCK"
                    : parent["Lead Time"]}
                </Text>
                <Text style={[styles.parentCell, styles.weeksCell]}>
                  {parent["Availabilty"] === "OUT OF STOCK"
                    ? `${getRemaingWeeks(parent["Lead Time"])} Weeks`
                    : parent["Lead Time"] || ""}
                </Text>
              </View>
              {buildChildRows(parent.Children, 1, `parent-${index}`)}
            </React.Fragment>
          ))}
          <View style={styles.footer}>
            <Text
              style={{
                fontSize: 7,
                marginBottom: 4,
                textAlign: "center",
                fontWeight: "bold",
              }}
            >
              NOTE: Materials will not be reserved based on availability check.
              A committed sales order is required.
            </Text>
            {/* <Text style={{ fontSize: 6, marginBottom: 2 }}>
              Disclaimer: This report is provided for reference purposes only
              and may not reflect final availability. Please confirm with the
              ERP system for ordering.
            </Text> */}
            {/* <Text style={{ fontSize: 6, marginTop: 4 }}>
              <Text style={{ fontWeight: "bold" }}>Reference Number: </Text>
              {TPCDataId}
            </Text> */}
            <View style={{ flexDirection: "row", marginTop: 4 }}>
              <Text style={{ width: "70%", fontSize: 6 }}>
                <Text style={{ fontWeight: "bold" }}>ERP Code: </Text>
                {TagData?.Erp_Code || "-"}
              </Text>
              <Text style={{ width: "30%", fontSize: 6, textAlign: "right" }}>
                <Text style={{ fontWeight: "bold" }}>BOM Version: </Text>
                {rev?.RevisionRev || "-"}
              </Text>
            </View>
          </View>
        </Page>
      </Document>
    );

    const blob = await pdf(pdfDocument).toBlob();
    const filename = `${TagData?.Catalog_Code || "availability"}_${formatMMDDYYyyhhmmss(new Date())}.pdf`;
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  if (isCustomValve) {
    return (
      <Box
        sx={{
          width: "100%",
          minHeight: "60vh",
          alignItems: "center",
          padding: "24px",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Box
          sx={{
            border: "1px solid #ff4d4f",
            color: "#ff1f1f",
            maxWidth: "600px",
            p: 2,
            fontSize: "0.9rem",
            backgroundColor: "#fff",
          }}
        >
          <Typography
            variant="h5"
            sx={{
              textAlign: "center",
              fontWeight: 700,
              mb: 3,
              color: "#ff1f1f",
            }}
          >
            ⚠ Special Configuration
          </Typography>

          <Typography
            sx={{
              fontSize: "1rem",
              lineHeight: 1.6,
              mb: 4,
              color: "#ff1f1f",
            }}
          >
            The requested valve has been identified as a special configuration
            due to one or more components not being available in the standard
            Bill of Materials.
          </Typography>

          <Typography
            sx={{
              fontSize: "1rem",
              lineHeight: 1.6,
              color: "#ff1f1f",
            }}
          >
            To proceed, either modify the configuration to a standard offering
            or contact the factory to obtain a quoted lead time for the special
            configuration.
          </Typography>
        </Box>
      </Box>
    );
  }
  if (loading) {
    const headerCells = [
      "",
      "Material Number",
      "Description",
      "Basic Material",
      "Assembly",
      "Qty",
      "UOM",
      "ATP Qty",
      "2nd Qty",
      "Availability",
      "Weeks",
    ];

    return (
      <Box sx={{ width: "100%", padding: "24px" }}>
        <TableContainer
          component={Paper}
          sx={{
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            borderRadius: "8px",
            overflowY: "auto",
            maxHeight: "60vh",
            height: "auto",
          }}
        >
          <Table
            stickyHeader
            sx={{
              "& .MuiTableCell-head": {
                backgroundColor: "#f5f5f5",
                fontWeight: 400,
                fontSize: "0.75rem",
                color: "#424242",
                borderBottom: "2px solid #e0e0e0",
                padding: "10px 8px",
              },
              "& .MuiTableCell-body": {
                padding: "8px 6px",
                fontSize: "0.75rem",
              },
            }}
          >
            <TableHead>
              <TableRow>
                {headerCells.map((label, index) => (
                  <TableCell
                    key={index}
                    align={index === 0 ? "center" : "left"}
                  >
                    <Skeleton
                      animation="wave"
                      width={label ? 120 : 24}
                      height={24}
                    />
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.from({ length: 6 }).map((_, rowIndex) => (
                <TableRow key={rowIndex}>
                  {Array.from({ length: headerCells.length }).map(
                    (__, cellIndex) => (
                      <TableCell key={cellIndex}>
                        <Skeleton animation="wave" width="100%" height={24} />
                      </TableCell>
                    ),
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  }

  const toggleNode = (key) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const isExpanded = (key) => expandedNodes.has(key);

  const getLevelLabel = (level, isParent = false) =>
    isParent ? "P" : `L${level || ""}`;

  const getLevelChipStyles = (level, isParent = false) => {
    if (isParent) {
      return { bgcolor: "#e3f2fd", color: "#1565c0" };
    }
    if (level === "1" || level === 1) {
      return { bgcolor: "#d1fae5", color: "#047857" };
    }
    if (level === "2" || level === 2) {
      return { bgcolor: "#fef3c7", color: "#b45309" };
    }
    if (level === "3" || level === 3) {
      return { bgcolor: "#fee2e2", color: "#b91c1c" };
    }
    return { bgcolor: "#e2e8f0", color: "#475569" };
  };

  const groupByLevel = (children) => {
    return children.reduce((acc, child) => {
      const level = child["Level"];
      if (!acc[level]) acc[level] = [];
      acc[level].push(child);
      return acc;
    }, {});
  };

  const getChildRowKey = (parentId, parentLevel, rowPath) =>
    `${parentId}-${parentLevel}-${rowPath}`;

  // const expandAllParents = () => {};

  const expandAllParents = () => {
    setExpandAll((prevExpand) => {
      const willExpand = !prevExpand;
      if (willExpand) {
        const next = new Set();

        // Walk through filteredData to build keys for all parents and child rows
        filteredData.forEach((parent) => {
          const parentKey = `parent-${parent["Id"]}`;
          next.add(parentKey);

          const traverse = (children, parentId, parentLevel, basePath) => {
            if (!Array.isArray(children)) return;
            children.forEach((child, idx) => {
              const level = String(child["Level"] ?? parentLevel ?? "");
              const rowPath = basePath
                ? `${basePath}-${idx}`
                : `${level}-${idx}`;
              next.add(getChildRowKey(parentId, level, rowPath));
              if (Array.isArray(child.Children) && child.Children.length) {
                traverse(
                  child.Children,
                  parentId,
                  parentLevel || level,
                  rowPath,
                );
              }
            });
          };

          if (Array.isArray(parent.Children)) {
            parent.Children.forEach((child, idx) => {
              const level = String(child["Level"] ?? "");
              const rowPath = `${level}-${idx}`;
              next.add(getChildRowKey(parent["Id"], level, rowPath));
              if (Array.isArray(child.Children) && child.Children.length) {
                traverse(child.Children, parent["Id"], level, rowPath);
              }
            });
          }
        });

        setExpandedNodes(next);
      } else {
        setExpandedNodes(new Set());
      }

      return willExpand;
    });
  };

  const renderChildRow = (
    child,
    nestingLevel,
    parentId,
    parentLevel,
    rowPath,
  ) => {
    const hasChildren =
      Array.isArray(child.Children) && child.Children.length > 0;
    const childRowKey = getChildRowKey(parentId, parentLevel, rowPath);

    return (
      <React.Fragment key={childRowKey}>
        <TableRow
          sx={{
            backgroundColor: "#ffffff",
            "& .MuiTableCell-body": {
              fontSize: "0.75rem",
              color: "#424242",
            },
          }}
        >
          <TableCell
            align="left"
            sx={{ width: "40px", paddingLeft: `${nestingLevel * 24 + 8}px` }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
                minHeight: "32px",
              }}
            >
              <Chip
                label={getLevelLabel(child["Level"])}
                size="small"
                sx={{
                  mr: hasChildren ? 1 : 0,
                  fontWeight: 600,
                  ...getLevelChipStyles(child["Level"]),
                }}
              />
              {hasChildren && (
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleNode(childRowKey);
                  }}
                  sx={{
                    padding: "4px",
                    color: "#1976d2",
                    ml: 0.5,
                  }}
                >
                  {isExpanded(childRowKey) ? (
                    <ExpandMoreIcon />
                  ) : (
                    <ChevronRight />
                  )}
                </IconButton>
              )}
            </Box>
          </TableCell>
          <TableCell>
            {/* <Badge
              variant="dot"
              sx={{
                "& .MuiBadge-badge": {
                  backgroundColor:
                    child["Level"] == 1
                      ? "#22c55e"
                      : child["Level"] == 2
                        ? "#f59e0b"
                        : child["Level"] == 3
                          ? "#ef4444"
                          : "#9ca3af",
                  color:
                    child["Level"] == 1
                      ? "#22c55e"
                      : child["Level"] == 2
                        ? "#f59e0b"
                        : child["Level"] == 3
                          ? "#ef4444"
                          : "#9ca3af",
                },
              }}
            />{" "} */}
            {child["Component Number"]}
          </TableCell>
          <TableCell>{child["Legacy Material Number"]}</TableCell>
          <TableCell>{child["Component Description"]}</TableCell>
          <TableCell>{child["Basic Material"] || "-"}</TableCell>
          {/* <TableCell align="center">-</TableCell> */}
          <TableCell>{child["Component Quantity"] * valveQty}</TableCell>
          <TableCell>
            {child["Component Unit"] || child["Unit of Measure"] || "-"}
          </TableCell>
          <TableCell>{child["Committed Quantity"]}</TableCell>
          {/* <TableCell align="right">{child["Second Quantity"]}</TableCell> */}
          {/*  */}
          <TableCell>
            {child["Availabilty"] === "IN STOCK" ? (
              <CheckCircleIcon style={{ color: "green", fontSize: "1rem" }} />
            ) : child["Availabilty"] === "OUT OF STOCK" ? (
              <b style={{ color: "red" }}>{child["Lead Time"]}</b>
            ) : (
              <ReportIcon style={{ color: "gray", fontSize: "1rem" }} />
            )}
          </TableCell>
          {/*  */}
          {/* <TableCell align="center">
            {child["Availabilty"] == "IN STOCK" ? (
              <CheckCircleIcon style={{ color: "green", fontSize: "1rem" }} />
            ) : (
              child["Full ATP Date"]
              // <DangerousIcon style={{ color: "red", fontSize: "1rem" }} />
            )}
          </TableCell> */}
          <TableCell>
            {child["Availabilty"] === "IN STOCK" ? (
              <b>{child["Lead Time"]}</b>
            ) : child["Availabilty"] === "OUT OF STOCK" ? (
              <b>{getRemaingWeeks(child["Lead Time"])} Weeks</b>
            ) : (
              <ReportIcon style={{ color: "gray", fontSize: "1rem" }} />
            )}
          </TableCell>
          {/* <TableCell align="center">4 WEEKS</TableCell> */}
        </TableRow>

        {hasChildren && isExpanded(childRowKey)
          ? child.Children.map((nestedChild, nestedIndex) =>
              renderChildRow(
                nestedChild,
                nestingLevel + 1,
                parentId,
                parentLevel,
                `${rowPath}-${nestedIndex}`,
              ),
            )
          : null}
      </React.Fragment>
    );
  };

  const getRemaingWeeks = (leadTime) => {
    const leadTimeDate = new Date(leadTime);
    const today = new Date();

    const diffInMs = leadTimeDate - today;
    const diffInWeeks = diffInMs / (1000 * 60 * 60 * 24 * 7);

    const remainingWeeks = Math.max(0, Math.ceil(diffInWeeks));
    return remainingWeeks;
  };

  return (
    <Box sx={{ width: "100%", padding: "24px" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        {/* Left side */}
        <Stack direction="row" spacing={1} alignItems="center">
          <FilterDropdown
            ParentSapNumber={ParentSapNumber}
            LeacyMaterialNumber={LeacyMaterialNumber}
            Availabilty={["IN STOCK", "OUT OF STOCK"]}
            filters={filters}
            setFilters={setFilters}
          />
        </Stack>
        {/*  */}

        {/*  */}
        <Stack direction="row" spacing={1} alignItems="center">
          {expandAll ? (
            <IconButton
              sx={{
                ml: "20px",
                borderRadius: "8px",
                boxShadow: 2,
                width: 40,
                height: 40,
                bgcolor: "background.paper",
                "&:hover": {
                  boxShadow: 6,
                  bgcolor: "action.hover",
                },
                transition: "all 0.2s ease-in-out",
              }}
            >
              <CloseFullscreenIcon
                sx={{ cursor: "pointer" }}
                onClick={expandAllParents}
              />
            </IconButton>
          ) : (
            <IconButton
              sx={{
                ml: "20px",
                borderRadius: "8px", // makes it square (not round)
                boxShadow: 2, // depth
                width: 40,
                height: 40,
                bgcolor: "background.paper",
                "&:hover": {
                  boxShadow: 6,
                  bgcolor: "action.hover",
                },
                transition: "all 0.2s ease-in-out",
              }}
            >
              <OpenInFullIcon
                sx={{ cursor: "pointer" }}
                onClick={expandAllParents}
              />
            </IconButton>
          )}
        </Stack>

        {/* Right side */}
      </Box>
      {/* {expandAll ? (
        <CloseFullscreenIcon onClick={expandAllParents}></CloseFullscreenIcon>
      ) : (
        <OpenInFullIcon onClick={expandAllParents}></OpenInFullIcon>
      )}
      <FilterDropdown
        ParentSapNumber={["123"]}
        filters={{ materials: ["123"] }}
        setFilters={() => {}}
      /> */}
      <TableContainer
        component={Paper}
        sx={{
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          borderRadius: "8px",
          overflowY: "auto",
          maxHeight: "80vh",
          height: "auto",
        }}
      >
        <Table
          stickyHeader
          sx={{
            "& .MuiTableCell-head": {
              backgroundColor: "#f5f5f5",
              fontWeight: 400,
              fontSize: "0.75rem",
              color: "#424242",
              borderBottom: "2px solid #e0e0e0",
              padding: "10px 8px",
            },
            "& .MuiTableCell-body": {
              padding: "8px 6px",
              fontSize: "0.75rem",
            },
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: "40px" }}></TableCell>
              <TableCell sx={{ minWidth: "120px" }}>Material Number</TableCell>
              <TableCell sx={{ minWidth: "140px" }}>
                Legacy Material Number
              </TableCell>
              <TableCell sx={{ minWidth: "200px" }}>Description</TableCell>
              <TableCell sx={{ minWidth: "140px" }}>Basic Material</TableCell>

              {/* <TableCell sx={{ width: "80px" }} align="center">
                Assembly
              </TableCell> */}
              <TableCell sx={{ width: "70px" }}>Qty</TableCell>
              <TableCell sx={{ width: "70px" }}>UOM</TableCell>
              <TableCell sx={{ width: "90px" }}>ATP Qty</TableCell>
              {/* <TableCell sx={{ width: "90px" }} align="right">
                2nd Qty
              </TableCell> */}
              <TableCell sx={{ minWidth: "120px" }}>Availability</TableCell>
              <TableCell sx={{ width: "90px" }}>Weeks</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredData.length > 0 &&
              [...filteredData]
                .filter((row) => {
                  const hasMaterials = filters.materials.length > 0;
                  const hasLegacyMaterials = filters.lmaterials.length > 0;
                  const hasAvailability = filters.availability.length > 0;

                  const materialMatch =
                    hasMaterials &&
                    filters.materials.includes(row["Material Number"]);

                  const legacyMaterialMatch =
                    hasLegacyMaterials &&
                    filters.lmaterials.includes(row["Legacy Material Number"]);

                  const availabilityMatch =
                    hasAvailability &&
                    filters.availability.includes(row["Availabilty"]);

                  let materialCondition = true;

                  if (hasMaterials && hasLegacyMaterials) {
                    materialCondition = materialMatch || legacyMaterialMatch;
                  } else if (hasMaterials) {
                    materialCondition = materialMatch;
                  } else if (hasLegacyMaterials) {
                    materialCondition = legacyMaterialMatch;
                  }

                  if (hasAvailability) {
                    return materialCondition && availabilityMatch;
                  }

                  return materialCondition;
                })
                .map((parent) => {
                  const parentKey = `parent-${parent["Id"]}`;
                  const isOpen = isExpanded(parentKey);
                  const grouped = groupByLevel(parent["Children"] || []);
                  const sortedLevels = Object.keys(grouped).sort(
                    (a, b) => parseInt(a) - parseInt(b),
                  );

                  return (
                    <React.Fragment key={parent["Id"]}>
                      {/* Parent Row */}
                      <TableRow
                        // onClick={() => toggleNode(parentKey)}
                        sx={{
                          backgroundColor: "#f0f0f0",
                          cursor: "pointer",
                          "&:hover": {
                            backgroundColor: "#f0f0f0",
                          },
                          "& .MuiTableCell-body": {
                            fontWeight: 500,
                            color: "#212121",
                          },
                        }}
                      >
                        <TableCell
                          align="left"
                          sx={{ width: "40px", pl: "8px" }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "flex-start",
                              minHeight: "32px",
                            }}
                          >
                            <Chip
                              label={getLevelLabel(null, true)}
                              size="small"
                              sx={{
                                mr: 1,
                                fontWeight: 400,
                                ...getLevelChipStyles(null, true),
                              }}
                            />
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleNode(parentKey);
                              }}
                              sx={{
                                // padding: "4px",
                                color: "#1976d2",
                                // ml: 0.5,
                              }}
                            >
                              {sortedLevels.length > 0 &&
                                (isOpen ? (
                                  <ExpandMoreIcon />
                                ) : (
                                  <ChevronRight />
                                ))}
                            </IconButton>
                          </Box>
                        </TableCell>
                        <TableCell>{parent["Material Number"]}</TableCell>
                        <TableCell>
                          {parent["Legacy Material Number"]}
                        </TableCell>
                        <TableCell>{parent["Material Description"]}</TableCell>
                        <TableCell>{parent["Basic Material"]}</TableCell>

                        {/* <TableCell align="center">{parent["Assembly"]}</TableCell> */}
                        <TableCell>{valveQty * parent["BOMQty"]}</TableCell>
                        <TableCell>{parent["Unit of Measure"]}</TableCell>
                        <TableCell>
                          {parent["Committed Quantity"] ?? "-"}
                        </TableCell>
                        {/* <TableCell align="right">
                      {parent["Second Quantity"] ?? "-"}
                    </TableCell> */}
                        <TableCell>
                          {parent["Availabilty"] === "IN STOCK" ? (
                            <CheckCircleIcon
                              style={{ color: "green", fontSize: "1rem" }}
                            />
                          ) : parent["Availabilty"] === "OUT OF STOCK" ? (
                            <b style={{ color: "red" }}>
                              {parent["Lead Time"]}
                            </b>
                          ) : (
                            <ReportIcon
                              style={{ color: "gray", fontSize: "1rem" }}
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          {parent["Availabilty"] === "IN STOCK" ? (
                            <b>{parent["Lead Time"]}</b>
                          ) : parent["Availabilty"] === "OUT OF STOCK" ? (
                            <b>{getRemaingWeeks(parent["Lead Time"])} Weeks</b>
                          ) : (
                            <ReportIcon
                              style={{ color: "gray", fontSize: "1rem" }}
                            />
                          )}
                        </TableCell>
                      </TableRow>

                      {/* Child Rows */}
                      {isOpen &&
                        sortedLevels.map((level) => {
                          return (
                            <React.Fragment
                              key={`level-${parent["Id"]}-${level}`}
                            >
                              {grouped[level].map((child, idx) =>
                                renderChildRow(
                                  child,
                                  1,
                                  parent["Id"],
                                  level,
                                  `${level}-${idx}`,
                                ),
                              )}
                            </React.Fragment>
                          );
                        })}
                    </React.Fragment>
                  );
                })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ParentChildTable;
