'use strict';

const { pool } = require('../../v2/db/pgsqldb');
const { toWorkflowDTO } = require('../models/dto/workflowDTO');

class WorkflowDataDataSource {
    async getAll() {
        const res = await pool.query('SELECT * FROM "GetWorkflowData";');
        return res.rows.map(toWorkflowDTO);
    }

    async getById(id) {
        const res = await pool.query('SELECT * FROM "GetWorkflowData" WHERE "Id" = $1', [id]);
        return res.rows[0] ? toWorkflowDTO(res.rows[0]) : null;
    }

    async getByIds(ids) {
        if (!ids.length) return [];
        const res = await pool.query('SELECT * FROM "GetWorkflowData" WHERE "Id" = ANY($1)', [ids]);
        const byId = new Map(res.rows.map((row) => {
            const dto = toWorkflowDTO(row);
            return [Number(dto.id), dto];
        }));
        return ids.map((id) => byId.get(Number(id)) || null);
    }
}

module.exports = {
    WorkflowDataDataSource,
};
