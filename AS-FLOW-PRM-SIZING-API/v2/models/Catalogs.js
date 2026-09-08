
    const { pool } = require('../db/pgsqldb');
    const { getFilteredData, getFormatedValues, getFormatedValue } = require('../utils/helper');
class Catalogs {
    constructor(data){
        this.CatalogId = data.CatalogId;
this.CatalogNumber = data.CatalogNumber;
this.FriendlyName = data.FriendlyName;
this.LastUpdatedDate = data.LastUpdatedDate;
this.Description = data.Description;
    }
    static async getAllCatalogs() {
        const listCatalogs = [];
        const res = await pool.query('SELECT * FROM "Catalogs";');
        res.rows.forEach((data) => {
            listCatalogs.push(new Catalogs(data));
        });
        return listCatalogs;
    }
    static async getCatalogsById(id) {
        const res = await pool.query('SELECT * FROM "Catalogs" WHERE "CatalogId" = $1', [id]);
        return new Catalogs(res.rows[0]);
    }    
    static async createCatalogs(data) {
        const filteredData = getFilteredData(data);
        const keys = Object.keys(filteredData);
        const values = getFormatedValues(filteredData);
        const insertQuery = `INSERT INTO "Catalogs"("${keys.join('","')}") VALUES (${values.join(',')})`;
        const res = await pool.query(insertQuery + ' RETURNING *;');
        return res.rows[0];
    }
    static async updateCatalogs(id, data) {
        const filteredData = getFilteredData(data);
        const setStatements = [];
        Object.entries(filteredData).forEach(([key, value]) => {
            setStatements.push(`${key} = ${getFormatedValue(value)}`);
        });
        const updateQuery = `UPDATE "Catalogs" SET ${setStatements.join(', ')} WHERE "CatalogId" = $1;`;
        const res = await pool.query(updateQuery, [id]);
        return res.rows[0];
    }
    static async deleteCatalogs(id) {
        const res = await pool.query('DELETE FROM "Catalogs" WHERE "CatalogId" = $1', [id]);
        return res.rowCount;
    }
    
}
module.exports = Catalogs;
