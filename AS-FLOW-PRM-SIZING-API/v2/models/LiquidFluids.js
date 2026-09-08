
    const { pool } = require('../db/pgsqldb');
    const { getFilteredData, getFormatedValues, getFormatedValue } = require('../utils/helper');
class LiquidFluids {
    constructor(data){
        this.LiquidId = data.LiquidId;
this.Name = data.Name;
this.SG = data.SG;
this.Viscosity = data.Viscosity;
this.Source = data.Source;
this.ViscosityUnit = data.ViscosityUnit;
this.Pcrit = data.Pcrit;
this.PcritUnit = data.PcritUnit;
    }
    static async getAllLiquidFluids() {
        const listLiquidFluids = [];
        const res = await pool.query('SELECT * FROM "LiquidFluids";');
        res.rows.forEach((data) => {
            listLiquidFluids.push(new LiquidFluids(data));
        });
        return listLiquidFluids;
    }
    static async getLiquidFluidsById(id) {
        const res = await pool.query('SELECT * FROM "LiquidFluids" WHERE "LiquidId" = $1', [id]);
        return new LiquidFluids(res.rows[0]);
    }    
    static async createLiquidFluids(data) {
        const filteredData = getFilteredData(data);
        const keys = Object.keys(filteredData);
        const values = getFormatedValues(filteredData);
        const insertQuery = `INSERT INTO "LiquidFluids"("${keys.join('","')}") VALUES (${values.join(',')})`;
        const res = await pool.query(insertQuery + ' RETURNING *;');
        return res.rows[0];
    }
    static async updateLiquidFluids(id, data) {
        const filteredData = getFilteredData(data);
        const setStatements = [];
        Object.entries(filteredData).forEach(([key, value]) => {
            setStatements.push(`${key} = ${getFormatedValue(value)}`);
        });
        const updateQuery = `UPDATE "LiquidFluids" SET ${setStatements.join(', ')} WHERE "LiquidId" = $1;`;
        const res = await pool.query(updateQuery, [id]);
        return res.rows[0];
    }
    static async deleteLiquidFluids(id) {
        const res = await pool.query('DELETE FROM "LiquidFluids" WHERE "LiquidId" = $1', [id]);
        return res.rowCount;
    }
    
}
module.exports = LiquidFluids;
