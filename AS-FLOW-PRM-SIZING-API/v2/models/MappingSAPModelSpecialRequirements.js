
    const { pool } = require('../db/pgsqldb');
    const { getFilteredData, getFormatedValues, getFormatedValue } = require('../utils/helper');
class MappingSAPModelSpecialRequirements {
    constructor(data){
        this.ModelSpecialReqId = data.ModelSpecialReqId;
this.SpecialReqId = data.SpecialReqId;
this.PRV_ModelId = data.PRV_ModelId;
this.SAP_ModelId = data.SAP_ModelId;
this.IsAutoSelect = data.IsAutoSelect;
    }
    static async getAllMappingSAPModelSpecialRequirements() {
        const listMappingSAPModelSpecialRequirements = [];
        const res = await pool.query('SELECT * FROM "MappingSAPModelSpecialRequirements";');
        res.rows.forEach((data) => {
            listMappingSAPModelSpecialRequirements.push(new MappingSAPModelSpecialRequirements(data));
        });
        return listMappingSAPModelSpecialRequirements;
    }
    static async getMappingSAPModelSpecialRequirementsById(id) {
        const res = await pool.query('SELECT * FROM "MappingSAPModelSpecialRequirements" WHERE "ModelSpecialReqId" = $1', [id]);
        return new MappingSAPModelSpecialRequirements(res.rows[0]);
    }    
    static async createMappingSAPModelSpecialRequirements(data) {
        const filteredData = getFilteredData(data);
        const keys = Object.keys(filteredData);
        const values = getFormatedValues(filteredData);
        const insertQuery = `INSERT INTO "MappingSAPModelSpecialRequirements"("${keys.join('","')}") VALUES (${values.join(',')})`;
        const res = await pool.query(insertQuery + ' RETURNING *;');
        return res.rows[0];
    }
    static async updateMappingSAPModelSpecialRequirements(id, data) {
        const filteredData = getFilteredData(data);
        const setStatements = [];
        Object.entries(filteredData).forEach(([key, value]) => {
            setStatements.push(`${key} = ${getFormatedValue(value)}`);
        });
        const updateQuery = `UPDATE "MappingSAPModelSpecialRequirements" SET ${setStatements.join(', ')} WHERE "ModelSpecialReqId" = $1;`;
        const res = await pool.query(updateQuery, [id]);
        return res.rows[0];
    }
    static async deleteMappingSAPModelSpecialRequirements(id) {
        const res = await pool.query('DELETE FROM "MappingSAPModelSpecialRequirements" WHERE "ModelSpecialReqId" = $1', [id]);
        return res.rowCount;
    }
    
}
module.exports = MappingSAPModelSpecialRequirements;
