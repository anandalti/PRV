
    const { pool } = require('../db/pgsqldb');
    const { getFilteredData, getFormatedValues, getFormatedValue } = require('../utils/helper');
class Sections {
    constructor(data){
        this.SectionId = data.SectionId;
this.DisplayName = data.DisplayName;
this.Description = data.Description;
this.SectionCode = data.SectionCode;
this.AllowMultiple = data.AllowMultiple;
this.DisplayOrder = data.DisplayOrder;
    }
    static async getAllSections() {
        const listSections = [];
        const res = await pool.query('SELECT * FROM "Sections";');
        res.rows.forEach((data) => {
            listSections.push(new Sections(data));
        });
        return listSections;
    }
    static async getSectionsById(id) {
        const res = await pool.query('SELECT * FROM "Sections" WHERE "SectionId" = $1', [id]);
        return new Sections(res.rows[0]);
    }    
    static async createSections(data) {
        const filteredData = getFilteredData(data);
        const keys = Object.keys(filteredData);
        const values = getFormatedValues(filteredData);
        const insertQuery = `INSERT INTO "Sections"("${keys.join('","')}") VALUES (${values.join(',')})`;
        const res = await pool.query(insertQuery + ' RETURNING *;');
        return res.rows[0];
    }
    static async updateSections(id, data) {
        const filteredData = getFilteredData(data);
        const setStatements = [];
        Object.entries(filteredData).forEach(([key, value]) => {
            setStatements.push(`${key} = ${getFormatedValue(value)}`);
        });
        const updateQuery = `UPDATE "Sections" SET ${setStatements.join(', ')} WHERE "SectionId" = $1;`;
        const res = await pool.query(updateQuery, [id]);
        return res.rows[0];
    }
    static async deleteSections(id) {
        const res = await pool.query('DELETE FROM "Sections" WHERE "SectionId" = $1', [id]);
        return res.rowCount;
    }
    
}
module.exports = Sections;
