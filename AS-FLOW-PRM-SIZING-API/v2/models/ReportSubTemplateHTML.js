
    const { pool } = require('../db/pgsqldb');
    const { getFilteredData, getFormatedValues, getFormatedValue } = require('../utils/helper');
class ReportSubTemplateHTML {
    constructor(data){
        this.Id = data.Id;
this.SubTemplateId = data.SubTemplateId;
this.ValidationCheckId = data.ValidationCheckId;
this.RowId = data.RowId;
this.ColumnId = data.ColumnId;
this.Colspan = data.Colspan;
this.Rowspan = data.Rowspan;
this.ValueType = data.ValueType;
this.CellValue = data.CellValue;
this.Param = data.Param;
this.Description = data.Description;
this.Style = data.Style;
    }
    static async getAllReportSubTemplateHTML() {
        const listReportSubTemplateHTML = [];
        const res = await pool.query('SELECT * FROM "ReportSubTemplateHTML";');
        res.rows.forEach((data) => {
            listReportSubTemplateHTML.push(new ReportSubTemplateHTML(data));
        });
        return listReportSubTemplateHTML;
    }
    static async getReportSubTemplateHTMLById(id) {
        const res = await pool.query('SELECT * FROM "ReportSubTemplateHTML" WHERE "Id" = $1', [id]);
        return new ReportSubTemplateHTML(res.rows[0]);
    }    
    static async createReportSubTemplateHTML(data) {
        const filteredData = getFilteredData(data);
        const keys = Object.keys(filteredData);
        const values = getFormatedValues(filteredData);
        const insertQuery = `INSERT INTO "ReportSubTemplateHTML"("${keys.join('","')}") VALUES (${values.join(',')})`;
        const res = await pool.query(insertQuery + ' RETURNING *;');
        return res.rows[0];
    }
    static async updateReportSubTemplateHTML(id, data) {
        const filteredData = getFilteredData(data);
        const setStatements = [];
        Object.entries(filteredData).forEach(([key, value]) => {
            setStatements.push(`${key} = ${getFormatedValue(value)}`);
        });
        const updateQuery = `UPDATE "ReportSubTemplateHTML" SET ${setStatements.join(', ')} WHERE "Id" = $1;`;
        const res = await pool.query(updateQuery, [id]);
        return res.rows[0];
    }
    static async deleteReportSubTemplateHTML(id) {
        const res = await pool.query('DELETE FROM "ReportSubTemplateHTML" WHERE "Id" = $1', [id]);
        return res.rowCount;
    }
    
}
module.exports = ReportSubTemplateHTML;
