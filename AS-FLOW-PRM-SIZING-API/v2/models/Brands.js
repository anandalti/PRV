
    const { pool } = require('../db/pgsqldb');
    const { getFilteredData, getFormatedValues, getFormatedValue } = require('../utils/helper');
class Brands {
    constructor(data){
        this.BrandId = data.BrandId;
this.Brand = data.Brand;
this.ShortName = data.ShortName;
    }
    static async getAllBrands() {
        const listBrands = [];
        const res = await pool.query('SELECT * FROM "Brands";');
        res.rows.forEach((data) => {
            listBrands.push(new Brands(data));
        });
        return listBrands;
    }
    static async getBrandsById(id) {
        const res = await pool.query('SELECT * FROM "Brands" WHERE "BrandId" = $1', [id]);
        return new Brands(res.rows[0]);
    }    
    static async createBrands(data) {
        const filteredData = getFilteredData(data);
        const keys = Object.keys(filteredData);
        const values = getFormatedValues(filteredData);
        const insertQuery = `INSERT INTO "Brands"("${keys.join('","')}") VALUES (${values.join(',')})`;
        const res = await pool.query(insertQuery + ' RETURNING *;');
        return res.rows[0];
    }
    static async updateBrands(id, data) {
        const filteredData = getFilteredData(data);
        const setStatements = [];
        Object.entries(filteredData).forEach(([key, value]) => {
            setStatements.push(`${key} = ${getFormatedValue(value)}`);
        });
        const updateQuery = `UPDATE "Brands" SET ${setStatements.join(', ')} WHERE "BrandId" = $1;`;
        const res = await pool.query(updateQuery, [id]);
        return res.rows[0];
    }
    static async deleteBrands(id) {
        const res = await pool.query('DELETE FROM "Brands" WHERE "BrandId" = $1', [id]);
        return res.rowCount;
    }
    
}
module.exports = Brands;
