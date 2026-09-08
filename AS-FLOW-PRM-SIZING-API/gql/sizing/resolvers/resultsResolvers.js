'use strict';

/**
 * Results domain resolvers
 *
 * These resolvers wire five GraphQL operations to the SizingResultsService.
 * They follow the same auth-guard pattern used throughout the gql/ module:
 *
 *   1. ensureAuthenticated(currentUser) — verifies the decoded JWT user object on
 *      the Apollo context; throws UNAUTHENTICATED if missing.
 *   2. Delegate all business logic to services.results.*  — no SQL, no HTTP.
 *   3. Wrap every response in a makePayload(message, data, code) envelope so
 *      callers always see { success, message, code, data, errors }.
 *
 * Operation map
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *  Query.sizingDetailsBySizingId
 *    • Input  : sizingId (String!) — e.g. "PRV14803037"
 *    • Service: services.results.getSizingDetailsBySizingId(sizingId)
 *    • Returns: SizingDetailsPayload { success, message, code, data, errors }
 *    • Notes  : data is an array because the REST controller wraps even single
 *               records in an array for consistency with the frontend.
 *
 *  Mutation.runResultsCalculations
    *    • Input  : JSON object with workflowId, saveSizingFlag, and 50+ form fields
    *      Example: { workflowId: 1, saveSizingFlag: true, UserId: 1, UserMailId: "...", ... }
 *    • Service: services.results.runResultsCalculations(input)
 *    • Returns: ResultsCalcPayload { success, message, code, data, errors }
 *    • Notes  : data = { results, sizingResponse } — typed as JSON scalar
 *               because their shape varies by workflow (25+ variants).
 *
 *  Mutation.addMultiValveRow
 *    • Input  : AddMultiValveRowInput { valveData: [JSON!]! }
 *    • Service: services.results.addMultiValveRow(input)
 *    • Returns: MultiValveRowPayload { success, message, code, data, errors }
 *
 *  Mutation.removeMultiValveRow
 *    • Input  : RemoveMultiValveRowInput { rowIdToRemove, valveData }
 *    • Service: services.results.removeMultiValveRow(input)
 *    • Returns: MultiValveRowPayload
 *
 *  Mutation.validateMultiValveRow
 *    • Input  : ValidateMultiValveRowInput { rowIdToValidate, fieldName, valveData, error? }
 *    • Service: services.results.validateMultiValveRow(input)
 *    • Returns: MultiValveRowPayload
 */

const { AppError, toGraphQLError } = require('../../utils/errors');
const { makePayload } = require('../utils/responses');
const { SIZING_MESSAGES } = require('../config/messages');
const { ensureAuthenticated } = require('../../middleware/authContext');

const resultsResolvers = {
    Query: {
        /**
         * sizingDetailsBySizingId
         *
         * Fetches the full saved sizing record for a given SizingId.
         *
         * Resolver steps:
         *   1. Verify the caller is authenticated.
         *   2. Delegate to SizingResultsService.getSizingDetailsBySizingId(sizingId).
         *   3. Wrap the returned data array in SizingDetailsPayload.
         *
         * @example GraphQL query
         *   query {
         *     sizingDetailsBySizingId(sizingId: "PRV14803037") {
         *       success message code
         *       data
         *     }
         *   }
         */
        sizingDetailsBySizingId: async (_parent, { sizingId }, context) => {
            try {
                ensureAuthenticated(context.currentUser);
                const data = await context.services.results.getSizingDetailsBySizingId(sizingId);
                // Pass data directly — makePayload places it under the `data` field
                return makePayload(
                    SIZING_MESSAGES.SIZING_DETAILS_SUCCESS,
                    data,
                    'SIZING_DETAILS_SUCCESS',
                );
            } catch (error) {
                throw toGraphQLError(error);
            }
        },
    },

    Mutation: {
        /**
         * runResultsCalculations
         *
         * Executes sizing calculations and optionally persists the record.
         *
         * Resolver steps:
         *   1. Verify authentication.
         *   2. Delegate to SizingResultsService.runResultsCalculations(input).
         *      The service concurrently:
         *        a. Calls saveRecordUsingSP (if saveSizingFlag = true).
         *        b. Runs getWorkflowResultsCalc domain service.
         *      Then patches popup URLs and multi-valve flag.
         *   3. Return ResultsCalcPayload with results + sizingResponse as JSON scalars.
         *
         * @example GraphQL mutation
         *   mutation RunCalc($input: ResultsCalcInput!) {
         *     runResultsCalculations(input: $input) {
         *       success message code
         *       results
         *       sizingResponse
         *     }
         *   }
         */
        runResultsCalculations: async (_parent, { input }, context) => {
            try {
                ensureAuthenticated(context.currentUser);
                const { results, sizingResponse } = await context.services.results.runResultsCalculations(input);
                // data = { results, sizingResponse } so clients access data.results and data.sizingResponse
                return makePayload(
                    SIZING_MESSAGES.RESULTS_CALC_SUCCESS,
                    { results, sizingResponse },
                    'RESULTS_CALC_SUCCESS',
                );
            } catch (error) {
                throw toGraphQLError(error);
            }
        },

        /**
         * addMultiValveRow
         *
         * Recalculates the multi-valve selection grid after a new row is appended.
         *
         * Resolver steps:
         *   1. Verify authentication.
         *   2. Delegate to SizingResultsService.addMultiValveRow(input).
         *      The service calls getMultiValveSelectionCalculations which recomputes
         *      per-row and total capacity/area/percentage figures.
         *   3. Return MultiValveRowPayload with the updated grid in data.
         *
         * @example GraphQL mutation
         *   mutation AddRow($input: AddMultiValveRowInput!) {
         *     addMultiValveRow(input: $input) {
         *       success message code
         *       data
         *     }
         *   }
         */
        addMultiValveRow: async (_parent, { input }, context) => {
            try {
                ensureAuthenticated(context.currentUser);
                const result = await context.services.results.addMultiValveRow(input);
                return makePayload(
                    SIZING_MESSAGES.MULTIVALVE_ADD_ROW_SUCCESS,
                    result,
                    'MULTIVALVE_ADD_ROW_SUCCESS',
                );
            } catch (error) {
                throw toGraphQLError(error);
            }
        },

        /**
         * removeMultiValveRow
         *
         * Removes a valve row and recalculates the remaining grid.
         *
         * Resolver steps:
         *   1. Verify authentication.
         *   2. Delegate to SizingResultsService.removeMultiValveRow(input).
         *      The service calls deleteMultiValveRow which handles:
         *        – Row removal by rowId.
         *        – Low-set pressure inheritance when row-0 is removed.
         *        – Re-calculation of the remaining rows.
         *   3. Return MultiValveRowPayload.
         *
         * @example GraphQL mutation
         *   mutation RemoveRow($input: RemoveMultiValveRowInput!) {
         *     removeMultiValveRow(input: $input) {
         *       success message code
         *       data
         *     }
         *   }
         */
        removeMultiValveRow: async (_parent, { input }, context) => {
            try {
                ensureAuthenticated(context.currentUser);
                const result = await context.services.results.removeMultiValveRow(input);
                return makePayload(
                    SIZING_MESSAGES.MULTIVALVE_REMOVE_ROW_SUCCESS,
                    result,
                    'MULTIVALVE_REMOVE_ROW_SUCCESS',
                );
            } catch (error) {
                throw toGraphQLError(error);
            }
        },

        /**
         * validateMultiValveRow
         *
         * Validates a field change on one valve row and recalculates the grid.
         *
         * Resolver steps:
         *   1. Verify authentication.
         *   2. Delegate to SizingResultsService.validateMultiValveRow(input).
         *      The service calls validateMultiValveSelectionData which:
         *        – Derives cross-linked pressure values (ValvePover ↔ ValvePoverP).
         *        – Converts pressures to psig and validates staggering / MAWP rules.
         *        – If valid, recalculates flow capacity and calls the grid recalc.
         *   3. Return MultiValveRowPayload including per-row validation errors.
         *
         * @example GraphQL mutation
         *   mutation ValidateRow($input: ValidateMultiValveRowInput!) {
         *     validateMultiValveRow(input: $input) {
         *       success message code
         *       data
         *     }
         *   }
         */
        validateMultiValveRow: async (_parent, { input }, context) => {
            try {
                ensureAuthenticated(context.currentUser);
                const result = await context.services.results.validateMultiValveRow(input);
                return makePayload(
                    SIZING_MESSAGES.MULTIVALVE_VALIDATE_ROW_SUCCESS,
                    result,
                    'MULTIVALVE_VALIDATE_ROW_SUCCESS',
                );
            } catch (error) {
                throw toGraphQLError(error);
            }
        },
    },
};

module.exports = { resultsResolvers };
