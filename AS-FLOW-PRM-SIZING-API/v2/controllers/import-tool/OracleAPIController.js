const crypto = require('crypto');
const { generatePayload } = require("../../service/import-tool/generatePayload");
const { insertReqRes, updateReqResOrderStatus } = require('../../service/import-tool/storeOracleRequestResponse')
const { callSalesOrderApi, callOrderStatusApi } = require("../../service/import-tool/salesOrderApiClient");
const { handleOracleSalesOrderResponse } = require("../../service/import-tool/oracleSalesOrderService");
const { parseOrderStatusPayload } = require("../../service/import-tool/oracleOrderStatusService");
const { createJob, updateJob } = require("../../service/import-tool/jobStore");

const generateOraclePayload = async (req, res) => {
    try {
        const fileUploadID = req.body.fileUploadID;
        const payload = await generatePayload(fileUploadID);
        return res.status(200).json({ message: "Payload generated successfully", payload });
    }
    catch (error) {
        console.error('Error generating payload', error);
        res.status(500).json({ success: false, message: 'Failed to generate payload' });
    }
}

const submitSalesOrder = async (req, res) => {
    try {
        const payload = req.body;
        if (!payload || Object.keys(payload).length === 0) {
            return res.status(400).json({
                message: 'Request body is required. Please send generated payload.'
            });
        }

        // Step 1: Trigger Create Sales Order API
        console.log('Triggering Create Sales Order API...');
        const createOrderResult = await callSalesOrderApi(payload);

        // Step 2: Parse Create Order response for errors — return immediately if error
        const createOrderParsed = await handleOracleSalesOrderResponse(createOrderResult.responseBody);

        const createSalesOrderStatus = createOrderParsed.isSuccess
            ? 'SUCCESS'
            : 'FAILED';

        // Step 3: Store request payload + create sales order response
        const savedPayload = await insertReqRes({
            requestPayload: payload,
            createSalesOrderResponse: createOrderResult.responseBody,
            createSalesOrderStatus,
            orderStatusResponse: null,
            orderStatus: null
        });

        const payloadID = savedPayload.PayloadID;

        // Step 4: If Create Sales Order failed, return immediately
        if (!createOrderParsed.isSuccess) {
            console.error('Create Sales Order returned an error:', createOrderParsed.error);
            return res.status(createOrderParsed.statusCode || 400).json({
                isSuccess: false,
                message: createOrderParsed.error?.ErrorMessage || 'Create Sales Order failed.',
                error: createOrderParsed.error,
                payloadID
            });
        }

        // Step 5: No error — create background job, return jobId immediately to UI
        const jobId = crypto.randomUUID();
        createJob(jobId);

        console.log(`Create Sales Order succeeded. Background job [${jobId}] started. Waiting 2 min before Order Status check...`);

        // Background async IIFE — NOT awaited, runs independently
        (async () => {
            try {
                // Wait 2 minutes
                await new Promise(resolve => setTimeout(resolve, 120000));

                // Trigger Order Status API
                console.log(`[Job ${jobId}] Triggering Order Status API...`);
                const orderStatusResult = await callOrderStatusApi(payload);

                // Parse Order Status response
                const orderStatusParsed = parseOrderStatusPayload(orderStatusResult.responseBody);

                const orderStatus = orderStatusParsed.isSuccess
                    ? 'SUCCESS'
                    : 'FAILED';

                // Store Order Status response in same row
                await updateReqResOrderStatus({
                    payloadID,
                    orderStatusResponse: orderStatusResult.responseBody,
                    orderStatus
                });

                if (!orderStatusParsed.isSuccess) {
                    console.error(`[Job ${jobId}] Order Status returned errors:`, orderStatusParsed.errors);
                    updateJob(jobId, 'failed', {
                        isSuccess: false,
                        message: orderStatusParsed.message || 'Order Status check failed.',
                        errors: orderStatusParsed.errors,
                        payloadID
                    });
                } else {
                    console.log(`[Job ${jobId}] Order Status successful.`);
                    updateJob(jobId, 'completed', {
                        isSuccess: true,
                        message: orderStatusParsed.message,
                        data: orderStatusParsed.data,
                        payloadID
                    });
                }
            } catch (bgError) {
                console.error(`[Job ${jobId}] Background job failed:`, bgError);

                await updateReqResOrderStatus({
                    payloadID,
                    orderStatusResponse: {
                        message: bgError.message || 'Background order status check failed.'
                    },
                    orderStatus: 'FAILED'
                });

                updateJob(jobId, 'failed', {
                    isSuccess: false,
                    message: bgError.message || 'Background order status check failed.',
                    errors: null,
                    payloadID
                });
            }
        })();

        // Return jobId to UI immediately (202 Accepted)
        return res.status(202).json({
            isSuccess: true,
            message: 'Sales Order submitted successfully. Connect to /job-status/:jobId to receive the Order Status result.',
            jobId,
            payloadID
        });

    } catch (error) {
        console.error('Sales order submission failed:', error);
        res.status(error.statusCode || 500).json({
            isSuccess: false,
            message: error.message || 'Sales order submission failed',
            error: error.responseBody || null
        });
    }
};

module.exports = { generateOraclePayload, submitSalesOrder }