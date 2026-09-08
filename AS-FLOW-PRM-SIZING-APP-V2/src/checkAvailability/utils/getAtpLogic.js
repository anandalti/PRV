// Check if ATP data exists
function hasATPData(committed, second, secDate, fullDate) {
  return (
    committed !== null &&
    second !== null &&
    secDate !== null &&
    fullDate !== null
  );
}

// Compare two date strings (MM/DD/YYYY format)
function compareDates(date1, date2) {
  return new Date(date1) - new Date(date2);
}

// Add days to a date string and return formatted date
function addDaysToDate(dateString, days) {
  const date = new Date(dateString);
  date.setDate(date.getDate() + days);
  return date.toLocaleDateString("en-US");
}

// Get the latest (maximum) date from an array of dates
function getLatestDate(dates) {
  return dates.reduce((latest, current) =>
    compareDates(current, latest) > 0 ? current : latest,
  );
}

// ============================================
// LEVEL 1 - TOP LEVEL BOM ITEM LOGIC
// ============================================
function processLevel1(valveQty, item, parentData, minLeadTime) {
  const {
    "MRP Type": mrpType,
    "Committed Quantity": committedQty,
    "Second Quantity": secondQty,
    "Second ATP Date": secondATPDate,
    "Full ATP Date": fullATPDate,
    BOMQty: bomQty,
  } = item;

  // Step 1: Check if ATP data exists
  if (!hasATPData(committedQty, secondQty, secondATPDate, fullATPDate)) {
    return { ...item, Availabilty: "NO DATA", "Lead Time": "NO DATA" };
  }

  // Step 2: Check MRP Type = ND
  if (mrpType === "ND") {
    return {
      ...item,
      Availabilty: "IN STOCK",
      "Lead Time": `${minLeadTime} Weeks`,
    };
  }

  // Step 3: MRP Type = PD - Check quantities
  if (mrpType === "PD") {
    const requiredQty = valveQty * bomQty;

    // Check if we have enough in committed stock
    if (requiredQty <= committedQty) {
      return {
        ...item,
        Availabilty: "IN STOCK",
        "Lead Time": `${minLeadTime} Weeks`,
      };
    }

    // Check if we have enough in second (incoming) quantity
    if (requiredQty <= (secondQty || 0)) {
      return {
        ...item,
        Availabilty: "OUT OF STOCK",
        "Lead Time": secondATPDate,
      };
    }

    // Not enough stock - we need to check children
    return {
      ...item,
      Availabilty: "OUT OF STOCK",
      "Lead Time": fullATPDate,
    };
  }
}

function processLevel2Child(
  valveQty,
  child,
  parentSecondATPDate,
  parentFullATPDate,
  minLeadTime,
) {
  const {
    "MRP Type": mrpType,
    "Committed Quantity": committedQty,
    "Second Quantity": secondQty,
    "Second ATP Date": secondATPDate,
    "Full ATP Date": fullATPDate,
    "Component Quantity": componentQty,
    "Component Number": Component_Number,
  } = child;

  // If no ATP data, inherit from parent
  if (!hasATPData(committedQty, secondQty, secondATPDate, fullATPDate)) {
    return {
      ...child,
      Availabilty: "NO DATA",
      "Lead Time": "NO DATA",
    };
  }

  const requiredQty = valveQty * (componentQty || 0);

  if (mrpType === "ND") {
    return {
      ...child,
      Availabilty: "IN STOCK",
      "Lead Time": `${minLeadTime} Weeks`,
    };
  }
  if (mrpType === "PD") {
    if (requiredQty <= (committedQty || 0)) {
      return {
        ...child,
        Availabilty: "IN STOCK",
        "Lead Time": `${minLeadTime} Weeks`,
      };
    }
    if (requiredQty <= (secondQty || 0)) {
      const leadDate =
        compareDates(secondATPDate, parentSecondATPDate) <= 0
          ? secondATPDate
          : parentSecondATPDate;
      return {
        ...child,
        Availabilty: "OUT OF STOCK",
        "Lead Time": leadDate,
      };
    } else {
      const leadDate =
        compareDates(fullATPDate, parentFullATPDate) <= 0
          ? fullATPDate
          : parentFullATPDate;
      return {
        ...child,
        Availabilty: "OUT OF STOCK",
        "Lead Time": leadDate,
      };
    }
  }

  return { ...child, Availabilty: "NO DATA", "Lead Time": "NO DATA" };
}

// ============================================
// LEVEL 2 - COMPONENT LEVEL LOGIC
// ============================================
function processLevel1Child(
  valveQty,
  child,
  parentSecondATPDate,
  parentFullATPDate,
  minLeadTime,
) {
  const {
    "MRP Type": mrpType,
    "Committed Quantity": committedQty,
    "Second Quantity": secondQty,
    "Second ATP Date": secondATPDate,
    "Full ATP Date": fullATPDate,
    "Component Quantity": componentQty,
  } = child;

  // If no ATP data, inherit from parent
  if (!hasATPData(committedQty, secondQty, secondATPDate, fullATPDate)) {
    return {
      ...child,
      Availabilty: "NO DATA",
      "Lead Time": "NO DATA",
    };
  }

  const requiredQty = valveQty * (componentQty || 0);

  // Check if MRP Type is ND
  if (mrpType === "ND") {
    return {
      ...child,
      Availabilty: "IN STOCK",
      "Lead Time": `${minLeadTime} Weeks`,
    };
  }

  // Check if MRP Type is PD
  if (mrpType === "PD") {
    // Case 1: Enough committed stock
    if (requiredQty <= (committedQty || 0)) {
      return {
        ...child,
        Availabilty: "IN STOCK",
        "Lead Time": `${minLeadTime} Weeks`,
      };
    }

    // Case 2: Enough second quantity
    if (requiredQty <= (secondQty || 0)) {
      // Use whichever date is earlier (limiting factor)
      const leadDate =
        compareDates(secondATPDate, parentSecondATPDate) <= 0
          ? secondATPDate
          : parentSecondATPDate;
      return {
        ...child,
        Availabilty: "OUT OF STOCK",
        "Lead Time": leadDate,
      };
    }

    // Case 3: Not enough - use full ATP date
    // Use whichever date is earlier (limiting factor)
    const leadDate =
      compareDates(fullATPDate, parentFullATPDate) <= 0
        ? fullATPDate
        : parentFullATPDate;
    return {
      ...child,
      Availabilty: "OUT OF STOCK",
      "Lead Time": leadDate,
    };
  }
}

// ============================================
// LEVEL 3 - SUB-COMPONENT LEVEL LOGIC
// ============================================
function processLevel3Child(
  valveQty,
  child,
  parentInHouseProdTime,
  parentFullATPDate,
  allChildren,
  minLeadTime,
) {
  const {
    "MRP Type": mrpType,
    "Committed Quantity": committedQty,
    "Second Quantity": secondQty,
    "Second ATP Date": secondATPDate,
    "Full ATP Date": fullATPDate,
    "Component Quantity": componentQty,
    "Procurement Type": procurementType,
  } = child;

  // If no ATP data, inherit from parent
  if (!hasATPData(committedQty, secondQty, secondATPDate, fullATPDate)) {
    return {
      ...child,
      Availabilty: "NO DATA",
      "Lead Time": "NO DATA",
    };
  }

  const requiredQty = valveQty * (componentQty || 0);

  // ===== PROCUREMENT TYPE = E (External/Purchased) =====
  if (procurementType === "E") {
    if (mrpType === "ND") {
      return {
        ...child,
        Availabilty: "IN STOCK",
        "Lead Time": `${minLeadTime} Weeks`,
      };
    }

    if (mrpType === "PD") {
      if (requiredQty <= (committedQty || 0)) {
        return {
          ...child,
          Availabilty: "IN STOCK",
          "Lead Time": `${minLeadTime} Weeks`,
        };
      }

      if (requiredQty <= (secondQty || 0)) {
        return {
          ...child,
          Availabilty: "OUT OF STOCK",
          "Lead Time": secondATPDate,
        };
      }

      return {
        ...child,
        Availabilty: "OUT OF STOCK",
        "Lead Time": fullATPDate,
      };
    }
  }

  // ===== PROCUREMENT TYPE = F (Fabricated/Make) =====
  if (procurementType === "F") {
    // Get latest (maximum) date from all children
    const childFullDates = allChildren
      .map((c) => c["Full ATP Date"])
      .filter((date) => date); // Remove null/undefined

    if (childFullDates.length === 0) {
      return {
        ...child,
        Availabilty: "IN STOCK",
        "Lead Time": `${minLeadTime} Weeks`,
      };
    }

    const latestChildDate = getLatestDate(childFullDates);

    // Add in-house production time to latest date
    const calculatedLeadDate = addDaysToDate(
      latestChildDate,
      parentInHouseProdTime || 0,
    );

    // Use whichever is earlier (limiting factor)
    const finalLeadDate =
      compareDates(calculatedLeadDate, parentFullATPDate) <= 0
        ? calculatedLeadDate
        : parentFullATPDate;

    return {
      ...child,
      Availabilty: "IN STOCK",
      "Lead Time": `${minLeadTime} Weeks`,
    };
  }

  // Default case if no procurement type
  return { ...child, Availabilty: "No Data" };
}

const getAtpLogic = (valveQty, out, minLeadTime = "4") => {
  const result = out.map((parent) => {
    // Process parent at Level 1
    const processedParent = processLevel1(valveQty, parent, {}, minLeadTime);

    if (!parent.Children || parent.Children.length === 0) {
      return processedParent;
    }

    // Process children (Level 2 and 3)
    const processedChildren = parent.Children.map((child) => {
      const { Level, "Component Number": Component_Number } = child;
      if (Level === "1") {
        // Level 1 components
        return processLevel1Child(
          valveQty,
          child,
          parent["Second ATP Date"],
          parent["Full ATP Date"],
          minLeadTime,
        );
      } else if (Level === "2") {
        return processLevel2Child(
          valveQty,
          child,
          parent["Second ATP Date"],
          parent["Full ATP Date"],
          minLeadTime,
        );
      } else if (Level === "3") {
        // Level 3 components
        return processLevel3Child(
          valveQty,
          child,
          parent["In House Production Time"] || 0,
          parent["Full ATP Date"],
          parent.Children, // Pass all children for date comparison
          minLeadTime,
        );
      }

      return child;
    });

    return {
      ...processedParent,
      Children: processedChildren,
    };
  });
  return result;
};

export default getAtpLogic;
