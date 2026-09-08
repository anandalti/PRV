
    const { pool } = require('../db/pgsqldb');
    const { getFilteredData, getFormatedValues, getFormatedValue } = require('../utils/helper');
class TagDetails {
    constructor(data){
        this.ProjectId = data.ProjectId;
this.SizingId = data.SizingId;
this.Quantity = data.Quantity;
this.Id = data.Id;
this.LineNumber = data.LineNumber;
this.ValueForG = data.ValueForG;
this.UserEnteredValue = data.UserEnteredValue;
this.TagNumber = data.TagNumber;
this.PID = data.PID;
this.Service = data.Service;
    }
    static async getAllTagDetails() {
        const listTagDetails = [];
        const res = await pool.query('SELECT * FROM "TagDetails";');
        res.rows.forEach((data) => {
            listTagDetails.push(new TagDetails(data));
        });
        return listTagDetails;
    }
    static async getTagDetailsById(id) {
        const res = await pool.query('SELECT * FROM "TagDetails" WHERE "Id" = $1', [id]);
        return new TagDetails(res.rows[0]);
    }    
    static async createTagDetails(data) {
        const filteredData = getFilteredData(data);
        const keys = Object.keys(filteredData);
        const values = getFormatedValues(filteredData);
        const insertQuery = `INSERT INTO "TagDetails"("${keys.join('","')}") VALUES (${values.join(',')})`;
        const res = await pool.query(insertQuery + ' RETURNING *;');
        return res.rows[0];
    }
    static async updateTagDetails(id, data) {
        const filteredData = getFilteredData(data);
        const setStatements = [];
        Object.entries(filteredData).forEach(([key, value]) => {
            setStatements.push(`"${key}" = ${getFormatedValue(value)}`);
        });
        const updateQuery = `UPDATE "TagDetails" SET ${setStatements.join(', ')} WHERE "Id" = $1;`;
        const res = await pool.query(updateQuery, [id]);
        return res.rows[0];
    }
    static async deleteTagDetails(id) {
        const res = await pool.query('DELETE FROM "TagDetails" WHERE "Id" = $1', [id]);
        return res.rowCount;
    }
    
}
module.exports = TagDetails;
