
    const { pool } = require('../db/pgsqldb');
    const { getFilteredData, getFormatedValues, getFormatedValue } = require('../utils/helper');
class SelectionConditions {
    constructor(data){
        this.Id = data.Id;
this.IsASMEChecked = data.IsASMEChecked;
this.Service = data.Service;
this.IsASMEDataSet = data.IsASMEDataSet;
this.IsMassFlow = data.IsMassFlow;
    }
    static async getAllSelectionConditions() {
        const listSelectionConditions = [];
        const res = await pool.query('SELECT * FROM "SelectionConditions";');
        res.rows.forEach((data) => {
            listSelectionConditions.push(new SelectionConditions(data));
        });
        return listSelectionConditions;
    }
    static async getSelectionConditionsById(id) {
        const res = await pool.query('SELECT * FROM "SelectionConditions" WHERE "Id" = $1', [id]);
        return new SelectionConditions(res.rows[0]);
    }    
    static async createSelectionConditions(data) {
        const filteredData = getFilteredData(data);
        const keys = Object.keys(filteredData);
        const values = getFormatedValues(filteredData);
        const insertQuery = `INSERT INTO "SelectionConditions"("${keys.join('","')}") VALUES (${values.join(',')})`;
        const res = await pool.query(insertQuery + ' RETURNING *;');
        return res.rows[0];
    }
    static async updateSelectionConditions(id, data) {
        const filteredData = getFilteredData(data);
        const setStatements = [];
        Object.entries(filteredData).forEach(([key, value]) => {
            setStatements.push(`${key} = ${getFormatedValue(value)}`);
        });
        const updateQuery = `UPDATE "SelectionConditions" SET ${setStatements.join(', ')} WHERE "Id" = $1;`;
        const res = await pool.query(updateQuery, [id]);
        return res.rows[0];
    }
    static async deleteSelectionConditions(id) {
        const res = await pool.query('DELETE FROM "SelectionConditions" WHERE "Id" = $1', [id]);
        return res.rowCount;
    }
    
}
module.exports = SelectionConditions;
