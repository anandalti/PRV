
    const { pool } = require('../db/pgsqldb');
    const { getFilteredData, getFormatedValues, getFormatedValue } = require('../utils/helper');
class Valves {
    constructor(data){
        this.ValveId = data.ValveId;
this.ModelId = data.ModelId;
this.SizeCode = data.SizeCode;
this.SizeUnit = data.SizeUnit;
this.InletSize = data.InletSize;
this.OutletSize = data.OutletSize;
this.Orifice = data.Orifice;
this.DualOutlet = data.DualOutlet;
this.ARCBypassSize = data.ARCBypassSize;
    }
    static async getAllValves() {
        const listValves = [];
        const res = await pool.query('SELECT * FROM "Valves";');
        res.rows.forEach((data) => {
            listValves.push(new Valves(data));
        });
        return listValves;
    }
    static async getValvesById(id) {
        const res = await pool.query('SELECT * FROM "Valves" WHERE "ValveId" = $1', [id]);
        return new Valves(res.rows[0]);
    }    
    static async createValves(data) {
        const filteredData = getFilteredData(data);
        const keys = Object.keys(filteredData);
        const values = getFormatedValues(filteredData);
        const insertQuery = `INSERT INTO "Valves"("${keys.join('","')}") VALUES (${values.join(',')})`;
        const res = await pool.query(insertQuery + ' RETURNING *;');
        return res.rows[0];
    }
    static async updateValves(id, data) {
        const filteredData = getFilteredData(data);
        const setStatements = [];
        Object.entries(filteredData).forEach(([key, value]) => {
            setStatements.push(`${key} = ${getFormatedValue(value)}`);
        });
        const updateQuery = `UPDATE "Valves" SET ${setStatements.join(', ')} WHERE "ValveId" = $1;`;
        const res = await pool.query(updateQuery, [id]);
        return res.rows[0];
    }
    static async deleteValves(id) {
        const res = await pool.query('DELETE FROM "Valves" WHERE "ValveId" = $1', [id]);
        return res.rowCount;
    }
    
}
module.exports = Valves;
