
    const { pool } = require('../db/pgsqldb');
    const { getFilteredData, getFormatedValues, getFormatedValue } = require('../utils/helper');
class SizingFieldProperties {
    constructor(data){
        this.Id = data.Id;
        this.SizingId = data.SizingId;
        this.FieldProperties = data.FieldProperties;
    }
    static async getAllSizingFieldProperties() {
        const listSizingFieldProperties = [];
        const res = await pool.query('SELECT * FROM "SizingFieldProperties";');
        res.rows.forEach((data) => {
            listSizingFieldProperties.push(new SizingFieldProperties(data));
        });
        return listSizingFieldProperties;
    }
    static async getSizingFieldPropertiesById(id) {
        const res = await pool.query('SELECT * FROM "SizingFieldProperties" WHERE "Id" = $1', [id]);
        return new SizingFieldProperties(res.rows[0]);
    }    
    static async createSizingFieldProperties(data) {
        const filteredData = getFilteredData(data);
        const keys = Object.keys(filteredData);
        const values = getFormatedValues(filteredData);
        const insertQuery = `INSERT INTO "SizingFieldProperties"("${keys.join('","')}") VALUES (${values.join(',')})`;
        const res = await pool.query(insertQuery + ' RETURNING *;');
        return res.rows[0];
    }
    static async updateFieldProperties(id, data) {
        const filteredData = getFilteredData(data);
        const setStatements = [];
        Object.entries(filteredData).forEach(([key, value]) => {
            setStatements.push(`${key} = ${getFormatedValue(value)}`);
        });
        const updateQuery = `UPDATE "SizingFieldProperties" SET ${setStatements.join(', ')} WHERE "Id" = $1;`;
        const res = await pool.query(updateQuery, [id]);
        return res.rows[0];
    }
    static async deleteSizingFieldProperties(id) {
        const res = await pool.query('DELETE FROM "SizingFieldProperties" WHERE "Id" = $1', [id]);
        return res.rowCount;
    }
    
}
module.exports = SizingFieldProperties;
