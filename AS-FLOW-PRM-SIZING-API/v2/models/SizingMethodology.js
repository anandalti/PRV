
    const { pool } = require('../db/pgsqldb');
    const { getFilteredData, getFormatedValues, getFormatedValue } = require('../utils/helper');
class SizingMethodology {
    constructor(data){
        this.Id = data.Id;
this.Name = data.Name;
this.Description = data.Description;
this.IsActive = data.IsActive;
this.DisplayOrder = data.DisplayOrder;
    }
    static async getAllSizingMethodology() {
        const listSizingMethodology = [];
        const res = await pool.query('SELECT * FROM "SizingMethodology";');
        res.rows.forEach((data) => {
            listSizingMethodology.push(new SizingMethodology(data));
        });
        return listSizingMethodology;
    }
    static async getSizingMethodologyById(id) {
        const res = await pool.query('SELECT * FROM "SizingMethodology" WHERE "Id" = $1', [id]);
        return new SizingMethodology(res.rows[0]);
    }    
    static async createSizingMethodology(data) {
        const filteredData = getFilteredData(data);
        const keys = Object.keys(filteredData);
        const values = getFormatedValues(filteredData);
        const insertQuery = `INSERT INTO "SizingMethodology"("${keys.join('","')}") VALUES (${values.join(',')})`;
        const res = await pool.query(insertQuery + ' RETURNING *;');
        return res.rows[0];
    }
    static async updateSizingMethodology(id, data) {
        const filteredData = getFilteredData(data);
        const setStatements = [];
        Object.entries(filteredData).forEach(([key, value]) => {
            setStatements.push(`${key} = ${getFormatedValue(value)}`);
        });
        const updateQuery = `UPDATE "SizingMethodology" SET ${setStatements.join(', ')} WHERE "Id" = $1;`;
        const res = await pool.query(updateQuery, [id]);
        return res.rows[0];
    }
    static async deleteSizingMethodology(id) {
        const res = await pool.query('DELETE FROM "SizingMethodology" WHERE "Id" = $1', [id]);
        return res.rowCount;
    }
    
}
module.exports = SizingMethodology;
