
    const { pool } = require('../db/pgsqldb');
    const { getFilteredData, getFormatedValues, getFormatedValue } = require('../utils/helper');
class ISO4126AppAA {
    constructor(data){
        this.P1 = data.P1;
this.P1Unit = data.P1Unit;
this.Tsat = data.Tsat;
this.TsatUnit = data.TsatUnit;
this.Kssat = data.Kssat;
this.Ksat = data.Ksat;
    }
    static async getAllISO4126AppAA() {
        const listISO4126AppAA = [];
        const res = await pool.query('SELECT * FROM "ISO4126AppAA";');
        res.rows.forEach((data) => {
            listISO4126AppAA.push(new ISO4126AppAA(data));
        });
        return listISO4126AppAA;
    }
    static async getISO4126AppAAById(id) {
        const res = await pool.query('SELECT * FROM "ISO4126AppAA" WHERE "Id" = $1', [id]);
        return new ISO4126AppAA(res.rows[0]);
    }    
    static async createISO4126AppAA(data) {
        const filteredData = getFilteredData(data);
        const keys = Object.keys(filteredData);
        const values = getFormatedValues(filteredData);
        const insertQuery = `INSERT INTO "ISO4126AppAA"("${keys.join('","')}") VALUES (${values.join(',')})`;
        const res = await pool.query(insertQuery + ' RETURNING *;');
        return res.rows[0];
    }
    static async updateISO4126AppAA(id, data) {
        const filteredData = getFilteredData(data);
        const setStatements = [];
        Object.entries(filteredData).forEach(([key, value]) => {
            setStatements.push(`${key} = ${getFormatedValue(value)}`);
        });
        const updateQuery = `UPDATE "ISO4126AppAA" SET ${setStatements.join(', ')} WHERE "Id" = $1;`;
        const res = await pool.query(updateQuery, [id]);
        return res.rows[0];
    }
    static async deleteISO4126AppAA(id) {
        const res = await pool.query('DELETE FROM "ISO4126AppAA" WHERE "Id" = $1', [id]);
        return res.rowCount;
    }
    
}
module.exports = ISO4126AppAA;
