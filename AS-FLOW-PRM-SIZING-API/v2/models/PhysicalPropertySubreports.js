
    const { pool } = require('../db/pgsqldb');
    const { getFilteredData, getFormatedValues, getFormatedValue } = require('../utils/helper');
class PhysicalPropertySubreports {
    constructor(data){
        this.PhysicalPropertySubreportId = data.PhysicalPropertySubreportId;
this.BrandId = data.BrandId;
this.ValveType = data.ValveType;
    }
    static async getAllPhysicalPropertySubreports() {
        const listPhysicalPropertySubreports = [];
        const res = await pool.query('SELECT * FROM "PhysicalPropertySubreports";');
        res.rows.forEach((data) => {
            listPhysicalPropertySubreports.push(new PhysicalPropertySubreports(data));
        });
        return listPhysicalPropertySubreports;
    }
    static async getPhysicalPropertySubreportsById(id) {
        const res = await pool.query('SELECT * FROM "PhysicalPropertySubreports" WHERE "PhysicalPropertySubreportId" = $1', [id]);
        return new PhysicalPropertySubreports(res.rows[0]);
    }    
    static async createPhysicalPropertySubreports(data) {
        const filteredData = getFilteredData(data);
        const keys = Object.keys(filteredData);
        const values = getFormatedValues(filteredData);
        const insertQuery = `INSERT INTO "PhysicalPropertySubreports"("${keys.join('","')}") VALUES (${values.join(',')})`;
        const res = await pool.query(insertQuery + ' RETURNING *;');
        return res.rows[0];
    }
    static async updatePhysicalPropertySubreports(id, data) {
        const filteredData = getFilteredData(data);
        const setStatements = [];
        Object.entries(filteredData).forEach(([key, value]) => {
            setStatements.push(`${key} = ${getFormatedValue(value)}`);
        });
        const updateQuery = `UPDATE "PhysicalPropertySubreports" SET ${setStatements.join(', ')} WHERE "PhysicalPropertySubreportId" = $1;`;
        const res = await pool.query(updateQuery, [id]);
        return res.rows[0];
    }
    static async deletePhysicalPropertySubreports(id) {
        const res = await pool.query('DELETE FROM "PhysicalPropertySubreports" WHERE "PhysicalPropertySubreportId" = $1', [id]);
        return res.rowCount;
    }
    
}
module.exports = PhysicalPropertySubreports;
