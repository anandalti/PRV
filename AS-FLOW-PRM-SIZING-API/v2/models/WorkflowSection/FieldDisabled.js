const { pool } = require('../../db/pgsqldb');
const { getFilteredData, getFormatedValues, getFormatedValue } = require('../../utils/helper');

class FieldDisabled {
    constructor(data) {
        this.Id = data.Id;
        this.FieldId = data.FieldId;
        this.DisabledId = data.DisabledId;
        this.ExpresisoncheckFlag = data.ExpresisoncheckFlag;
        this.DefaultValue = data.DefaultValue;
    }

    static async getAllFieldDisabledByFieldIds(fieldIds) {
        const res = await pool.query('SELECT * FROM "FieldDisabled" WHERE "FieldId" = ANY($1::int[]);', [fieldIds]);
        return res.rows.map(row => new FieldDisabled(row));
    }


    static async getAllFieldDisabledByFieldId(fieldId) {
        const res = await pool.query('SELECT * FROM "FieldDisabled" WHERE "FieldId" = $1;', [fieldId]);
        return res.rows.map(row => new FieldDisabled(row));
    }

    static async getAllFieldsDisabled() {
        try {
            const res = await pool.query('SELECT * FROM "FieldDisabled";');
            return res.rows.map(row => new FieldDisabled(row));
        } catch (error) {
            console.error('Error fetching all field disabled:', error);
            throw error;
        }
        
    }

    static async getFieldDisabledById(id) {
        const res = await pool.query('SELECT * FROM "FieldDisabled" WHERE "Id" = $1', [id]);
        if (res.rows.length === 0) return null;
        return new FieldDisabled(res.rows[0]);
    }

    static async createFieldDisabled(data) {
        const { FieldId, ExpresisoncheckFlag, DefaultValue } = data;
        const values = [];
        const params = [];
        // console.log('In Disabled fieldIds >> ', FieldId);
        FieldId?.forEach((field, i) => {
            values.push(`($${i*3 + 1}, $${i*3 + 2}, $${i*3 + 3})`);
            params.push(field, ExpresisoncheckFlag[field], DefaultValue[i]);
        })
        const query = `
            INSERT INTO "FieldDisabled" ("FieldId", "ExpresisoncheckFlag", "DefaultValue")
            VALUES ${values.join(', ')} RETURNING *;
        `;
        // console.log('In Disabled values >>>>>> >> ', query,params);
        const res = await pool.query(query, params);
        return res.rows.map(row => new FieldDisabled(row));
    }

    static async updateFieldDisabled(id, data) {
        const filteredData = getFilteredData(data);
        const setStatements = [];
        Object.entries(filteredData).forEach(([key, value]) => {
            setStatements.push(`"${key}" = ${getFormatedValue(value)}`);
        });
        const updateQuery = `UPDATE "FieldDisabled" SET ${setStatements.join(', ')} WHERE "Id" = $1 RETURNING *;`;
        const res = await pool.query(updateQuery, [id]);
        if (res.rows.length === 0) return null;
        return new FieldDisabled(res.rows[0]);
    }

    static async deleteAllByFieldId(fieldId) {
        await pool.query('DELETE FROM "FieldDisabled" WHERE "FieldId" = $1;', [fieldId]);
    }
}

module.exports = FieldDisabled;
