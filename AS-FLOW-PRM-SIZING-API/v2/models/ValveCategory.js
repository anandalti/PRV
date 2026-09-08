
    const { pool } = require('../db/pgsqldb');
    const { getFilteredData, getFormatedValues, getFormatedValue } = require('../utils/helper');
class ValveCategory {
    constructor(data){
        this.Id = data.Id;
this.Name = data.Name;
this.Description = data.Description;
this.IsActive = data.IsActive;
this.Icon = data.Icon;
this.DisplayOrder = data.DisplayOrder;
    }
    static async getAllValveCategory() {
        const listValveCategory = [];
        const res = await pool.query('SELECT * FROM "ValveCategory";');
        res.rows.forEach((data) => {
            listValveCategory.push(new ValveCategory(data));
        });
        return listValveCategory;
    }
    static async getValveCategoryById(id) {
        const res = await pool.query('SELECT * FROM "ValveCategory" WHERE "Id" = $1', [id]);
        return new ValveCategory(res.rows[0]);
    }    
    static async createValveCategory(data) {
        const filteredData = getFilteredData(data);
        const keys = Object.keys(filteredData);
        const values = getFormatedValues(filteredData);
        const insertQuery = `INSERT INTO "ValveCategory"("${keys.join('","')}") VALUES (${values.join(',')})`;
        const res = await pool.query(insertQuery + ' RETURNING *;');
        return res.rows[0];
    }
    static async updateValveCategory(id, data) {
        const filteredData = getFilteredData(data);
        const setStatements = [];
        Object.entries(filteredData).forEach(([key, value]) => {
            setStatements.push(`${key} = ${getFormatedValue(value)}`);
        });
        const updateQuery = `UPDATE "ValveCategory" SET ${setStatements.join(', ')} WHERE "Id" = $1;`;
        const res = await pool.query(updateQuery, [id]);
        return res.rows[0];
    }
    static async deleteValveCategory(id) {
        const res = await pool.query('DELETE FROM "ValveCategory" WHERE "Id" = $1', [id]);
        return res.rowCount;
    }
    
}
module.exports = ValveCategory;
