const { pool } = require("../db/pgsqldb");
const RestrictedLiftData = require("../models/RestrictedLiftData");
const sizingOperationsUseCases = require('../service/usecases/sizingOperations');


const saveRecordUsingSP = async (data) => {
    const RestrictedLiftModelData= {...data,SizingId:data?.Id};
    // console.log(RestrictedLiftModelData)
    let RLData= new RestrictedLiftData(RestrictedLiftModelData);
    
    RLData= Object.fromEntries(Object.entries(RLData).filter(([_, v]) => v !== undefined && v !== '' && v !== null));
    
    
    const RestrictedLiftData_IN={RLData};
        
    let output=await pool.query(`CALL public."PROC_SaveRetrictedLiftData"($1,$2)`, [RestrictedLiftData_IN,RestrictedLiftData_IN?.SizingId]);
    
    const message=output?.rows[0]?.Message_OUT;
    const sizingData=output?.rows[0]?.SizingData_OUT;
    
    
    return {message, sizingData};
}

const saveRestrictedLiftUsingSP = async (req, res) => {

    const data = req.body;
    
    try {
       const {message, sizingData} = await saveRecordUsingSP(data);
        

        res.status(200).json({
            success: true,
            message,
            sizingData
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Error executing stored procedure',
        });
    }
}

const saveRestrictedLift = async (req, res) => {
    const data = req.body;
    
    try {
        const existing = await RestrictedLiftData.getRestrictedLiftDataById(data?.Id);
        const response = await sizingOperationsUseCases.saveRestrictedLiftData({ input: data });
        const message = existing
            ? 'Restricted Lift Data updated successfully'
            : 'Restricted Lift Data created successfully';
        // console.log('Response>>>>>>>>>>>>>> ',response)
        res.status(200).json({
            success: true,
            message,
            data: response
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Error executing queries procedure',
        });
    }
}

const getRestrictedLift = async (req, res) => {
    try {
        const params = req.query;
        // console.log(params)
        let response = await RestrictedLiftData.getRLDataWithSizingDetailsBySizingId(params?.SizingId);
        // console.log(response)
        
        if(response===null){
            res.status(200).json({
                success: "No Data",
                message:"No Data of Restricted Lift Data for given Sizing Id",
                data: null
            });
        }else{
            response={...response, Id:params?.Id,SizingId:params?.SizingId};
            res.status(200).json({
                success: "Success",
                message:" Restricted Lift Data fetched successfully",
                data: response
            });
        }
    } catch (error) {
       console.error(error);
        res.status(500).json({
            success: "Error",
            message: 'Error executing queries procedure',
        }); 
    }
}

module.exports = {
    saveRestrictedLiftUsingSP, 
    saveRestrictedLift,
    getRestrictedLift
};
