const { pool } = require('../../db/pgsqldb');
const { getFilteredData, getFormatedValues, getFormatedValue } = require('../../utils/helper');

class FieldVisible {
    constructor(data) {
        this.Id = data.Id;
        this.FieldId = data.FieldId;
        this.VisibleId = data.VisibleId;
        this.ExpresisoncheckFlag = data.ExpresisoncheckFlag;
        this.DefaultValue = data.DefaultValue;
    }

    static async getAllFieldVisibleByFieldIds(fieldIds) {
        const query='SELECT * FROM "FieldVisible" WHERE "FieldId" = ANY($1::int[]);';
        const res = await pool.query(query, [fieldIds]);
        return res.rows.map(row => new FieldVisible(row));
    }

    static async getAllFieldVisible() {
        const query='SELECT * FROM "FieldVisible";';
        const res = await pool.query(query);
        return res.rows.map(row => new FieldVisible(row));
    }

    static async getAllFieldVisibleByFieldId(fieldId) {
        const res = await pool.query('SELECT * FROM "FieldVisible" WHERE "FieldId" = $1;', [fieldId]);
        return res.rows.map(row => new FieldVisible(row));
    }

    static async getFieldVisibleById(id) {
        const res = await pool.query('SELECT * FROM "FieldVisible" WHERE "Id" = $1', [id]);
        if (res.rows.length === 0) return null;
        return new FieldVisible(res.rows[0]);
    }

    static async createFieldVisible(data) {
        const { FieldId, ExpresisoncheckFlag, DefaultValue } = data;
        const values = [];
        const params = [];
        // console.log('In Visible fieldIds >> ', FieldId);
        FieldId?.forEach((field, i) => {
            values.push(`($${i*3 + 1}, $${i*3 + 2}, $${i*3 + 3})`);
            params.push(field, ExpresisoncheckFlag[field], DefaultValue[i]);
        })
        const query = `
            INSERT INTO "FieldVisible" ("FieldId", "ExpresisoncheckFlag", "DefaultValue")
            VALUES ${values.join(', ')} RETURNING *;
        `;
        // console.log('In Visible values >>>>>> >> ', query,params);
        const res = await pool.query(query, params);
        return res.rows.map(row => new FieldVisible(row));
    }

    static async updateFieldVisible(id, data) {
        const filteredData = getFilteredData(data);
        const setStatements = [];
        Object.entries(filteredData).forEach(([key, value]) => {
            setStatements.push(`"${key}" = ${getFormatedValue(value)}`);
        });
        const updateQuery = `UPDATE "FieldVisible" SET ${setStatements.join(', ')} WHERE "Id" = $1 RETURNING *;`;
        const res = await pool.query(updateQuery, [id]);
        if (res.rows.length === 0) return null;
        return new FieldVisible(res.rows[0]);
    }

    static async deleteAllByFieldId(fieldId) {
        await pool.query('DELETE FROM "FieldVisible" WHERE "FieldId" = $1;', [fieldId]);
    }
}

module.exports = FieldVisible;
