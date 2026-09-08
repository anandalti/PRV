
    const { pool } = require('../db/pgsqldb');
    const { getFilteredData, getFormatedValues, getFormatedValue } = require('../utils/helper');
class MultiphaseFluids {
    constructor(data){
        this.MultiphaseId = data.MultiphaseId;
this.Name = data.Name;
this.M = data.M;
this.k = data.k;
this.Z = data.Z;
this.SG = data.SG;
this.Tcrit = data.Tcrit;
this.Pcrit = data.Pcrit;
this.Source = data.Source;
this.TcritUnit = data.TcritUnit;
this.PcritUnit = data.PcritUnit;
    }
    static async getAllMultiphaseFluids() {
        const listMultiphaseFluids = [];
        const res = await pool.query('SELECT * FROM "MultiphaseFluids";');
        res.rows.forEach((data) => {
            listMultiphaseFluids.push(new MultiphaseFluids(data));
        });
        return listMultiphaseFluids;
    }
    static async getMultiphaseFluidsById(id) {
        const res = await pool.query('SELECT * FROM "MultiphaseFluids" WHERE "MultiphaseId" = $1', [id]);
        return new MultiphaseFluids(res.rows[0]);
    }    
    static async createMultiphaseFluids(data) {
        const filteredData = getFilteredData(data);
        const keys = Object.keys(filteredData);
        const values = getFormatedValues(filteredData);
        const insertQuery = `INSERT INTO "MultiphaseFluids"("${keys.join('","')}") VALUES (${values.join(',')})`;
        const res = await pool.query(insertQuery + ' RETURNING *;');
        return res.rows[0];
    }
    static async updateMultiphaseFluids(id, data) {
        const filteredData = getFilteredData(data);
        const setStatements = [];
        Object.entries(filteredData).forEach(([key, value]) => {
            setStatements.push(`${key} = ${getFormatedValue(value)}`);
        });
        const updateQuery = `UPDATE "MultiphaseFluids" SET ${setStatements.join(', ')} WHERE "MultiphaseId" = $1;`;
        const res = await pool.query(updateQuery, [id]);
        return res.rows[0];
    }
    static async deleteMultiphaseFluids(id) {
        const res = await pool.query('DELETE FROM "MultiphaseFluids" WHERE "MultiphaseId" = $1', [id]);
        return res.rowCount;
    }
    
}
module.exports = MultiphaseFluids;
