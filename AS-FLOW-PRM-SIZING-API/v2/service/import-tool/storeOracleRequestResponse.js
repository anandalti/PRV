const { pool } = require('../../db/pgsqldb');

const insertReqRes = async ({
    requestPayload,
    createSalesOrderResponse,
    createSalesOrderStatus,
    orderStatusResponse = null,
    orderStatus = null
}) => {
    try {
        const query = `
            INSERT INTO it."OracleAPIRequestReponse"
            (
                "RequestPayload",
                "CreateSalesOrderResponse",
                "CreateSalesOrderStatus",
                "OrderStatusResponse",
                "OrderStatus"
            )
            VALUES ($1, $2, $3, $4, $5)
            RETURNING "PayloadID";
        `;

        const values = [
            requestPayload,
            createSalesOrderResponse,
            createSalesOrderStatus,
            orderStatusResponse,
            orderStatus
        ];

        const result = await pool.query(query, values);

        return result.rows[0];

    } catch (error) {
        console.error('Error inserting Oracle API request/response:', error);

        throw {
            statusCode: 500,
            message: 'Failed to store Oracle API request/response',
            originalError: error
        };
    }
};

const updateReqResOrderStatus = async ({
    payloadID,
    orderStatusResponse,
    orderStatus
}) => {
    try {
        const query = `
            UPDATE it."OracleAPIRequestReponse"
            SET
                "OrderStatusResponse" = $1,
                "OrderStatus" = $2
            WHERE "PayloadID" = $3
            RETURNING "PayloadID";
        `;

        const values = [
            orderStatusResponse,
            orderStatus,
            payloadID
        ];

        const result = await pool.query(query, values);

        if (result.rowCount === 0) {
            throw {
                statusCode: 404,
                message: `No Oracle API request/response record found for PayloadID: ${payloadID}`
            };
        }

        return result.rows[0];

    } catch (error) {
        console.error('Error updating Oracle API order status response:', error);

        throw {
            statusCode: error.statusCode || 500,
            message: error.message || 'Failed to update Oracle API order status response',
            originalError: error
        };
    }
};

module.exports = {
    insertReqRes,
    updateReqResOrderStatus
};
