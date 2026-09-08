const { createWorkflowDetails, deleteWorkflowDetails, createPopupDetails, updateWorkFlowFile, createDataFiles } = require("../utils/jsondata_crud/workflows/WorkflowJsonActions");
const sizingOperationsUseCases = require('../service/usecases/sizingOperations');
const sizingQueryUseCases = require('../service/usecases/sizingQuery');

const getWorkflowLayout = async (req, res) => {

    try {
        const data = await sizingQueryUseCases.getWorkflowLayout({
            userId: req.query?.userId || req.user?.email,
            workFlowId: Number(req.query.workFlowId),
        });
        return res.status(200).json({ status: "Success", data });
    } catch (error) {
        if (error?.status) {
            return res.status(error.status).json({ status: "Error", error: error.message });
        }
        console.error('Error fetching workflow layout:', error);
        return res.status(500).json({ status: "Error", error: 'Internal Server Error' });
    }
};

const createRequiredDataFile = async (req, res) => {

    try {
        // const workflowId = req.query.workFlowId;

        // console.log('>>>>>>>>>>>>>>> Creating Workflow Layout <<<<<<<<<<<<<<<');
        const data = await createDataFiles();
        if (data?.status === 'error') {
            return res.status(404).json({ status: "Error", error: 'Error in creating Workflow' });
        }
        return res.status(200).json({ status: "Success", message:data });
    } catch (error) {
        console.error('Error fetching workflow layout:', error);
        return res.status(500).json({ status: "Error", error: 'Internal Server Error' });
    }
};

const createWorkflowLayout = async (req, res) => {

    try {
        const workflowIdParam = req.query.workFlowId;
        // CWE-23: workflowId must be a non-negative integer — prevents path traversal
        if (!workflowIdParam || !/^\d+$/.test(workflowIdParam)) {
            return res.status(400).json({ status: "Error", error: "Invalid workFlowId" });
        }
        const workflowId = workflowIdParam;
        const data = await createWorkflowDetails(workflowId);
        if (data?.status === 'error') {
            return res.status(404).json({ status: "Error", error: 'Error in creating Workflow' });
        }
        return res.status(200).json({ status: "Success", message:data });
    } catch (error) {
        console.error('Error fetching workflow layout:', error);
        return res.status(500).json({ status: "Error", error: 'Internal Server Error' });
    }
};

const updateWorkflowLayout = async(req,res) =>{
    try {
        const workflowIdParam = req.query.workFlowId;
        // CWE-23: workflowId must be a non-negative integer — prevents path traversal
        if (!workflowIdParam || !/^\d+$/.test(workflowIdParam)) {
            return res.status(400).json({ status: "Error", error: "Invalid workFlowId" });
        }
        const workflowId = workflowIdParam;
        const data = await updateWorkFlowFile(workflowId);
        if (data?.status === 'error') {
            return res.status(404).json({ status: "Error", error: 'Error in updating Workflow' });
        }
        return res.status(200).json(data);
    } catch (error) {
        if (error?.status) {
            return res.status(error.status).json({ status: "Error", error: error.message });
        }
        console.error('Error fetching workflow layout:', error);
        return res.status(500).json({ status: "Error", error: 'Internal Server Error' });
    }
}

const createPopupLayout = async (req, res) => {

    try {
        const workflowIdParam = req.query.workFlowId;
        // CWE-23: workflowId must be a non-negative integer — prevents path traversal
        if (!workflowIdParam || !/^\d+$/.test(workflowIdParam)) {
            return res.status(400).json({ status: "Error", error: "Invalid workFlowId" });
        }
        const workflowId = workflowIdParam;
        const data = await createPopupDetails(workflowId);
        if (!data) {
            return res.status(404).json({ status: "Error", error: 'Error in creating Popup Layout' });
        }
        return res.status(200).json({ status: "Success", data });
    } catch (error) {
        console.error('Error fetching popup layout:', error);
        return res.status(500).json({ status: "Error", error: 'Internal Server Error' });
    }
};

const deleteWorkflowLayout = async (req, res) => {

    try {
        const workflowIdParam = req.query.workFlowId;
        // CWE-23: workflowId must be a non-negative integer — prevents path traversal
        if (!workflowIdParam || !/^\d+$/.test(workflowIdParam)) {
            return res.status(400).json({ status: "Error", error: "Invalid workFlowId" });
        }
        const workflowId = workflowIdParam;
        const data = await deleteWorkflowDetails(workflowId);
        if (!data) {
            return res.status(404).json({ status: "Error", error: 'Error in deleting Workflow' });
        }
        return res.status(200).json({ status: "Success", data });
    } catch (error) {
        console.error('Error fetching workflow layout:', error);
        return res.status(500).json({ status: "Error", error: 'Internal Server Error' });
    }
};

const getWorkflowPopupLayout = async (req, res) => {

    try {
        const data = await sizingOperationsUseCases.getPopupLayout({
            workflowId: req.query.workflowId,
            userId: req.query.userId,
        });

        return res.status(200).json({ status: "Success", data });
    } catch (error) {
        if (error?.status) {
            return res.status(error.status).json({ status: "Error", error: error.message });
        }
        console.error('Error fetching workflow Popup:', error);
        return res.status(500).json({ status: "Error", error: 'Internal Server Error' });

    }
};

const getPreferencesLayout = async (req, res) => {

    try {
        const layout = await sizingQueryUseCases.getPreferencesLayout({
            userId: req.query?.userId || req.user?.email,
        });
        return res.status(200).json({ status: "Success", data: layout });
    } catch (error) {
        if (error?.status) {
            return res.status(error.status).json({ status: "Error", error: error.message });
        }
        console.error('Error fetching preferences layout:', error);
        return res.status(500).json({ status: "Error", error: 'Internal Server Error' });

    } 
        
    };

const getRestrictedLiftPopupLayout = async (req, res) => {
    try {
        const layout = await sizingOperationsUseCases.getRestrictedLiftPopupLayout({
            userId: req.query.userId,
            query: req.query,
        });
        return res.status(200).json({ status: "Success", data: layout });
    } catch (error) {
        if (error?.status) {
            return res.status(error.status).json({ status: "Error", error: error.message });
        }
        console.error('Error fetching Restricted Lift Popup layout:', error);
        return res.status(500).json({ status: "Error", error: 'Internal Server Error' });

    } 
}
module.exports = {
    getWorkflowLayout,
    createWorkflowLayout,
    getWorkflowPopupLayout,
    getPreferencesLayout,
    deleteWorkflowLayout,
    createPopupLayout,
    updateWorkflowLayout,
    createRequiredDataFile,
    getRestrictedLiftPopupLayout
};
