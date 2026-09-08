
    const { pool } = require('../db/pgsqldb');
    const { getFilteredData, getFormatedValues, getFormatedValue } = require('../utils/helper');
class SuperheatCorrectionFactors {
    constructor(data){
        this.P1 = data.P1;
this.P1Unit = data.P1Unit;
this.T = data.T;
this.TUnit = data.TUnit;
this.Ksh = data.Ksh;
    }
    static async getAllSuperheatCorrectionFactors() {
        const listSuperheatCorrectionFactors = [];
        const res = await pool.query('SELECT * FROM "SuperheatCorrectionFactors";');
        res.rows.forEach((data) => {
            listSuperheatCorrectionFactors.push(new SuperheatCorrectionFactors(data));
        });
        return listSuperheatCorrectionFactors;
    }
    static async getSuperheatCorrectionFactorsById(id) {
        const res = await pool.query('SELECT * FROM "SuperheatCorrectionFactors" WHERE "Id" = $1', [id]);
        return new SuperheatCorrectionFactors(res.rows[0]);
    }    
    static async createSuperheatCorrectionFactors(data) {
        const filteredData = getFilteredData(data);
        const keys = Object.keys(filteredData);
        const values = getFormatedValues(filteredData);
        const insertQuery = `INSERT INTO "SuperheatCorrectionFactors"("${keys.join('","')}") VALUES (${values.join(',')})`;
        const res = await pool.query(insertQuery + ' RETURNING *;');
        return res.rows[0];
    }
    static async updateSuperheatCorrectionFactors(id, data) {
        const filteredData = getFilteredData(data);
        const setStatements = [];
        Object.entries(filteredData).forEach(([key, value]) => {
            setStatements.push(`${key} = ${getFormatedValue(value)}`);
        });
        const updateQuery = `UPDATE "SuperheatCorrectionFactors" SET ${setStatements.join(', ')} WHERE "Id" = $1;`;
        const res = await pool.query(updateQuery, [id]);
        return res.rows[0];
    }
    static async deleteSuperheatCorrectionFactors(id) {
        const res = await pool.query('DELETE FROM "SuperheatCorrectionFactors" WHERE "Id" = $1', [id]);
        return res.rowCount;
    }
    
}
module.exports = SuperheatCorrectionFactors;
