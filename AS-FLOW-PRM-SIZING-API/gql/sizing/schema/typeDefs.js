'use strict';

const sizingOperationsTypeDefs = `#graphql
  type GenericJsonPayload {
    success: Boolean!
    message: String!
    code: String!
    data: JSON
    errors: [ApiError!]!
  }

  type WorkflowSaveResponse {
    message: String
    sizingData: JSON
    proceedButtonEnableFlag: Boolean
  }

  type WorkflowSavePayload {
    success: Boolean!
    message: String!
    code: String!
    data: WorkflowSaveResponse
    errors: [ApiError!]!
  }

  type RestrictedLiftDataItem {
    id: Int
    sizingId: Int
    modelNumber: String
    orifice: String
    restrictedLift: String
    requiredFlow: Float
    ratedFlowCapacity: Float
    flowCapacityUOM: String
    ifr: Int
    doNotExceedCapacity: Float
    liftRestriction: Float
    restrictedLiftCapacity: Float
  }

  type RestrictedLiftSavePayload {
    success: Boolean!
    message: String!
    code: String!
    data: RestrictedLiftDataItem
    errors: [ApiError!]!
  }

  input RestrictedLiftPopupInput {
    sizingId: String
    modelNumber: String
    orifice: String
    requiredCapacity: Float
    ratedFlowCapacity: Float
    service: String
    doNotExceedCapacity: Float
    ifr: Int
  }

  input LiftRestrictionInput {
    modelNumber: String!
    orifice: String!
    requiredCapacity: Float!
    ratedFlowCapacity: Float!
    doNotExceedCapacity: Float
    ifr: Int
  }

  input RlCapacityInput {
    liftRestriction: Float!
    ratedFlowCapacity: Float!
  }

  input RestrictedLiftSaveInput {
    id: Int!
    modelNumber: String
    orifice: String
    restrictedLift: String
    requiredFlow: Float
    ratedFlowCapacity: Float
    flowCapacityUOM: String
    ifr: Int
    doNotExceedCapacity: Float
    liftRestriction: Float
    restrictedLiftCapacity: Float
  }

  extend type Query {
    popupLayout(workflowId: Int!): GenericJsonPayload!
    restrictedLiftPopup(input: RestrictedLiftPopupInput!): GenericJsonPayload!
    liftRestrictions(input: JSON!): GenericJsonPayload!
    rlCapacity(input: JSON!): GenericJsonPayload!
  }

  extend type Mutation {
    validateSizing(input: JSON!): GenericJsonPayload!
    convertUom(input: JSON!): GenericJsonPayload!
    saveWorkflowCallprocs(input: JSON!): WorkflowSavePayload!
    saveRestrictedLiftData(input: RestrictedLiftSaveInput!): RestrictedLiftSavePayload!
  }
`;

module.exports = {
    sizingOperationsTypeDefs,
};
