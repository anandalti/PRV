
    const { pool } = require('../db/pgsqldb');
    const { getFilteredData, getFormatedValues, getFormatedValue } = require('../utils/helper');
class SAPModels {
    constructor(data){
        this.SAP_ModelId = data.SAP_ModelId;
this.SAP_ModelNumber = data.SAP_ModelNumber;
    }
    static async getAllSAPModels() {
        const listSAPModels = [];
        const res = await pool.query('SELECT * FROM "SAPModels";');
        res.rows.forEach((data) => {
            listSAPModels.push(new SAPModels(data));
        });
        return listSAPModels;
    }
    static async getSAPModelsById(id) {
        const res = await pool.query('SELECT * FROM "SAPModels" WHERE "SAP_ModelId" = $1', [id]);
        return new SAPModels(res.rows[0]);
    }    
    static async createSAPModels(data) {
        const filteredData = getFilteredData(data);
        const keys = Object.keys(filteredData);
        const values = getFormatedValues(filteredData);
        const insertQuery = `INSERT INTO "SAPModels"("${keys.join('","')}") VALUES (${values.join(',')})`;
        const res = await pool.query(insertQuery + ' RETURNING *;');
        return res.rows[0];
    }
    static async updateSAPModels(id, data) {
        const filteredData = getFilteredData(data);
        const setStatements = [];
        Object.entries(filteredData).forEach(([key, value]) => {
            setStatements.push(`${key} = ${getFormatedValue(value)}`);
        });
        const updateQuery = `UPDATE "SAPModels" SET ${setStatements.join(', ')} WHERE "SAP_ModelId" = $1;`;
        const res = await pool.query(updateQuery, [id]);
        return res.rows[0];
    }
    static async deleteSAPModels(id) {
        const res = await pool.query('DELETE FROM "SAPModels" WHERE "SAP_ModelId" = $1', [id]);
        return res.rowCount;
    }
    
}
module.exports = SAPModels;
