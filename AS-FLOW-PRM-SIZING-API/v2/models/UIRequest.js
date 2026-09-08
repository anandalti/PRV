const { pool } = require('../db/pgsqldb');

class UIRequest {
    constructor(data) {

        //userid,workflowId,servicetype,apiurl,api_method,request_payload,response,response_status,error_type,error
        this.Id = data.Id;
        this.UserId = data.UserId;
        this.WorkflowId = data.WorkflowId;
        this.ServiceType = data.ServiceType;
        this.ApiUrl = data.ApiUrl;
        this.ApiMethod = data.ApiMethod;
        this.RequestPayload = data.RequestPayload;
        this.Response = data.Response;
        this.ResponseStatus = data.ResponseStatus;
        this.ErrorType = data.ErrorType;
        this.Error = data.Error;
        this.CreatedAt = data.CreatedAt;
        this.UpdatedAt = data.UpdatedAt;
        
    }

    static async getAllUIRequests() {
        const listUIRequests = [];
        const res = await pool.query('SELECT * FROM "UIRequest";');
        res.rows.forEach((data) => {
            listUIRequests.push(new UIRequest(data));
        });
        return listUIRequests;

    }

    static async getUIRequestById(id) {
        const res = await pool.query('SELECT * FROM "UIRequest" WHERE "Id" = $1', [id]);
        return new UIRequest(res.rows[0]);
    }

    static async getUIRequestByUserId(userid) {
        const res = await pool.query('SELECT * FROM "UIRequest" WHERE "UserId" = $1', [userid]);
        return new UIRequest(res.rows[0]);
    }

    static async createUIRequest(data) {
        const filteredData = Object.fromEntries(Object.entries(data).filter(([_, v]) => v !== undefined && v !== '' && v !== null));
        const keys = Object.keys(filteredData);
        const values = keys.map(key => `$${keys.indexOf(key) + 1}`);
        const insertQuery = `INSERT INTO "UIRequest"("${keys.join('","')}") VALUES (${values.join(',')}) RETURNING *;`;
        const res = await pool.query(insertQuery, Object.values(filteredData));
        // return new UIRequest(res.rows[0]);
        return res.rows[0];
    }
}

module.exports = UIRequest;