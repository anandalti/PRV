'use strict';

const sizingTypeDefs = `#graphql
  type WorkflowData {
    id: Int
    valveCategoryId: Int
    valveCategoryName: String
    valveCategoryDescription: String
    valveCategoryIsActive: Boolean
    valveCategoryIcon: String
    valveCategoryDisplayOrder: Int
    fluidTypeId: Int
    fluidTypeName: String
    fluidTypeDescription: String
    fluidTypeIsActive: Boolean
    fluidTypeIcon: String
    fluidTypeDisplayOrder: Int
    sizingMethodologyId: Int
    sizingMethodologyName: String
    code: String
    sizingMethodologyDescription: String
    sizingMethodologyIsActive: Boolean
    sizingMethodologyDisplayOrder: Int
    isGenericReq: Boolean
  }

  type GenericErrorsGridPayload {
    success: Boolean!
    message: String!
    code: String!
    data: [JSON!]!
    errors: [ApiError!]!
  }

  type FluidsPayload {
    success: Boolean!
    message: String!
    code: String!
    data: JSON
    errors: [ApiError!]!
  }

  type UomDetailsPayload {
    success: Boolean!
    message: String!
    code: String!
    data: JSON
    errors: [ApiError!]!
  }

  type WorkflowDataPayload {
    success: Boolean!
    message: String!
    code: String!
    data: [WorkflowData!]!
    errors: [ApiError!]!
  }

  type LayoutPayload {
    success: Boolean!
    message: String!
    code: String!
    data: [JSON!]!
    errors: [ApiError!]!
  }

  extend type Query {
    genericErrorsGrid: GenericErrorsGridPayload!
    fluids(fluidTypeId: String): FluidsPayload!
    uomDetails: UomDetailsPayload!
    workflowData(id: Int): WorkflowDataPayload!
    preferencesLayout: LayoutPayload!
    workflowLayout(workFlowId: Int!): LayoutPayload!
  }
`;

module.exports = {
    sizingTypeDefs,
};
