
    const { pool } = require('../db/pgsqldb');
    const { getFilteredData, getFormatedValues, getFormatedValue } = require('../utils/helper');
class ComboCatalogStringLookup {
    constructor(data){
        this.ComboCatalogStringLookup1 = data.ComboCatalogStringLookup1;
this.Model1CatalogString = data.Model1CatalogString;
this.Model2CatalogString = data.Model2CatalogString;
    }
    static async getAllComboCatalogStringLookup() {
        const listComboCatalogStringLookup = [];
        const res = await pool.query('SELECT * FROM "ComboCatalogStringLookup";');
        res.rows.forEach((data) => {
            listComboCatalogStringLookup.push(new ComboCatalogStringLookup(data));
        });
        return listComboCatalogStringLookup;
    }
    static async getComboCatalogStringLookupById(id) {
        const res = await pool.query('SELECT * FROM "ComboCatalogStringLookup" WHERE "Id" = $1', [id]);
        return new ComboCatalogStringLookup(res.rows[0]);
    }    
    static async createComboCatalogStringLookup(data) {
        const filteredData = getFilteredData(data);
        const keys = Object.keys(filteredData);
        const values = getFormatedValues(filteredData);
        const insertQuery = `INSERT INTO "ComboCatalogStringLookup"("${keys.join('","')}") VALUES (${values.join(',')})`;
        const res = await pool.query(insertQuery + ' RETURNING *;');
        return res.rows[0];
    }
    static async updateComboCatalogStringLookup(id, data) {
        const filteredData = getFilteredData(data);
        const setStatements = [];
        Object.entries(filteredData).forEach(([key, value]) => {
            setStatements.push(`${key} = ${getFormatedValue(value)}`);
        });
        const updateQuery = `UPDATE "ComboCatalogStringLookup" SET ${setStatements.join(', ')} WHERE "Id" = $1;`;
        const res = await pool.query(updateQuery, [id]);
        return res.rows[0];
    }
    static async deleteComboCatalogStringLookup(id) {
        const res = await pool.query('DELETE FROM "ComboCatalogStringLookup" WHERE "Id" = $1', [id]);
        return res.rowCount;
    }
    
}
module.exports = ComboCatalogStringLookup;
