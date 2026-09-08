
    const { pool } = require('../db/pgsqldb');
    const { getFilteredData, getFormatedValues, getFormatedValue } = require('../utils/helper');
class MaterialGroups {
    constructor(data){
        this.MaterialGroupId = data.MaterialGroupId;
this.GroupName = data.GroupName;
    }
    static async getAllMaterialGroups() {
        const listMaterialGroups = [];
        const res = await pool.query('SELECT * FROM "MaterialGroups";');
        res.rows.forEach((data) => {
            listMaterialGroups.push(new MaterialGroups(data));
        });
        return listMaterialGroups;
    }
    static async getMaterialGroupsById(id) {
        const res = await pool.query('SELECT * FROM "MaterialGroups" WHERE "MaterialGroupId" = $1', [id]);
        return new MaterialGroups(res.rows[0]);
    }    
    static async createMaterialGroups(data) {
        const filteredData = getFilteredData(data);
        const keys = Object.keys(filteredData);
        const values = getFormatedValues(filteredData);
        const insertQuery = `INSERT INTO "MaterialGroups"("${keys.join('","')}") VALUES (${values.join(',')})`;
        const res = await pool.query(insertQuery + ' RETURNING *;');
        return res.rows[0];
    }
    static async updateMaterialGroups(id, data) {
        const filteredData = getFilteredData(data);
        const setStatements = [];
        Object.entries(filteredData).forEach(([key, value]) => {
            setStatements.push(`${key} = ${getFormatedValue(value)}`);
        });
        const updateQuery = `UPDATE "MaterialGroups" SET ${setStatements.join(', ')} WHERE "MaterialGroupId" = $1;`;
        const res = await pool.query(updateQuery, [id]);
        return res.rows[0];
    }
    static async deleteMaterialGroups(id) {
        const res = await pool.query('DELETE FROM "MaterialGroups" WHERE "MaterialGroupId" = $1', [id]);
        return res.rowCount;
    }
    
}
module.exports = MaterialGroups;
