
    const { pool } = require('../db/pgsqldb');
    const { getFilteredData, getFormatedValues, getFormatedValue } = require('../utils/helper');
class ValveLimits {
    constructor(data){
        this.ValveLimitId = data.ValveLimitId;
this.ModelId = data.ModelId;
this.SizeCode = data.SizeCode;
this.Expression = data.Expression;
this.AnyOrAll = data.AnyOrAll;
    }
    static async getAllValveLimits() {
        const listValveLimits = [];
        const res = await pool.query('SELECT * FROM "ValveLimits";');
        res.rows.forEach((data) => {
            listValveLimits.push(new ValveLimits(data));
        });
        return listValveLimits;
    }
    static async getValveLimitsById(id) {
        const res = await pool.query('SELECT * FROM "ValveLimits" WHERE "ValveLimitId" = $1', [id]);
        return new ValveLimits(res.rows[0]);
    }    
    static async createValveLimits(data) {
        const filteredData = getFilteredData(data);
        const keys = Object.keys(filteredData);
        const values = getFormatedValues(filteredData);
        const insertQuery = `INSERT INTO "ValveLimits"("${keys.join('","')}") VALUES (${values.join(',')})`;
        const res = await pool.query(insertQuery + ' RETURNING *;');
        return res.rows[0];
    }
    static async updateValveLimits(id, data) {
        const filteredData = getFilteredData(data);
        const setStatements = [];
        Object.entries(filteredData).forEach(([key, value]) => {
            setStatements.push(`${key} = ${getFormatedValue(value)}`);
        });
        const updateQuery = `UPDATE "ValveLimits" SET ${setStatements.join(', ')} WHERE "ValveLimitId" = $1;`;
        const res = await pool.query(updateQuery, [id]);
        return res.rows[0];
    }
    static async deleteValveLimits(id) {
        const res = await pool.query('DELETE FROM "ValveLimits" WHERE "ValveLimitId" = $1', [id]);
        return res.rowCount;
    }
    
}
module.exports = ValveLimits;
