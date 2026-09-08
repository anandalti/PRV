
    const { pool } = require('../db/pgsqldb');
    const { getFilteredData, getFormatedValues, getFormatedValue } = require('../utils/helper');
class UserProjectDetails {
    constructor(data){
        this.Id = data.Id;
this.UserId = data.UserId;
this.QuoteNumber = data.QuoteNumber;
this.Client = data.Client;
this.Location = data.Location;
this.EndUserReferenceNo = data.EndUserReferenceNo;
this.Project = data.Project;
this.ProjectReferenceNo = data.ProjectReferenceNo;
    }
    static async getAllUserProjectDetails() {
        const listUserProjectDetails = [];
        const res = await pool.query('SELECT * FROM "UserProjectDetails";');
        res.rows.forEach((data) => {
            listUserProjectDetails.push(new UserProjectDetails(data));
        });
        return listUserProjectDetails;
    }
    static async getUserProjectDetailsById(id) {
        const res = await pool.query('SELECT * FROM "UserProjectDetails" WHERE "Id" = $1', [id]);
        return new UserProjectDetails(res.rows[0]);
    }    
    static async createUserProjectDetails(data) {
        const filteredData = getFilteredData(data);
        const keys = Object.keys(filteredData);
        const values = getFormatedValues(filteredData);
        const insertQuery = `INSERT INTO "UserProjectDetails"("${keys.join('","')}") VALUES (${values.join(',')})`;
        const res = await pool.query(insertQuery + ' RETURNING *;');
        return res.rows[0];
    }
    static async updateUserProjectDetails(id, data) {
        const filteredData = getFilteredData(data);
        const setStatements = [];
        Object.entries(filteredData).forEach(([key, value]) => {
            setStatements.push(`"${key}" = ${getFormatedValue(value)}`);
        });
        const updateQuery = `UPDATE "UserProjectDetails" SET ${setStatements.join(', ')} WHERE "Id" = $1;`;
        const res = await pool.query(updateQuery, [id]);
        return res.rows[0];
    }
    static async deleteUserProjectDetails(id) {
        const res = await pool.query('DELETE FROM "UserProjectDetails" WHERE "Id" = $1', [id]);
        return res.rowCount;
    }
    
}
module.exports = UserProjectDetails;
