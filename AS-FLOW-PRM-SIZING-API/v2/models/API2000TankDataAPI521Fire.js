
    const { pool } = require('../db/pgsqldb');
    const { getFilteredData, getFormatedValues, getFormatedValue } = require('../utils/helper');
class API2000TankDataAPI521Fire {
    constructor(data){
        this.Id = data.Id;
this.SizingId = data.SizingId;
this.TankShape = data.TankShape;
this.Diameter_d = data.Diameter_d;
this.Diameter_d_UOM = data?.LengthUOM ?? data.Diameter_d_UOM;
this.Elevation_H = data.Elevation_H;
this.Elevation_H_UOM = data?.LengthUOM ?? data.Elevation_H_UOM;
this.Height_h = data.Height_h;
this.Height_h_UOM = data?.LengthUOM ?? data.Height_h_UOM;
this.VesselWidth_w = data.VesselWidth_w;
this.VesselWidth_w_UOM = data?.LengthUOM ?? data.VesselWidth_w_UOM;
this.LengthEndToEnd_lt = data.LengthEndToEnd_lt;
this.LengthEndToEnd_lt_UOM = data?.LengthUOM ?? data.LengthEndToEnd_lt_UOM;
this.LengthSeamToSeam_Ls = data.LengthSeamToSeam_Ls;
this.LengthSeamToSeam_Ls_UOM = data?.LengthUOM ?? data.LengthSeamToSeam_Ls_UOM;
this.IsHorizontalOrientation = data.IsHorizontalOrientation;
this.Ends = data.Ends;
this.IsLtOrLs = data.IsLtOrLs;
this.LiquidDepth_f = data.LiquidDepth_f;
this.LiquidDepth_f_UOM = data?.LengthUOM ?? data.LiquidDepth_f_UOM;
this.BottomPlate_Y= data.BottomPlate_Y;
this.tcResponse= data.tcResponse;
    }
    static async getAllAPI2000TankDataAPI521Fire() {
        const listAPI2000TankDataAPI521Fire = [];
        const res = await pool.query('SELECT * FROM "API2000TankDataAPI521Fire";');
        res.rows.forEach((data) => {
            listAPI2000TankDataAPI521Fire.push(new API2000TankDataAPI521Fire(data));
        });
        return listAPI2000TankDataAPI521Fire;
    }
    static async getAPI2000TankDataAPI521FireById(id) {
        const res = await pool.query('SELECT * FROM "API2000TankDataAPI521Fire" WHERE "Id" = $1', [id]);
        return new API2000TankDataAPI521Fire(res.rows[0]);
    } 
    static async getAPI2000TankDataAPI521FireBySizingId(sizingid) {
        const res = await pool.query('SELECT * FROM "API2000TankDataAPI521Fire" WHERE "SizingId" = $1', [sizingid]);
        return new API2000TankDataAPI521Fire(res.rows[0]);
    }     
    static async createAPI2000TankDataAPI521Fire(data) {
        const filteredData = getFilteredData(data);
        const keys = Object.keys(filteredData);
        const values = getFormatedValues(filteredData);
        const insertQuery = `INSERT INTO "API2000TankDataAPI521Fire"("${keys.join('","')}") VALUES (${values.join(',')})`;
        const res = await pool.query(insertQuery + ' RETURNING *;');
        return res.rows[0];
    }
    static async updateAPI2000TankDataAPI521Fire(id, data) {
        const filteredData = getFilteredData(data);
        const setStatements = [];
        Object.entries(filteredData).forEach(([key, value]) => {
            setStatements.push(`${key} = ${getFormatedValue(value)}`);
        });
        const updateQuery = `UPDATE "API2000TankDataAPI521Fire" SET ${setStatements.join(', ')} WHERE "Id" = $1;`;
        const res = await pool.query(updateQuery, [id]);
        return res.rows[0];
    }
    static async deleteAPI2000TankDataAPI521Fire(id) {
        const res = await pool.query('DELETE FROM "API2000TankDataAPI521Fire" WHERE "Id" = $1', [id]);
        return res.rowCount;
    }
    
}
module.exports = API2000TankDataAPI521Fire;
