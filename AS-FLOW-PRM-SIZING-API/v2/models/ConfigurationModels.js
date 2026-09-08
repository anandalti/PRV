
    const { pool } = require('../db/pgsqldb');
    const { getFilteredData, getFormatedValues, getFormatedValue } = require('../utils/helper');
class ConfigurationModels {
    constructor(data){
        this.ConfigurationModelId = data.ConfigurationModelId;
this.ModelId = data.ModelId;
    }
    static async getAllConfigurationModels() {
        const listConfigurationModels = [];
        const res = await pool.query('SELECT * FROM "ConfigurationModels";');
        res.rows.forEach((data) => {
            listConfigurationModels.push(new ConfigurationModels(data));
        });
        return listConfigurationModels;
    }
    static async getConfigurationModelsById(id) {
        const res = await pool.query('SELECT * FROM "ConfigurationModels" WHERE "Id" = $1', [id]);
        return new ConfigurationModels(res.rows[0]);
    }    
    static async createConfigurationModels(data) {
        const filteredData = getFilteredData(data);
        const keys = Object.keys(filteredData);
        const values = getFormatedValues(filteredData);
        const insertQuery = `INSERT INTO "ConfigurationModels"("${keys.join('","')}") VALUES (${values.join(',')})`;
        const res = await pool.query(insertQuery + ' RETURNING *;');
        return res.rows[0];
    }
    static async updateConfigurationModels(id, data) {
        const filteredData = getFilteredData(data);
        const setStatements = [];
        Object.entries(filteredData).forEach(([key, value]) => {
            setStatements.push(`${key} = ${getFormatedValue(value)}`);
        });
        const updateQuery = `UPDATE "ConfigurationModels" SET ${setStatements.join(', ')} WHERE "Id" = $1;`;
        const res = await pool.query(updateQuery, [id]);
        return res.rows[0];
    }
    static async deleteConfigurationModels(id) {
        const res = await pool.query('DELETE FROM "ConfigurationModels" WHERE "Id" = $1', [id]);
        return res.rowCount;
    }
    
}
module.exports = ConfigurationModels;
