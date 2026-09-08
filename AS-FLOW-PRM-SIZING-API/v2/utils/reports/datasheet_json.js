// templates id ================================
const templateID_conditions = {
    "APO": 34, "ACS": 34, "ABP": 34, "CCS": 34, "CBB": 34, "CBP": 34, //higPressureReport
    "ALP": 35, "AWL": 35, //lowPressureReport
    "VSO": 36, "VWL": 36, //tankVentReport
    "VFA": 37, //flameArresterReport
    "VFV": 38 //freeVentReport
}

// subtemplates id ============================
const subFlowValidations = [
    {
        templateId: 34,
        subTemplateId: 155,
        service_type: ["Gas/Vapor", "Liquid"],
        code: "ASME Section VIII/XIII - UV (API 520, Part I, 10th Edition)",
        k_a_dataset: "NA"
    },
    // ... rest of the subFlowValidations objects
]

// moc id ========================
const subMOC_conditions = [
    // ... rest of the subMOC_conditions objects
]

// subsizing data ===================
const subSIZING_conditions = [
    // ... rest of the subSIZING_conditions objects
]

module.exports = {
    templateID_conditions,
    subFlowValidations,
    subMOC_conditions,
    subSIZING_conditions
}
