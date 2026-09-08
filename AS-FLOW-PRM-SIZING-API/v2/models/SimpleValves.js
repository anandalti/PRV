
    const { pool } = require('../db/pgsqldb');
    const { getFilteredData, getFormatedValues, getFormatedValue } = require('../utils/helper');
class SimpleValves {
    constructor(data){
        this.ValveId = data.ValveId;
this.PropertyId = data.PropertyId;
    }
    static async getAllSimpleValves() {
        const listSimpleValves = [];
        const res = await pool.query('SELECT * FROM "SimpleValves";');
        res.rows.forEach((data) => {
            listSimpleValves.push(new SimpleValves(data));
        });
        return listSimpleValves;
    }
    static async getSimpleValvesById(id) {
        const res = await pool.query('SELECT * FROM "SimpleValves" WHERE "Id" = $1', [id]);
        return new SimpleValves(res.rows[0]);
    }    
    static async createSimpleValves(data) {
        const filteredData = getFilteredData(data);
        const keys = Object.keys(filteredData);
        const values = getFormatedValues(filteredData);
        const insertQuery = `INSERT INTO "SimpleValves"("${keys.join('","')}") VALUES (${values.join(',')})`;
        const res = await pool.query(insertQuery + ' RETURNING *;');
        return res.rows[0];
    }
    static async updateSimpleValves(id, data) {
        const filteredData = getFilteredData(data);
        const setStatements = [];
        Object.entries(filteredData).forEach(([key, value]) => {
            setStatements.push(`${key} = ${getFormatedValue(value)}`);
        });
        const updateQuery = `UPDATE "SimpleValves" SET ${setStatements.join(', ')} WHERE "Id" = $1;`;
        const res = await pool.query(updateQuery, [id]);
        return res.rows[0];
    }
    static async deleteSimpleValves(id) {
        const res = await pool.query('DELETE FROM "SimpleValves" WHERE "Id" = $1', [id]);
        return res.rowCount;
    }
    
}
module.exports = SimpleValves;
