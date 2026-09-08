
    const { pool } = require('../db/pgsqldb');
    const { getFilteredData, getFormatedValues, getFormatedValue } = require('../utils/helper');
class SectionChoiceComboLimitRelations {
    constructor(data){
        this.SectionChoiceComboLimitRelationId = data.SectionChoiceComboLimitRelationId;
this.SectionChoiceComboLimitId = data.SectionChoiceComboLimitId;
this.SectionChoiceId = data.SectionChoiceId;
    }
    static async getAllSectionChoiceComboLimitRelations() {
        const listSectionChoiceComboLimitRelations = [];
        const res = await pool.query('SELECT * FROM "SectionChoiceComboLimitRelations";');
        res.rows.forEach((data) => {
            listSectionChoiceComboLimitRelations.push(new SectionChoiceComboLimitRelations(data));
        });
        return listSectionChoiceComboLimitRelations;
    }
    static async getSectionChoiceComboLimitRelationsById(id) {
        const res = await pool.query('SELECT * FROM "SectionChoiceComboLimitRelations" WHERE "Id" = $1', [id]);
        return new SectionChoiceComboLimitRelations(res.rows[0]);
    }    
    static async createSectionChoiceComboLimitRelations(data) {
        const filteredData = getFilteredData(data);
        const keys = Object.keys(filteredData);
        const values = getFormatedValues(filteredData);
        const insertQuery = `INSERT INTO "SectionChoiceComboLimitRelations"("${keys.join('","')}") VALUES (${values.join(',')})`;
        const res = await pool.query(insertQuery + ' RETURNING *;');
        return res.rows[0];
    }
    static async updateSectionChoiceComboLimitRelations(id, data) {
        const filteredData = getFilteredData(data);
        const setStatements = [];
        Object.entries(filteredData).forEach(([key, value]) => {
            setStatements.push(`${key} = ${getFormatedValue(value)}`);
        });
        const updateQuery = `UPDATE "SectionChoiceComboLimitRelations" SET ${setStatements.join(', ')} WHERE "Id" = $1;`;
        const res = await pool.query(updateQuery, [id]);
        return res.rows[0];
    }
    static async deleteSectionChoiceComboLimitRelations(id) {
        const res = await pool.query('DELETE FROM "SectionChoiceComboLimitRelations" WHERE "Id" = $1', [id]);
        return res.rowCount;
    }
    
}
module.exports = SectionChoiceComboLimitRelations;
