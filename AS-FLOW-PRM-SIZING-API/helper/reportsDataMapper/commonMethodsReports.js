const designCodesizingSTD = [
    { "Code": "ASME Section I", "DesignCode": "ASME I - V", "SizingStd": "", },
    { "Code": "ASME Section I - V", "DesignCode": "ASME I - V", "SizingStd": "", },
    { "Code": "Non-Code (API 520, Part 1, 10th Edition)", "DesignCode": "Non-Code", "SizingStd": "API 520", },
    { "Code": "Non-Code (API 520, Part 1, 9th Edition)", "DesignCode": "Non-Code", "SizingStd": "API 520", },
    { "Code": "ASME Section VIII (API 520, Part I, 10th Edition)", "DesignCode": "ASME VIII/XIII- UV", "SizingStd": "API 520", },
    { "Code": "ASME Section VIII/XIII - UV (API 520, Part I, 10th Edition)", "DesignCode": "ASME VIII/XIII- UV", "SizingStd": "API 520", },
    { "Code": "ASME Section VIII (API 520, Part I, 9th Edition)", "DesignCode": "ASME VIII/XIII- UV", "SizingStd": "API 520", },
    { "Code": "ISO 4126-7 (2nd Edition)", "DesignCode": "ASME VIII/XIII- UV", "SizingStd": "ISO 4126", },
    { "Code": "Non-Code (API 2000, 7th Edition)", "DesignCode": "Non-Code", "SizingStd": "API 2000", },
    { "Code": "Fire Sizing (API 521 / API 520. Part I, 9th Edition)", "DesignCode": "ASME VIII/XIII- UV", "SizingStd": "API 520", },
    { "Code": "Fire Sizing (API 521 / API 520. Part I, 10th Edition)", "DesignCode": "ASME VIII/XIII- UV", "SizingStd": "API 520", },
    { "Code": "Flame Arrester (VAREC)", "DesignCode": "", "SizingStd": "", },
    { "Code": "Pressure Relief Valve (API 2000, 7th Edition)", "DesignCode": "Non-Code", "SizingStd": "API 2000", },
    { "Code": "Free Vent (API 2000, 7th Edition)", "DesignCode": "Non-Code", "SizingStd": "API 2000", },
    { "Code": "Saturated Water", "DesignCode": "ASME VIII/XIII- UV", "SizingStd": "App 11", },
    { "Code": "Mass Flux from Direct Integration (C.2.1)", "DesignCode": "ASME VIII/XIII- UV", "SizingStd": "API 520", },
    { "Code": "2-Phase, Flashing / Non-Flashing 2-Phase (C.2.2)", "DesignCode": "ASME VIII/XIII- UV", "SizingStd": "API 520", },
    { "Code": "Flashing / Non-Flashing 2-Phase (C.2.2)", "DesignCode": "ASME VIII/XIII- UV", "SizingStd": "API 520", },
    { "Code": "Sub-cooled / Saturated Liquid (C.2.3)", "DesignCode": "ASME VIII/XIII- UV", "SizingStd": "API 520", },
    { "Code": "Flashing Liquid + lts Vapor (D.2.1)", "DesignCode": "ASME VIII/XIII- UV", "SizingStd": "API 520", },
    { "Code": "Non Flashing Liquid + Gas (D.2.1)", "DesignCode": "ASME VIII/XIII- UV", "SizingStd": "API 520", },
    { "Code": "Sub-cooled / Saturated Liquid (D.2.2)", "DesignCode": "ASME VIII/XIII- UV", "SizingStd": "API 520", },
    { "Code": "Flashing Liquid + Vapor + Gas (D.2.3)", "DesignCode": "ASME VIII/XIII- UV", "SizingStd": "API 520", },
    { "Code": "Separated Flow Method", "DesignCode": "ASME VIII/XIII- UV", "SizingStd": "API 520", },

]

const fluidStateAtInletJSON = [
    { "code": "Non-Code (API 520, Part 1, 10th Edition)", "service_type": "Liquid", "product_type": "Pressure Relief", "fluid_state_at_inlet": "Liquid" },
    { "code": "Non-Code (API 520, Part 1, 10th Edition)", "service_type": "Steam", "product_type": "Pressure Relief", "fluid_state_at_inlet": "Steam" },
    { "code": "Non-Code (API 520, Part 1, 9th Edition)", "service_type": "Steam", "product_type": "Pressure Relief", "fluid_state_at_inlet": "Steam" },
    { "code": "ASME Section I - V", "service_type": "Steam", "product_type": "Pressure Relief", "fluid_state_at_inlet": "Steam" },
    { "code": "ASME Section VIII/XIII - UV (API 520, Part I, 10th Edition)", "service_type": "Steam", "product_type": "Pressure Relief", "fluid_state_at_inlet": "Steam" },
    { "code": "Flashing Liquid + lts Vapor (D.2.1)", "service_type": "2-Phase", "product_type": "Pressure Relief", "fluid_state_at_inlet": "Flashing Liquid & Its Vapor (7th, D.2.1)" },
    { "code": "Flow control Valve", "service_type": "ARC", "product_type": "ARC", "fluid_state_at_inlet": "ARC" },
    { "code": "Mass Flux from Direct Integration (C.2.1)", "service_type": "2-Phase", "product_type": "Pressure Relief", "fluid_state_at_inlet": "Two-Phase Flow (9th, C.2.1)" },
    { "code": "Separated Flow Method", "service_type": "2-Phase", "product_type": "Pressure Relief", "fluid_state_at_inlet": "Separated Flow Method" },
    { "code": "Non-Code (API 520, Part 1, 10th Edition)", "service_type": "Gas/Vapor", "product_type": "Pressure Relief", "fluid_state_at_inlet": "Gas/Vapor" },
    { "code": "ISO 4126-7 (2nd Edition)", "service_type": "Liquid", "product_type": "Pressure Relief", "fluid_state_at_inlet": "Liquid" },
    { "code": "ISO 4126-7 (2nd Edition)", "service_type": "Steam", "product_type": "Pressure Relief", "fluid_state_at_inlet": "Steam" },
    { "code": "ASME Section VIII/XIII - UV (API 520, Part I, 10th Edition)", "service_type": "Liquid", "product_type": "Pressure Relief", "fluid_state_at_inlet": "Liquid" },
    { "code": "Flashing / Non-Flashing 2-Phase (C.2.2)", "service_type": "2-Phase", "product_type": "Pressure Relief", "fluid_state_at_inlet": "Two-Phase Flow (9th, C.2.2)" },
    { "code": "Fire Sizing (API 521 / API 520. Part I, 10th Edition)", "service_type": "Fire", "product_type": "Pressure Relief", "fluid_state_at_inlet": "Fire " },
    { "code": "Pressure Relief Valve (API 2000, 7th Edition)", "service_type": "Tank Vent", "product_type": "Pressure Relief", "fluid_state_at_inlet": "Tank Vent" },
    { "code": "Sub-cooled / Saturated Liquid (C.2.3)", "service_type": "2-Phase", "product_type": "Pressure Relief", "fluid_state_at_inlet": "Flashing Liquid (9th, C.2.3)" },
    { "code": "Flashing Liquid + Vapor + Gas (D.2.3)", "service_type": "2-Phase", "product_type": "Pressure Relief", "fluid_state_at_inlet": "2-Phase Flash & Noncond. Gas (7th, D.2.3)" },
    { "code": "ASME Section VIII (API 520, Part I, 9th Edition)", "service_type": "2-Phase", "product_type": "Pressure Relief", "fluid_state_at_inlet": "2 Phase" },
    { "code": "ASME Section VIII (API 520, Part I, 9th Edition)", "service_type": "Gas/Vapor", "product_type": "Pressure Relief", "fluid_state_at_inlet": "Gas/Vapor" },
    { "code": "Non Flashing Liquid + Gas (D.2.1)", "service_type": "2-Phase", "product_type": "Pressure Relief", "fluid_state_at_inlet": "No-Flash Liq. & Noncond. Gas (7th, D.2.1)" },
    { "code": "Saturated Water", "service_type": "2-Phase", "product_type": "Pressure Relief", "fluid_state_at_inlet": "Saturated Water (Appendix 11)" },
    { "code": "Free Vent (API 2000, 7th Edition)", "service_type": "Tank Vent", "product_type": "Tank Vent", "fluid_state_at_inlet": "Free Vent" },
    { "code": "Non-Code (API 520, Part 1, 9th Edition)", "service_type": "Liquid", "product_type": "Pressure Relief", "fluid_state_at_inlet": "Liquid" },
    { "code": "Non-Code (API 520, Part 1, 9th Edition)", "service_type": "Gas/Vapor", "product_type": "Pressure Relief", "fluid_state_at_inlet": "Gas/Vapor" },
    { "code": "ASME Section VIII (API 520, Part I, 10th Edition)", "service_type": "Gas/Vapor", "product_type": "Pressure Relief", "fluid_state_at_inlet": "Gas/Vapor" },
    { "code": "Fire Sizing (API 521 / API 520. Part I, 9th Edition)", "service_type": "Fire", "product_type": "Pressure Relief", "fluid_state_at_inlet": "Fire " },
    { "code": "ASME Section VIII (API 520, Part I, 10th Edition)", "service_type": "Steam", "product_type": "Pressure Relief", "fluid_state_at_inlet": "Steam" },
    { "code": "Non-Code (API 520, Part 1, 10th Edition)", "service_type": "Steam", "product_type": "Pressure Relief", "fluid_state_at_inlet": "Steam" },
    { "code": "ASME Section I", "service_type": "Steam", "product_type": "Pressure Relief", "fluid_state_at_inlet": "Steam" },
    { "code": "ASME Section VIII (API 520, Part I, 9th Edition)", "service_type": "Steam", "product_type": "Pressure Relief", "fluid_state_at_inlet": "Steam" },
    { "code": "ASME Section VIII (API 520, Part I, 10th Edition)", "service_type": "Liquid", "product_type": "Pressure Relief", "fluid_state_at_inlet": "Liquid" },
    { "code": "Pressure Relief Valve (API 2000, 7th Edition)", "service_type": "Tank Vent", "product_type": "Tank Vent", "fluid_state_at_inlet": "Tank Vent" },
    { "code": "Flame Arrester (VAREC)", "service_type": "Flame Arrester", "product_type": "Flame  Arrester", "fluid_state_at_inlet": "Flame Arrester" },
    { "code": "ASME Section VIII/XIII - UV (API 520, Part I, 10th Edition)", "service_type": "Gas/Vapor", "product_type": "Pressure Relief", "fluid_state_at_inlet": "Gas/Vapor" },
    { "code": "ASME Section VIII (API 520, Part I, 9th Edition)", "service_type": "Liquid", "product_type": "Pressure Relief", "fluid_state_at_inlet": "Liquid" },
    { "code": "Non-Code (API 2000, 7th Edition)", "service_type": "Gas/Vapor", "product_type": "Pressure Relief", "fluid_state_at_inlet": "Gas/Vapor" },
    { "code": "Flame Arrester (VAREC)", "service_type": "Flame Arrester", "product_type": "Flame Arrester", "fluid_state_at_inlet": "Flame Arrester" },
    { "code": "Sub-cooled / Saturated Liquid (D.2.2)", "service_type": "2-Phase", "product_type": "Pressure Relief", "fluid_state_at_inlet": "Flashing Liquid (7th, D.2.2)" },
    { "code": "ISO 4126-7 (2nd Edition)", "service_type": "Gas/Vapor", "product_type": "Pressure Relief", "fluid_state_at_inlet": "Gas/Vapor" },
    { "code": "2-Phase, Flashing / Non-Flashing 2-Phase (C.2.2)", "service_type": "2-Phase", "product_type": "Pressure Relief", "fluid_state_at_inlet": "Mixed Phase (Gas / Vapor + Liquid)" }
]

const get_design_code = (code) => {
    return designCodesizingSTD.filter(item => item.Code == code)[0].DesignCode;
}

const get_sizing_std = (code) => {

    return designCodesizingSTD.filter(item => item.Code == code)[0].SizingStd;
}

const isMassOrVolumetric = (uom) => {
    if (uom.includes("massflow")) {
        return "Mass"
    } else {
        return "Volumetric"
    }
}

const getDateFunc = () => {
    const date = new Date();

    const months = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
}

const getDateLocalFunc = () => {
    const date = new Date();
    return date.toLocaleString();
}

const getFluidStateAtInletValue = (data) => {
    let val = fluidStateAtInletJSON.filter(el => el.code === data["code"] && el.service_type === data["service_type"] && el.product_type === data["product_type"]).map(el => el.fluid_state_at_inlet);
    const model = data.model;
    const PR = data.calc_result ? data.calc_result.PR : null;
    const TPR = data.calc_result ? data.calc_result.TPR : null;

    if (!PR || !TPR) return val[0];

    if (model.includes("92") || model.includes("93") || model === "95") {
        if (PR > TPR) {
            val[0] += " Only (Sub-Sonic Flow)";
        }
        else {
            val[0] += " Only (Sonic Flow)";
        }
    }

    return val[0];
}

module.exports = { get_design_code, get_sizing_std, isMassOrVolumetric, getDateFunc, getDateLocalFunc, getFluidStateAtInletValue }