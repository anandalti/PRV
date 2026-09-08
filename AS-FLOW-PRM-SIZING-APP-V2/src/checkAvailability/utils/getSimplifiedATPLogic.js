const parseDate = (dateString) => {
  const date = new Date(dateString);
  return Number.isNaN(date.getTime()) ? null : date;
};

const addBusinessDays = (startDate, businessDays) => {
  const date = new Date(startDate);
  let daysToAdd = businessDays;

  while (daysToAdd > 0) {
    date.setDate(date.getDate() + 1);
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    if (!isWeekend) {
      daysToAdd -= 1;
    }
  }

  return date;
};

const addWeeks = (startDate, weeks) => {
  const days = weeks * 7;
  const date = new Date(startDate);
  date.setDate(date.getDate() + days);
  return date;
};

const formatDate = (date) => date.toLocaleDateString("en-US");

export const getSimplifiedATPLogic = (valveQty, data, minLeadTimeWeeks) => {
  const today = new Date();

  const computeAtp = (item) => {
    const committedQty = item["Committed Quantity"];
    const secondQty = item["Second Quantity"];
    const secondATPDate = item["Second ATP Date"];
    const fullATPDate = item["Full ATP Date"];
    const mrpType = item["MRP Type"];
    const procurementType = item["Procurement Type"];
    const totalReplenishmentTime = item["Total Replinishment Time"];
    const plannedDeliveryTime = item["Planned Delivery Time"];
    const requiredQty = valveQty * (item["BOMQty"] || 1);

    const secondDate = parseDate(secondATPDate);
    const fullDate = parseDate(fullATPDate);
    const hasAtpData =
      committedQty !== null &&
      committedQty !== undefined &&
      secondQty !== null &&
      secondQty !== undefined &&
      secondDate &&
      fullDate;

    if (!hasAtpData) {
      return {
        ...item,
        Availabilty: "NO DATA",
        "Lead Time": "NO DATA",
      };
    }

    if (mrpType === "ND") {
      return {
        ...item,
        Availabilty: "IN STOCK",
        "Lead Time": `${minLeadTimeWeeks} Weeks`,
      };
    }

    if (requiredQty <= committedQty) {
      return {
        ...item,
        Availabilty: "IN STOCK",
        "Lead Time": `${minLeadTimeWeeks} Weeks`,
      };
    }

    const targetDate = requiredQty <= secondQty ? secondDate : fullDate;
    let leadDate = targetDate;

    if (leadDate <= today) {
      if (procurementType === "E") {
        leadDate = addBusinessDays(leadDate, totalReplenishmentTime || 0);
      } else {
        leadDate = addBusinessDays(leadDate, plannedDeliveryTime || 0);
      }
    }

    if (leadDate <= today) {
      leadDate = addWeeks(leadDate, minLeadTimeWeeks || 0);
    }

    return {
      ...item,
      Availabilty: "OUT OF STOCK",
      "Lead Time": formatDate(leadDate),
    };
  };

  const computeAtpWithChildren = (item) => {
    const updatedItem = computeAtp(item);

    if (Array.isArray(item.Children) && item.Children.length > 0) {
      updatedItem.Children = item.Children.map(computeAtpWithChildren);
    }

    return updatedItem;
  };

  return data.map(computeAtpWithChildren);
};
