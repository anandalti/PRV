
    const { pool } = require('../db/pgsqldb');
    const { getFilteredData, getFormatedValues, getFormatedValue } = require('../utils/helper');
class EstablishedSectionChoiceExpressions {
    constructor(data){
        this.EstablishedSectionChoiceExpressionId = data.EstablishedSectionChoiceExpressionId;
this.SectionChoiceId = data.SectionChoiceId;
this.Expression = data.Expression;
    }
    static async getAllEstablishedSectionChoiceExpressions() {
        const listEstablishedSectionChoiceExpressions = [];
        const res = await pool.query('SELECT * FROM "EstablishedSectionChoiceExpressions";');
        res.rows.forEach((data) => {
            listEstablishedSectionChoiceExpressions.push(new EstablishedSectionChoiceExpressions(data));
        });
        return listEstablishedSectionChoiceExpressions;
    }
    static async getEstablishedSectionChoiceExpressionsById(id) {
        const res = await pool.query('SELECT * FROM "EstablishedSectionChoiceExpressions" WHERE "Id" = $1', [id]);
        return new EstablishedSectionChoiceExpressions(res.rows[0]);
    }    
    static async createEstablishedSectionChoiceExpressions(data) {
        const filteredData = getFilteredData(data);
        const keys = Object.keys(filteredData);
        const values = getFormatedValues(filteredData);
        const insertQuery = `INSERT INTO "EstablishedSectionChoiceExpressions"("${keys.join('","')}") VALUES (${values.join(',')})`;
        const res = await pool.query(insertQuery + ' RETURNING *;');
        return res.rows[0];
    }
    static async updateEstablishedSectionChoiceExpressions(id, data) {
        const filteredData = getFilteredData(data);
        const setStatements = [];
        Object.entries(filteredData).forEach(([key, value]) => {
            setStatements.push(`${key} = ${getFormatedValue(value)}`);
        });
        const updateQuery = `UPDATE "EstablishedSectionChoiceExpressions" SET ${setStatements.join(', ')} WHERE "Id" = $1;`;
        const res = await pool.query(updateQuery, [id]);
        return res.rows[0];
    }
    static async deleteEstablishedSectionChoiceExpressions(id) {
        const res = await pool.query('DELETE FROM "EstablishedSectionChoiceExpressions" WHERE "Id" = $1', [id]);
        return res.rowCount;
    }
    
}
module.exports = EstablishedSectionChoiceExpressions;
