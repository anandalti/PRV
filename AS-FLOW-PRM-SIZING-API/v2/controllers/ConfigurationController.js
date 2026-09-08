const {  pool } = require("../db/pgsqldb");

const getModelConfigurationDetails= async (req, res) => {
    const ModelId = req.query?.ModelId || req.query?.ModelId || req.query?.ModelId || req.query?.ModelId;
    try {
        
        let data=await pool.query(`SELECT * FROM public."GetConfigurationSC"($1)`, [ModelId]);
        // console.log(' >>>>>>>>. ',data)
        // data=data?.rows[0]?.SizingDetails;
        
        
        res.status(200).json({
            success: true,
            message:'SUCCESS',
            rowCount: data?.rowCount,
            data:data?.rows
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
    getModelConfigurationDetails
};