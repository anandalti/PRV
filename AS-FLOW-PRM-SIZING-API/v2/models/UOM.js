
const { pool } = require('../db/pgsqldb');
const { getFilteredData, getFormatedValues, getFormatedValue } = require('../utils/helper');
class UOM {
    constructor(data) {
        this.UpdatedAt = data.UpdatedAt;
        this.UnitOffset = data.UnitOffset;
        this.DisplayPrecision = data.DisplayPrecision;
        this.IsDefault = data.IsDefault;
        this.CreatedAt = data.CreatedAt;
        this.Id = data.Id;
        this.UnitFactor = data.UnitFactor;
        this.DimensionName = data.DimensionName;
        this.UnitKey = data.UnitKey;
        this.UnitName = data.UnitName;
        this.UnitLongName = data.UnitLongName;
        this.SystemUnit = data.SystemUnit;
    }
    static async getAllUOM() {
        const listUOM = [];
        const res = await pool.query('SELECT * FROM "UOM";');
        res.rows.forEach((data) => {
            listUOM.push(new UOM(data));
        });
        return listUOM;
    }
    static async getAllDefaultUOM() {
        const listUOM = [];
        const res = await pool.query('SELECT * FROM "UOM" WHERE "IsDefault" is true;');
        res.rows.forEach((data) => {
            listUOM.push(new UOM(data));
        });
        return listUOM;
    }
    static async getUOMById(id) {
        const res = await pool.query('SELECT * FROM "UOM" WHERE "Id" = $1', [id]);
        return new UOM(res.rows[0]);
    }
    static async createUOM(data) {
        const filteredData = getFilteredData(data);
        const keys = Object.keys(filteredData);
        const values = getFormatedValues(filteredData);
        const insertQuery = `INSERT INTO "UOM"("${keys.join('","')}") VALUES (${values.join(',')})`;
        const res = await pool.query(insertQuery + ' RETURNING *;');
        return res.rows[0];
    }
    static async updateUOM(id, data) {
        const filteredData = getFilteredData(data);
        const setStatements = [];
        Object.entries(filteredData).forEach(([key, value]) => {
            setStatements.push(`${key} = ${getFormatedValue(value)}`);
        });
        const updateQuery = `UPDATE "UOM" SET ${setStatements.join(', ')} WHERE "Id" = $1;`;
        const res = await pool.query(updateQuery, [id]);
        return res.rows[0];
    }
    static async deleteUOM(id) {
        const res = await pool.query('DELETE FROM "UOM" WHERE "Id" = $1', [id]);
        return res.rowCount;
    }

}
module.exports = UOM;
