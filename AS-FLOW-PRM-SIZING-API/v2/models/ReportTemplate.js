
    const { pool } = require('../db/pgsqldb');
    const { getFilteredData, getFormatedValues, getFormatedValue } = require('../utils/helper');
class ReportTemplate {
    constructor(data){
        this.Id = data.Id;
this.ReportTypeId = data.ReportTypeId;
this.Name = data.Name;
this.ProductGrouping = data.ProductGrouping;
this.ModelGrouping = data.ModelGrouping;
    }
    static async getAllReportTemplate() {
        const listReportTemplate = [];
        const res = await pool.query('SELECT * FROM "ReportTemplate";');
        res.rows.forEach((data) => {
            listReportTemplate.push(new ReportTemplate(data));
        });
        return listReportTemplate;
    }
    static async getReportTemplateById(id) {
        const res = await pool.query('SELECT * FROM "ReportTemplate" WHERE "Id" = $1', [id]);
        return new ReportTemplate(res.rows[0]);
    }    
    static async createReportTemplate(data) {
        const filteredData = getFilteredData(data);
        const keys = Object.keys(filteredData);
        const values = getFormatedValues(filteredData);
        const insertQuery = `INSERT INTO "ReportTemplate"("${keys.join('","')}") VALUES (${values.join(',')})`;
        const res = await pool.query(insertQuery + ' RETURNING *;');
        return res.rows[0];
    }
    static async updateReportTemplate(id, data) {
        const filteredData = getFilteredData(data);
        const setStatements = [];
        Object.entries(filteredData).forEach(([key, value]) => {
            setStatements.push(`${key} = ${getFormatedValue(value)}`);
        });
        const updateQuery = `UPDATE "ReportTemplate" SET ${setStatements.join(', ')} WHERE "Id" = $1;`;
        const res = await pool.query(updateQuery, [id]);
        return res.rows[0];
    }
    static async deleteReportTemplate(id) {
        const res = await pool.query('DELETE FROM "ReportTemplate" WHERE "Id" = $1', [id]);
        return res.rowCount;
    }
    
}
module.exports = ReportTemplate;
