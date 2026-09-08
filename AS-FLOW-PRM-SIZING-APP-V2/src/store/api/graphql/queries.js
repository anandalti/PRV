import { gql } from '@apollo/client';

/**
 * GraphQL Query Definitions
 * These queries and mutations map to the backend GraphQL schema in /gql
 */

// ========== AUTH QUERIES & MUTATIONS ==========

export const REGISTER_MUTATION = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      success
      message
      code
      accessToken
      user {
        id
        email
        name
      }
      preferences
      errors {
        code
        message
        field
      }
    }
  }
`;

export const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      success
      message
      code
      accessToken
      user {
        id
        email
        name
      }
      preferences
      errors {
        code
        message
        field
      }
    }
  }
`;

// ✅ REFRESH_TOKEN_MUTATION — no argument needed
// Backend reads the refreshToken from the httpOnly cookie automatically via resolveRefreshToken(req) in authContext
export const REFRESH_TOKEN_MUTATION = gql`
  mutation RefreshToken {
    refreshToken {
      success
      message
      code
      accessToken
      errors {
        code
        message
        field
      }
    }
  }
`;

export const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout {
      success
      message
      code
      errors {
        code
        message
        field
      }
    }
  }
`;

export const UPDATE_PASSWORD_MUTATION = gql`
  mutation UpdatePassword($input: UpdatePasswordInput!) {
    updatePassword(input: $input) {
      success
      message
      code
      errors {
        code
        message
        field
      }
    }
  }
`;

// ========== WORKFLOW QUERIES ==========

export const GET_WORKFLOW_DATA_QUERY = gql`
  query GetWorkflowData {
    workflowData {
      success
      code
      data {
        id
        valveCategoryId
        valveCategoryName
        valveCategoryDescription
        valveCategoryIsActive
        valveCategoryIcon
        valveCategoryDisplayOrder
        fluidTypeId
        fluidTypeName
        fluidTypeDescription
        fluidTypeIsActive
        fluidTypeIcon
        fluidTypeDisplayOrder
        sizingMethodologyId
        sizingMethodologyName
        code
        sizingMethodologyDescription
        sizingMethodologyIsActive
        sizingMethodologyDisplayOrder
        isGenericReq
      }
      errors {
        code
        message
      }
    }
  }
`;

export const GET_GENERIC_ERRORS_GRID_QUERY = gql`
  query GetGenericErrorsGrid {
    genericErrorsGrid {
      success
      code
      data
      errors {
        code
        message
      }
    }
  }
`;

export const GET_FLUIDS_QUERY = gql`
  query GetFluids {
    fluids {
      success
      code
      data
      errors {
        code
        message
      }
    }
  }
`;

export const GET_UOM_DETAILS_QUERY = gql`
  query GetUomDetails {
    uomDetails {
      success
      code
      data
      errors {
        code
        message
      }
    }
  }
`;

export const GET_PREFERENCES_LAYOUT_QUERY = gql`
  query GetPreferencesLayout {
    preferencesLayout {
      success
      code
      data
      errors {
        code
        message
      }
    }
  }
`;

export const GET_WORKFLOW_LAYOUT_QUERY = gql`
  query GetWorkflowLayout($workFlowId: Int!) {
    workflowLayout(workFlowId: $workFlowId) {
      success
      code
      data
      errors {
        code
        message
      }
    }
  }
`;

export const GET_POPUP_LAYOUT_QUERY = gql`
  query GetPopupLayout($workflowId: Int!) {
    popupLayout(workflowId: $workflowId) {
      success
      code
      data
      errors {
        code
        message
      }
    }
  }
`;

export const VALIDATE_SIZING_MUTATION = gql`
  mutation ValidateSizing($input: JSON!) {
    validateSizing(input: $input) {
      success
      code
      data
      errors {
        code
        message
      }
    }
  }
`;

export const CONVERT_UOM_MUTATION = gql`
  mutation ConvertUom($input: JSON!) {
    convertUom(input: $input) {
      success
      code
      data
      errors {
        code
        message
      }
    }
  }
`;

export const RUN_RESULTS_CALCULATIONS_MUTATION = gql`
  mutation RunResultsCalculations($input: JSON!) {
    runResultsCalculations(input: $input) {
      success
      code
      data
      errors {
        code
        message
      }
    }
  }
`;

// ========== MULTI-VALVE SELECTION MUTATIONS ==========

export const ADD_MULTI_VALVE_ROW_MUTATION = gql`
  mutation AddMultiValveRow($input: AddMultiValveRowInput!) {
    addMultiValveRow(input: $input) {
      success
      code
      message
      data
      errors {
        code
        message
      }
    }
  }
`;

export const REMOVE_MULTI_VALVE_ROW_MUTATION = gql`
  mutation RemoveMultiValveRow($input: RemoveMultiValveRowInput!) {
    removeMultiValveRow(input: $input) {
      success
      code
      message
      data
      errors {
        code
        message
      }
    }
  }
`;

export const VALIDATE_MULTI_VALVE_ROW_MUTATION = gql`
  mutation ValidateMultiValveRow($input: ValidateMultiValveRowInput!) {
    validateMultiValveRow(input: $input) {
      success
      code
      message
      data
      errors {
        code
        message
      }
    }
  }
`;

// ========== RESTRICTED LIFT QUERIES & MUTATIONS ==========

export const RESTRICTED_LIFT_POPUP_QUERY = gql`
  query RestrictedLiftPopup($input: RestrictedLiftPopupInput!) {
    restrictedLiftPopup(input: $input) {
      success
      code
      message
      data
      errors {
        code
        message
      }
    }
  }
`;

export const LIFT_RESTRICTIONS_QUERY = gql`
  query LiftRestrictions($input: JSON!) {
    liftRestrictions(input: $input) {
      success
      code
      message
      data
      errors {
        code
        message
      }
    }
  }
`;

export const RL_CAPACITY_QUERY = gql`
  query RlCapacity($input: JSON!) {
    rlCapacity(input: $input) {
      success
      code
      message
      data
      errors {
        code
        message
      }
    }
  }
`;

export const SAVE_RESTRICTED_LIFT_MUTATION = gql`
  mutation SaveRestrictedLiftData($input: RestrictedLiftSaveInput!) {
    saveRestrictedLiftData(input: $input) {
      success
      code
      message
      data {
        id
        modelNumber
        orifice
        restrictedLift
        requiredFlow
        ratedFlowCapacity
        flowCapacityUOM
        ifr
        doNotExceedCapacity
        liftRestriction
        restrictedLiftCapacity
      }
      errors {
        code
        message
      }
    }
  }
`;

export const SAVE_WORKFLOW_CALLPROCS_MUTATION = gql`
  mutation SaveWorkflowCallprocs($input: JSON!) {
    saveWorkflowCallprocs(input: $input) {
      success
      code
      data {
        message
        sizingData
        proceedButtonEnableFlag
      }
      errors {
        code
        message
      }
    }
  }
`;

export const GET_SIZING_DETAILS_BY_SIZING_ID_QUERY = gql`
  query GetSizingDetailsBySizingId($sizingId: String!) {
    sizingDetailsBySizingId(sizingId: $sizingId) {
      success
      code
      data
      errors {
        code
        message
      }
    }
  }
`;

// ========== SIZING QUERIES & MUTATIONS ==========

export const EXECUTE_SIZING_MUTATION = gql`
  mutation ExecuteSizing($workflowId: String!, $payload: JSON!) {
    executeSizing(workflowId: $workflowId, payload: $payload) {
      id
      status
      results {
        id
        name
        value
        unit
      }
      errors {
        code
        message
      }
    }
  }
`;

export const GET_MY_SIZINGS_QUERY = gql`
  query GetMySizings($userId: String!, $limit: Int, $offset: Int) {
    getMySizings(userId: $userId, limit: $limit, offset: $offset) {
      id
      workflowId
      name
      createdAt
      updatedAt
      status
      results {
        id
        name
        value
      }
    }
  }
`;

export const GET_SIZING_DETAILS_QUERY = gql`
  query GetSizingDetails($sizingId: String!) {
    getSizingDetails(sizingId: $sizingId) {
      id
      workflowId
      userId
      name
      createdAt
      updatedAt
      payload
      results {
        id
        rowId
        name
        value
        unit
      }
    }
  }
`;

export const SAVE_SIZING_MUTATION = gql`
  mutation SaveSizing($sizing: SizingInput!) {
    saveSizing(sizing: $sizing) {
      id
      name
      workflowId
      createdAt
      status
    }
  }
`;

export const UPDATE_SIZING_MUTATION = gql`
  mutation UpdateSizing($id: String!, $updates: JSON!) {
    updateSizing(id: $id, updates: $updates) {
      id
      name
      updatedAt
      status
    }
  }
`;

export const DELETE_SIZING_MUTATION = gql`
  mutation DeleteSizing($id: String!) {
    deleteSizing(id: $id) {
      success
      message
    }
  }
`;

// ========== USER PREFERENCES MUTATIONS ==========

export const UPDATE_USER_PREFERENCE_MUTATION = gql`
  mutation UpdateUserPreference($id: String!, $preferences: JSON!) {
    updateUserPreference(id: $id, preferences: $preferences) {
      id
      userId
      theme
      units
      language
      notifications
    }
  }
`;

// ========== HEALTH CHECK ==========

export const HEALTH_CHECK_QUERY = gql`
  query HealthCheck {
    _health {
      status
      version
    }
  }
`;
