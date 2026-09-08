const { pool } = require('../db/pgsqldb');

class ErrorLogs {
    constructor(data){
        //endpoint,controllerName,functionName,functionLogNumber,logMessage,logType,logDate
        this.Id = data.Id;
        this.endpoint = data.endpoint;
        this.controllerName = data.controllerName;
        this.functionName = data.functionName;
        this.functionLogNumber = data.functionLogNumber;
        this.logMessage = data.logMessage;
        this.logType = data.logType;
    }
    static async getAllErrorLogs() {
        const listErrorLogs = [];
        const res = await pool.query('SELECT * FROM "ErrorLogs";');
        res.rows.forEach((data) => {
            listErrorLogs.push(new ErrorLogs(data));
        });
        return listErrorLogs;
    }
    static async getErrorLogsById(id) {
        const res = await pool.query('SELECT * FROM "ErrorLogs" WHERE "Id" = $1', [id]);
        return new ErrorLogs(res.rows[0]);
    }
    static async createErrorLogs(data) {
        const keys = Object.keys(data);
        const values = Object.values(data);
        const insertQuery = `INSERT INTO "ErrorLogs"("${keys.join('","')}") VALUES (${values.join(',')})`;
        const res = await pool.query(insertQuery + ' RETURNING *;');
        return res.rows[0];
    }
}
module.exports = ErrorLogs;