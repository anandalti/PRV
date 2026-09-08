
    const { pool } = require('../db/pgsqldb');
    const { getFilteredData, getFormatedValues, getFormatedValue } = require('../utils/helper');
class GasFluids {
    constructor(data){
        this.GasId = data.GasId;
this.Name = data.Name;
this.MW = data.MW;
this.k = data.k;
this.Z = data.Z;
this.Source = data.Source;
    }
    static async getAllGasFluids() {
        const listGasFluids = [];
        const res = await pool.query('SELECT * FROM "GasFluids";');
        res.rows.forEach((data) => {
            listGasFluids.push(new GasFluids(data));
        });
        return listGasFluids;
    }
    static async getGasFluidsById(id) {
        const res = await pool.query('SELECT * FROM "GasFluids" WHERE "GasId" = $1', [id]);
        return new GasFluids(res.rows[0]);
    }    
    static async createGasFluids(data) {
        const filteredData = getFilteredData(data);
        const keys = Object.keys(filteredData);
        const values = getFormatedValues(filteredData);
        const insertQuery = `INSERT INTO "GasFluids"("${keys.join('","')}") VALUES (${values.join(',')})`;
        const res = await pool.query(insertQuery + ' RETURNING *;');
        return res.rows[0];
    }
    static async updateGasFluids(id, data) {
        const filteredData = getFilteredData(data);
        const setStatements = [];
        Object.entries(filteredData).forEach(([key, value]) => {
            setStatements.push(`${key} = ${getFormatedValue(value)}`);
        });
        const updateQuery = `UPDATE "GasFluids" SET ${setStatements.join(', ')} WHERE "GasId" = $1;`;
        const res = await pool.query(updateQuery, [id]);
        return res.rows[0];
    }
    static async deleteGasFluids(id) {
        const res = await pool.query('DELETE FROM "GasFluids" WHERE "GasId" = $1', [id]);
        return res.rowCount;
    }
    
}
module.exports = GasFluids;
