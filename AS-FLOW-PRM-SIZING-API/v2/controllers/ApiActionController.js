const { CheckRequiredApiAction } = require("../service/ApiActionService");

const CheckApiAction= async (req, res) => {
    try {
        const payload=req.body;
        console.log(' >>>>>>>>>> ',payload)
        const data= await CheckRequiredApiAction(payload)
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

module.exports={
    CheckApiAction
}