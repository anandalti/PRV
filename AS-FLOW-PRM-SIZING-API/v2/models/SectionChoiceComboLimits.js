
    const { pool } = require('../db/pgsqldb');
    const { getFilteredData, getFormatedValues, getFormatedValue } = require('../utils/helper');
class SectionChoiceComboLimits {
    constructor(data){
        this.SectionChoiceComboLimitId = data.SectionChoiceComboLimitId;
this.Expression = data.Expression;
    }
    static async getAllSectionChoiceComboLimits() {
        const listSectionChoiceComboLimits = [];
        const res = await pool.query('SELECT * FROM "SectionChoiceComboLimits";');
        res.rows.forEach((data) => {
            listSectionChoiceComboLimits.push(new SectionChoiceComboLimits(data));
        });
        return listSectionChoiceComboLimits;
    }
    static async getSectionChoiceComboLimitsById(id) {
        const res = await pool.query('SELECT * FROM "SectionChoiceComboLimits" WHERE "SectionChoiceComboLimitId" = $1', [id]);
        return new SectionChoiceComboLimits(res.rows[0]);
    }    
    static async createSectionChoiceComboLimits(data) {
        const filteredData = getFilteredData(data);
        const keys = Object.keys(filteredData);
        const values = getFormatedValues(filteredData);
        const insertQuery = `INSERT INTO "SectionChoiceComboLimits"("${keys.join('","')}") VALUES (${values.join(',')})`;
        const res = await pool.query(insertQuery + ' RETURNING *;');
        return res.rows[0];
    }
    static async updateSectionChoiceComboLimits(id, data) {
        const filteredData = getFilteredData(data);
        const setStatements = [];
        Object.entries(filteredData).forEach(([key, value]) => {
            setStatements.push(`${key} = ${getFormatedValue(value)}`);
        });
        const updateQuery = `UPDATE "SectionChoiceComboLimits" SET ${setStatements.join(', ')} WHERE "SectionChoiceComboLimitId" = $1;`;
        const res = await pool.query(updateQuery, [id]);
        return res.rows[0];
    }
    static async deleteSectionChoiceComboLimits(id) {
        const res = await pool.query('DELETE FROM "SectionChoiceComboLimits" WHERE "SectionChoiceComboLimitId" = $1', [id]);
        return res.rowCount;
    }
    
}
module.exports = SectionChoiceComboLimits;
