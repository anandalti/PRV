const { pool } = require('../../db/pgsqldb');
const { getFilteredData,  getFormatedValue } = require('../../utils/helper');

class WorkflowSectionDetails {
    constructor(data) {
        this.WorkflowId = data.WorkflowId;
        this.SectionId = data.SectionId;
        this.SectionName = data.SectionName;
        this.SectionLabel = data.SectionLabel;
        this.DisplayType = data.DisplayType;
        this.DisplayOrder = data.DisplayOrder;
    }

    static async getAllWorkflowSections() {
        try {
            const list = [];
            const res = await pool.query('SELECT * FROM "WorkflowSectionDetails";');
            res.rows.forEach((data) => {
                list.push(new WorkflowSectionDetails(data));
            });
            return list;
        } catch (error) {
            console.error('Error fetching all workflow sections:', error);
            throw error;
        }
        
    }

    static async getWorkflowSectionsByWorkflowId(workflowId){
        const list = [];
        const res = await pool.query('SELECT * FROM "WorkflowSectionDetails" WHERE "WorkflowId" = $1;', [workflowId]);
        res.rows.forEach((data) => {
            list.push(new WorkflowSectionDetails(data));
        });
        return list;
    }

    static async getWorkflowSectionsById(workflowId, sectionId) {
        const res = await pool.query('SELECT * FROM "WorkflowSectionDetails" WHERE "WorkflowId" = $1 AND "SectionId" = $2', [workflowId, sectionId]);
        if (res.rows.length === 0) return null;
        return new WorkflowSectionDetails(res.rows[0]);
    }

    static async createWorkflowSections(data) {
        // console.log(data);
        const res = await pool.query(
            `INSERT INTO "WorkflowSectionDetails"
            ("WorkflowId",  "SectionName", "SectionLabel", "DisplayType", "DisplayOrder")
            VALUES ($1, $2, $3, $4, $5) RETURNING *;`,
            [
                data.WorkflowId,
                data.SectionName,
                data.SectionLabel,
                data.DisplayType,
                data.DisplayOrder
            ]
        );
        return new WorkflowSectionDetails(res.rows[0]);
    }

    static async update(workflowId, sectionId, data) {
        const filteredData = getFilteredData(data);
        const setStatements = [];
        Object.entries(filteredData).forEach(([key, value]) => {
            setStatements.push(`"${key}" = ${getFormatedValue(value)}`);
        });
        const updateQuery = `UPDATE "WorkflowSectionDetails" SET ${setStatements.join(', ')} WHERE "WorkflowId" = $1 AND "SectionId" = $2 RETURNING *;`;
        const res = await pool.query(updateQuery, [workflowId, sectionId]);
        if (res.rows.length === 0) return null;
        return new WorkflowSectionDetails(res.rows[0]);
    }

    static async deleteWorkflow(workflowId) {
        await pool.query('DELETE FROM "WorkflowSectionDetails" WHERE "WorkflowId" = $1;', [workflowId]);
    }
}

module.exports = WorkflowSectionDetails;
