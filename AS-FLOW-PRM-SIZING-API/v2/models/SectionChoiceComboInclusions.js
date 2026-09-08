
    const { pool } = require('../db/pgsqldb');
    const { getFilteredData, getFormatedValues, getFormatedValue } = require('../utils/helper');
class SectionChoiceComboInclusions {
    constructor(data){
        this.SectionChoiceId1 = data.SectionChoiceId1;
this.SectionChoiceId2 = data.SectionChoiceId2;
    }
    static async getAllSectionChoiceComboInclusions() {
        const listSectionChoiceComboInclusions = [];
        const res = await pool.query('SELECT * FROM "SectionChoiceComboInclusions";');
        res.rows.forEach((data) => {
            listSectionChoiceComboInclusions.push(new SectionChoiceComboInclusions(data));
        });
        return listSectionChoiceComboInclusions;
    }
    static async getSectionChoiceComboInclusionsById(id) {
        const res = await pool.query('SELECT * FROM "SectionChoiceComboInclusions" WHERE "Id" = $1', [id]);
        return new SectionChoiceComboInclusions(res.rows[0]);
    }    
    static async createSectionChoiceComboInclusions(data) {
        const filteredData = getFilteredData(data);
        const keys = Object.keys(filteredData);
        const values = getFormatedValues(filteredData);
        const insertQuery = `INSERT INTO "SectionChoiceComboInclusions"("${keys.join('","')}") VALUES (${values.join(',')})`;
        const res = await pool.query(insertQuery + ' RETURNING *;');
        return res.rows[0];
    }
    static async updateSectionChoiceComboInclusions(id, data) {
        const filteredData = getFilteredData(data);
        const setStatements = [];
        Object.entries(filteredData).forEach(([key, value]) => {
            setStatements.push(`${key} = ${getFormatedValue(value)}`);
        });
        const updateQuery = `UPDATE "SectionChoiceComboInclusions" SET ${setStatements.join(', ')} WHERE "Id" = $1;`;
        const res = await pool.query(updateQuery, [id]);
        return res.rows[0];
    }
    static async deleteSectionChoiceComboInclusions(id) {
        const res = await pool.query('DELETE FROM "SectionChoiceComboInclusions" WHERE "Id" = $1', [id]);
        return res.rowCount;
    }
    
}
module.exports = SectionChoiceComboInclusions;
