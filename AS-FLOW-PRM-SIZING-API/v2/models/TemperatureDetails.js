
    const { pool } = require('../db/pgsqldb');
    const { getFilteredData, getFormatedValues, getFormatedValue } = require('../utils/helper');
class TemperatureDetails {
    constructor(data){
        this.Id = data.Id;
this.SizingId = data.SizingId;
this.Relieving = data.Relieving;
this.Operating = data.Operating;
this.DesignMin = data.DesignMin;
this.DesignMax = data.DesignMax;
this.NormalSystem = data.NormalSystem;
this.RelievingforVacuum = data.RelievingforVacuum;
this.SaturatedSteam = data.SaturatedSteam;
this.VesselWall = data.VesselWall;
this.Ksh = data.Ksh;
this.ho = data.ho;
this.Ks = data.Ks;
this.TemperatureUOM = data.TemperatureUOM;
    }
    static async getAllTemperatureDetails() {
        const listTemperatureDetails = [];
        const res = await pool.query('SELECT * FROM "TemperatureDetails";');
        res.rows.forEach((data) => {
            listTemperatureDetails.push(new TemperatureDetails(data));
        });
        return listTemperatureDetails;
    }
    static async getTemperatureDetailsById(id) {
        const res = await pool.query('SELECT * FROM "TemperatureDetails" WHERE "Id" = $1', [id]);
        return new TemperatureDetails(res.rows[0]);
    }    
    static async createTemperatureDetails(data) {
        const filteredData = getFilteredData(data);
        const keys = Object.keys(filteredData);
        const values = getFormatedValues(filteredData);
        const insertQuery = `INSERT INTO "TemperatureDetails"("${keys.join('","')}") VALUES (${values.join(',')})`;
        const res = await pool.query(insertQuery + ' RETURNING *;');
        return res.rows[0];
    }
    static async updateTemperatureDetails(id, data) {
        const filteredData = getFilteredData(data);
        const setStatements = [];
        Object.entries(filteredData).forEach(([key, value]) => {
            setStatements.push(`${key} = ${getFormatedValue(value)}`);
        });
        const updateQuery = `UPDATE "TemperatureDetails" SET ${setStatements.join(', ')} WHERE "Id" = $1;`;
        const res = await pool.query(updateQuery, [id]);
        return res.rows[0];
    }
    static async deleteTemperatureDetails(id) {
        const res = await pool.query('DELETE FROM "TemperatureDetails" WHERE "Id" = $1', [id]);
        return res.rowCount;
    }
    
}
module.exports = TemperatureDetails;
