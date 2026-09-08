'use strict';

class WorkflowDetails {
    static async upsert(client, workflowId, details, popupDetails = null) {
        const result = await client.query(
            `INSERT INTO "WorkflowDetails" ("WorkflowId", "WorkflowDetails", "PopupDetails")
             VALUES ($1, $2::jsonb, $3::jsonb)
             ON CONFLICT ("WorkflowId") DO UPDATE SET
                 "WorkflowDetails" = EXCLUDED."WorkflowDetails",
                 "PopupDetails" = EXCLUDED."PopupDetails",
                 "UpdatedAt" = clock_timestamp()
             RETURNING *`,
            [workflowId, JSON.stringify(details), popupDetails === null ? null : JSON.stringify(popupDetails)]
        );
        return result.rows[0];
    }

    static async getAll(client) {
        // Shared popup files are restored from the most recently updated workflow.
        const result = await client.query('SELECT * FROM "WorkflowDetails" ORDER BY "UpdatedAt", "WorkflowId"');
        return result.rows;
    }
}

module.exports = WorkflowDetails;
