
    const { pool } = require('../db/pgsqldb');
    const { getFilteredData, getFormatedValues, getFormatedValue } = require('../utils/helper');
class ReportTemplateMapping {
    constructor(data){
        this.Id = data.Id;
this.TemplateId = data.TemplateId;
this.SubTemplateId = data.SubTemplateId;
this.ReportTypeId = data.ReportTypeId;
this.DisplayOrder = data.DisplayOrder;
this.IsParent = data.IsParent;
this.IsRequired = data.IsRequired;
    }
    static async getAllReportTemplateMapping() {
        const listReportTemplateMapping = [];
        const res = await pool.query('SELECT * FROM "ReportTemplateMapping";');
        res.rows.forEach((data) => {
            listReportTemplateMapping.push(new ReportTemplateMapping(data));
        });
        return listReportTemplateMapping;
    }
    static async getReportTemplateMappingById(id) {
        const res = await pool.query('SELECT * FROM "ReportTemplateMapping" WHERE "Id" = $1', [id]);
        return new ReportTemplateMapping(res.rows[0]);
    }    
    static async createReportTemplateMapping(data) {
        const filteredData = getFilteredData(data);
        const keys = Object.keys(filteredData);
        const values = getFormatedValues(filteredData);
        const insertQuery = `INSERT INTO "ReportTemplateMapping"("${keys.join('","')}") VALUES (${values.join(',')})`;
        const res = await pool.query(insertQuery + ' RETURNING *;');
        return res.rows[0];
    }
    static async updateReportTemplateMapping(id, data) {
        const filteredData = getFilteredData(data);
        const setStatements = [];
        Object.entries(filteredData).forEach(([key, value]) => {
            setStatements.push(`${key} = ${getFormatedValue(value)}`);
        });
        const updateQuery = `UPDATE "ReportTemplateMapping" SET ${setStatements.join(', ')} WHERE "Id" = $1;`;
        const res = await pool.query(updateQuery, [id]);
        return res.rows[0];
    }
    static async deleteReportTemplateMapping(id) {
        const res = await pool.query('DELETE FROM "ReportTemplateMapping" WHERE "Id" = $1', [id]);
        return res.rowCount;
    }
    
}
module.exports = ReportTemplateMapping;
