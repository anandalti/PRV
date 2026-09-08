# Import Tool Developer Guide

## Overview
The Import Tool is a modular feature designed to facilitate data import operations within the AS-FLOW-PRM-SIZING-API project. All development for this tool should be based on the `feature/import-tool/dev` branch.

## Branching Strategy
- **Base Branch:** `feature/import-tool/dev`
- All Import Tool development must branch off from `feature/import-tool/dev`.
- Submit pull requests targeting `feature/import-tool/dev` for Import Tool-related changes.

## Folder Structure
The Import Tool is organized into dedicated folders within each main component directory:

- **routes/import-tool/**: Route definitions for import endpoints.
- **controllers/import-tool/**: Business logic and request handling for import operations.
- **service/import-tool/**: Service layer for import-related processes.
- **utils/import-tool/**: Utility functions and helpers for import logic.
- **migrations/import-tool/**: Database migration scripts related to import features.

## Environment Variable Activation
To activate the Import Tool feature, set the following environment variable in your `.env` file:

```dotenv
IMPORT_TOOL_ACTIVE=true
```

This variable must be set to `true` for the Import Tool to be enabled in your development or production environment.

## Filename Conventions
- All Import Tool filenames should use **PascalCase** (e.g., `ImportRoutes.js`, `ImportController.js`, `CsvParser.js`), **except**:
  - Files in the `service` folder should use **camelCase** (e.g., `importService.js`).
  - Files in the `db/import-tool/migrations/` folder should use **kebab-case** (hyphenated, e.g., `2026-02-16-add-import-table.js`).

## Development Guidelines
1. **Modularity:**
   - Place all Import Tool code in the respective `import-tool` subfolder of each component.
   - Avoid mixing Import Tool logic with unrelated code.

2. **Naming Conventions:**
   - Use clear, descriptive names for files and functions (see filename conventions above).

3. **Testing:**
   - Add or update tests for all new features and bug fixes.
   - Place Import Tool tests in a corresponding `test/import-tool/` folder if available.

4. **Documentation:**
   - Update this README with any major changes to the Import Tool structure or workflow.

## Getting Started
1. Checkout the base branch:
   ```sh
   git checkout feature/import-tool/dev
   ```
2. Create a new feature branch for your work:
   ```sh
   git checkout -b feature/import-tool/[your-feature]
   ```
3. Add your code to the appropriate `import-tool` folder in each component.
4. Commit and push your changes, then open a pull request to `feature/import-tool/dev`.

## Example Folder Structure
```
routes/
  import-tool/
    ImportRoutes.js
controllers/
  import-tool/
    ImportController.js
service/
  import-tool/
    importService.js
utils/
  import-tool/
    CsvParser.js
migrations/
  import-tool/
    2026-02-16-add-import-table.js
```

## Contact
For questions or support, contact the Import Tool maintainers or refer to the project documentation.

