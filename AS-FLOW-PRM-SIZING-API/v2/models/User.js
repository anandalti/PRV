
const { pool } = require('../db/pgsqldb');
const { getFilteredData, getFormatedValues, getFormatedValue } = require('../utils/helper');
class User {
    constructor(data) {
        this.Id = data.Id;
        this.EmailId = data.EmailId;
        this.Name = data.Name;
    }
    static async getAllUser() {
        const listUser = [];
        const res = await pool.query('SELECT * FROM "User";');
        res.rows.forEach((data) => {
            listUser.push(new User(data));
        });
        return listUser;
    }
    static async getUserById(id) {
        const res = await pool.query('SELECT * FROM "User" WHERE "Id" = $1', [id]);
        return new User(res.rows[0]);
    }
    static async getUserByEmailId(email) {
        const res = await pool.query(`SELECT * FROM "User" WHERE "EmailId" = $1`, [email]);
        if (res.rows.length === 0) return null;
        return new User(res.rows[0]);
    }
    static async createUser(data) {
        const filteredData = getFilteredData(data);
        const keys = Object.keys(filteredData);
        const values = getFormatedValues(filteredData);
        const insertQuery = `INSERT INTO "User"("${keys.join('","')}") VALUES (${values.join(',')})`;
        const res = await pool.query(insertQuery + ' RETURNING *;');
        return res.rows[0];
    }
    static async updateUser(id, data) {
        const filteredData = getFilteredData(data);
        const setStatements = [];
        Object.entries(filteredData).forEach(([key, value]) => {
            setStatements.push(`${key} = ${getFormatedValue(value)}`);
        });
        const updateQuery = `UPDATE "User" SET ${setStatements.join(', ')} WHERE "Id" = $1;`;
        const res = await pool.query(updateQuery, [id]);
        return res.rows[0];
    }
    static async deleteUser(id) {
        const res = await pool.query('DELETE FROM "User" WHERE "Id" = $1', [id]);
        return res.rowCount;
    }

}
module.exports = User;
