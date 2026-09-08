
const { pool } = require('../db/pgsqldb');
const { getFilteredData, getFormatedValues, getFormatedValue } = require('../utils/helper');
class SelectedValve {
    constructor(data) {
        this.Id = data.Id;
        this.SizingId = data.SizingId;
        this.ReResponse = data.ReResponse;
        this.NoiseForceCalculations = data.NoiseForceCalculations;
        this.ItemNumber = data.ItemNumber;
        this.Brand = data.Brand;
        this.ModelNumber = data.ModelNumber;
        this.ValveTypeDesc = data.ValveTypeDesc;
        this.ValveType = data.ValveType;
        this.SizeOrOrifice = data.SizeOrOrifice;
        this.ReqOrificeArea = data.ReqOrificeArea;
        this.FlowCapacity = data.FlowCapacity;
        this.ValveTag = data.ValveTag;
        this.SetPressure = data.SetPressure;
        this.OverPressurePer = data.OverPressurePer;
        this.OverPressure = data.OverPressure;
        this.ReqFlowPer = data.ReqFlowPer;
        this.PressureUOM = data.PressureUOM;
        this.AreaUOM = data.AreaUOM;
        this.PressureFlowUOM = data.PressureFlowUOM;
        this.TotalReqArea = data.TotalReqArea;
        this.TotalSelectedArea = data.TotalSelectedArea;
        this.TotalSelectedPer = data.TotalSelectedPer;
        this.TotalRatedPressValveFlow = data.TotalRatedPressValveFlow;
        this.TotalActualPressValveFlow = data.TotalActualPressValveFlow;
        this.Quantity = data.Quantity;
        this.PartialReqAreaGas = data.PartialReqAreaGas;
        this.PartialReqAreaLiquid1 = data.PartialReqAreaLiquid1;
        this.PartialReqAreaLiquid2 = data.PartialReqAreaLiquid2;
        this.ValveId = data.ValveId;
        this.SelectedValve= data.SelectedValve;
        this.RestrictedLift = data.RestrictedLift;
        this.RestrictedLiftCapacity = data?.RestrictedLift==='FullLift'?null:data.RestrictedLiftCapacity;
        this.RestrictedLiftCapacityUOM = data?.RestrictedLift==='FullLift'?null:data.FlowCapacityUOM;
    }
    static async getAllSelectedValve() {
        const listSelectedValve = [];
        const res = await pool.query('SELECT * FROM "SelectedValve";');
        res.rows.forEach((data) => {
            listSelectedValve.push(new SelectedValve(data));
        });
        return listSelectedValve;
    }
    static async getSelectedValveById(id) {
        const res = await pool.query('SELECT * FROM "SelectedValve" WHERE "Id" = $1', [id]);
        return new SelectedValve(res.rows[0]);
    }
    static async createSelectedValve(data) {
        const filteredData = getFilteredData(data);
        const keys = Object.keys(filteredData);
        const values = getFormatedValues(filteredData);
        const insertQuery = `INSERT INTO "SelectedValve"("${keys.join('","')}") VALUES (${values.join(',')})`;
        const res = await pool.query(insertQuery + ' RETURNING *;');
        return res.rows[0];
    }
    static async updateSelectedValve(id, data) {
        const filteredData = getFilteredData(data);
        const setStatements = [];
        Object.entries(filteredData).forEach(([key, value]) => {
            setStatements.push(`${key} = ${getFormatedValue(value)}`);
        });
        const updateQuery = `UPDATE "SelectedValve" SET ${setStatements.join(', ')} WHERE "Id" = $1;`;
        const res = await pool.query(updateQuery, [id]);
        return res.rows[0];
    }
    static async deleteSelectedValve(id) {
        const res = await pool.query('DELETE FROM "SelectedValve" WHERE "Id" = $1', [id]);
        return res.rowCount;
    }

}
module.exports = SelectedValve;
