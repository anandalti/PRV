'use strict';

/**
 * SizingResultsService
 *
 * GraphQL-facing service for results and multi-valve selection operations.
 * All five methods in this class correspond 1-to-1 with REST endpoints that
 * already exist under /v2/api/:
 *
 *   Method                   REST endpoint
 *   ─────────────────────    ─────────────────────────────────────────────
 *   runResultsCalculations   POST /v2/api/results/calculations
 *   addMultiValveRow         POST /v2/api/results/multivalve/selection/addRow
 *   removeMultiValveRow      POST /v2/api/results/multivalve/selection/removeRow
 *   validateMultiValveRow    POST /v2/api/results/multivalve/selection/validateRow
 *   getSizingDetailsBySizingId GET /v2/api/getSizing/SizingDetailsBySizingId
 *
 * Design principles
 * ─────────────────
 * • No req / res coupling — all methods receive plain input objects and
 *   return plain data objects or throw AppError for business failures.
 * • All business logic is delegated to shared v2 use-cases so REST and GraphQL
 *   paths execute the same domain flow.
 */

const resultsUseCases = require('../../../v2/service/usecases/results');

const { AppError } = require('../../utils/errors');

// ─── Service class ───────────────────────────────────────────────────────────

class SizingResultsService {
    /**
     * runResultsCalculations
     *
     * Mirrors: POST /v2/api/results/calculations
     *
     * Step-by-step:
     *   1. Concurrently: optionally save the sizing record via PROC_SaveSizing,
     *      AND execute the full valve sizing calculation pipeline.
     *   2. Resolve the SizingId from the save result or fall back to params.Id.
     *   3. Patch any popup URLs that contained the placeholder "SizingId=null".
     *   4. Inject multiValveSelectionDisplayFlag for multi-valve workflows.
     *   5. Return results and sizingResponse as JSON scalars (shape varies by wf).
     *
     * @param {object} params - Full form payload (same as REST request body).
     *   params.workflowId    {number}  Required workflow identifier.
     *   params.saveSizingFlag {boolean} Whether to persist the record.
     *   ...all other fields  {any}     Sizing form fields (UserId, UserMailId, SetPressure, etc.)
     * @returns {{ results: object, sizingResponse: { message: string, sizingData: any[] } }}
     */
    async runResultsCalculations(params) {
        if (!params || typeof params !== 'object') {
            throw new AppError(
                'input must be a JSON object',
                { code: 'BAD_USER_INPUT', status: 400 },
            );
        }

        // Extract workflowId accepting all casing variants (camelCase / PascalCase).
        // Do NOT destructure WorkFlowId/WorkflowId out of the spread — the downstream
        // calculation service (getWorkflowResults/getWorkflowResultsCalc) reads WorkFlowId
        // directly from fullParams. Removing it caused parseInt(undefined) = NaN → DB error.
        const { saveSizingFlag, ...payload } = params;
        const workflowId = params.workflowId || params.WorkFlowId || params.WorkflowId;
        if (!Number.isInteger(workflowId) || workflowId < 1) {
            throw new AppError(
                'workflowId is required and must be a positive integer',
                { code: 'BAD_USER_INPUT', status: 400 },
            );
        }

        return resultsUseCases.runResultsCalculations({
            workflowId,
            saveSizingFlag: saveSizingFlag === true,
            payload,
            requestContext: { source: 'GraphQL' },
        });
    }

    /**
     * addMultiValveRow
     *
     * Mirrors: POST /v2/api/results/multivalve/selection/addRow
     *
     * Step-by-step:
     *   1. Receive the array of valve-row objects (one per selected valve).
     *   2. Call getMultiValveSelectionCalculations — recomputes totalReqArea,
     *      totalSelectedArea, per-row ValveSelectedPer, ValveW, PsetH/PoverH,
     *      popup URL patches, and flow-capacity totals.
     *   3. Return the updated MultiValveFieldSection data.
     *
     * @param {object} params
     *   params.valveData  {Array} Array of existing + newly-added valve row objects.
     * @returns {object} { MultiValveFieldSection, ... }
     */
    async addMultiValveRow(params) {
        return resultsUseCases.addMultiValveRow(params);
    }

    /**
     * removeMultiValveRow
     *
     * Mirrors: POST /v2/api/results/multivalve/selection/removeRow
     *
     * Step-by-step:
     *   1. Receive the rowId to remove and the current valve data array.
     *   2. Call deleteMultiValveRow which:
     *        a. Identifies and removes the target row.
     *        b. If row-0 (low-set reference valve) was removed, recalculates the
     *           new row-0 using the deleted row's pressure values.
     *        c. Calls getMultiValveSelectionCalculations on the remaining rows.
     *   3. Return the updated grid.
     *
     * @param {object} params
     *   params.rowIdToRemove  {number}  1-based rowId.
     *   params.valveData      {Array}   Current valve rows.
     * @returns {object} Updated multi-valve grid data.
     */
    async removeMultiValveRow(params) {
        return resultsUseCases.removeMultiValveRow(params);
    }

    /**
     * validateMultiValveRow
     *
     * Mirrors: POST /v2/api/results/multivalve/selection/validateRow
     *
     * Step-by-step:
     *   1. Receive rowIdToValidate, fieldName, current valveData array and any
     *      pre-existing errors array.
     *   2. Call validateMultiValveSelectionData which:
     *        a. Locates the target row by rowId.
     *        b. If fieldName === 'ValvePoverP': derives ValvePover = (PsetH * PoverPH) / 100.
     *           If fieldName === 'ValvePover':  derives ValvePoverP = (PoverH / PsetH) * 100.
     *        c. Converts pressures to psig and validates:
     *             – PsetH must be > PsetL (staggering rule)
     *             – PsetH must not exceed MAWP
     *             – PoverH stacking constraints
     *        d. If valid: recalculates flow capacity for the row using
     *           ReCalculateFlowCapacityforSelectedValve, then calls
     *           getMultiValveSelectionCalculations on the full updated grid.
     *   3. Returns the updated grid with validation errors embedded per-row.
     *
     * @param {object} params
     *   params.rowIdToValidate {number}  1-based rowId of the edited row.
     *   params.fieldName       {string}  'ValvePset' | 'ValvePover' | 'ValvePoverP'.
     *   params.valveData       {Array}   All valve rows including updated field values.
     *   params.error           {Array}   Existing errors (optional).
     * @returns {object} Updated multi-valve grid with validation results.
     */
    async validateMultiValveRow(params) {
        return resultsUseCases.validateMultiValveRow(params);
    }

    /**
     * getSizingDetailsBySizingId
     *
     * Mirrors: GET /v2/api/getSizing/SizingDetailsBySizingId?SizingId=PRVxxxxx
     *
     * Step-by-step:
     *   1. Validate SizingId is a non-empty string.
     *   2. Call the PostgreSQL stored function public."GetSizingDetailsBySizingId"($1).
     *   3. Extract data.rows[0].SizingDetails.
     *   4. If data exists and length > 0:
     *        a. Map SelectedValves — flatten .SelectedValve and stringify ReResponse fields.
     *        b. Compute MultiValveSelectionData for multi-valve records (IsMultivalve &&
     *           SelectedValves.length > 1).
     *        c. Branch by WorkFlowId for additional popup/tank data enrichment:
     *             – WorkFlowId === 12  → API521 fire/emergency data
     *             – WorkFlowId 3/23/24 → API2000 venting data
     *             – All other wfs       → IsSingleORMultiCompSys boolean flags
     *   5. Return the enriched data array.
     *
     * @param {string} sizingId - The SizingId string (e.g., "PRV14803037").
     * @returns {Array|null} Array with one sizing-record object, or null.
     */
    async getSizingDetailsBySizingId(sizingId) {
        return resultsUseCases.getSizingDetailsBySizingId({ sizingId });
    }
}

module.exports = { SizingResultsService };
