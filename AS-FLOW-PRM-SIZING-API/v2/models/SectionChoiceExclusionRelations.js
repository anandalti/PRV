
    const { pool } = require('../db/pgsqldb');
    const { getFilteredData, getFormatedValues, getFormatedValue } = require('../utils/helper');
class SectionChoiceExclusionRelations {
    constructor(data){
        this.SectionChoiceExclusionRelationId = data.SectionChoiceExclusionRelationId;
this.ExclusionSetId = data.ExclusionSetId;
this.SectionChoiceComboLimitId = data.SectionChoiceComboLimitId;
this.SectionChoiceId = data.SectionChoiceId;
    }
    static async getAllSectionChoiceExclusionRelations() {
        const listSectionChoiceExclusionRelations = [];
        const res = await pool.query('SELECT * FROM "SectionChoiceExclusionRelations";');
        res.rows.forEach((data) => {
            listSectionChoiceExclusionRelations.push(new SectionChoiceExclusionRelations(data));
        });
        return listSectionChoiceExclusionRelations;
    }
    static async getSectionChoiceExclusionRelationsById(id) {
        const res = await pool.query('SELECT * FROM "SectionChoiceExclusionRelations" WHERE "Id" = $1', [id]);
        return new SectionChoiceExclusionRelations(res.rows[0]);
    }    
    static async createSectionChoiceExclusionRelations(data) {
        const filteredData = getFilteredData(data);
        const keys = Object.keys(filteredData);
        const values = getFormatedValues(filteredData);
        const insertQuery = `INSERT INTO "SectionChoiceExclusionRelations"("${keys.join('","')}") VALUES (${values.join(',')})`;
        const res = await pool.query(insertQuery + ' RETURNING *;');
        return res.rows[0];
    }
    static async updateSectionChoiceExclusionRelations(id, data) {
        const filteredData = getFilteredData(data);
        const setStatements = [];
        Object.entries(filteredData).forEach(([key, value]) => {
            setStatements.push(`${key} = ${getFormatedValue(value)}`);
        });
        const updateQuery = `UPDATE "SectionChoiceExclusionRelations" SET ${setStatements.join(', ')} WHERE "Id" = $1;`;
        const res = await pool.query(updateQuery, [id]);
        return res.rows[0];
    }
    static async deleteSectionChoiceExclusionRelations(id) {
        const res = await pool.query('DELETE FROM "SectionChoiceExclusionRelations" WHERE "Id" = $1', [id]);
        return res.rowCount;
    }
    
}
module.exports = SectionChoiceExclusionRelations;
