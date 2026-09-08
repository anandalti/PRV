
    const { pool } = require('../db/pgsqldb');
    const { getFilteredData, getFormatedValues, getFormatedValue } = require('../utils/helper');
class WorkflowSelection {
    constructor(data){
        this.Id = data.Id;
this.WorkflowId = data.WorkflowId;
this.SelectionConditionId = data.SelectionConditionId;
this.FlowKey = data.FlowKey;
this.Kx = data.Kx;
    }
    static async getAllWorkflowSelection() {
        const listWorkflowSelection = [];
        const res = await pool.query('SELECT * FROM "WorkflowSelection";');
        res.rows.forEach((data) => {
            listWorkflowSelection.push(new WorkflowSelection(data));
        });
        return listWorkflowSelection;
    }
    static async getWorkflowSelectionById(id) {
        const res = await pool.query('SELECT * FROM "WorkflowSelection" WHERE "Id" = $1', [id]);
        return new WorkflowSelection(res.rows[0]);
    }    
    static async createWorkflowSelection(data) {
        const filteredData = getFilteredData(data);
        const keys = Object.keys(filteredData);
        const values = getFormatedValues(filteredData);
        const insertQuery = `INSERT INTO "WorkflowSelection"("${keys.join('","')}") VALUES (${values.join(',')})`;
        const res = await pool.query(insertQuery + ' RETURNING *;');
        return res.rows[0];
    }
    static async updateWorkflowSelection(id, data) {
        const filteredData = getFilteredData(data);
        const setStatements = [];
        Object.entries(filteredData).forEach(([key, value]) => {
            setStatements.push(`${key} = ${getFormatedValue(value)}`);
        });
        const updateQuery = `UPDATE "WorkflowSelection" SET ${setStatements.join(', ')} WHERE "Id" = $1;`;
        const res = await pool.query(updateQuery, [id]);
        return res.rows[0];
    }
    static async deleteWorkflowSelection(id) {
        const res = await pool.query('DELETE FROM "WorkflowSelection" WHERE "Id" = $1', [id]);
        return res.rowCount;
    }
    
}
module.exports = WorkflowSelection;
