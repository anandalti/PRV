
    const { pool } = require('../db/pgsqldb');
    const { getFilteredData, getFormatedValues, getFormatedValue } = require('../utils/helper');
class SteamEnthalpies {
    constructor(data){
        this.P1 = data.P1;
this.P1Unit = data.P1Unit;
this.T = data.T;
this.TUnit = data.TUnit;
this.ho = data.ho;
this.hoUnit = data.hoUnit;
this.SaturatedSteamEnthalpy = data.SaturatedSteamEnthalpy;
    }
    static async getAllSteamEnthalpies() {
        const listSteamEnthalpies = [];
        const res = await pool.query('SELECT * FROM "SteamEnthalpies";');
        res.rows.forEach((data) => {
            listSteamEnthalpies.push(new SteamEnthalpies(data));
        });
        return listSteamEnthalpies;
    }
    static async getSteamEnthalpiesById(id) {
        const res = await pool.query('SELECT * FROM "SteamEnthalpies" WHERE "Id" = $1', [id]);
        return new SteamEnthalpies(res.rows[0]);
    }    
    static async createSteamEnthalpies(data) {
        const filteredData = getFilteredData(data);
        const keys = Object.keys(filteredData);
        const values = getFormatedValues(filteredData);
        const insertQuery = `INSERT INTO "SteamEnthalpies"("${keys.join('","')}") VALUES (${values.join(',')})`;
        const res = await pool.query(insertQuery + ' RETURNING *;');
        return res.rows[0];
    }
    static async updateSteamEnthalpies(id, data) {
        const filteredData = getFilteredData(data);
        const setStatements = [];
        Object.entries(filteredData).forEach(([key, value]) => {
            setStatements.push(`${key} = ${getFormatedValue(value)}`);
        });
        const updateQuery = `UPDATE "SteamEnthalpies" SET ${setStatements.join(', ')} WHERE "Id" = $1;`;
        const res = await pool.query(updateQuery, [id]);
        return res.rows[0];
    }
    static async deleteSteamEnthalpies(id) {
        const res = await pool.query('DELETE FROM "SteamEnthalpies" WHERE "Id" = $1', [id]);
        return res.rowCount;
    }
    
}
module.exports = SteamEnthalpies;
