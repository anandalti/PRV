
    const { pool } = require('../db/pgsqldb');
    const { getFilteredData, getFormatedValues, getFormatedValue } = require('../utils/helper');
class SectionChoiceInclusionRelations {
    constructor(data){
        this.SectionChoiceInclusionRelationId = data.SectionChoiceInclusionRelationId;
this.InclusionSetId = data.InclusionSetId;
this.SectionChoiceComboLimitId = data.SectionChoiceComboLimitId;
this.SectionChoiceId = data.SectionChoiceId;
    }
    static async getAllSectionChoiceInclusionRelations() {
        const listSectionChoiceInclusionRelations = [];
        const res = await pool.query('SELECT * FROM "SectionChoiceInclusionRelations";');
        res.rows.forEach((data) => {
            listSectionChoiceInclusionRelations.push(new SectionChoiceInclusionRelations(data));
        });
        return listSectionChoiceInclusionRelations;
    }
    static async getSectionChoiceInclusionRelationsById(id) {
        const res = await pool.query('SELECT * FROM "SectionChoiceInclusionRelations" WHERE "Id" = $1', [id]);
        return new SectionChoiceInclusionRelations(res.rows[0]);
    }    
    static async createSectionChoiceInclusionRelations(data) {
        const filteredData = getFilteredData(data);
        const keys = Object.keys(filteredData);
        const values = getFormatedValues(filteredData);
        const insertQuery = `INSERT INTO "SectionChoiceInclusionRelations"("${keys.join('","')}") VALUES (${values.join(',')})`;
        const res = await pool.query(insertQuery + ' RETURNING *;');
        return res.rows[0];
    }
    static async updateSectionChoiceInclusionRelations(id, data) {
        const filteredData = getFilteredData(data);
        const setStatements = [];
        Object.entries(filteredData).forEach(([key, value]) => {
            setStatements.push(`${key} = ${getFormatedValue(value)}`);
        });
        const updateQuery = `UPDATE "SectionChoiceInclusionRelations" SET ${setStatements.join(', ')} WHERE "Id" = $1;`;
        const res = await pool.query(updateQuery, [id]);
        return res.rows[0];
    }
    static async deleteSectionChoiceInclusionRelations(id) {
        const res = await pool.query('DELETE FROM "SectionChoiceInclusionRelations" WHERE "Id" = $1', [id]);
        return res.rowCount;
    }
    
}
module.exports = SectionChoiceInclusionRelations;
