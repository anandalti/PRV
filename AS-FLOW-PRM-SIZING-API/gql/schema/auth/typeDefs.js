'use strict';

const authTypeDefs = `#graphql
  type AuthUser {
    id: ID!
    name: String!
    email: String!
    appType: String
  }

  input RegisterInput {
    name: String!
    email: String!
    password: String!
    appType: String
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input UpdatePasswordInput {
    email: String!
    oldPassword: String!
    newPassword: String!
  }

  type RegisterPayload {
    success: Boolean!
    message: String!
    code: String!
    user: AuthUser
    errors: [ApiError!]!
  }

  type LoginPayload {
    success: Boolean!
    message: String!
    code: String!
    user: AuthUser
    preferences: JSON
    accessToken: String
    errors: [ApiError!]!
  }

  type RefreshTokenPayload {
    success: Boolean!
    message: String!
    code: String!
    accessToken: String
    errors: [ApiError!]!
  }

  extend type Mutation {
    register(input: RegisterInput!): RegisterPayload!
    login(input: LoginInput!): LoginPayload!
    refreshToken: RefreshTokenPayload!
    logout: MutationStatus!
    updatePassword(input: UpdatePasswordInput!): MutationStatus!
  }
`;

module.exports = {
    authTypeDefs,
};
