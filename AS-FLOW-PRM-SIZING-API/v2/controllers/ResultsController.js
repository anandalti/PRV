const { getMultiValveSectionDetails } = require("../service/results/MultiValveSection");
const { getWorkflowResultsFilters } = require("../service/results/ResultFilter");
const {  getWorkflowResults } = require("../service/results/ResultService");
const { saveRecordUsingSP } = require("./SaveWorkflowRecordController");
const resultsUseCases = require('../service/usecases/results');

const getResults = async (req, res) => {
    const { body: params } = req;
    // let startTime = new Date().getTime();
    try {
        let { message, sizingData } = params?.saveSizingFlag ? await saveRecordUsingSP(req.body,false) : { message: "", sizingData: null }; //{message:"",sizingData:{}};
        const id=sizingData!==null && sizingData?.length>0?sizingData[0]?.Id:null;
        // console.log(id,sizingData)
        const results = await getWorkflowResults(params,id);
        // console.log('1111111111 >>>>>>>>>>>>. ',id);
        if(id!==null){
            let localSizingData=sizingData[0];
            const multiValveSelectionDisplayFlag=localSizingData?.IsMultivalve?results?.MultiValveFieldSection!==undefined?true:false:false;
            // console.log('222222222 >>>>>>>>>>>>. ',localSizingData?.IsMultivalve,multiValveSelectionDisplayFlag,results?.MultiValveFieldSection!==undefined);
            localSizingData={...localSizingData,multiValveSelectionDisplayFlag};
            sizingData=[localSizingData];
        }
        
        res.status(200).json({ status: "success", results, "sizingResponse": { message, sizingData } });
    } catch (e) {
        console.log(e);
        // return { error: e.message };
        res.status(500).json({ status: "error", error: e.message });
    }
}

const getResultsCalculations = async (req, res) => {
    const { body: params } = req;
    // let startTime = new Date().getTime();
    try {
        const workflowId = params.workflowId ?? params.WorkflowId ?? params.WorkFlowId;
        const { saveSizingFlag, ...payload } = params;
        // console.log(' >>>>>>>>>>>>>>>>>>>>>>> 111111111111111 >>>>>>>>>>>>>>>>>>>>>>>>>>>>');
        const { results, sizingResponse } = await resultsUseCases.runResultsCalculations({
            workflowId,
            saveSizingFlag: saveSizingFlag === true,
            payload,
            requestContext: { source: 'REST' },
        });
        
        res.status(200).json({ status: "success", results, "sizingResponse": sizingResponse });
    } catch (e) {
        console.log(e);
        // return { error: e.message };
        res.status(500).json({ status: "error", error: e.message });
    }
}

const getResultsFilter = async (req, res) => {
    const { body: params } = req;
    // let startTime = new Date().getTime();
    try {
        // let { message, sizingData } = params?.saveSizingFlag ? await saveRecordUsingSP(req.body) : { message: "", sizingData: null }; //{message:"",sizingData:{}};
    
        const results = await getWorkflowResultsFilters(params);
        
        // res.status(200).json({ status: "success", results, "sizingResponse": { message, sizingData } });
        res.status(200).json({ status: "success", results});
    } catch (e) {
        console.log(e);
        // return { error: e.message };
        res.status(500).json({ status: "error", error: e.message });
    }
}

const getMultiValveSection = async (req, res) => {
    try {
        const { body: params } = req;
        const multiValveSectionDetails = await getMultiValveSectionDetails(params);
        return res.status(200).json(multiValveSectionDetails);

    } catch (error) {
        return res.status(500).json({ status: "error", message: error.message, data: { MultiValveFieldSection: {} } });
    }
    
}

const getMultiValveSelectionDetails = async (req, res) => {
    try {
        const params = Array.isArray(req.body)
            ? { valveData: req.body }
            : req.body;
        const multiValveSectionDetails = await resultsUseCases.addMultiValveRow(params);
        return res.status(200).json(multiValveSectionDetails);

    } catch (error) {
        return res.status(500).json({ status: "error", message: error.message, data: { MultiValveFieldSection: {} } });
    }
    
}

const deleteRowFromMultiValves = async (req, res) => {
    try {
        const { body: params } = req;
        const multiValveSectionDetails = await resultsUseCases.removeMultiValveRow(params);
        return res.status(200).json(multiValveSectionDetails);

    } catch (error) {
        return res.status(500).json({ status: "error", message: error.message, data: { MultiValveFieldSection: {} } });
    }
    
}

const validateMultiValveSelection = async (req, res) => {
    try {
        const { body: params } = req;
        const validationResponse = await resultsUseCases.validateMultiValveRow(params);
        return res.status(200).json(validationResponse);

    } catch (error) {
        return res.status(500).json({ status: "error", message: error.message, data: { MultiValveFieldSection: {} } });
    }
    
}

module.exports = {
    getResults,
    getResultsCalculations,
    getResultsFilter,
    getMultiValveSection,
    getMultiValveSelectionDetails,
    deleteRowFromMultiValves,
    validateMultiValveSelection
}