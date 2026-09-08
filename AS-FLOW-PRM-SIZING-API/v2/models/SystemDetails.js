
    const { pool } = require('../db/pgsqldb');
    const { getFilteredData, getFormatedValues, getFormatedValue } = require('../utils/helper');
class SystemDetails {
    constructor(data){
        this.Id = data.Id;
this.SizingId = data.SizingId;
this.IsSingleORMultiCompSys = data.IsSingleORMultiCompSys;
this.FarFromCriticalPoint = data.FarFromCriticalPoint;
this.CriticalPressure = data.CriticalPressure;
this.CriticalTemperature = data.CriticalTemperature;
this.IsBoilingRangeLT150F = data.IsBoilingRangeLT150F;
this.IsMixtureLTPoint1PerHydrorgen = data.IsMixtureLTPoint1PerHydrorgen;
    }
    static async getAllSystemDetails() {
        const listSystemDetails = [];
        const res = await pool.query('SELECT * FROM "SystemDetails";');
        res.rows.forEach((data) => {
            listSystemDetails.push(new SystemDetails(data));
        });
        return listSystemDetails;
    }
    static async getSystemDetailsById(id) {
        const res = await pool.query('SELECT * FROM "SystemDetails" WHERE "Id" = $1', [id]);
        return new SystemDetails(res.rows[0]);
    }    
    static async createSystemDetails(data) {
        const filteredData = getFilteredData(data);
        const keys = Object.keys(filteredData);
        const values = getFormatedValues(filteredData);
        const insertQuery = `INSERT INTO "SystemDetails"("${keys.join('","')}") VALUES (${values.join(',')})`;
        const res = await pool.query(insertQuery + ' RETURNING *;');
        return res.rows[0];
    }
    static async updateSystemDetails(id, data) {
        const filteredData = getFilteredData(data);
        const setStatements = [];
        Object.entries(filteredData).forEach(([key, value]) => {
            setStatements.push(`${key} = ${getFormatedValue(value)}`);
        });
        const updateQuery = `UPDATE "SystemDetails" SET ${setStatements.join(', ')} WHERE "Id" = $1;`;
        const res = await pool.query(updateQuery, [id]);
        return res.rows[0];
    }
    static async deleteSystemDetails(id) {
        const res = await pool.query('DELETE FROM "SystemDetails" WHERE "Id" = $1', [id]);
        return res.rowCount;
    }
    
}
module.exports = SystemDetails;
