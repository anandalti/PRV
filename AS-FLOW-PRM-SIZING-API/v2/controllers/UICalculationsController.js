const { CalculatePressureAPI2000 } = require("../service/api2000popup/CalculatePressureAPI2000");
const { calculateEMLiftRestrictions, calculateEMRestrictedLiftCapacity } = require("../service/calculations/RestrictedLiftCalculations");
const { CalculateTup, Calculate_21_ReqFlowCapacity, checkP1_CP_T_CT, Calculate_18_Non_Flashing_Wreq, Calculate_14_ReqFlowCapacity, Calculate_17_Inlet_SpVolMix } = require("../service/fieldCalculations/CalculateWorkflowFunctions");
const { SteamISOCalculations } = require("../service/fieldCalculations/ISO4126_Calculations");
const { CalculateAreaMethods } = require("../service/fieldCalculations/SurfaceAreaCalculator");
const sizingOperationsUseCases = require('../service/usecases/sizingOperations');


const getISO4126Calculations = async (req, res) => {
    // console.log(' >>>>>>>>>>>>>> 1111111111111111 >>>>>>>>>>>>>>>>>')
    try {
        // console.log('request >> ',req.originalUrl)
        const { body: payload } = req;
        const userIdParam = payload['userId'];
        if (!userIdParam) {
            return res.status(400).json({ status: "Error", error: "Missing userId in request parameters" });
        }
        const userId = decodeURIComponent(userIdParam);
        const data = await SteamISOCalculations(payload);
        // console.log(' >>>>>>>>>>>... 2222222222222222 >>>>>>>>>>>>>>>>>',data)
        if (!data) {
            return res.status(404).json({ status: "Error", error: 'Iso 4126 details not found' });
        }
        return res.status(200).json({ status: "Success", data });
    } catch (error) {
        console.error('Error fetching ISO 4126 calculations:', error);
        return res.status(500).json({ status: "Error", error: 'Internal Server Error' });
        
    }
};

const getTup = async (req, res) => {
    // console.log(' >>>>>>>>>>>>>> 1111111111111111 >>>>>>>>>>>>>>>>>')
    try {
        // console.log('request >> ',req.originalUrl)
        const { body: payload } = req;
        const userIdParam = payload['userId'];
        if (!userIdParam) {
            return res.status(400).json({ status: "Error", error: "Missing userId in request parameters" });
        }
        const userId = decodeURIComponent(userIdParam);
        const data = await CalculateTup(payload);
        // console.log(' >>>>>>>>>>>... 2222222222222222 >>>>>>>>>>>>>>>>>', data)
        if (!data) {
            return res.status(404).json({ status:"Error",error: 'Tup details not found' });
        }
        return res.status(200).json({status:"Success", data});
    } catch (error) {
        console.error('Error fetching Tup calculations:', error);
        return res.status(500).json({ status:"Error",error: 'Internal Server Error' });
        
    }
};

const get14flowCapacity = async (req, res) => {
    // console.log(' >>>>>>>>>>>>>> 1111111111111111 >>>>>>>>>>>>>>>>>')
    try {
        // console.log('request >> ',req.body)
        const { body: payload } = req;
        const userIdParam = payload['userId'];
        if (!userIdParam) {
            return res.status(400).json({ status: "Error", error: "Missing userId in request parameters" });
        }
        const userId = decodeURIComponent(userIdParam);
        const data = Calculate_14_ReqFlowCapacity(payload);
        // console.log(' >>>>>>>>>>>... 2222222222222222 >>>>>>>>>>>>>>>>>',data)
        if (!data) {
            return res.status(404).json({ status: "Error", error: '14 Flow Capacity details not found' });
        }
        return res.status(200).json({ status: "Success", data });
    } catch (error) {
        console.error('Error fetching 14 Flow Capacity calculations:', error);
        return res.status(500).json({ status: "Error", error: 'Internal Server Error' });
        
    }
};

const get17SpecVolMix = async (req, res) => {
    // console.log(' >>>>>>>>>>>>>> 1111111111111111 >>>>>>>>>>>>>>>>>')
    try {
        // console.log('request >> ',req.originalUrl)
        const { body: payload } = req;
        const userIdParam = payload['userId'];
        if (!userIdParam) {
            return res.status(400).json({ status: "Error", error: "Missing userId in request parameters" });
        }
        const userId = decodeURIComponent(userIdParam);
        const data= await Calculate_17_Inlet_SpVolMix(payload);
        // console.log(' >>>>>>>>>>>... 2222222222222222 >>>>>>>>>>>>>>>>>',data)
        if (!data) {
            return res.status(404).json({ status: "Error", error: '17 Inlet Specific Volume Mixture details not found' });
        }
        return res.status(200).json({ status: "Success", data });
    } catch (error) {
        console.error('Error fetching 17 Inlet Specific Volume Mixture calculations:', error);
        return res.status(500).json({ status: "Error", error: 'Internal Server Error' });
        
    }
};

const get18flowCapacity = async (req, res) => {
    // console.log(' >>>>>>>>>>>>>> 1111111111111111 >>>>>>>>>>>>>>>>>')
    try {
        // console.log('request >> ',req.originalUrl)
        const { body: payload } = req;
        const userIdParam = payload['userId'];
        if (!userIdParam) {
            return res.status(400).json({ status: "Error", error: "Missing userId in request parameters" });
        }
        const userId = decodeURIComponent(userIdParam);
        const data = Calculate_18_Non_Flashing_Wreq(payload);
        // console.log(' >>>>>>>>>>>... 2222222222222222 >>>>>>>>>>>>>>>>>',data)
        if (!data) {
            return res.status(404).json({ status: "Error", error: '18 Flow Capacity details not found' });
        }
        return res.status(200).json({ status: "Success", data });
    } catch (error) {
        console.error('Error fetching 18 Flow Capacity calculations:', error);
        return res.status(500).json({ status: "Error", error: 'Internal Server Error' });
        
    }
};

const get21flowCapacity = async (req, res) => {
    // console.log(' >>>>>>>>>>>>>> 1111111111111111 >>>>>>>>>>>>>>>>>')
    try {
        // console.log('request >> ',req.originalUrl)
        const { body: payload } = req;
        const userIdParam = payload['userId'];
        if (!userIdParam) {
            return res.status(400).json({ status: "Error", error: "Missing userId in request parameters" });
        }
        const userId = decodeURIComponent(userIdParam);
        const data = await Calculate_21_ReqFlowCapacity(payload);
        // console.log(' >>>>>>>>>>>... 2222222222222222 >>>>>>>>>>>>>>>>>',data)
        if (!data) {
            return res.status(404).json({ status: "Error", error: '21 Flow Capacity details not found' });
        }
        return res.status(200).json({ status: "Success", data });
    } catch (error) {
        console.error('Error fetching 21 Flow Capacity calculations:', error);
        return res.status(500).json({ status: "Error", error: 'Internal Server Error' });
        
    }
};

const checkCriticalPressureTemperature = async (req, res) => {
    // console.log(' >>>>>>>>>>>>>> 1111111111111111 >>>>>>>>>>>>>>>>>')
    try {
        // console.log('request >> ',req.originalUrl)
        const { body: payload } = req;
        const userIdParam = payload['userId'];
        if (!userIdParam) {
            return res.status(400).json({ status: "Error", error: "Missing userId in request parameters" });
        }
        const userId = decodeURIComponent(userIdParam);
        const data = await checkP1_CP_T_CT(payload);
        // console.log(' >>>>>>>>>>>... 2222222222222222 >>>>>>>>>>>>>>>>>',data)
        if (!data) {
            return res.status(404).json({ status: "Error", error: 'Critical Pressure Temperature details not found' });
        }
        return res.status(200).json({ status: "Success", data });
    } catch (error) {
        console.error('Error fetching Critical Pressure Temperature calculations:', error);
        return res.status(500).json({ status: "Error", error: 'Internal Server Error' });
        
    }
};

const CalculateFireSizePopupSurfaceArea = async (req, res) => {
    try {
        // console.log('request >> ',req.originalUrl)
        const { body: payload } = req;
        const userIdParam = payload['userId'];
        if (!userIdParam) {
            return res.status(400).json({ status: "Error", error: "Missing userId in request parameters" });
        }
        const userId = decodeURIComponent(userIdParam);
        const data = await CalculateAreaMethods(payload);
        // console.log(' >>>>>>>>>>>... 2222222222222222 >>>>>>>>>>>>>>>>>',userId)
        if (!data) {
            return res.status(404).json({ status:"Error",error: 'Fire Size Popup Area details not found' });
        }
        return res.status(200).json({status:"Success", data});
    } catch (error) {
        console.error('Error fetching Fire Size Popup Area calculations:', error);
        return res.status(500).json({ status:"Error",error: 'Internal Server Error' });
        
    }
};

const CalculateAPI2000PopupPressure = async (req, res) => {
    try {
        // console.log('request >> ',req.originalUrl)
        const { body: payload } = req;
        const userIdParam = payload['userId'];
        if (!userIdParam) {
            return res.status(400).json({ status: "Error", error: "Missing userId in request parameters" });
        }
        const userId = decodeURIComponent(userIdParam);
        const data = await CalculatePressureAPI2000(payload);
        // console.log(' >>>>>>>>>>>... 2222222222222222 >>>>>>>>>>>>>>>>>',data)
        if (!data) {
            return res.status(404).json({ status: "Error", error: 'API 2000 Popup Pressure details not found' });
        }
        return res.status(200).json({ status: "Success", data });
    } catch (error) {
        console.error('Error fetching API 2000 Popup Pressure calculations:', error);
        return res.status(500).json({ status: "Error", error: 'Internal Server Error' });
        
    }
};

const getRestrictedLiftRestrictions = async (req, res) => {
    try {
        const userIdParam = req.query.userId;
        if (!userIdParam) {
            return res.status(400).json({ status: "Error", error: "Missing userId in request parameters" });
        }
        const LiftRestriction = await sizingOperationsUseCases.getLiftRestrictions({ input: req.query });
        return res.status(200).json({ status: "Success", data: LiftRestriction });
    }catch (error) {
        console.error('Error fetching Restricted Lift Restrictions calculations:', error);
        return res.status(500).json({ status: "Error", error: 'Internal Server Error' });
    }
}

const getRLCapacity = async (req, res) => {
    try {
        const userIdParam = req.query.userId;
        if (!userIdParam) {
            return res.status(400).json({ status: "Error", error: "Missing userId in request parameters" });
        }
        const { restrictedLiftCapacity } = await sizingOperationsUseCases.getRestrictedLiftCapacity({ input: req.query });
        return res.status(200).json({ status: "Success", data: {RestrictedLiftCapacity: restrictedLiftCapacity} });
    }catch (error) {
        console.error('Error fetching Restricted Lift Restrictions calculations:', error);
        return res.status(500).json({ status: "Error", error: 'Internal Server Error' });
    }
}

const getEMRestrictedLiftRestrictions = async (req, res) => {
    try {
        const userIdParam = req.query.userId;
        if (!userIdParam) {
            return res.status(400).json({ status: "Error", error: "Missing userId in request parameters" });
        }
        const LiftRestriction = calculateEMLiftRestrictions(req.query);
        return res.status(200).json({ status: "Success", data: LiftRestriction });
    }catch (error) {
        console.error('Error fetching Restricted Lift Restrictions calculations:', error);
        return res.status(500).json({ status: "Error", error: 'Internal Server Error' });
    }
}

const getEMRLCapacity = async (req, res) => {
    try {
        const userIdParam = req.query.userId;
        if (!userIdParam) {
            return res.status(400).json({ status: "Error", error: "Missing userId in request parameters" });
        }
        const RestrictedLiftCapacity = calculateEMRestrictedLiftCapacity(req.query);
        return res.status(200).json({ status: "Success", data: {RestrictedLiftCapacity} });
    }catch (error) {
        console.error('Error fetching Restricted Lift Restrictions calculations:', error);
        return res.status(500).json({ status: "Error", error: 'Internal Server Error' });
    }
}

module.exports = {
    getISO4126Calculations,
    getTup,
    get14flowCapacity,
    get17SpecVolMix,
    get18flowCapacity,
    get21flowCapacity,
    checkCriticalPressureTemperature,
    CalculateFireSizePopupSurfaceArea,
    CalculateAPI2000PopupPressure,
    getRestrictedLiftRestrictions,
    getRLCapacity,
    getEMRestrictedLiftRestrictions,
    getEMRLCapacity
};
