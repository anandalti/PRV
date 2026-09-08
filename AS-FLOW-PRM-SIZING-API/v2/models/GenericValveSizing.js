
    const { pool } = require('../db/pgsqldb');
    const { getFilteredData, getFormatedValues, getFormatedValue } = require('../utils/helper');
class GenericValveSizing {
    constructor(data){
        this.Id = data.Id;
this.SizingId = data.SizingId;
this.ManufacturerORBrand = data.ManufacturerORBrand;
this.Model = data.Model;
this.Orifice = data.Orifice;
this.OrificeArea = data.OrificeArea;
this.OrificeAreaUOM = data.OrificeAreaUOM;
this.DistanceFromValve = data.DistanceFromValve;
this.DistanceFromValveUOM = data.DistanceFromValveUOM;
this.InletDiameter = data.InletDiameter;
this.InletOutletDiameterUOM = data.InletOutletDiameterUOM;
this.OutletDiameter = data.OutletDiameter;
this.IsDualOutletValve = data.IsDualOutletValve;
this.IsKORKd = data.IsKORKd;
this.K = data.K;
this.Kd = data.Kd;
this.Kw = data.Kw;
this.Kb = data.Kb;
this.DImA = data.DImA;
this.DimUOM = data.DimUOM;
this.DimB = data.DimB;
this.DimC = data.DimC;
this.Weight  = data.Weight ;
this.WeightUOM = data.WeightUOM;
this.Notes = data.Notes;
this.IsAutoNumberNotes = data.IsAutoNumberNotes;
    }
    static async getAllGenericValveSizing() {
        const listGenericValveSizing = [];
        const res = await pool.query('SELECT * FROM "GenericValveSizing";');
        res.rows.forEach((data) => {
            listGenericValveSizing.push(new GenericValveSizing(data));
        });
        return listGenericValveSizing;
    }
    static async getGenericValveSizingById(id) {
        const res = await pool.query('SELECT * FROM "GenericValveSizing" WHERE "Id" = $1', [id]);
        return new GenericValveSizing(res.rows[0]);
    }    
    static async createGenericValveSizing(data) {
        const filteredData = getFilteredData(data);
        const keys = Object.keys(filteredData);
        const values = getFormatedValues(filteredData);
        const insertQuery = `INSERT INTO "GenericValveSizing"("${keys.join('","')}") VALUES (${values.join(',')})`;
        const res = await pool.query(insertQuery + ' RETURNING *;');
        return res.rows[0];
    }
    static async updateGenericValveSizing(id, data) {
        const filteredData = getFilteredData(data);
        const setStatements = [];
        Object.entries(filteredData).forEach(([key, value]) => {
            setStatements.push(`${key} = ${getFormatedValue(value)}`);
        });
        const updateQuery = `UPDATE "GenericValveSizing" SET ${setStatements.join(', ')} WHERE "Id" = $1;`;
        const res = await pool.query(updateQuery, [id]);
        return res.rows[0];
    }
    static async deleteGenericValveSizing(id) {
        const res = await pool.query('DELETE FROM "GenericValveSizing" WHERE "Id" = $1', [id]);
        return res.rowCount;
    }
    
}
module.exports = GenericValveSizing;
