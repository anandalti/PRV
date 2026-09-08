
    const { pool } = require('../db/pgsqldb');
    const { getFilteredData, getFormatedValues, getFormatedValue } = require('../utils/helper');
class API521FlowRateReq {
    constructor(data){
        this.Id = data.Id;
        this.SizingId = data.SizingId;
        this.FireSizingMethod = data.FireSizingMethod;
        this.IsPromptFFEADExists = data.IsPromptFFEADExists;
        this.LatentHeatOfVapor = data.LatentHeatOfVapor;
        this.LatentHeatOfVaporUOM = data.LatentHeatOfVaporUOM;
        this.EnvironmentalFactor = data.EnvironmentalFactor;
        this.WettedArea = data.WettedArea;
        this.WettedAreaUOM = data?.AreaUOM ?? data.WettedAreaUOM;
        this.AddCapacityForPressure = data.AddCapacityForPressure;
        this.AddCapacityForPressureUOM = data?.FlowCapacityUOM ?? data.AddCapacityForPressureUOM;
        this.RequiredPressureFlow = data.RequiredPressureFlow;
        this.RequiredPressureFlowUOM = data?.FlowCapacityUOM ?? data.RequiredPressureFlowUOM;
        this.IsFireSizingFactorCalculated = data.IsFireSizingFactorCalculated;
        this.FireSizingFactor = data.FireSizingFactor;
        this.Operating = data.Operating;
        this.OperatingUOM = data?.TemperatureUOM ?? data.OperatingUOM;
        this.OperatingPressure = data.OperatingPressure;
        this.OperatingPressureUOM = data?.PressureUOM ?? data.OperatingPressureUOM;
        this.SurfaceArea = data.SurfaceArea;
        this.SurfaceAreaUOM = data?.AreaUOM ??data.SurfaceAreaUOM;
        this.WallTemp = data.WallTemp;
        this.WallTempUOM = data?.TemperatureUOM ?? data.WallTempUOM;
        this.CalculateTankData=data.CalculateTankData;
    }
    static async getAllAPI521FlowRateReq() {
        const listAPI521FlowRateReq = [];
        const res = await pool.query('SELECT * FROM "API521FlowRateReq";');
        res.rows.forEach((data) => {
            listAPI521FlowRateReq.push(new API521FlowRateReq(data));
        });
        return listAPI521FlowRateReq;
    }
    static async getAPI521FlowRateReqById(id) {
        const res = await pool.query('SELECT * FROM "API521FlowRateReq" WHERE "Id" = $1', [id]);
        return new API521FlowRateReq(res.rows[0]);
    } 
    static async getAPI521FlowRateReqBySizingId(sizingid) {
        const res = await pool.query('SELECT * FROM "API521FlowRateReq" WHERE "SizingId" = $1', [sizingid]);
        return new API521FlowRateReq(res.rows[0]);
    }     
    static async createAPI521FlowRateReq(data) {
        const filteredData = getFilteredData(data);
        const keys = Object.keys(filteredData);
        const values = getFormatedValues(filteredData);
        const insertQuery = `INSERT INTO "API521FlowRateReq"("${keys.join('","')}") VALUES (${values.join(',')})`;
        const res = await pool.query(insertQuery + ' RETURNING *;');
        return res.rows[0];
    }
    static async updateAPI521FlowRateReq(id, data) {
        const filteredData = getFilteredData(data);
        const setStatements = [];
        Object.entries(filteredData).forEach(([key, value]) => {
            setStatements.push(`${key} = ${getFormatedValue(value)}`);
        });
        const updateQuery = `UPDATE "API521FlowRateReq" SET ${setStatements.join(', ')} WHERE "Id" = $1;`;
        const res = await pool.query(updateQuery, [id]);
        return res.rows[0];
    }
    static async deleteAPI521FlowRateReq(id) {
        const res = await pool.query('DELETE FROM "API521FlowRateReq" WHERE "Id" = $1', [id]);
        return res.rowCount;
    }
    
}
module.exports = API521FlowRateReq;
