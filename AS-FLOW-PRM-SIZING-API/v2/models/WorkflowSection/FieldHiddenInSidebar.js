const { pool } = require('../../db/pgsqldb');
const { getFilteredData, getFormatedValues, getFormatedValue } = require('../../utils/helper');

class FieldHiddenInSidebar {
    constructor(data) {
        this.Id = data.Id;
        this.FieldId = data.FieldId;
        this.SideHiddenId = data.SideHiddenId;
        this.ExpresisoncheckFlag = data.ExpresisoncheckFlag;
        this.DefaultValue = data.DefaultValue;
    }

    static async getAllFieldHiddenInSidebarByFieldIds(fieldIds) {
        const query='SELECT * FROM "FieldHiddenInSidebar" WHERE "FieldId" = ANY($1::int[]);';
        const res = await pool.query(query, [fieldIds]);
        return res.rows.map(row => new FieldHiddenInSidebar(row));
    }

    static async getAllFieldHiddenInSidebar() {
        const query='SELECT * FROM "FieldHiddenInSidebar";';
        const res = await pool.query(query);
        return res.rows.map(row => new FieldHiddenInSidebar(row));
    }

    static async getAllFieldHiddenInSidebarByFieldId(fieldId) {
        const list = [];
        const res = await pool.query('SELECT * FROM "FieldHiddenInSidebar" WHERE "FieldId" = $1;', [fieldId]);
        res.rows.forEach((data) => {
            list.push(new FieldHiddenInSidebar(data));
        });
        return list;
    }

    static async getFieldHiddenInSidebarById(id) {
        const res = await pool.query('SELECT * FROM "FieldHiddenInSidebar" WHERE "Id" = $1', [id]);
        if (res.rows.length === 0) return null;
        return new FieldHiddenInSidebar(res.rows[0]);
    }

    static async createFieldHiddenInSidebar(data) {
        const { FieldId, ExpresisoncheckFlag, DefaultValue } = data;
        const values = [];
        const params = [];
        // console.log('In HiddenInSidebar fieldIds >> ', FieldId);
        FieldId?.forEach((field, i) => {
            values.push(`($${i*3 + 1}, $${i*3 + 2}, $${i*3 + 3})`);
            params.push(field, ExpresisoncheckFlag[field], DefaultValue[i]);
        })
        const query = `
            INSERT INTO "FieldHiddenInSidebar" ("FieldId", "ExpresisoncheckFlag", "DefaultValue")
            VALUES ${values.join(', ')} RETURNING *;
        `;
        // console.log('In HiddenInSidebar values >>>>>> >> ', query,params);
        const res = await pool.query(query, params);
        return res.rows.map(row => new FieldHiddenInSidebar(row));
        // const insertQuery = `INSERT INTO "FieldHiddenInSidebar" ("FieldId", "ExpresisoncheckFlag", "DefaultValue") VALUES ($1, $2, $3) RETURNING *;`;
        // const res = await pool.query(insertQuery, [FieldId, ExpresisoncheckFlag, DefaultValue]);
        // return new FieldHiddenInSidebar(res.rows[0]);
    }

    static async updateFieldHiddenInSidebar(id, data) {
        const filteredData = getFilteredData(data);
        const setStatements = [];
        Object.entries(filteredData).forEach(([key, value]) => {
            setStatements.push(`"${key}" = ${getFormatedValue(value)}`);
        });
        const updateQuery = `UPDATE "FieldHiddenInSidebar" SET ${setStatements.join(', ')} WHERE "Id" = $1 RETURNING *;`;
        const res = await pool.query(updateQuery, [id]);
        if (res.rows.length === 0) return null;
        return new FieldHiddenInSidebar(res.rows[0]);
    }

    static async deleteAllByFieldId(fieldId) {
        await pool.query('DELETE FROM "FieldHiddenInSidebar" WHERE "FieldId" = $1;', [fieldId]);
    }
}

module.exports = FieldHiddenInSidebar;
