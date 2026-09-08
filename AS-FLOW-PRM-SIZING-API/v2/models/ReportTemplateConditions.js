
    const { pool } = require('../db/pgsqldb');
    const { getFilteredData, getFormatedValues, getFormatedValue } = require('../utils/helper');
class ReportTemplateConditions {
    constructor(data){
        this.Id = data.Id;
this.TemplateId = data.TemplateId;
this.Brand = data.Brand;
this.ProductType = data.ProductType;
this.ModelNumber = data.ModelNumber;
this.Service = data.Service;
this.ProductFunction = data.ProductFunction;
this.CodeFlow = data.CodeFlow;
this.ValveCategoryId = data.ValveCategoryId;
this.FluidTypeId = data.FluidTypeId;
this.SizingMethodologyId = data.SizingMethodologyId;
    }
    static async getAllReportTemplateConditions() {
        const listReportTemplateConditions = [];
        const res = await pool.query('SELECT * FROM "ReportTemplateConditions";');
        res.rows.forEach((data) => {
            listReportTemplateConditions.push(new ReportTemplateConditions(data));
        });
        return listReportTemplateConditions;
    }
    static async getReportTemplateConditionsById(id) {
        const res = await pool.query('SELECT * FROM "ReportTemplateConditions" WHERE "Id" = $1', [id]);
        return new ReportTemplateConditions(res.rows[0]);
    }    
    static async createReportTemplateConditions(data) {
        const filteredData = getFilteredData(data);
        const keys = Object.keys(filteredData);
        const values = getFormatedValues(filteredData);
        const insertQuery = `INSERT INTO "ReportTemplateConditions"("${keys.join('","')}") VALUES (${values.join(',')})`;
        const res = await pool.query(insertQuery + ' RETURNING *;');
        return res.rows[0];
    }
    static async updateReportTemplateConditions(id, data) {
        const filteredData = getFilteredData(data);
        const setStatements = [];
        Object.entries(filteredData).forEach(([key, value]) => {
            setStatements.push(`${key} = ${getFormatedValue(value)}`);
        });
        const updateQuery = `UPDATE "ReportTemplateConditions" SET ${setStatements.join(', ')} WHERE "Id" = $1;`;
        const res = await pool.query(updateQuery, [id]);
        return res.rows[0];
    }
    static async deleteReportTemplateConditions(id) {
        const res = await pool.query('DELETE FROM "ReportTemplateConditions" WHERE "Id" = $1', [id]);
        return res.rowCount;
    }
    
}
module.exports = ReportTemplateConditions;
