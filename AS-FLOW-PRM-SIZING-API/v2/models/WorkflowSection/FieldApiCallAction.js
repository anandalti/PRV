const { pool } = require('../../db/pgsqldb');
const { getFilteredData,  getFormatedValue } = require('../../utils/helper');

class FieldApiCallAction {
    constructor(data) {
        this.Id = data.Id;
        this.FieldId = data.FieldId;
        this.Symbol = data.Symbol;
        this.Method = data.Method;
        this.ActionType = data.ActionType;
        this.Url = data.Url;
        this.RequestParams = data.RequestParams;
        this.ResponseParams = data.ResponseParams;
    }

    static async getAllFieldApiCallAction() {
        const res = await pool.query('SELECT * FROM "FieldApiCallAction";');
        return res.rows.map(row => new FieldApiCallAction(row));
    }

    static async getAllFieldApiCallActionByFieldIds(fieldIds) {
        const query='SELECT * FROM "FieldApiCallAction" WHERE "FieldId" = ANY($1::int[]);';
        // console.log('In default query >>>>> ',query,fieldIds);
        const res = await pool.query(query, [fieldIds]);
        return res.rows.map(row => new FieldApiCallAction(row));
    }


    static async getAllByFieldId(fieldId) {
        const res = await pool.query('SELECT * FROM "FieldApiCallAction" WHERE "FieldId" = $1;', [fieldId]);
        return res.rows.map(row => new FieldApiCallAction(row));
    }

    static async getFieldApiCallActionById(id) {
        const res = await pool.query('SELECT * FROM "FieldApiCallAction" WHERE "Id" = $1', [id]);
        if (res.rows.length === 0) return null;
        return new FieldApiCallAction(res.rows[0]);
    }

    static async createFieldApiCallAction(data) {
        // const { FieldId, Symbol, Method, ActionType, Url, RequestParams, ResponseParams } = data;
        const values = [];
        const params = [];
        // console.log('In ApiCallAction fieldIds >> ', data);
        const fieldCount = 7;
        data?.forEach((field, i) => {
            const { FieldId, Symbol, Method, ActionType, Url, RequestParams, ResponseParams } = field;
            values.push(`($${i*fieldCount + 1}, $${i*fieldCount + 2}, $${i*fieldCount + 3}, $${i*fieldCount + 4}, $${i*fieldCount + 5}, $${i*fieldCount + 6}, $${i*fieldCount + 7})`);
            params.push(FieldId, Symbol, Method, ActionType, Url, RequestParams, ResponseParams);
        })
        const query = `
            INSERT INTO "FieldApiCallAction" ("FieldId", "Symbol", "Method", "ActionType", "Url", "RequestParams", "ResponseParams")
            VALUES ${values.join(', ')} RETURNING *;
        `;
        // if(data?.length>1){
            // console.log('In ApiCallAction values >>>>>> >> ', query,params,values);
        // }
        const res = await pool.query(query, params);
        return res.rows.map(row => new FieldApiCallAction(row))
        // const insertQuery = `INSERT INTO "FieldApiCallAction" ("FieldId", "Symbol", "Method", "ActionType", "Url", "RequestParams", "ResponseParams") VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *;`;
        // const res = await pool.query(insertQuery, [FieldId, Symbol, Method, ActionType, Url, RequestParams, ResponseParams]);
        // return new FieldApiCallAction(res.rows[0]);
    }

    static async updateFieldApiCallAction(id, data) {
        const filteredData = getFilteredData(data);
        const setStatements = [];
        Object.entries(filteredData).forEach(([key, value]) => {
            setStatements.push(`"${key}" = ${getFormatedValue(value)}`);
        });
        const updateQuery = `UPDATE "FieldApiCallAction" SET ${setStatements.join(', ')} WHERE "Id" = $1 RETURNING *;`;
        const res = await pool.query(updateQuery, [id]);
        if (res.rows.length === 0) return null;
        return new FieldApiCallAction(res.rows[0]);
    }

    static async deleteFieldApiCallAction(FieldId) {
        await pool.query('DELETE FROM "FieldApiCallAction" WHERE "FieldId" = $1;', [FieldId]);
    }
}

module.exports = FieldApiCallAction;
