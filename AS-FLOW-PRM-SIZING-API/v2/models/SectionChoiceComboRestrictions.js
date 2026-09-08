
    const { pool } = require('../db/pgsqldb');
    const { getFilteredData, getFormatedValues, getFormatedValue } = require('../utils/helper');
class SectionChoiceComboRestrictions {
    constructor(data){
        this.SectionChoiceId1 = data.SectionChoiceId1;
this.SectionChoiceId2 = data.SectionChoiceId2;
    }
    static async getAllSectionChoiceComboRestrictions() {
        const listSectionChoiceComboRestrictions = [];
        const res = await pool.query('SELECT * FROM "SectionChoiceComboRestrictions";');
        res.rows.forEach((data) => {
            listSectionChoiceComboRestrictions.push(new SectionChoiceComboRestrictions(data));
        });
        return listSectionChoiceComboRestrictions;
    }
    static async getSectionChoiceComboRestrictionsById(id) {
        const res = await pool.query('SELECT * FROM "SectionChoiceComboRestrictions" WHERE "Id" = $1', [id]);
        return new SectionChoiceComboRestrictions(res.rows[0]);
    }    
    static async createSectionChoiceComboRestrictions(data) {
        const filteredData = getFilteredData(data);
        const keys = Object.keys(filteredData);
        const values = getFormatedValues(filteredData);
        const insertQuery = `INSERT INTO "SectionChoiceComboRestrictions"("${keys.join('","')}") VALUES (${values.join(',')})`;
        const res = await pool.query(insertQuery + ' RETURNING *;');
        return res.rows[0];
    }
    static async updateSectionChoiceComboRestrictions(id, data) {
        const filteredData = getFilteredData(data);
        const setStatements = [];
        Object.entries(filteredData).forEach(([key, value]) => {
            setStatements.push(`${key} = ${getFormatedValue(value)}`);
        });
        const updateQuery = `UPDATE "SectionChoiceComboRestrictions" SET ${setStatements.join(', ')} WHERE "Id" = $1;`;
        const res = await pool.query(updateQuery, [id]);
        return res.rows[0];
    }
    static async deleteSectionChoiceComboRestrictions(id) {
        const res = await pool.query('DELETE FROM "SectionChoiceComboRestrictions" WHERE "Id" = $1', [id]);
        return res.rowCount;
    }
    
}
module.exports = SectionChoiceComboRestrictions;
