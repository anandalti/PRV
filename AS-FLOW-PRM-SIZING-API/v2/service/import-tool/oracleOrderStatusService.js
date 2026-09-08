/**
 * Parses and extracts errors or success details from the Oracle Order Status API payload.
 *
 * @param {Object} payload - The Oracle Order Status API response payload
 * @returns {Object} Extracted order details or errors
 */
const parseOrderStatusPayload = (payload) => {
  const orderStatus = payload?.OrderStatus || {};
  const dataArea = orderStatus.DataArea || {};
  const identification = dataArea.Identification || {};
  const orderStatusInfoArray = dataArea.OrderStatusInfo || [];

  let errors = [];
  let orderHeaderDetails = null;

  // Extract errors from all items in OrderStatusInfo
  orderStatusInfoArray.forEach(info => {
    const headerInfo = info.OrderHeaderInfo || {};
    const headerMsgArray = headerInfo.HeaderMsg || [];
    
    // Extract header errors
    headerMsgArray.forEach(msg => {
      if (msg.ErrorMessage) {
        errors.push({
          level: 'Header',
          field: msg.ErrorField,
          code: msg.ErrorCode,
          message: msg.ErrorMessage
        });
      }
    });

    const lineInfoArray = info.OrderLineInfo || [];
    // Extract line errors
    lineInfoArray.forEach(line => {
      const lineMsgArray = line.LineMsg || [];
      lineMsgArray.forEach(msg => {
        if (msg.ErrorMessage) {
          errors.push({
            level: 'Line',
            lineNumber: line.LineNbr,
            field: msg.ErrorField,
            code: msg.ErrorCode,
            message: msg.ErrorMessage
          });
        }
      });
    });
    
    // Capture header details (from the first valid item)
    if (!orderHeaderDetails) {
      orderHeaderDetails = {
        OrderNbr: identification.OrderNbr,
        OriginatingSystem: identification.OriginatingSystem,
        PONumber: headerInfo.PONumber,
        CreationDate: headerInfo.CreationDate,
        RequestDate: headerInfo.RequestDate,
        OrderStatus: headerInfo.OrderStatus,
        OrderStatusDate: headerInfo.OrderStatusDate
      };
    }
  });

  const isSuccess = errors.length === 0 && Boolean(identification.OrderNbr);

  if (!isSuccess) {
    return {
      isSuccess: false,
      errors: errors,
      message: errors.length > 0 ? "Errors found in Order Status." : "Order Number is missing.",
      data: null
    };
  }

  return {
    isSuccess: true,
    data: orderHeaderDetails,
    errors: [],
    message: "Order processed successfully."
  };
};

module.exports = {
  parseOrderStatusPayload
};
