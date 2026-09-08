
    const { pool } = require('../db/pgsqldb');
    const { getFilteredData, getFormatedValues, getFormatedValue } = require('../utils/helper');
class FluidType {
    constructor(data){
        this.Id = data.Id;
this.Name = data.Name;
this.Description = data.Description;
this.IsActive = data.IsActive;
this.DisplayOrder = data.DisplayOrder;
this.Icon = data.Icon;
    }
    static async getAllFluidType() {
        const listFluidType = [];
        const res = await pool.query('SELECT * FROM "FluidType";');
        res.rows.forEach((data) => {
            listFluidType.push(new FluidType(data));
        });
        return listFluidType;
    }
    static async getFluidTypeById(id) {
        const res = await pool.query('SELECT * FROM "FluidType" WHERE "Id" = $1', [id]);
        return new FluidType(res.rows[0]);
    }    
    static async createFluidType(data) {
        const filteredData = getFilteredData(data);
        const keys = Object.keys(filteredData);
        const values = getFormatedValues(filteredData);
        const insertQuery = `INSERT INTO "FluidType"("${keys.join('","')}") VALUES (${values.join(',')})`;
        const res = await pool.query(insertQuery + ' RETURNING *;');
        return res.rows[0];
    }
    static async updateFluidType(id, data) {
        const filteredData = getFilteredData(data);
        const setStatements = [];
        Object.entries(filteredData).forEach(([key, value]) => {
            setStatements.push(`${key} = ${getFormatedValue(value)}`);
        });
        const updateQuery = `UPDATE "FluidType" SET ${setStatements.join(', ')} WHERE "Id" = $1;`;
        const res = await pool.query(updateQuery, [id]);
        return res.rows[0];
    }
    static async deleteFluidType(id) {
        const res = await pool.query('DELETE FROM "FluidType" WHERE "Id" = $1', [id]);
        return res.rowCount;
    }
    
}
module.exports = FluidType;
