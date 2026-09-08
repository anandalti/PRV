const { pool } = require('../../db/pgsqldb');
const { getFilteredData, getFormatedValues, getFormatedValue } = require('../../utils/helper');

class FieldExpression {
    constructor(data) {
        this.Id = data.Id;
        this.FieldId = data.FieldId;
        this.ExpressionId = data.ExpressionId;
        this.TargetField = data.TargetField;
        this.Symbol = data.Symbol;
        this.FocusedField = data.FocusedField;
        this.CurrentId = data.CurrentId;
        this.Expression = data.Expression;
        this.ExpectedResultType = data.ExpectedResultType;
        this.ExpressionReqFields = data.ExpressionReqFields;
        this.Uom = data.Uom;
        this.NextRound = data.NextRound;
        this.Value = data.Value;
    }

    static async getAllByExpressionIds(expressionIds) {
        const query=`SELECT * FROM "FieldExpression" WHERE "ExpressionId" = ANY(ARRAY[${expressionIds.map(id => `'${id}'`).join(', ')}]);`;
        const res = await pool.query(query);
        return res.rows.map(row => new FieldExpression(row));
    }

    static async getAllByExpressionId(expressionId) {
        const res = await pool.query('SELECT * FROM "FieldExpression" WHERE "ExpressionId" = $1;', [expressionId]);
        return res.rows.map(row => new FieldExpression(row));
    }

    static async getFieldExpressionById(id) {
        const res = await pool.query('SELECT * FROM "FieldExpression" WHERE "Id" = $1', [id]);
        if (res.rows.length === 0) return null;
        return new FieldExpression(res.rows[0]);
    }

    static async getAllFieldsExpressions() {
        try {
            const res = await pool.query('SELECT * FROM "FieldExpression"');
            if (res.rows.length === 0) return [];
            return res.rows.map(row => new FieldExpression(row));
        } catch (error) {
            console.error('Error fetching all field expressions:', error);
            throw error;
        }
    }

    static async createFieldExpression(dataList) {
        const values = [];
        const params = [];
        if (Array.isArray(dataList) && dataList.length > 0) {
            const dataObj=dataList[0]
            
            dataList.forEach((data,i) => {
                const numOfKeys=Object.keys(dataObj)?.length
                let localkeys=``
                Object.keys(dataObj).forEach((key, j) => {
                    localkeys+= j==0?`$${i * numOfKeys +j + 1}`:`, $${i * numOfKeys +j + 1}`
                });
                values.push(`(${localkeys})`)
                params.push(
                    data.FieldId,
                    data.ExpressionId,
                    data.TargetField ?? '',
                    data.Symbol ?? '',
                    data.FocusedField ?? '',
                    data.CurrentId ?? '',
                    data.Expression ?? '',
                    data.ExpectedResultType ?? '',
                    data.ExpressionReqFields ?? '',
                    data.ExpectedValue ?? '',
                    data.Uom ?? '',
                    data.NextRound ?? false,
                    data.Value ?? ''
                );
            });
        }
        
        const insertQuery = `
            INSERT INTO "FieldExpression" ("FieldId", "ExpressionId", "TargetField", "Symbol", "FocusedField", "CurrentId", "Expression", "ExpectedResultType", "ExpressionReqFields", "ExpectedValue", "Uom", "NextRound", "Value")
            VALUES ${values.join(', ')} RETURNING *;
        `;
        // console.log(values?.length,params?.length, insertQuery,params)
        const res = await pool.query(insertQuery, params);

        return res.rows.map(row => new FieldExpression(row));
        // const res = await pool.query(
        //     `INSERT INTO "FieldExpression" ("FieldId", "ExpresisonId", "TargetField", "Symbol", "FocusedField", "CurrentId", "Expression", "ExpectedResultType", "ExpressionReqFields", "ExpectedValue", "Uom", "NextRound", "Value")
        //     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *;`,
        //     [
        //         data.FieldId,
        //         data.ExpresisonId,
        //         data.TargetField,
        //         data.Symbol,
        //         data.FocusedField,
        //         data.CurrentId,
        //         data.Expression,
        //         data.ExpectedResultType,
        //         data.ExpressionReqFields,
        //         data.ExpectedValue,
        //         data.Uom,
        //         data.NextRound,
        //         data.Value
        //     ]
        // );
        // return new FieldExpression(res.rows[0]);
    }

    static async updateFieldExpression(id, data) {
        const filteredData = getFilteredData(data);
        const setStatements = [];
        Object.entries(filteredData).forEach(([key, value]) => {
            setStatements.push(`"${key}" = ${getFormatedValue(value)}`);
        });
        const updateQuery = `UPDATE "FieldExpression" SET ${setStatements.join(', ')} WHERE "Id" = $1 RETURNING *;`;
        const res = await pool.query(updateQuery, [id]);
        if (res.rows.length === 0) return null;
        return new FieldExpression(res.rows[0]);
    }

    static async deleteAllByExpresisonId(expresisonId) {
        await pool.query('DELETE FROM "FieldExpression" WHERE "ExpresisonId" = $1;', [expresisonId]);
    }

    static async deleteAllByFieldId(fieldId) {
        await pool.query('DELETE FROM "FieldExpression" WHERE "FieldId" = $1;', [fieldId]);
    }
}

module.exports = FieldExpression;
