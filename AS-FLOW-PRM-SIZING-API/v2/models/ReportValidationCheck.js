
    const { pool } = require('../db/pgsqldb');
    const { getFilteredData, getFormatedValues, getFormatedValue } = require('../utils/helper');
class ReportValidationCheck {
    constructor(data){
        this.Id = data.Id;
this.FlowType = data.FlowType;
this.UnitType = data.UnitType;
this.Expressions = data.Expressions;
this.Conditions = data.Conditions;
    }
    static async getAllReportValidationCheck() {
        const listReportValidationCheck = [];
        const res = await pool.query('SELECT * FROM "ReportValidationCheck";');
        res.rows.forEach((data) => {
            listReportValidationCheck.push(new ReportValidationCheck(data));
        });
        return listReportValidationCheck;
    }
    static async getReportValidationCheckById(id) {
        const res = await pool.query('SELECT * FROM "ReportValidationCheck" WHERE "Id" = $1', [id]);
        return new ReportValidationCheck(res.rows[0]);
    }    
    static async createReportValidationCheck(data) {
        const filteredData = getFilteredData(data);
        const keys = Object.keys(filteredData);
        const values = getFormatedValues(filteredData);
        const insertQuery = `INSERT INTO "ReportValidationCheck"("${keys.join('","')}") VALUES (${values.join(',')})`;
        const res = await pool.query(insertQuery + ' RETURNING *;');
        return res.rows[0];
    }
    static async updateReportValidationCheck(id, data) {
        const filteredData = getFilteredData(data);
        const setStatements = [];
        Object.entries(filteredData).forEach(([key, value]) => {
            setStatements.push(`${key} = ${getFormatedValue(value)}`);
        });
        const updateQuery = `UPDATE "ReportValidationCheck" SET ${setStatements.join(', ')} WHERE "Id" = $1;`;
        const res = await pool.query(updateQuery, [id]);
        return res.rows[0];
    }
    static async deleteReportValidationCheck(id) {
        const res = await pool.query('DELETE FROM "ReportValidationCheck" WHERE "Id" = $1', [id]);
        return res.rowCount;
    }
    
}
module.exports = ReportValidationCheck;
