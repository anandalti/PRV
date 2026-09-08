
    const { pool } = require('../db/pgsqldb');
    const { getFilteredData, getFormatedValues, getFormatedValue } = require('../utils/helper');
class API2000FlowRateReq {
    constructor(data){
        this.Id = data.Id;
        this.SizingId = data.SizingId;
        this.SizingBassis = data.SizingBassis;
        this.RequiredCapacityMethod = data.RequiredCapacityMethod;
        this.ProductInTank = data.ProductInTank;
        this.IsFlashingLiquid = data.IsFlashingLiquid;
        this.AverageStorageTemperature = data.AverageStorageTemperature;
        this.VaporSaturationPressure = data.VaporSaturationPressure;
        this.TankLatitude = data.TankLatitude;
        this.TankVolume = data.TankVolume;
        this.TankVolumeUOM = data.TankVolumeUOM;
        this.PumpInRate = data.PumpInRate;
        this.PumpInRateUOM = data.PumpInRateUOM;
        this.TankHasInsulation = data.TankHasInsulation;
        this.Rin = data.Rin;
        this.IsSimpleEmergencyFlowRateCalc = data.IsSimpleEmergencyFlowRateCalc;
        this.SystemMAWP = data.SystemMAWP;
        this.SystemMAWPUOM = data.SystemMAWPUOM;
        this.EnvironmentalFactor = data.EnvironmentalFactor;
        this.WettedArea = data.WettedArea;
        this.WettedAreaUOM = data?.AreaUOM ?? data.WettedAreaUOM;
        this.LatentHeatOfVaporization = data.LatentHeatOfVaporization;
        this.LatentHeatOfVaporizationUOM = data.LatentHeatOfVaporizationUOM;
        this.MolWtVapor = data.MolWtVapor;
        this.RelievingTemp = data.RelievingTemp;
        this.RelievingTempUOM = data?.TemperatureUOM ?? data.RelievingTempUOM;
        this.InsulationThickness = data.InsulationThickness;
        this.insulationThicknessUOM = data.insulationThicknessUOM;
        this.InsulationThermalConductivity = data.InsulationThermalConductivity;
        this.InsulationThermalConductivityUOM = data.InsulationThermalConductivityUOM;
        this.HeatTransferCoefficient = data.HeatTransferCoefficient;
        this.HeatTransferCoefficientUOM = data.HeatTransferCoefficientUOM;
        this.SurfaceArea = data.SurfaceArea;
        this.SurfaceAreaUOM = data?.AreaUOM ?? data.SurfaceAreaUOM;
        this.IsInsulatedPercentOfATilt = data.IsInsulatedPercentOfATilt;
        this.InsulatedPercentOfATilt = data.InsulatedPercentOfATilt;
        this.InsulatedPercentOfATiltUOM = data.InsulatedPercentOfATiltUOM;
        this.IsInsulatedSurfaceArea = data.IsInsulatedSurfaceArea;
        this.InsulatedSurfaceArea = data.InsulatedSurfaceArea;
        this.InsulatedSurfaceAreaUOM = data.InsulatedSurfaceAreaUOM;
        this.IsOuterContSurAreaPer = data.IsOuterContSurAreaPer;
        this.OuterContSurAreaPer = data.OuterContSurAreaPer;
        this.OuterContSurAreaPerUOM = data?.AreaUOM ?? data.OuterContSurAreaPerUOM;
        this.IsOuterContSurArea = data.IsOuterContSurArea;
        this.OuterContSurArea = data.OuterContSurArea;
        this.OuterContSurAreaUOM = data?.AreaUOM ?? data.OuterContSurAreaUOM;
        this.IsBoilingPointRadio = data.IsBoilingPointRadio;
        this.BoilingPoint = data.BoilingPoint;
        this.BoilingPointUOM = data.BoilingPointUOM;
        this.IsFlashPointRadio = data.IsFlashPointRadio;
        this.FlashPoint = data.FlashPoint;
        this.FlashPointUOM = data.FlashPointUOM;
        this.PumpOutRate = data.PumpOutRate;
        this.PumpOutRateUOM = data.PumpOutRateUOM;
        this.CalculateTankData=data.CalculateTankData;
    }
    static async getAllAPI2000FlowRateReq() {
        const listAPI2000FlowRateReq = [];
        const res = await pool.query('SELECT * FROM "API2000FlowRateReq";');
        res.rows.forEach((data) => {
            listAPI2000FlowRateReq.push(new API2000FlowRateReq(data));
        });
        return listAPI2000FlowRateReq;
    }
    static async getAPI2000FlowRateReqById(id) {
        const res = await pool.query('SELECT * FROM "API2000FlowRateReq" WHERE "Id" = $1', [id]);
        return new API2000FlowRateReq(res.rows[0]);
    }    
    static async getAPI2000FlowRateReqBySizingId(sizingid) {
        const res = await pool.query('SELECT * FROM "API2000FlowRateReq" WHERE "SizingId" = $1', [sizingid]);
        return new API2000FlowRateReq(res.rows[0]);
    }  
    static async createAPI2000FlowRateReq(data) {
        const filteredData = getFilteredData(data);
        const keys = Object.keys(filteredData);
        const values = getFormatedValues(filteredData);
        const insertQuery = `INSERT INTO "API2000FlowRateReq"("${keys.join('","')}") VALUES (${values.join(',')})`;
        const res = await pool.query(insertQuery + ' RETURNING *;');
        return res.rows[0];
    }
    static async updateAPI2000FlowRateReq(id, data) {
        const filteredData = getFilteredData(data);
        const setStatements = [];
        Object.entries(filteredData).forEach(([key, value]) => {
            setStatements.push(`${key} = ${getFormatedValue(value)}`);
        });
        const updateQuery = `UPDATE "API2000FlowRateReq" SET ${setStatements.join(', ')} WHERE "Id" = $1;`;
        const res = await pool.query(updateQuery, [id]);
        return res.rows[0];
    }
    static async deleteAPI2000FlowRateReq(id) {
        const res = await pool.query('DELETE FROM "API2000FlowRateReq" WHERE "Id" = $1', [id]);
        return res.rowCount;
    }
    
}
module.exports = API2000FlowRateReq;
