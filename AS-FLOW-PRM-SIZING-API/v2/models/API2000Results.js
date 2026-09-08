
    const { pool } = require('../db/pgsqldb');
    const { getFilteredData, getFormatedValues, getFormatedValue } = require('../utils/helper');
class API2000Results {
    constructor(data){
        this.Id = data.Id;
        this.SizingId = data.SizingId;
        this.ProductMovementPressure = data.ProductMovementPressure;
        this.ProductMovementVacuum = data.ProductMovementVacuum;
        this.ProductMovementUOM = data?.FlowCapacityUOM ?? data.ProductMovementUOM;
        this.ThermalPressure = data.ThermalPressure;
        this.ThermalVacuum = data.ThermalVacuum;
        this.ThermalUOM = data?.FlowCapacityUOM ?? data.ThermalUOM;
        this.FlashingLiquid = data.FlashingLiquid;
        this.FlashingLiquidUOM = data?.FlowCapacityUOM ?? data.FlashingLiquidUOM;
        this.RegulatorFailure = data.RegulatorFailure;
        this.RegulatorFailureUOM = data?.FlowCapacityUOM ?? data.RegulatorFailureUOM;
        this.Other = data.Other;
        this.OtherUOM = data?.FlowCapacityUOM ?? data.OtherUOM;
        this.AdditionalCapacityPressure = data.AdditionalCapacityPressure;
        this.AdditionalCapacityVacuum = data.AdditionalCapacityVacuum;
        this.AdditionalCapacityUOM = data?.FlowCapacityUOM ?? data.AdditionalCapacityUOM;
        this.RequiredFlowPressure = data.RequiredFlowPressure;
        this.RequiredFlowVacuum = data.RequiredFlowVacuum;
        this.RequiredFlowUOM = data?.FlowCapacityUOM ?? data.RequiredFlowUOM;
    }
    static async getAllAPI2000Results() {
        const listAPI2000Results = [];
        const res = await pool.query('SELECT * FROM "API2000Results";');
        res.rows.forEach((data) => {
            listAPI2000Results.push(new API2000Results(data));
        });
        return listAPI2000Results;
    }
    static async getAPI2000ResultsById(id) {
        const res = await pool.query('SELECT * FROM "API2000Results" WHERE "Id" = $1', [id]);
        return new API2000Results(res.rows[0]);
    }    
    static async getAPI2000ResultsBySizingId(sizingid) {
        const res = await pool.query('SELECT * FROM "API2000Results" WHERE "SizingId" = $1', [sizingid]);
        return new API2000Results(res.rows[0]);
    }  
    static async createAPI2000Results(data) {
        const filteredData = getFilteredData(data);
        const keys = Object.keys(filteredData);
        const values = getFormatedValues(filteredData);
        const insertQuery = `INSERT INTO "API2000Results"("${keys.join('","')}") VALUES (${values.join(',')})`;
        const res = await pool.query(insertQuery + ' RETURNING *;');
        return res.rows[0];
    }

    static async updateAPI2000Results(id, data) {
        const filteredData = getFilteredData(data);
        const setStatements = [];
        Object.entries(filteredData).forEach(([key, value]) => {
            setStatements.push(`${key} = ${getFormatedValue(value)}`);
        });
        const updateQuery = `UPDATE "API2000Results" SET ${setStatements.join(', ')} WHERE "Id" = $1;`;
        const res = await pool.query(updateQuery, [id]);
        return res.rows[0];
    }

    static async deleteAPI2000Results(id) {
        const res = await pool.query('DELETE FROM "API2000Results" WHERE "Id" = $1', [id]);
        return res.rowCount;
    }
    
}
module.exports = API2000Results;
