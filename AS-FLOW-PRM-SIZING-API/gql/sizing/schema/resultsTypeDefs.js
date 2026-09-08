'use strict';

/**
 * GraphQL SDL — Results & Sizing domain operations
 *
 * This file extends the root Query/Mutation types with five operations that
 * mirror the following REST endpoints:
 *
 *   POST   /v2/api/results/calculations
 *     → Mutation: runResultsCalculations
 *     → Executes valve sizing calculations and optionally persists the record.
 *       The same logic is used by both REST and GraphQL; business logic lives
 *       in ResultService.getWorkflowResultsCalc (v2 domain service).
 *
 *   POST   /v2/api/results/multivalve/selection/addRow
 *     → Mutation: addMultiValveRow
 *     → Adds a new valve row to the multi-valve selection grid and recomputes
 *       combined capacity, area, and percentage figures for the whole grid.
 *       Business logic: MultiValveSection.getMultiValveSelectionCalculations
 *
 *   POST   /v2/api/results/multivalve/selection/removeRow
 *     → Mutation: removeMultiValveRow
 *     → Removes a valve row from the multi-valve selection grid and recalculates
 *       the remaining rows; if row-0 is removed the new row-0 inherits low-set
 *       pressure values. Business logic: MultiValveSection.deleteMultiValveRow
 *
 *   POST   /v2/api/results/multivalve/selection/validateRow
 *     → Mutation: validateMultiValveRow
 *     → Validates a single row field (ValvePset / ValvePover / ValvePoverP) in the
 *       multi-valve grid, cross-checks against MAWP and low-set-pressure, and
 *       returns an updated row with recomputed values plus any validation errors.
 *       Business logic: MultiValveSection.validateMultiValveSelectionData
 *
 *   GET    /v2/api/getSizing/SizingDetailsBySizingId?SizingId=PRVxxxxx
 *     → Query: sizingDetailsBySizingId
 *     → Fetches a full saved sizing record (including selected valves, multi-valve
 *       summary, tank/popup data for workflows 3/12/23/24) by its SizingId string.
 *       Business logic: SizingController.getSizingDetailsBySizingId (DB stored-proc)
 *
 * ─── Response envelope ────────────────────────────────────────────────────────
 *
 * Every operation returns either:
 *   • GenericJsonPayload  – carries free-form JSON in `data`; used where the
 *     response shape varies by workflow or is too deeply nested to model in SDL.
 *   • ResultsCalcPayload  – carries typed results + sizingResponse sub-object.
 *   • SizingDetailsPayload – typed response for the getSizing endpoint.
 *
 * ─── Input types ──────────────────────────────────────────────────────────────
 *
 * All mutation inputs are typed scalars where possible. Deeply nested or
 * variable-shape objects (e.g., the full valve data array) use the `JSON`
 * scalar defined in gql/schema/common/scalars.js.
 */

const resultsTypeDefs = `#graphql
  # ─── Response types ─────────────────────────────────────────────────────────

  """
  Response wrapper for the results-calculations mutation.
  data.results:        Full calculation output (columns, rows, filters, section data).
  data.sizingResponse: Save confirmation message and persisted sizing record metadata.
  """
  type ResultsCalcPayload {
    success: Boolean!
    message: String!
    code: String!
    data: JSON
    errors: [ApiError!]!
  }

  """
  Response wrapper for all multi-valve row mutations (addRow / removeRow / validateRow).
  data: Updated full multi-valve section with recalculated rows and totals.
  """
  type MultiValveRowPayload {
    success: Boolean!
    message: String!
    code: String!
    data: JSON
    errors: [ApiError!]!
  }

  """
  Response wrapper for getSizingDetailsBySizingId query.
  data: Full reconstructed sizing record including selected valves,
        multi-valve summary, and workflow-specific popup / tank data.
  """
  type SizingDetailsPayload {
    success: Boolean!
    message: String!
    code: String!
    data: JSON
    errors: [ApiError!]!
  }

  # ─── Input types ─────────────────────────────────────────────────────────────

  """
  Input for the results-calculations mutation.
  Accepts all form fields at the top level: workflowId, saveSizingFlag, and 50+
  sizing form fields (UserId, UserMailId, FluidType, SetPressure, etc.).
  """
  input ResultsCalcInput {
    workflowId: Int
    saveSizingFlag: Boolean
  }

  """
  Input for addRow — adds a fully-calculated valve row to the selection grid.
  valveData:  Array of existing valve-row objects (each contains ReResponse, Areq,
              Wsel, Vsel, Asel, ValvePset, ValvePover, ValvePoverP and many more).
  """
  input AddMultiValveRowInput {
    workFlowId: Int
    valveData: [JSON!]!
  }

  """
  Input for removeRow — removes one row by its rowId and recalculates remaining rows.
  rowIdToRemove:  The rowId (1-based sequential integer) of the row to delete.
  valveData:      Current state of all valve rows before the delete.
  """
  input RemoveMultiValveRowInput {
    rowIdToRemove: Int!
    workFlowId: Int
    valveData: [JSON!]!
  }

  """
  Input for validateRow — validates a field change on a specific row.
  rowIdToValidate: The rowId of the row being edited.
  fieldName:       Name of the changed field — one of ValvePset | ValvePover | ValvePoverP.
  valveData:       Current state of all valve rows (including the edited values).
  error:           Existing error array from the client (will be merged / resolved).
  """
  input ValidateMultiValveRowInput {
    rowIdToValidate: Int!
    workFlowId: Int
    fieldName: String!
    valveData: [JSON!]!
    error: [JSON]
  }

  # ─── Operation declarations ───────────────────────────────────────────────────

  extend type Query {
    """
    GET /v2/api/getSizing/SizingDetailsBySizingId?SizingId=PRVxxxxx
    Retrieves the full saved sizing record for a given SizingId string.
    For workflows 3/12/23/24 additional popup/tank data is fetched and merged.
    Requires authentication. SizingId is validated as a non-empty string.
    """
    sizingDetailsBySizingId(sizingId: String!): SizingDetailsPayload!
  }

  extend type Mutation {
    """
    POST /v2/api/results/calculations
    Executes valve sizing calculations for the given workflow and input values.
    Optionally saves the sizing record (saveSizingFlag = true) before running calcs.
    Uses the same ResultService.getWorkflowResultsCalc domain service as REST.
    """
    runResultsCalculations(input: JSON!): ResultsCalcPayload!

    """
    POST /v2/api/results/multivalve/selection/addRow
    Appends a new valve row to the multi-valve selection grid and returns the full
    recalculated grid (totals, percentage, per-row capacity and area figures).
    """
    addMultiValveRow(input: AddMultiValveRowInput!): MultiValveRowPayload!

    """
    POST /v2/api/results/multivalve/selection/removeRow
    Removes a valve row identified by rowIdToRemove. If row-0 is removed the next
    row inherits its low-set-pressure values and flow capacity is recalculated.
    """
    removeMultiValveRow(input: RemoveMultiValveRowInput!): MultiValveRowPayload!

    """
    POST /v2/api/results/multivalve/selection/validateRow
    Validates pressure field changes (ValvePset / ValvePover / ValvePoverP) for a
    given row, converts units, checks MAWP / staggering rules, and returns the
    updated row with recalculated dependent fields and any validation errors.
    """
    validateMultiValveRow(input: ValidateMultiValveRowInput!): MultiValveRowPayload!
  }
`;

module.exports = {
    resultsTypeDefs,
};
