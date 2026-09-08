const { pool } = require('../../db/pgsqldb');
const { getFilteredData, getFormatedValues, getFormatedValue } = require('../../utils/helper');

class FieldErrors {
    constructor(data) {
        this.Id = data.Id;
        this.FieldId = data.FieldId;
        this.ErrorId = data.ErrorId;
        this.MessageType = data.MessageType;
        this.MessageId = data.MessageId;
        this.Message= data.Message;
        this.DynamicFlag = data.DynamicFlag;
    }

    static async getAllErrors() {
        try {
            const res = await pool.query('SELECT * FROM "FieldErrors";');
            return res.rows.map(row => new FieldErrors(row));
        } catch (error) {
            console.error('Error fetching all field errors:', error);
            throw error;
        }
    }

    static async getAllByFieldId(fieldId) {
        const list = [];
        const res = await pool.query('SELECT * FROM "FieldErrors" WHERE "FieldId" = $1;', [fieldId]);
        res.rows.forEach((data) => {
            list.push(new FieldErrors(data));
        });
        return list;
    }

    static async getFieldErrorsById(id) {
        const res = await pool.query('SELECT * FROM "FieldErrors" WHERE "Id" = $1', [id]);
        if (res.rows.length === 0) return null;
        return new FieldErrors(res.rows[0]);
    }

    static async createFieldError(dataList) {
        // console.log('In errors >>>>>>>>', data)
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
                    data.ErrorId,
                    data.MessageType,
                    data.MessageId,
                    data.Message,
                    data.DynamicFlag
                );
            });
        }
        const insertQuery = `INSERT INTO "FieldErrors" ("FieldId", "ErrorId", "MessageType", "MessageId", "Message", "DynamicFlag") 
                        VALUES ${values.join(', ')} RETURNING *;`;
        // console.log(insertQuery,params);
        const res = await pool.query(insertQuery, params);
        return res.rows.map(row => new FieldErrors(row));
    }

    static async updateFieldError(id, data) {
        const filteredData = getFilteredData(data);
        const setStatements = [];
        Object.entries(filteredData).forEach(([key, value]) => {
            setStatements.push(`"${key}" = ${getFormatedValue(value)}`);
        });
        const updateQuery = `UPDATE "FieldErrors" SET ${setStatements.join(', ')} WHERE "Id" = $1 RETURNING *;`;
        const res = await pool.query(updateQuery, [id]);
        if (res.rows.length === 0) return null;
        return new FieldErrors(res.rows[0]);
    }
}

module.exports = FieldErrors;
