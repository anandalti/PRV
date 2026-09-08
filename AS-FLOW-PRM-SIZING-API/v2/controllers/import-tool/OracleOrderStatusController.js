const { parseOrderStatusPayload } = require('../../service/import-tool/oracleOrderStatusService');

/**
 * Controller to handle Oracle Order Status API payloads.
 *
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const handleOrderStatus = (req, res) => {
  try {
    const payload = req.body;

    if (!payload || !payload.OrderStatus) {
      return res.status(400).json({
        isSuccess: false,
        message: "Invalid or empty Oracle Order Status payload received.",
        errors: [],
        data: null
      });
    }

    const result = parseOrderStatusPayload(payload);

    if (!result.isSuccess) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error in OracleOrderStatusController:", error);
    return res.status(500).json({
      isSuccess: false,
      message: error.message || "An unexpected error occurred on the backend.",
      errors: [],
      data: null
    });
  }
};

module.exports = {
  handleOrderStatus
};
