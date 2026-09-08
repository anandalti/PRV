
    const { pool } = require('../db/pgsqldb');
    const { getFilteredData, getFormatedValues, getFormatedValue } = require('../utils/helper');
class ReportSubTemplate {
    constructor(data){
        this.Id = data.Id;
this.Name = data.Name;
    }
    static async getAllReportSubTemplate() {
        const listReportSubTemplate = [];
        const res = await pool.query('SELECT * FROM "ReportSubTemplate";');
        res.rows.forEach((data) => {
            listReportSubTemplate.push(new ReportSubTemplate(data));
        });
        return listReportSubTemplate;
    }
    static async getReportSubTemplateById(id) {
        const res = await pool.query('SELECT * FROM "ReportSubTemplate" WHERE "Id" = $1', [id]);
        return new ReportSubTemplate(res.rows[0]);
    }    
    static async createReportSubTemplate(data) {
        const filteredData = getFilteredData(data);
        const keys = Object.keys(filteredData);
        const values = getFormatedValues(filteredData);
        const insertQuery = `INSERT INTO "ReportSubTemplate"("${keys.join('","')}") VALUES (${values.join(',')})`;
        const res = await pool.query(insertQuery + ' RETURNING *;');
        return res.rows[0];
    }
    static async updateReportSubTemplate(id, data) {
        const filteredData = getFilteredData(data);
        const setStatements = [];
        Object.entries(filteredData).forEach(([key, value]) => {
            setStatements.push(`${key} = ${getFormatedValue(value)}`);
        });
        const updateQuery = `UPDATE "ReportSubTemplate" SET ${setStatements.join(', ')} WHERE "Id" = $1;`;
        const res = await pool.query(updateQuery, [id]);
        return res.rows[0];
    }
    static async deleteReportSubTemplate(id) {
        const res = await pool.query('DELETE FROM "ReportSubTemplate" WHERE "Id" = $1', [id]);
        return res.rowCount;
    }
    
}
module.exports = ReportSubTemplate;
