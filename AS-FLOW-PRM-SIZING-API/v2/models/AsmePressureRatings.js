
    const { pool } = require('../db/pgsqldb');
    const { getFilteredData, getFormatedValues, getFormatedValue } = require('../utils/helper');
class AsmePressureRatings {
    constructor(data){
        this.MaterialGroupId = data.MaterialGroupId;
this.Temperature = data.Temperature;
this.PressureClass = data.PressureClass;
this.WorkPressure = data.WorkPressure;
this.System = data.System;
    }
    static async getAllAsmePressureRatings() {
        const listAsmePressureRatings = [];
        const res = await pool.query('SELECT * FROM "AsmePressureRatings";');
        res.rows.forEach((data) => {
            listAsmePressureRatings.push(new AsmePressureRatings(data));
        });
        return listAsmePressureRatings;
    }
    static async getAsmePressureRatingsById(id) {
        const res = await pool.query('SELECT * FROM "AsmePressureRatings" WHERE "MaterialGroupId" = $1', [id]);
        return new AsmePressureRatings(res.rows[0]);
    }    
    static async createAsmePressureRatings(data) {
        const filteredData = getFilteredData(data);
        const keys = Object.keys(filteredData);
        const values = getFormatedValues(filteredData);
        const insertQuery = `INSERT INTO "AsmePressureRatings"("${keys.join('","')}") VALUES (${values.join(',')})`;
        const res = await pool.query(insertQuery + ' RETURNING *;');
        return res.rows[0];
    }
    static async updateAsmePressureRatings(id, data) {
        const filteredData = getFilteredData(data);
        const setStatements = [];
        Object.entries(filteredData).forEach(([key, value]) => {
            setStatements.push(`${key} = ${getFormatedValue(value)}`);
        });
        const updateQuery = `UPDATE "AsmePressureRatings" SET ${setStatements.join(', ')} WHERE "MaterialGroupId" = $1;`;
        const res = await pool.query(updateQuery, [id]);
        return res.rows[0];
    }
    static async deleteAsmePressureRatings(id) {
        const res = await pool.query('DELETE FROM "AsmePressureRatings" WHERE "MaterialGroupId" = $1', [id]);
        return res.rowCount;
    }
    
}
module.exports = AsmePressureRatings;
