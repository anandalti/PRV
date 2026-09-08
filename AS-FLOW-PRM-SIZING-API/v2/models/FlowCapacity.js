
    const { pool } = require('../db/pgsqldb');
    const { getFilteredData, getFormatedValues, getFormatedValue } = require('../utils/helper');
class FlowCapacity {
    constructor(data){
        this.Id = data.Id;
this.SizingId = data.SizingId;
this.FlowCapacityUOM = data.FlowCapacityUOM;
this.Wreq = data.Wreq;
this.Vreq = data.Vreq;
this.Qreq = data.Qreq;
this.VlreqMass = data.VlreqMass;
this.Wv = data.Wv;
this.Wl = data.Wl;
this.Wg = data.Wg;
this.Liquid2Wl = data.Liquid2Wl;
this.WreqV = data.WreqV;
this.VreqV = data.VreqV;
this.FlowCapacityWvUOM = data.FlowCapacityWvUOM;
this.FlowCapacityLiqUOM = data.FlowCapacityLiqUOM;
this.FlowCapacityLiq2UOM = data.FlowCapacityLiq2UOM;
    }
    static async getAllFlowCapacity() {
        const listFlowCapacity = [];
        const res = await pool.query('SELECT * FROM "FlowCapacity";');
        res.rows.forEach((data) => {
            listFlowCapacity.push(new FlowCapacity(data));
        });
        return listFlowCapacity;
    }
    static async getFlowCapacityById(id) {
        const res = await pool.query('SELECT * FROM "FlowCapacity" WHERE "Id" = $1', [id]);
        return new FlowCapacity(res.rows[0]);
    }    
    static async createFlowCapacity(data) {
        const filteredData = getFilteredData(data);
        const keys = Object.keys(filteredData);
        const values = getFormatedValues(filteredData);
        const insertQuery = `INSERT INTO "FlowCapacity"("${keys.join('","')}") VALUES (${values.join(',')})`;
        const res = await pool.query(insertQuery + ' RETURNING *;');
        return res.rows[0];
    }
    static async updateFlowCapacity(id, data) {
        const filteredData = getFilteredData(data);
        const setStatements = [];
        Object.entries(filteredData).forEach(([key, value]) => {
            setStatements.push(`${key} = ${getFormatedValue(value)}`);
        });
        const updateQuery = `UPDATE "FlowCapacity" SET ${setStatements.join(', ')} WHERE "Id" = $1;`;
        const res = await pool.query(updateQuery, [id]);
        return res.rows[0];
    }
    static async deleteFlowCapacity(id) {
        const res = await pool.query('DELETE FROM "FlowCapacity" WHERE "Id" = $1', [id]);
        return res.rowCount;
    }
    
}
module.exports = FlowCapacity;
