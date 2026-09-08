
    const { pool } = require('../db/pgsqldb');
    const { getFilteredData, getFormatedValues, getFormatedValue } = require('../utils/helper');
class PhysicalPropertySubreportFields {
    constructor(data){
        this.PhysicalPropertySubreportFieldId = data.PhysicalPropertySubreportFieldId;
this.PhysicalPropertySubreportId = data.PhysicalPropertySubreportId;
this.PhysicalPropertyEnumerationId = data.PhysicalPropertyEnumerationId;
this.Name = data.Name;
    }
    static async getAllPhysicalPropertySubreportFields() {
        const listPhysicalPropertySubreportFields = [];
        const res = await pool.query('SELECT * FROM "PhysicalPropertySubreportFields";');
        res.rows.forEach((data) => {
            listPhysicalPropertySubreportFields.push(new PhysicalPropertySubreportFields(data));
        });
        return listPhysicalPropertySubreportFields;
    }
    static async getPhysicalPropertySubreportFieldsById(id) {
        const res = await pool.query('SELECT * FROM "PhysicalPropertySubreportFields" WHERE "PhysicalPropertySubreportFieldId" = $1', [id]);
        return new PhysicalPropertySubreportFields(res.rows[0]);
    }    
    static async createPhysicalPropertySubreportFields(data) {
        const filteredData = getFilteredData(data);
        const keys = Object.keys(filteredData);
        const values = getFormatedValues(filteredData);
        const insertQuery = `INSERT INTO "PhysicalPropertySubreportFields"("${keys.join('","')}") VALUES (${values.join(',')})`;
        const res = await pool.query(insertQuery + ' RETURNING *;');
        return res.rows[0];
    }
    static async updatePhysicalPropertySubreportFields(id, data) {
        const filteredData = getFilteredData(data);
        const setStatements = [];
        Object.entries(filteredData).forEach(([key, value]) => {
            setStatements.push(`${key} = ${getFormatedValue(value)}`);
        });
        const updateQuery = `UPDATE "PhysicalPropertySubreportFields" SET ${setStatements.join(', ')} WHERE "PhysicalPropertySubreportFieldId" = $1;`;
        const res = await pool.query(updateQuery, [id]);
        return res.rows[0];
    }
    static async deletePhysicalPropertySubreportFields(id) {
        const res = await pool.query('DELETE FROM "PhysicalPropertySubreportFields" WHERE "PhysicalPropertySubreportFieldId" = $1', [id]);
        return res.rowCount;
    }
    
}
module.exports = PhysicalPropertySubreportFields;
