'use strict';

const { Kind, GraphQLScalarType } = require('graphql');

const parseLiteral = (ast) => {
    switch (ast.kind) {
        case Kind.STRING:
            return ast.value;
        case Kind.BOOLEAN:
            return ast.value;
        case Kind.INT:
            return parseInt(ast.value, 10);
        case Kind.FLOAT:
            return parseFloat(ast.value);
        case Kind.OBJECT:
            return ast.fields.reduce((obj, field) => {
                obj[field.name.value] = parseLiteral(field.value);
                return obj;
            }, {});
        case Kind.LIST:
            return ast.values.map(parseLiteral);
        case Kind.NULL:
            return null;
        default:
            return null;
    }
};

const jsonScalar = new GraphQLScalarType({
    name: 'JSON',
    description: 'Arbitrary JSON object',
    serialize: (value) => value,
    parseValue: (value) => value,
    parseLiteral,
});

const commonTypeDefs = `#graphql
  scalar JSON

  type ApiError {
    code: String!
    message: String!
    field: String
  }

  type MutationStatus {
    success: Boolean!
    message: String!
    code: String!
    errors: [ApiError!]!
  }
`;

const commonResolvers = {
    JSON: jsonScalar,
};

module.exports = {
    commonTypeDefs,
    commonResolvers,
};
