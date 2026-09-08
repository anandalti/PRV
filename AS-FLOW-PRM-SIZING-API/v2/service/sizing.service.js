const { dataSheetJSON } = require("../../helper/datasheet/reportsHelper");
const { reportMappingFunc, SubSummaryMapping, HeaderMapping, SubEquationMapping, FooterMapping, SizingDataMapping, SubInputMapping, TagInfoMapping, SpecificTankDataMapping, ValveSizingInformationMapping, sapDataMapping, ValveSummaryMapping, ValveDimesionsMapping, NotesMapping  } = require("../../helper/reportsHelper");




const mapSizingDataForCalcSheet = async (sizingData, sapData, uomResults, templateId, host) => {
    const reportStructure = {
        header: { ...HeaderMapping },
        subSummary: { ...SubSummaryMapping },
        subInput: { ...SubInputMapping },
        subEquation: { ...SubEquationMapping },
        footer: { ...FooterMapping },
        sizingData: { ...SizingDataMapping }
    }
    
    const reportResponse = {};

    Object.keys(reportStructure).forEach(async (key) => {
        const result = await reportMappingFunc(sizingData, reportStructure[key], uomResults, templateId, host, sapData);
        // reportResponse[key] = result; 
        Object.keys(result).forEach(key2 => {
            reportResponse[key2] = result[key2];
        })
    })

    return reportResponse;
}

const mapSizingDataForDataSheet = async(sizingData, sapData, uomResults, templateId, host) => {
    const reportStructure = {
        header: { ...HeaderMapping },
        subSummary: { ...SubSummaryMapping },
        subInput: { ...SubInputMapping },
        subEquation: { ...SubEquationMapping },
        footer: { ...FooterMapping },
        sizingData: { ...SizingDataMapping },
        dataSheet: {...dataSheetJSON},
    };

    const reportResponse = {};

    Object.keys(reportStructure).forEach(async (key) => {
        const result = await reportMappingFunc(sizingData, reportStructure[key], uomResults, templateId, host, sapData);
        // reportResponse[key] = result; 
        Object.keys(result).forEach(key2 => {
            reportResponse[key2] = result[key2];
        })
    })

    return reportResponse;
}

const mapSizingDataForConfigSheet = async(sizingData, sapData, uomResults, templateId, host) => {
    const reportStructure = {
        header: { ...HeaderMapping },
        tagInfo: { ...TagInfoMapping },
        specificTankData: { ...SpecificTankDataMapping },
        valveSizingInfo: { ...ValveSizingInformationMapping },
        sapData: { ...sapDataMapping },
        footer: { ...FooterMapping },
    };
    
    const reportResponse = {};

    Object.keys(reportStructure).forEach(async (key) => {
        const result = await reportMappingFunc(sizingData, reportStructure[key], uomResults, templateId, host, sapData);
        // reportResponse[key] = result; 
        Object.keys(result).forEach(key2 => {
            reportResponse[key2] = result[key2];
        })
    })

    return reportResponse;
}

const mapSizingDataForDrawingSheet = async(sizingData, sapData, uomResults, templateId, host) => {
    const reportStructure = {
        header: { ...HeaderMapping },
        valveSummary: { ...ValveSummaryMapping },
        valveDimensions: { ...ValveDimesionsMapping },
        notes: { ...NotesMapping },
        footer: { ...FooterMapping },
    };
    
    const reportResponse = {};

    Object.keys(reportStructure).forEach(async (key) => {
        const result = await reportMappingFunc(sizingData, reportStructure[key], uomResults, templateId, host, sapData);
        // reportResponse[key] = result; 
        Object.keys(result).forEach(key2 => {
            reportResponse[key2] = result[key2];
        })
    })

    return reportResponse;
}

const mapSizingDataForReports = async (sizingData, uomResults, reportTypeId, templateId, sapData, host) => {
    if (reportTypeId === "1") {
        let reportResponse = await mapSizingDataForCalcSheet(sizingData, sapData, uomResults, templateId, host);
        return reportResponse;
    } else if (reportTypeId === "2") {
        let reportResponse = await mapSizingDataForDataSheet(sizingData, sapData, uomResults, templateId, host);
        return reportResponse;
    } else if (reportTypeId === '4') {
        let reportResponse = await mapSizingDataForConfigSheet(sizingData, sapData, uomResults, templateId, host);
        return reportResponse;
    } else if (reportTypeId === '3') {
        let reportResponse = await mapSizingDataForDrawingSheet(sizingData, sapData, uomResults, templateId, host);
        return reportResponse;
    } else {
        return "Doesn't Exist"
    }
}



module.exports = {

    mapSizingDataForReports,
    
};