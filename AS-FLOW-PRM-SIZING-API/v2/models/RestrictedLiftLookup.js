
    const { pool } = require('../db/pgsqldb');
    const { getFilteredData, getFormatedValues, getFormatedValue } = require('../utils/helper');
class RestrictedLiftLookup {
    constructor(data){
        this.RLId = data.RLId;
this.Lres = data.Lres;
this.Lres_Base_3 = data.Lres_Base_3;
this.Lres_Base_4 = data.Lres_Base_4;
this.Lres_Base_5 = data.Lres_Base_5;
this.Lres_Base_6 = data.Lres_Base_6;
this.Lres_Base_7 = data.Lres_Base_7;
this.Lres_Base_8 = data.Lres_Base_8;
this.Lres_Base_9 = data.Lres_Base_9;
this.LRMinBracket = data.LRMinBracket;
this.LRMin = data.LRMin;
this.LRMax = data.LRMax;
this.LRMaxBracket = data.LRMaxBracket;
this.Char_1 = data.Char_1;
this.Char_2 = data.Char_2;
this.Char_3 = data.Char_3;
this.LSLAdd = data.LSLAdd;
    }
    static async getAllRestrictedLiftLookup() {
        const listRestrictedLiftLookup = [];
        const res = await pool.query('SELECT * FROM "RestrictedLiftLookup";');
        res.rows.forEach((data) => {
            listRestrictedLiftLookup.push(new RestrictedLiftLookup(data));
        });
        return listRestrictedLiftLookup;
    }
    static async getRestrictedLiftLookupById(id) {
        const res = await pool.query('SELECT * FROM "RestrictedLiftLookup" WHERE "RLId" = $1', [id]);
        return new RestrictedLiftLookup(res.rows[0]);
    }    
    static async createRestrictedLiftLookup(data) {
        const filteredData = getFilteredData(data);
        const keys = Object.keys(filteredData);
        const values = getFormatedValues(filteredData);
        const insertQuery = `INSERT INTO "RestrictedLiftLookup"("${keys.join('","')}") VALUES (${values.join(',')})`;
        const res = await pool.query(insertQuery + ' RETURNING *;');
        return res.rows[0];
    }
    static async updateRestrictedLiftLookup(id, data) {
        const filteredData = getFilteredData(data);
        const setStatements = [];
        Object.entries(filteredData).forEach(([key, value]) => {
            setStatements.push(`${key} = ${getFormatedValue(value)}`);
        });
        const updateQuery = `UPDATE "RestrictedLiftLookup" SET ${setStatements.join(', ')} WHERE "RLId" = $1;`;
        const res = await pool.query(updateQuery, [id]);
        return res.rows[0];
    }
    static async deleteRestrictedLiftLookup(id) {
        const res = await pool.query('DELETE FROM "RestrictedLiftLookup" WHERE "RLId" = $1', [id]);
        return res.rowCount;
    }
    
}
module.exports = RestrictedLiftLookup;
