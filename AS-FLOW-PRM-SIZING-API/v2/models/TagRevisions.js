const { pool } = require('../db/pgsqldb');
const { getFilteredData, getFormatedValues, getFormatedValue } = require('../utils/helper');
class TagRevisions {
    constructor(data) {
        this.Id = data.Id;
        this.SizingId = data.SizingId;
        this.Number = data.Number;
        this.PreparedBy = data.PreparedBy;
        this.CheckedBy = data.CheckedBy;
        this.ApprovedBy = data.ApprovedBy;
        this.Date = data.Date;
        this.Revision = data.Revision;
    }
    static async getAllTagRevisions() {
        const listTagRevisions = [];
        const res = await pool.query('SELECT * FROM "TagRevisions";');
        res.rows.forEach((data) => {
            listTagRevisions.push(new TagRevisions(data));
        });
        return listTagRevisions;
    }
    static async getTagRevisionsById(id) {
        const res = await pool.query('SELECT * FROM "TagRevisions" WHERE "Id" = $1', [id]);
        return new TagRevisions(res.rows[0]);
    }
    static async getTagRevisionsBySizingId(id) {
        const res = await pool.query('SELECT * FROM "TagRevisions" WHERE "SizingId" = $1', [id]);
        return res.rows.map(row => new TagRevisions(row));
    }
    static async createTagRevisions(data) {
        const filteredData = getFilteredData(data);
        const keys = Object.keys(filteredData);
        const values = getFormatedValues(filteredData);
        const insertQuery = `INSERT INTO "TagRevisions"("${keys.join('","')}") VALUES (${values.join(',')})  RETURNING *;`;
        const res = await pool.query(insertQuery);
        return res.rows[0];
    }
    static async updateTagRevisions(id, data) {
        const filteredData = getFilteredData(data);
        const setStatements = [];
        Object.entries(filteredData).forEach(([key, value]) => {
            setStatements.push(`"${key}" = ${getFormatedValue(value)}`);
        });
        const updateQuery = `UPDATE "TagRevisions" SET ${setStatements.join(', ')} WHERE "Id" = $1;`;
        const res = await pool.query(updateQuery, [id]);
        return res.rows[0];
    }
    static async deleteTagRevisions(id) {
        const res = await pool.query('DELETE FROM "TagRevisions" WHERE "Id" = $1', [id]);
        return res.rowCount;
    }
    static async deleteTagRevisionsBySizingId(id) {
        const res = await pool.query('DELETE FROM "TagRevisions" WHERE "SizingId" = $1', [id]);
        return res.rowCount;
    }
    static async updateTagrevisionsbySizingdata(TagRevisions_IN) {
        const query = `CALL "PROC_SaveTagRevisions"($1)`;
        await pool.query(query, [TagRevisions_IN]);
    }

}
module.exports = TagRevisions;
