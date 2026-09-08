const { pool } = require('../../db/pgsqldb');
const { getFilteredData, getFormatedValues, getFormatedValue } = require('../../utils/helper');

class FieldDefaultValue {
    constructor(data) {
        this.Id = data.Id;
        this.FieldId = data.FieldId;
        this.DefaultValueId = data.DefaultValueId;
        this.ExpresisoncheckFlag = data.ExpresisoncheckFlag;
        this.DefaultValue = data.DefaultValue;
    }

    static async getAllFieldDefaultValueByFieldIds(fieldIds) {
        const list = [];
        const query='SELECT * FROM "FieldDefaultValue" WHERE "FieldId" = ANY($1::int[]);';
        // console.log('In default query >>>>> ',query,fieldIds);
        const res = await pool.query(query, [fieldIds]);
        return res.rows.map(row => new FieldDefaultValue(row));
    }

    static async getAllFieldDefaultValueByFieldId(fieldId) {
        const query='SELECT * FROM "FieldDefaultValue" WHERE "FieldId" = $1;';
        const res = await pool.query(query, [fieldId]);
        return res.rows.map(row => new FieldDefaultValue(row));
    }

    static async getAllFieldsDefaultValues() {
        try {
            const list = [];
            const res = await pool.query('SELECT * FROM "FieldDefaultValue";');
            res.rows.forEach((data) => {
                list.push(new FieldDefaultValue(data));
            });
            return list;
        } catch (error) {
            console.error('Error fetching all field default values:', error);
            throw error;
        }
    }

    static async getFieldDefaultValueById(id) {
        const res = await pool.query('SELECT * FROM "FieldDefaultValue" WHERE "Id" = $1', [id]);
        if (res.rows.length === 0) return null;
        return new FieldDefaultValue(res.rows[0]);
    }

    static async createFieldDefaultValue(data) {
        const { FieldId, ExpresisoncheckFlag, DefaultValue } = data;
        const values = [];
        const params = [];
        // console.log('In Default fieldIds >> ', FieldId);
        FieldId?.forEach((field, i) => {
            values.push(`($${i*3 + 1}, $${i*3 + 2}, $${i*3 + 3})`);
            params.push(field, ExpresisoncheckFlag[field], DefaultValue[i]);
        })
        const query = `
            INSERT INTO "FieldDefaultValue" ("FieldId", "ExpresisoncheckFlag", "DefaultValue")
            VALUES ${values.join(', ')} RETURNING *;
        `;
        // console.log('In Default values >>>>>> >> ', query,params);
        const res = await pool.query(query, params);
        return res.rows.map(row => new FieldDefaultValue(row));
        // return new FieldDefaultValue(res.rows[0]);
    }

    static async updateFieldDefaultValue(id, data) {
        const filteredData = getFilteredData(data);
        const setStatements = [];
        Object.entries(filteredData).forEach(([key, value]) => {
            setStatements.push(`"${key}" = ${getFormatedValue(value)}`);
        });
        const updateQuery = `UPDATE "FieldDefaultValue" SET ${setStatements.join(', ')} WHERE "Id" = $1 RETURNING *;`;
        const res = await pool.query(updateQuery, [id]);
        if (res.rows.length === 0) return null;
        return new FieldDefaultValue(res.rows[0]);
    }

    static async deleteAllByFieldId(fieldId) {
        await pool.query('DELETE FROM "FieldDefaultValue" WHERE "FieldId" = $1;', [fieldId]);
    }
}

module.exports = FieldDefaultValue;
