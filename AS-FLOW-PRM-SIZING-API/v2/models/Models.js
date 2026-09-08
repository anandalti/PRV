
    const { pool } = require('../db/pgsqldb');
    const { getFilteredData, getFormatedValues, getFormatedValue } = require('../utils/helper');
class Models {
    constructor(data){
        this.ModelId = data.ModelId;
this.BrandId = data.BrandId;
this.ModelNumber = data.ModelNumber;
this.ImageKey = data.ImageKey;
this.AllowedPbackTypes = data.AllowedPbackTypes;
this.SchematicImageKey = data.SchematicImageKey;
this.DrawingImageKey = data.DrawingImageKey;
this.ValveType = data.ValveType;
this.SafetyRelief = data.SafetyRelief;
this.Balanced = data.Balanced;
this.MarketingTextKey = data.MarketingTextKey;
this.ValveTypeSummary = data.ValveTypeSummary;
    }
    static async getAllModels() {
        const listModels = [];
        const res = await pool.query('SELECT * FROM "Models";');
        res.rows.forEach((data) => {
            listModels.push(new Models(data));
        });
        return listModels;
    }
    static async getModelsById(id) {
        const res = await pool.query('SELECT * FROM "Models" WHERE "ModelId" = $1', [id]);
        return new Models(res.rows[0]);
    }    
    static async createModels(data) {
        const filteredData = getFilteredData(data);
        const keys = Object.keys(filteredData);
        const values = getFormatedValues(filteredData);
        const insertQuery = `INSERT INTO "Models"("${keys.join('","')}") VALUES (${values.join(',')})`;
        const res = await pool.query(insertQuery + ' RETURNING *;');
        return res.rows[0];
    }
    static async updateModels(id, data) {
        const filteredData = getFilteredData(data);
        const setStatements = [];
        Object.entries(filteredData).forEach(([key, value]) => {
            setStatements.push(`${key} = ${getFormatedValue(value)}`);
        });
        const updateQuery = `UPDATE "Models" SET ${setStatements.join(', ')} WHERE "ModelId" = $1;`;
        const res = await pool.query(updateQuery, [id]);
        return res.rows[0];
    }
    static async deleteModels(id) {
        const res = await pool.query('DELETE FROM "Models" WHERE "ModelId" = $1', [id]);
        return res.rowCount;
    }
    
}
module.exports = Models;
