const axios = require('axios');

const ERROR_MAPPINGS = [
  {
    pattern: /Invalid value of Sender, Target or BusinessGroup/i,
    message: "Invalid configuration credentials (Sender, Target, or BusinessGroup). Could not find the Configuration.",
    action: "Check and Correct the values of SenderID, TargetID or BusinessGroup in the configuration or backend environment variables (.env)."
  },
  {
    pattern: /Could not find the Configuration/i,
    message: "The requested configuration could not be found in Oracle.",
    action: "Verify that the Configuration is correct and try again."
  },
  {
    pattern: /Unauthorized|Invalid credentials|Authentication failed/i,
    message: "Authentication failed when connecting to Oracle APIs.",
    action: "Verify API gateway credentials and client certificates."
  },
  {
    pattern: /timeout|timed out|socket hang up/i,
    message: "Connection to Oracle SalesOrder service timed out.",
    action: "Check network connectivity or status of Oracle API gateway."
  }
];

/**
 * Parses and configures Oracle Create SalesOrder API responses/errors.
 * Maps Oracle raw errors to clean, structured, and user-friendly error responses.
 *
 * @param {Object} payload - The Oracle API response payload
 * @returns {Object} Structured error details or null-flag object if no error
 */
const configureOracleErrorMessage = (payload) => {
  const response = payload?.Response || {};
  const status = (response.ResponseStatus || "").trim().toLowerCase();
  const rawErrorMessage = response.ErrorMessage || "";
  const rawActionRecommended = response.ActionRecommended || "";
  
  let responseCode = 400;
  if (response.ResponseCode) {
    const parsed = parseInt(response.ResponseCode, 10);
    if (!isNaN(parsed)) {
      responseCode = parsed;
    }
  }

  // Treat as error if status is explicitly error, or if ErrorFlag is 'Y'
  const isError = status === "error" || response.ErrorFlag === "Y";

  if (isError) {
    let message = rawErrorMessage;
    let action = rawActionRecommended;

    if (responseCode === 200) {
      responseCode = 400; // default to bad request if it's an error payload but code says 200
    }

    // Configure/map custom error messages based on known error patterns
    const mapping = ERROR_MAPPINGS.find(m => m.pattern.test(rawErrorMessage));
    if (mapping) {
      message = mapping.message;
      action = mapping.action;
    }

    return {
      flag: true,
      ErrorType: "ORACLE_SALES_ORDER_ERROR",
      ErrorStatusCode: responseCode,
      ErrorMessage: message || "An unknown error occurred during Oracle SalesOrder processing.",
      ActionRecommended: action || "Please check the Oracle payload for more details or contact support.",
      originalError: rawErrorMessage,
    };
  }

  return {
    flag: false,
    ErrorType: null,
    ErrorStatusCode: null,
    ErrorMessage: null,
    ActionRecommended: null,
  };
};

/**
 * Handle Oracle SalesOrder creation or response processing.
 *
 * @param {Object} payload - The Oracle API response payload
 * @returns {Promise<Object>} Processed result status and data/error
 */
const handleOracleSalesOrderResponse = async (payload) => {
  const errorObj = configureOracleErrorMessage(payload);
  if (errorObj.flag) {
    return {
      isSuccess: false,
      statusCode: errorObj.ErrorStatusCode,
      error: errorObj,
    };
  }

  return {
    isSuccess: true,
    statusCode: 200,
    data: payload,
  };
};

module.exports = {
  configureOracleErrorMessage,
  handleOracleSalesOrderResponse
};
