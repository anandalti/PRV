
    const { pool } = require('../db/pgsqldb');
    const { getFilteredData, getFormatedValues, getFormatedValue } = require('../utils/helper');
class WorkFlow {
    constructor(data){
        this.Id = data.Id;
this.ValveCategoryId = data.ValveCategoryId;
this.FluidTypeId = data.FluidTypeId;
this.SizingMethodologyId = data.SizingMethodologyId;
    }
    static async getAllWorkFlow() {
        const listWorkFlow = [];
        const res = await pool.query('SELECT * FROM "WorkFlow";');
        res.rows.forEach((data) => {
            listWorkFlow.push(new WorkFlow(data));
        });
        return listWorkFlow;
    }
    static async getWorkFlowById(id) {
        const res = await pool.query('SELECT * FROM "WorkFlow" WHERE "Id" = $1', [id]);
        return new WorkFlow(res.rows[0]);
    }    
    static async createWorkFlow(data) {
        const filteredData = getFilteredData(data);
        const keys = Object.keys(filteredData);
        const values = getFormatedValues(filteredData);
        const insertQuery = `INSERT INTO "WorkFlow"("${keys.join('","')}") VALUES (${values.join(',')})`;
        const res = await pool.query(insertQuery + ' RETURNING *;');
        return res.rows[0];
    }
    static async updateWorkFlow(id, data) {
        const filteredData = getFilteredData(data);
        const setStatements = [];
        Object.entries(filteredData).forEach(([key, value]) => {
            setStatements.push(`${key} = ${getFormatedValue(value)}`);
        });
        const updateQuery = `UPDATE "WorkFlow" SET ${setStatements.join(', ')} WHERE "Id" = $1;`;
        const res = await pool.query(updateQuery, [id]);
        return res.rows[0];
    }
    static async deleteWorkFlow(id) {
        const res = await pool.query('DELETE FROM "WorkFlow" WHERE "Id" = $1', [id]);
        return res.rowCount;
    }
    
}
module.exports = WorkFlow;
