const { pool } = require('../../db/pgsqldb');
const { getFilteredData, getFormatedValues, getFormatedValue } = require('../../utils/helper');

class FieldGroup {
    constructor(data) {
        this.FieldId = data.FieldId;
        this.FieldGroupId = data.FieldGroupId;
        this.FieldGroupType = data.FieldGroupType;
        this.FieldGroupName = data.FieldGroupName;
        this.DefaultSelected = data.DefaultSelected;
    }

    static async getAllFieldGroups() {
        const query='SELECT * FROM "FieldGroup";';
        const res = await pool.query(query);
        return res.rows.map(row => new FieldGroup(row));
    }

    static async getFieldGroupByFieldIds(fieldIds) {
        const query='SELECT * FROM "FieldGroup" WHERE "FieldId" = ANY($1::int[]);';
        const res = await pool.query(query, [fieldIds]);
        return res.rows.map(row => new FieldGroup(row));
    }   

    static async getAllFieldGroupByFieldId(fieldId) {
        const list = [];
        const res = await pool.query('SELECT * FROM "FieldGroup" WHERE "FieldId" = $1;', [fieldId]);
        res.rows.forEach((data) => {
            list.push(new FieldGroup(data));
        });
        return list;
    }

    static async getFieldGroupById(fieldGroupId) {
        const res = await pool.query('SELECT * FROM "FieldGroup" WHERE "FieldGroupId" = $1', [fieldGroupId]);
        if (res.rows.length === 0) return null;
        return new FieldGroup(res.rows[0]);
    }

    static async createFieldGroup(data) {
        const { FieldId, FieldGroupType, FieldGroupName, DefaultSelected } = data;
        const insertQuery = `INSERT INTO "FieldGroup" ("FieldId", "FieldGroupType", "FieldGroupName", "DefaultSelected") VALUES ($1, $2, $3, $4) RETURNING *;`;
        const res = await pool.query(insertQuery, [FieldId, FieldGroupType, FieldGroupName, DefaultSelected]);
        return new FieldGroup(res.rows[0]);
    }

    static async updateFieldGroup(fieldGroupId, data) {
        const filteredData = getFilteredData(data);
        const setStatements = [];
        Object.entries(filteredData).forEach(([key, value]) => {
            setStatements.push(`"${key}" = ${getFormatedValue(value)}`);
        });
        const updateQuery = `UPDATE "FieldGroup" SET ${setStatements.join(', ')} WHERE "FieldGroupId" = $1 RETURNING *;`;
        const res = await pool.query(updateQuery, [fieldGroupId]);
        if (res.rows.length === 0) return null;
        return new FieldGroup(res.rows[0]);
    }

    static async deleteAllByFieldId(fieldId) {
        await pool.query('DELETE FROM "FieldGroup" WHERE "FieldId" = $1;', [fieldId]);
    }
}

module.exports = FieldGroup;
