
    const { pool } = require('../db/pgsqldb');
    const { getFilteredData, getFormatedValues, getFormatedValue } = require('../utils/helper');
class MappingSAPPRVModels {
    constructor(data){
        this.ModelNumber = data.ModelNumber;
this.SAPModelNumber = data.SAPModelNumber;
    }
    static async getAllMappingSAPPRVModels() {
        const listMappingSAPPRVModels = [];
        const res = await pool.query('SELECT * FROM "MappingSAPPRVModels";');
        res.rows.forEach((data) => {
            listMappingSAPPRVModels.push(new MappingSAPPRVModels(data));
        });
        return listMappingSAPPRVModels;
    }
    static async getMappingSAPPRVModelsById(id) {
        const res = await pool.query('SELECT * FROM "MappingSAPPRVModels" WHERE "Id" = $1', [id]);
        return new MappingSAPPRVModels(res.rows[0]);
    }    
    static async createMappingSAPPRVModels(data) {
        const filteredData = getFilteredData(data);
        const keys = Object.keys(filteredData);
        const values = getFormatedValues(filteredData);
        const insertQuery = `INSERT INTO "MappingSAPPRVModels"("${keys.join('","')}") VALUES (${values.join(',')})`;
        const res = await pool.query(insertQuery + ' RETURNING *;');
        return res.rows[0];
    }
    static async updateMappingSAPPRVModels(id, data) {
        const filteredData = getFilteredData(data);
        const setStatements = [];
        Object.entries(filteredData).forEach(([key, value]) => {
            setStatements.push(`${key} = ${getFormatedValue(value)}`);
        });
        const updateQuery = `UPDATE "MappingSAPPRVModels" SET ${setStatements.join(', ')} WHERE "Id" = $1;`;
        const res = await pool.query(updateQuery, [id]);
        return res.rows[0];
    }
    static async deleteMappingSAPPRVModels(id) {
        const res = await pool.query('DELETE FROM "MappingSAPPRVModels" WHERE "Id" = $1', [id]);
        return res.rowCount;
    }
    
}
module.exports = MappingSAPPRVModels;
