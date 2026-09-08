
    const { pool } = require('../db/pgsqldb');
    const { getFilteredData, getFormatedValues, getFormatedValue } = require('../utils/helper');
class SectionChoices {
    constructor(data){
        this.SectionChoiceId = data.SectionChoiceId;
this.ConfigurationSectionId = data.ConfigurationSectionId;
this.Order = data.Order;
this.CatalogCode = data.CatalogCode;
this.ERPCode = data.ERPCode;
this.Description = data.Description;
this.Comment = data.Comment;
this.Expression = data.Expression;
this.InletASMEMaterialGroup = data.InletASMEMaterialGroup;
this.OutletASMEMaterialGroup = data.OutletASMEMaterialGroup;
this.InletFlangeClass = data.InletFlangeClass;
this.OutletFlangeClass = data.OutletFlangeClass;
    }
    static async getAllSectionChoices() {
        const listSectionChoices = [];
        const res = await pool.query('SELECT * FROM "SectionChoices";');
        res.rows.forEach((data) => {
            listSectionChoices.push(new SectionChoices(data));
        });
        return listSectionChoices;
    }
    static async getSectionChoicesById(id) {
        const res = await pool.query('SELECT * FROM "SectionChoices" WHERE "Id" = $1', [id]);
        return new SectionChoices(res.rows[0]);
    }    
    static async createSectionChoices(data) {
        const filteredData = getFilteredData(data);
        const keys = Object.keys(filteredData);
        const values = getFormatedValues(filteredData);
        const insertQuery = `INSERT INTO "SectionChoices"("${keys.join('","')}") VALUES (${values.join(',')})`;
        const res = await pool.query(insertQuery + ' RETURNING *;');
        return res.rows[0];
    }
    static async updateSectionChoices(id, data) {
        const filteredData = getFilteredData(data);
        const setStatements = [];
        Object.entries(filteredData).forEach(([key, value]) => {
            setStatements.push(`${key} = ${getFormatedValue(value)}`);
        });
        const updateQuery = `UPDATE "SectionChoices" SET ${setStatements.join(', ')} WHERE "Id" = $1;`;
        const res = await pool.query(updateQuery, [id]);
        return res.rows[0];
    }
    static async deleteSectionChoices(id) {
        const res = await pool.query('DELETE FROM "SectionChoices" WHERE "Id" = $1', [id]);
        return res.rowCount;
    }
    
}
module.exports = SectionChoices;
