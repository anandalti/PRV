
    const { pool } = require('../db/pgsqldb');
    const { getFilteredData, getFormatedValues, getFormatedValue } = require('../utils/helper');
class CatalogReference {
    constructor(data){
        this.ModelId = data.ModelId;
this.CatalogId = data.CatalogId;
this.Primary = data.Primary;
    }
    static async getAllCatalogReference() {
        const listCatalogReference = [];
        const res = await pool.query('SELECT * FROM "CatalogReference";');
        res.rows.forEach((data) => {
            listCatalogReference.push(new CatalogReference(data));
        });
        return listCatalogReference;
    }
    static async getCatalogReferenceById(id) {
        const res = await pool.query('SELECT * FROM "CatalogReference" WHERE "Id" = $1', [id]);
        return new CatalogReference(res.rows[0]);
    }    
    static async createCatalogReference(data) {
        const filteredData = getFilteredData(data);
        const keys = Object.keys(filteredData);
        const values = getFormatedValues(filteredData);
        const insertQuery = `INSERT INTO "CatalogReference"("${keys.join('","')}") VALUES (${values.join(',')})`;
        const res = await pool.query(insertQuery + ' RETURNING *;');
        return res.rows[0];
    }
    static async updateCatalogReference(id, data) {
        const filteredData = getFilteredData(data);
        const setStatements = [];
        Object.entries(filteredData).forEach(([key, value]) => {
            setStatements.push(`${key} = ${getFormatedValue(value)}`);
        });
        const updateQuery = `UPDATE "CatalogReference" SET ${setStatements.join(', ')} WHERE "Id" = $1;`;
        const res = await pool.query(updateQuery, [id]);
        return res.rows[0];
    }
    static async deleteCatalogReference(id) {
        const res = await pool.query('DELETE FROM "CatalogReference" WHERE "Id" = $1', [id]);
        return res.rowCount;
    }
    
}
module.exports = CatalogReference;
