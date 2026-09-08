
    const { pool } = require('../db/pgsqldb');
    const { getFilteredData, getFormatedValues, getFormatedValue } = require('../utils/helper');
class ReportType {
    constructor(data){
        this.Id = data.Id;
this.Name = data.Name;
    }
    static async getAllReportType() {
        const listReportType = [];
        const res = await pool.query('SELECT * FROM "ReportType";');
        res.rows.forEach((data) => {
            listReportType.push(new ReportType(data));
        });
        return listReportType;
    }
    static async getReportTypeById(id) {
        const res = await pool.query('SELECT * FROM "ReportType" WHERE "Id" = $1', [id]);
        return new ReportType(res.rows[0]);
    }    
    static async createReportType(data) {
        const filteredData = getFilteredData(data);
        const keys = Object.keys(filteredData);
        const values = getFormatedValues(filteredData);
        const insertQuery = `INSERT INTO "ReportType"("${keys.join('","')}") VALUES (${values.join(',')})`;
        const res = await pool.query(insertQuery + ' RETURNING *;');
        return res.rows[0];
    }
    static async updateReportType(id, data) {
        const filteredData = getFilteredData(data);
        const setStatements = [];
        Object.entries(filteredData).forEach(([key, value]) => {
            setStatements.push(`${key} = ${getFormatedValue(value)}`);
        });
        const updateQuery = `UPDATE "ReportType" SET ${setStatements.join(', ')} WHERE "Id" = $1;`;
        const res = await pool.query(updateQuery, [id]);
        return res.rows[0];
    }
    static async deleteReportType(id) {
        const res = await pool.query('DELETE FROM "ReportType" WHERE "Id" = $1', [id]);
        return res.rowCount;
    }
    
}
module.exports = ReportType;
