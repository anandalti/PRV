const {  pool } = require("../db/pgsqldb");
const resultsUseCases = require('../service/usecases/results');

const getMySizing = async (req, res) => {
    // Mulesoft Response
    if(!!req?.body?.emailId) {
        try {
            const emailId = req.body.emailId;
            let mySizingData = await pool.query(`SELECT SD."SizingId", SV."ModelNumber", SD."CreatedDate" FROM public."SizingDetails" SD
                LEFT JOIN public."SelectedValve" SV ON SV."SizingId" = SD."Id"
                INNER JOIN public."User" U ON SD."UserId" = U."Id"
                WHERE U."EmailId" = '${emailId}'
                ORDER BY SD."Id" ASC `);
            const data = mySizingData.rows.map(item => ({
                sizing_id: item.SizingId,
                model: item.ModelNumber,
                created_at: item.CreatedDate,
                rev_num: 1
            }));
            let mySizingData1 = {
                "mysizing_list": {
                    "mysizing_list_item": data
                },
                "errorFlag": null,
                "errorCode": null,
                "errorMsg": null
            }
            res.status(200).json(mySizingData1);
        } catch (error) {
            let mySizingDataError = {
                "mysizing_list": {
                    "mysizing_list_item": []
                },
                "errorFlag": "Y",
                "errorCode": "ERROR",
                "errorMsg": "Issue in getting data"
            }
            res.status(200).json(mySizingDataError);
        }
    } else {
        const UserId = req.query?.UserId || req.query?.userId || req.query?.userid || req.query?.Userid;
        try {
            
            let data=await pool.query(`SELECT * FROM public."GetMySizingDetails"($1)`, [UserId]);
            // console.log('first query SizingDetails_IN 111111>>>>>>>>>>>>>> ', data);
            // data=data?.rows[0]?.MySizingDetails;
            
            res.status(200).json({
                success: true,
                message:'SUCCESS',
                data
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({
                success: false,
                message: 'Error executing stored procedure',
            });
        }
    }
}

const getSizingId= async (req, res) => {
    const SizingId = req.query.Id || req.query.id;
    try {
        
        let data=await pool.query(`SELECT * FROM public."GetSizingDetails"($1)`, [SizingId]);
        // console.log('first query SizingDetails_IN 111111>>>>>>>>>>>>>> ', data);
        data=data?.rows[0]?.SizingDetails;
        
        res.status(200).json({
            success: true,
            message:'SUCCESS',
            data
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Error executing stored procedure',
        });
    }
}

const getSizingDetailsBySizingId= async (req, res) => {
    const SizingId = req.query?.SizingId || req.query?.sizingId || req.query?.Sizingid || req.query?.sizingid;
    try {
        const data = await resultsUseCases.getSizingDetailsBySizingId({ sizingId: SizingId });
        
        res.status(200).json({
            success: true,
            message:'SUCCESS',
            data
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Error executing stored procedure',
        });
    }
}

const getSizingDetailsOnReports= async (req, res) => {
    const SizingId = req.query?.SizingId || req.query?.sizingId || req.query?.Sizingid || req.query?.sizingid;
    try {
        
        let data=await pool.query(`SELECT * FROM public."GetSizingDataOnReports"($1)`, [SizingId]);
        // console.log('first query SizingDetails_IN 111111>>>>>>>>>>>>>> ', data);
        data=data?.rows[0];
        

        res.status(200).json({
            success: true,
            message:'SUCCESS',
            data
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Error executing stored procedure',
        });
    }
}

module.exports = {
    getMySizing,
    getSizingId,
    getSizingDetailsBySizingId,
    getSizingDetailsOnReports
};
