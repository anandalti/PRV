# GraphQL Module (Apollo Server)

This folder contains the production-oriented GraphQL implementation for selected `v2` REST APIs.

## Modules

- `auth`: login/register/token/password operations.
- `sizing`: workflow and static business data operations.

## Endpoint

- Default GraphQL endpoint: `/gql`

## Folder Design

- `config/`: environment and server-level configuration.
- `schema/`: SDL definitions (`typeDefs`) by module.
- `resolvers/`: GraphQL field resolvers only.
- `services/`: business logic and orchestration.
- `models/dto/`: response normalization DTOs.
- `data-sources/`: persistence and query abstractions.
- `dataloaders/`: request-scoped batching (DataLoader).
- `middleware/`: auth context extraction.
- `utils/`: validation, error mapping, logging.

## Mapped Operations

### Auth mutations

- `register` -> `POST /v2/api/auth/register`
- `login` -> `POST /v2/api/auth/login`
- `refreshToken` -> `POST /v2/api/auth/refresh-token`
- `logout` -> `POST /v2/api/auth/logout`
- `updatePassword` -> `POST /v2/api/auth/updatePassword`

### Sizing queries

- `genericErrorsGrid` -> `GET /v2/api/genericdata/errorsgrid`
- `fluids` -> `GET /v2/api/genericdata/fluids`
- `uomDetails` -> `GET /v2/api/UOM/uomDetails`
- `workflowData` -> `GET /v2/api/GetWorkflowData`
- `preferencesLayout` -> `GET /v2/api/layoutData/preferences`
- `workflowLayout` -> `GET /v2/api/layoutData/workflow`

## Local Smoke Test

1. Install dependencies: `npm install`
2. Start API: `npm run dev`
3. Query GraphQL endpoint at `/gql`
