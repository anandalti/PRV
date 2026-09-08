
    const { pool } = require('../db/pgsqldb');
    const { getFilteredData, getFormatedValues, getFormatedValue } = require('../utils/helper');
class DatabaseProperties {
    constructor(data){
        this.Key = data.Key;
this.Value = data.Value;
    }
    static async getAllDatabaseProperties() {
        const listDatabaseProperties = [];
        const res = await pool.query('SELECT * FROM "DatabaseProperties";');
        res.rows.forEach((data) => {
            listDatabaseProperties.push(new DatabaseProperties(data));
        });
        return listDatabaseProperties;
    }
    static async getDatabasePropertiesById(id) {
        const res = await pool.query('SELECT * FROM "DatabaseProperties" WHERE "Key" = $1', [id]);
        return new DatabaseProperties(res.rows[0]);
    }    
    static async createDatabaseProperties(data) {
        const filteredData = getFilteredData(data);
        const keys = Object.keys(filteredData);
        const values = getFormatedValues(filteredData);
        const insertQuery = `INSERT INTO "DatabaseProperties"("${keys.join('","')}") VALUES (${values.join(',')})`;
        const res = await pool.query(insertQuery + ' RETURNING *;');
        return res.rows[0];
    }
    static async updateDatabaseProperties(id, data) {
        const filteredData = getFilteredData(data);
        const setStatements = [];
        Object.entries(filteredData).forEach(([key, value]) => {
            setStatements.push(`${key} = ${getFormatedValue(value)}`);
        });
        const updateQuery = `UPDATE "DatabaseProperties" SET ${setStatements.join(', ')} WHERE "Key" = $1;`;
        const res = await pool.query(updateQuery, [id]);
        return res.rows[0];
    }
    static async deleteDatabaseProperties(id) {
        const res = await pool.query('DELETE FROM "DatabaseProperties" WHERE "Key" = $1', [id]);
        return res.rowCount;
    }
    
}
module.exports = DatabaseProperties;
