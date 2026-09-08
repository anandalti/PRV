
    const { pool } = require('../db/pgsqldb');
    const { getFilteredData, getFormatedValues, getFormatedValue } = require('../utils/helper');
class ConfigValveLimits {
    constructor(data){
        this.ConfigValveLimitId = data.ConfigValveLimitId;
this.ConfigurationModelId = data.ConfigurationModelId;
this.SizeCode = data.SizeCode;
this.Expression = data.Expression;
this.AnyOrAll = data.AnyOrAll;
    }
    static async getAllConfigValveLimits() {
        const listConfigValveLimits = [];
        const res = await pool.query('SELECT * FROM "ConfigValveLimits";');
        res.rows.forEach((data) => {
            listConfigValveLimits.push(new ConfigValveLimits(data));
        });
        return listConfigValveLimits;
    }
    static async getConfigValveLimitsById(id) {
        const res = await pool.query('SELECT * FROM "ConfigValveLimits" WHERE "ConfigValveLimitId" = $1', [id]);
        return new ConfigValveLimits(res.rows[0]);
    }    
    static async createConfigValveLimits(data) {
        const filteredData = getFilteredData(data);
        const keys = Object.keys(filteredData);
        const values = getFormatedValues(filteredData);
        const insertQuery = `INSERT INTO "ConfigValveLimits"("${keys.join('","')}") VALUES (${values.join(',')})`;
        const res = await pool.query(insertQuery + ' RETURNING *;');
        return res.rows[0];
    }
    static async updateConfigValveLimits(id, data) {
        const filteredData = getFilteredData(data);
        const setStatements = [];
        Object.entries(filteredData).forEach(([key, value]) => {
            setStatements.push(`${key} = ${getFormatedValue(value)}`);
        });
        const updateQuery = `UPDATE "ConfigValveLimits" SET ${setStatements.join(', ')} WHERE "ConfigValveLimitId" = $1;`;
        const res = await pool.query(updateQuery, [id]);
        return res.rows[0];
    }
    static async deleteConfigValveLimits(id) {
        const res = await pool.query('DELETE FROM "ConfigValveLimits" WHERE "ConfigValveLimitId" = $1', [id]);
        return res.rowCount;
    }
    
}
module.exports = ConfigValveLimits;
