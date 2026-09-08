
const { pool } = require('../db/pgsqldb');
const { getFilteredData, getFormatedValues, getFormatedValue } = require('../utils/helper');
class UserReportHeader {
    constructor(data) {
        this.Id = data.Id;
        this.UserId = data.UserId;
        this.Company = data.Company;
        this.Address = data.Address;
        this.CityStateZip = data.CityStateZip;
        this.Country = data.Country;
        this.Phone = data.Phone;
        this.EmailUrlFax = data.EmailUrlFax;
    }
    static async getAllUserReportHeader() {
        const listUserReportHeader = [];
        const res = await pool.query('SELECT * FROM "UserReportHeader";');
        res.rows.forEach((data) => {
            listUserReportHeader.push(new UserReportHeader(data));
        });
        return listUserReportHeader;
    }
    static async getUserReportHeaderById(id) {
        const res = await pool.query('SELECT * FROM "UserReportHeader" WHERE "UserId" = $1', [id]);
        if (res.rows.length === 0) return null;
        return new UserReportHeader(res.rows[0]);
    }
    static async createUserReportHeader(data) {
        const filteredData = getFilteredData(data);
        const keys = Object.keys(filteredData);
        const values = getFormatedValues(filteredData);
        const insertQuery = `INSERT INTO "UserReportHeader"("${keys.join('","')}") VALUES (${values.join(',')})`;
        console.log(insertQuery);
        const res = await pool.query(insertQuery + ' RETURNING *;');
        return res.rows[0];
    }
    static async updateUserReportHeader(id, data) {
        const filteredData = getFilteredData(data);
        const setStatements = [];
        Object.entries(filteredData).forEach(([key, value]) => {
            setStatements.push(`"${key}" = ${getFormatedValue(value)}`);
        });
        const updateQuery = `UPDATE "UserReportHeader" SET ${setStatements.join(', ')} WHERE "UserId" = $1 Returning *;`;
        const res = await pool.query(updateQuery, [id]);
        return res.rows[0];
    }
    static async deleteUserReportHeader(id) {
        const res = await pool.query('DELETE FROM "UserReportHeader" WHERE "Id" = $1', [id]);
        return res.rowCount;
    }
}
module.exports = UserReportHeader;
