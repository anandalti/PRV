
    const { pool } = require('../db/pgsqldb');
    const { getFilteredData, getFormatedValues, getFormatedValue } = require('../utils/helper');
class ValveProperties {
    constructor(data){
        this.ValvePropertyId = data.ValvePropertyId;
this.ValveType = data.ValveType;
this.ValveFunction = data.ValveFunction;
this.NominalSize = data.NominalSize;
this.Kmax = data.Kmax;
this.Tp = data.Tp;
this.Tpunits = data.Tpunits;
this.E = data.E;
this.A = data.A;
this.m = data.m;
this.b = data.b;
this.Service = data.Service;
this.NozzleSize = data.NozzleSize;
this.AAPI = data.AAPI;
this.KAPI = data.KAPI;
this.Cv = data.Cv;
this.ARCMainValveSize = data.ARCMainValveSize;
this.ARCBypassSize = data.ARCBypassSize;
this.ARCMaxMainValveCv = data.ARCMaxMainValveCv;
this.ARCDiscSpring = data.ARCDiscSpring;
this.ARCFullLiftDiscDeltaP = data.ARCFullLiftDiscDeltaP;
this.ARCMinBypassCv = data.ARCMinBypassCv;
this.ARCMaxBypassCv = data.ARCMaxBypassCv;
this.ARCSwitchPointMainFlow = data.ARCSwitchPointMainFlow;
this.ARCValveSize = data.ARCValveSize;
this.ARCOrientation = data.ARCOrientation;
this.ARCValveDescription = data.ARCValveDescription;
    }
    static async getAllValveProperties() {
        const listValveProperties = [];
        const res = await pool.query('SELECT * FROM "ValveProperties";');
        res.rows.forEach((data) => {
            listValveProperties.push(new ValveProperties(data));
        });
        return listValveProperties;
    }
    static async getValvePropertiesById(id) {
        const res = await pool.query('SELECT * FROM "ValveProperties" WHERE "ValvePropertyId" = $1', [id]);
        return new ValveProperties(res.rows[0]);
    }    
    static async createValveProperties(data) {
        const filteredData = getFilteredData(data);
        const keys = Object.keys(filteredData);
        const values = getFormatedValues(filteredData);
        const insertQuery = `INSERT INTO "ValveProperties"("${keys.join('","')}") VALUES (${values.join(',')})`;
        const res = await pool.query(insertQuery + ' RETURNING *;');
        return res.rows[0];
    }
    static async updateValveProperties(id, data) {
        const filteredData = getFilteredData(data);
        const setStatements = [];
        Object.entries(filteredData).forEach(([key, value]) => {
            setStatements.push(`${key} = ${getFormatedValue(value)}`);
        });
        const updateQuery = `UPDATE "ValveProperties" SET ${setStatements.join(', ')} WHERE "ValvePropertyId" = $1;`;
        const res = await pool.query(updateQuery, [id]);
        return res.rows[0];
    }
    static async deleteValveProperties(id) {
        const res = await pool.query('DELETE FROM "ValveProperties" WHERE "ValvePropertyId" = $1', [id]);
        return res.rowCount;
    }
    
}
module.exports = ValveProperties;
