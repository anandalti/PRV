const { pool } = require('../../db/pgsqldb');
const { getFilteredData, getFormatedValues, getFormatedValue } = require('../../utils/helper');

class FieldValidations {
    constructor(data) {
        this.Id = data.Id;
        this.FieldId = data.FieldId;
        this.ValidationId = data.ValidationId;
    }

    static async getAllValidationsByFieldIds(fieldIds) {
        const query='SELECT * FROM "FieldValidations" WHERE "FieldId" = ANY($1::int[]);';
        const res = await pool.query(query, [fieldIds]);
        return res.rows.map(row => new FieldValidations(row));

    }

    static async getAllFieldValidationsByFieldId(fieldId) {
        const list = [];
        const res = await pool.query('SELECT * FROM "FieldValidations" WHERE "FieldId" = $1;', [fieldId]);
        res.rows.forEach((data) => {
            list.push(new FieldValidations(data));
        });
        return list;
    }

    static async getFieldValidationById(id) {
        const res = await pool.query('SELECT * FROM "FieldValidations" WHERE "Id" = $1', [id]);
        if (res.rows.length === 0) return null;
        return new FieldValidations(res.rows[0]);
    }

    static async getFieldValidations() {
        try {
            const list = [];
            const res = await pool.query('SELECT * FROM "FieldValidations";');
            res.rows.forEach((data) => {
                list.push(new FieldValidations(data));
            });
            return list;
        } catch (error) {
            console.error('Error fetching all field validations:', error);
            throw error;
        }
    }

    static async createFieldValidation(data) {
        const values = [];
        const params = [];
        data?.fieldIds?.forEach((fieldId, i) => {
            values.push(`($${i + 1})`);
            params.push(fieldId);
        });
        const query=`INSERT INTO "FieldValidations" ("FieldId")
            VALUES ${values.join(', ')} RETURNING *;`;

        // console.log('In Validation >>>>>>> ', query, params);
        const res = await pool.query(query, params);

        return res.rows.map(row => new FieldValidations(row));
        // return new FieldValidations(res.rows[0]);
    }

    static async updateFieldValidations(id, data) {
        const filteredData = getFilteredData(data);
        const setStatements = [];
        Object.entries(filteredData).forEach(([key, value]) => {
            setStatements.push(`"${key}" = ${getFormatedValue(value)}`);
        });
        const updateQuery = `UPDATE "FieldValidations" SET ${setStatements.join(', ')} WHERE "Id" = $1 RETURNING *;`;
        const res = await pool.query(updateQuery, [id]);
        if (res.rows.length === 0) return null;
        return new FieldValidations(res.rows[0]);
    }

    static async deleteAllByFieldId(fieldId) {
        await pool.query('DELETE FROM "FieldValidations" WHERE "FieldId" = $1;', [fieldId]);
    }
}

module.exports = FieldValidations;
