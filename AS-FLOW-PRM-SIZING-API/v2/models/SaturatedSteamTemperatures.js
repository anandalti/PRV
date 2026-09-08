
    const { pool } = require('../db/pgsqldb');
    const { getFilteredData, getFormatedValues, getFormatedValue } = require('../utils/helper');
class SaturatedSteamTemperatures {
    constructor(data){
        this.P1 = data.P1;
        this.P1Unit = data.P1Unit;
        this.Tsat = data.Tsat;
        this.TsatUnit = data.TsatUnit;
    }
    static async getAllSaturatedSteamTemperatures() {
        const listSaturatedSteamTemperatures = [];
        const res = await pool.query('SELECT * FROM "SaturatedSteamTemperatures";');
        res.rows.forEach((data) => {
            listSaturatedSteamTemperatures.push(new SaturatedSteamTemperatures(data));
        });
        return listSaturatedSteamTemperatures;
    }
    static async getSaturatedSteamTemperaturesById(id) {
        const res = await pool.query('SELECT * FROM "SaturatedSteamTemperatures" WHERE "Id" = $1', [id]);
        return new SaturatedSteamTemperatures(res.rows[0]);
    }    
    static async createSaturatedSteamTemperatures(data) {
        const filteredData = getFilteredData(data);
        const keys = Object.keys(filteredData);
        const values = getFormatedValues(filteredData);
        const insertQuery = `INSERT INTO "SaturatedSteamTemperatures"("${keys.join('","')}") VALUES (${values.join(',')})`;
        const res = await pool.query(insertQuery + ' RETURNING *;');
        return res.rows[0];
    }
    static async updateSaturatedSteamTemperatures(id, data) {
        const filteredData = getFilteredData(data);
        const setStatements = [];
        Object.entries(filteredData).forEach(([key, value]) => {
            setStatements.push(`${key} = ${getFormatedValue(value)}`);
        });
        const updateQuery = `UPDATE "SaturatedSteamTemperatures" SET ${setStatements.join(', ')} WHERE "Id" = $1;`;
        const res = await pool.query(updateQuery, [id]);
        return res.rows[0];
    }
    static async deleteSaturatedSteamTemperatures(id) {
        const res = await pool.query('DELETE FROM "SaturatedSteamTemperatures" WHERE "Id" = $1', [id]);
        return res.rowCount;
    }
    
}
module.exports = SaturatedSteamTemperatures;
