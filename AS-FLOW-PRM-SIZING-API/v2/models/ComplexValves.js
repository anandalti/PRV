
    const { pool } = require('../db/pgsqldb');
    const { getFilteredData, getFormatedValues, getFormatedValue } = require('../utils/helper');
class ComplexValves {
    constructor(data){
        this.ValveId = data.ValveId;
this.Property1Id = data.Property1Id;
this.Property2Id = data.Property2Id;
    }
    static async getAllComplexValves() {
        const listComplexValves = [];
        const res = await pool.query('SELECT * FROM "ComplexValves";');
        res.rows.forEach((data) => {
            listComplexValves.push(new ComplexValves(data));
        });
        return listComplexValves;
    }
    static async getComplexValvesById(id) {
        const res = await pool.query('SELECT * FROM "ComplexValves" WHERE "Id" = $1', [id]);
        return new ComplexValves(res.rows[0]);
    }    
    static async createComplexValves(data) {
        const filteredData = getFilteredData(data);
        const keys = Object.keys(filteredData);
        const values = getFormatedValues(filteredData);
        const insertQuery = `INSERT INTO "ComplexValves"("${keys.join('","')}") VALUES (${values.join(',')})`;
        const res = await pool.query(insertQuery + ' RETURNING *;');
        return res.rows[0];
    }
    static async updateComplexValves(id, data) {
        const filteredData = getFilteredData(data);
        const setStatements = [];
        Object.entries(filteredData).forEach(([key, value]) => {
            setStatements.push(`${key} = ${getFormatedValue(value)}`);
        });
        const updateQuery = `UPDATE "ComplexValves" SET ${setStatements.join(', ')} WHERE "Id" = $1;`;
        const res = await pool.query(updateQuery, [id]);
        return res.rows[0];
    }
    static async deleteComplexValves(id) {
        const res = await pool.query('DELETE FROM "ComplexValves" WHERE "Id" = $1', [id]);
        return res.rowCount;
    }
    
}
module.exports = ComplexValves;
