const { pool } = require('../../db/pgsqldb');
const { getFilteredData, getFormatedValues, getFormatedValue } = require('../../utils/helper');

class FieldMandatory {
    constructor(data) {
        this.Id = data.Id;
        this.FieldId = data.FieldId;
        this.MandatoryId = data.MandatoryId;
        this.ExpresisoncheckFlag = data.ExpresisoncheckFlag;
        this.DefaultValue = data.DefaultValue;
    }

    static async getAllFieldMandatoryByFieldIds(fieldIds) {
        const query='SELECT * FROM "FieldMandatory" WHERE "FieldId" = ANY($1::int[]);';
        const res = await pool.query(query, [fieldIds]);
        return res.rows.map(row => new FieldMandatory(row));
    }

    static async getAllFieldMandatory() {
        const query='SELECT * FROM "FieldMandatory";';
        const res = await pool.query(query);
        return res.rows.map(row => new FieldMandatory(row));
    }

    static async getAllFieldMandatoryByFieldId(fieldId) {
        const list = [];
        const res = await pool.query('SELECT * FROM "FieldMandatory" WHERE "FieldId" = $1;', [fieldId]);
        res.rows.forEach((data) => {
            list.push(new FieldMandatory(data));
        });
        return list;
    }

    static async getFieldMandatoryById(id) {
        const res = await pool.query('SELECT * FROM "FieldMandatory" WHERE "Id" = $1', [id]);
        if (res.rows.length === 0) return null;
        return new FieldMandatory(res.rows[0]);
    }

    static async createFieldMandatory(data) {
        const { FieldId, ExpresisoncheckFlag, DefaultValue } = data;
        const values = [];
        const params = [];
        // console.log('In Mandatory fieldIds >> ', FieldId);
        FieldId?.forEach((field, i) => {
            values.push(`($${i*3 + 1}, $${i*3 + 2}, $${i*3 + 3})`);
            params.push(field, ExpresisoncheckFlag[field], DefaultValue[i]);
        })
        const query = `
            INSERT INTO "FieldMandatory" ("FieldId", "ExpresisoncheckFlag", "DefaultValue")
            VALUES ${values.join(', ')} RETURNING *;
        `;
        const res = await pool.query(query, params);
        return res.rows.map(row => new FieldMandatory(row));
    }

    static async updateFieldMandatory(id, data) {
        const filteredData = getFilteredData(data);
        const setStatements = [];
        Object.entries(filteredData).forEach(([key, value]) => {
            setStatements.push(`"${key}" = ${getFormatedValue(value)}`);
        });
        const updateQuery = `UPDATE "FieldMandatory" SET ${setStatements.join(', ')} WHERE "Id" = $1 RETURNING *;`;
        const res = await pool.query(updateQuery, [id]);
        if (res.rows.length === 0) return null;
        return new FieldMandatory(res.rows[0]);
    }

    static async deleteAllByFieldId(fieldId) {
        await pool.query('DELETE FROM "FieldMandatory" WHERE "FieldId" = $1;', [fieldId]);
    }
}

module.exports = FieldMandatory;
