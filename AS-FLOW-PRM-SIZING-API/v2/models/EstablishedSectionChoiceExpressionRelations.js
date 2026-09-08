
    const { pool } = require('../db/pgsqldb');
    const { getFilteredData, getFormatedValues, getFormatedValue } = require('../utils/helper');
class EstablishedSectionChoiceExpressionRelations {
    constructor(data){
        this.EstablishedSectionChoiceExpressionRelationId = data.EstablishedSectionChoiceExpressionRelationId;
this.ConfigurationSectionId = data.ConfigurationSectionId;
this.SectionChoiceId = data.SectionChoiceId;
this.EstablishedSectionChoiceExpressionId = data.EstablishedSectionChoiceExpressionId;
    }
    static async getAllEstablishedSectionChoiceExpressionRelations() {
        const listEstablishedSectionChoiceExpressionRelations = [];
        const res = await pool.query('SELECT * FROM "EstablishedSectionChoiceExpressionRelations";');
        res.rows.forEach((data) => {
            listEstablishedSectionChoiceExpressionRelations.push(new EstablishedSectionChoiceExpressionRelations(data));
        });
        return listEstablishedSectionChoiceExpressionRelations;
    }
    static async getEstablishedSectionChoiceExpressionRelationsById(id) {
        const res = await pool.query('SELECT * FROM "EstablishedSectionChoiceExpressionRelations" WHERE "Id" = $1', [id]);
        return new EstablishedSectionChoiceExpressionRelations(res.rows[0]);
    }    
    static async createEstablishedSectionChoiceExpressionRelations(data) {
        const filteredData = getFilteredData(data);
        const keys = Object.keys(filteredData);
        const values = getFormatedValues(filteredData);
        const insertQuery = `INSERT INTO "EstablishedSectionChoiceExpressionRelations"("${keys.join('","')}") VALUES (${values.join(',')})`;
        const res = await pool.query(insertQuery + ' RETURNING *;');
        return res.rows[0];
    }
    static async updateEstablishedSectionChoiceExpressionRelations(id, data) {
        const filteredData = getFilteredData(data);
        const setStatements = [];
        Object.entries(filteredData).forEach(([key, value]) => {
            setStatements.push(`${key} = ${getFormatedValue(value)}`);
        });
        const updateQuery = `UPDATE "EstablishedSectionChoiceExpressionRelations" SET ${setStatements.join(', ')} WHERE "Id" = $1;`;
        const res = await pool.query(updateQuery, [id]);
        return res.rows[0];
    }
    static async deleteEstablishedSectionChoiceExpressionRelations(id) {
        const res = await pool.query('DELETE FROM "EstablishedSectionChoiceExpressionRelations" WHERE "Id" = $1', [id]);
        return res.rowCount;
    }
    
}
module.exports = EstablishedSectionChoiceExpressionRelations;
