
    const { pool } = require('../db/pgsqldb');
    const { getFilteredData, getFormatedValues, getFormatedValue } = require('../utils/helper');
class SpecialRequirements {
    constructor(data){
        this.SpecialReqId = data.SpecialReqId;
this.SectionId = data.SectionId;
this.PRVDescription = data.PRVDescription;
this.SAPDescription = data.SAPDescription;
this.ERPCode = data.ERPCode;
this.DisplayOrder = data.DisplayOrder;
this.NeedsQty = data.NeedsQty;
this.NeedsComments = data.NeedsComments;
    }
    static async getAllSpecialRequirements() {
        const listSpecialRequirements = [];
        const res = await pool.query('SELECT * FROM "SpecialRequirements";');
        res.rows.forEach((data) => {
            listSpecialRequirements.push(new SpecialRequirements(data));
        });
        return listSpecialRequirements;
    }
    static async getSpecialRequirementsById(id) {
        const res = await pool.query('SELECT * FROM "SpecialRequirements" WHERE "SpecialReqId" = $1', [id]);
        return new SpecialRequirements(res.rows[0]);
    }    
    static async createSpecialRequirements(data) {
        const filteredData = getFilteredData(data);
        const keys = Object.keys(filteredData);
        const values = getFormatedValues(filteredData);
        const insertQuery = `INSERT INTO "SpecialRequirements"("${keys.join('","')}") VALUES (${values.join(',')})`;
        const res = await pool.query(insertQuery + ' RETURNING *;');
        return res.rows[0];
    }
    static async updateSpecialRequirements(id, data) {
        const filteredData = getFilteredData(data);
        const setStatements = [];
        Object.entries(filteredData).forEach(([key, value]) => {
            setStatements.push(`${key} = ${getFormatedValue(value)}`);
        });
        const updateQuery = `UPDATE "SpecialRequirements" SET ${setStatements.join(', ')} WHERE "SpecialReqId" = $1;`;
        const res = await pool.query(updateQuery, [id]);
        return res.rows[0];
    }
    static async deleteSpecialRequirements(id) {
        const res = await pool.query('DELETE FROM "SpecialRequirements" WHERE "SpecialReqId" = $1', [id]);
        return res.rowCount;
    }
    
}
module.exports = SpecialRequirements;
