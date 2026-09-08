const { pool } = require('../../db/pgsqldb');
const { getFilteredData, getFormatedValues, getFormatedValue } = require('../../utils/helper');

class FieldOptions {
    constructor(data) {
        this.FieldId = data.FieldId;
        this.FieldOptionId = data.FieldOptionId;
        this.Label = data.Label;
        this.Value = data.Value;
    }

    static async getAllFieldOptions() {
        const query='SELECT * FROM "FieldOptions";';
        const res = await pool.query(query);
        return res.rows.map(row => new FieldOptions(row));
    }  

    static async getFieldOptionsByFieldIds(fieldIds) {
        const query='SELECT * FROM "FieldOptions" WHERE "FieldId" = ANY($1::int[]);';
        const res = await pool.query(query, [fieldIds]);
        return res.rows.map(row => new FieldOptions(row));
    }   
    
    static async getAllFieldOptionsByFieldId(fieldId) {
        const list = [];
        const res = await pool.query('SELECT * FROM "FieldOptions" WHERE "FieldId" = $1;', [fieldId]);
        res.rows.forEach((data) => {
            list.push(new FieldOptions(data));
        });
        return list;
    }

    static async getFieldOptionById(fieldOptionId) {
        const res = await pool.query('SELECT * FROM "FieldOptions" WHERE "FieldOptionId" = $1', [fieldOptionId]);
        if (res.rows.length === 0) return null;
        return new FieldOptions(res.rows[0]);
    }

    static async createFieldOption(data) {
        const { FieldId, Label, Value } = data;
        const insertQuery = `INSERT INTO "FieldOptions" ("FieldId", "Label", "Value") VALUES ($1, $2, $3) RETURNING *;`;
        const res = await pool.query(insertQuery, [FieldId, Label, Value]);
        return new FieldOptions(res.rows[0]);
    }

    static async updateFieldOption(fieldOptionId, data) {
        const filteredData = getFilteredData(data);
        const setStatements = [];
        Object.entries(filteredData).forEach(([key, value]) => {
            setStatements.push(`"${key}" = ${getFormatedValue(value)}`);
        });
        const updateQuery = `UPDATE "FieldOptions" SET ${setStatements.join(', ')} WHERE "FieldOptionId" = $1 RETURNING *;`;
        const res = await pool.query(updateQuery, [fieldOptionId]);
        if (res.rows.length === 0) return null;
        return new FieldOptions(res.rows[0]);
    }

    static async deleteAllByFieldId(fieldId) {
        await pool.query('DELETE FROM "FieldOptions" WHERE "FieldId" = $1;', [fieldId]);
    }
}

module.exports = FieldOptions;
