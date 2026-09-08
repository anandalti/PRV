
    const { pool } = require('../db/pgsqldb');
    const { getFilteredData, getFormatedValues, getFormatedValue } = require('../utils/helper');
class PhysicalPropertySubreportModels {
    constructor(data){
        this.PhysicalPropertySubreportId = data.PhysicalPropertySubreportId;
this.ModelId = data.ModelId;
    }
    static async getAllPhysicalPropertySubreportModels() {
        const listPhysicalPropertySubreportModels = [];
        const res = await pool.query('SELECT * FROM "PhysicalPropertySubreportModels";');
        res.rows.forEach((data) => {
            listPhysicalPropertySubreportModels.push(new PhysicalPropertySubreportModels(data));
        });
        return listPhysicalPropertySubreportModels;
    }
    static async getPhysicalPropertySubreportModelsById(id) {
        const res = await pool.query('SELECT * FROM "PhysicalPropertySubreportModels" WHERE "Id" = $1', [id]);
        return new PhysicalPropertySubreportModels(res.rows[0]);
    }    
    static async createPhysicalPropertySubreportModels(data) {
        const filteredData = getFilteredData(data);
        const keys = Object.keys(filteredData);
        const values = getFormatedValues(filteredData);
        const insertQuery = `INSERT INTO "PhysicalPropertySubreportModels"("${keys.join('","')}") VALUES (${values.join(',')})`;
        const res = await pool.query(insertQuery + ' RETURNING *;');
        return res.rows[0];
    }
    static async updatePhysicalPropertySubreportModels(id, data) {
        const filteredData = getFilteredData(data);
        const setStatements = [];
        Object.entries(filteredData).forEach(([key, value]) => {
            setStatements.push(`${key} = ${getFormatedValue(value)}`);
        });
        const updateQuery = `UPDATE "PhysicalPropertySubreportModels" SET ${setStatements.join(', ')} WHERE "Id" = $1;`;
        const res = await pool.query(updateQuery, [id]);
        return res.rows[0];
    }
    static async deletePhysicalPropertySubreportModels(id) {
        const res = await pool.query('DELETE FROM "PhysicalPropertySubreportModels" WHERE "Id" = $1', [id]);
        return res.rowCount;
    }
    
}
module.exports = PhysicalPropertySubreportModels;
