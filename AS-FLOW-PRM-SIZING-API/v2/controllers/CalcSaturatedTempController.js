// const {  pool } = require("../db/pgsqldb");
// const { convertUnit } = require("../utils/helper");
// const { getAllUOM } = require('../models/UOM');

const { CalcSaturatedTemperture, CalcSaturatedTempertureKsc } = require("../service/CalculateSaturatedTemperature");

const getSaturatedTemperature= async (req, res) => {
    try {
        const SetPressure = req.query?.SetPressure || req.query?.setPressure || req.query?.Setpressure || req.query?.setpressure;
        const OverPressure = req.query?.OverPressure || req.query?.overPressure || req.query?.Overpressure || req.query?.overpressure;
        const InletLoss = req.query?.InletLoss || req.query?.inletLoss || req.query?.Inletloss || req.query?.inletloss;
        const AtmPressure = req.query?.AtmPressure || req.query?.atmPressure || req.query?.Atmpressure || req.query?.atmpressure;
        const Relieving= req.query?.Relieving || req.query?.relieving;
        const PressureUOM = req.query?.PressureUOM || req.query?.pressureUOM || req.query?.Pressureuom || req.query?.pressureuom;
        const TemperatureUOM = req.query?.TemperatureUOM || req.query?.temperatureUOM || req.query?.Temperatureuom || req.query?.temperatureuom;
        const AtmPressureUOM = req.query?.AtmPressureUOM || req.query?.atmPressureUOM || req.query?.Atmpressureuom || req.query?.atmpressureuom;
        const workflowId=req.query?.workflowId || req.query?.WorkflowId || req.query?.workflowid || req.query?.Workflowid;
        const payload={
            SetPressure,
            OverPressure,
            InletLoss,
            AtmPressure,
            Relieving,
            PressureUOM,
            TemperatureUOM,
            AtmPressureUOM,
            workflowId

        }
        // console.log(' >>>>>>>>>>>>> ',payload)
        let data;
        if(workflowId==8){
            data = await CalcSaturatedTempertureKsc(payload);
        }else{
            data = await CalcSaturatedTemperture(payload);
        }
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

const getHo = async (P1, T, uomRequired) => {
    try {
        const uoms = await getAllUOM();
        console.log({ uomRequired});
        const P1converted = uomRequired.pressureUOM === 'psig' ? P1 : convertUnit(P1, uoms.find(uom => uom.UnitName === uomRequired.pressureUOM), uoms.find(uom => uom.UnitKey === 'pressure.psig'));
        const Tconverted = uomRequired.temperatureUOM === "°F" ? T : convertUnit(T, uoms.find(uom => uom.UnitName === uomRequired.temperatureUOM), uoms.find(uom => uom.UnitKey === 'temp.degF'));
        let data= await pool.query(`SELECT * FROM public."FUNC_Getho"($1,$2)`, [P1converted, Tconverted]);
        console.log({P1, T, data: data?.rows[0]?.FUNC_Getho});
        return Number(data?.rows[0]?.FUNC_Getho);
    } catch (err) {
        return '';
    }
}

module.exports = {
    getSaturatedTemperature,
    getHo
};
