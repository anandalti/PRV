
    const { pool } = require('../db/pgsqldb');
    const { getFilteredData, getFormatedValues, getFormatedValue } = require('../utils/helper');
class ExceptionsandInclusions {
    constructor(data){
        this.ExInId = data.ExInId;
this.SpecReqId = data.SpecReqId;
this.EISpecReqId = data.EISpecReqId;
this.IsExceptions = data.IsExceptions;
    }
    static async getAllExceptionsandInclusions() {
        const listExceptionsandInclusions = [];
        const res = await pool.query('SELECT * FROM "ExceptionsandInclusions";');
        res.rows.forEach((data) => {
            listExceptionsandInclusions.push(new ExceptionsandInclusions(data));
        });
        return listExceptionsandInclusions;
    }
    static async getExceptionsandInclusionsById(id) {
        const res = await pool.query('SELECT * FROM "ExceptionsandInclusions" WHERE "ExInId" = $1', [id]);
        return new ExceptionsandInclusions(res.rows[0]);
    }    
    static async createExceptionsandInclusions(data) {
        const filteredData = getFilteredData(data);
        const keys = Object.keys(filteredData);
        const values = getFormatedValues(filteredData);
        const insertQuery = `INSERT INTO "ExceptionsandInclusions"("${keys.join('","')}") VALUES (${values.join(',')})`;
        const res = await pool.query(insertQuery + ' RETURNING *;');
        return res.rows[0];
    }
    static async updateExceptionsandInclusions(id, data) {
        const filteredData = getFilteredData(data);
        const setStatements = [];
        Object.entries(filteredData).forEach(([key, value]) => {
            setStatements.push(`${key} = ${getFormatedValue(value)}`);
        });
        const updateQuery = `UPDATE "ExceptionsandInclusions" SET ${setStatements.join(', ')} WHERE "ExInId" = $1;`;
        const res = await pool.query(updateQuery, [id]);
        return res.rows[0];
    }
    static async deleteExceptionsandInclusions(id) {
        const res = await pool.query('DELETE FROM "ExceptionsandInclusions" WHERE "ExInId" = $1', [id]);
        return res.rowCount;
    }
    
}
module.exports = ExceptionsandInclusions;
