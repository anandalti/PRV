# Import Tool Application - Developer Guide

## Overview
This guide provides instructions for developers working on the Import Tool application within the AS-FLOW-PRM-SIZING-APP-V2 project. It covers folder structure, environment setup, and branching strategy for feature development.

---

## Folder Structure
The Import Tool application is organized as follows:

```
src/
  importTool/           # Main Import Tool components
  components/
    importTool/         # Shared Import Tool UI components
  containers/
    importTool/         # Import Tool container logic
  hooks/                # Custom React hooks (e.g., usePopupPanel, usePopupFields)
  utils/                # Utility functions
```

- **src/importTool/**: Core logic and main files for the Import Tool.
- **src/importTool/components/**: Reusable UI components specific to the Import Tool.
- **src/importTool/containers/**: Container components managing state and logic.
- **src/importTool/hooks/**: Custom hooks used throughout the Import Tool.
- **src/importTool/utils/**: Utility functions.

---

## Environment Variable
To enable the Import Tool application, set the following in your `.env` file:

```
VITE_IMPORT_TOOL_ACTIVE=true
```

This flag activates Import Tool features in the app.

---

## Branching Strategy

- **Base Branch:**
  - Use `feature/import-tool/dev` as the base branch for all Import Tool development.

- **Feature Branches:**
  - Create feature branches from `feature/import-tool/dev` using the naming convention:
    - `feature/import-tool/[feature-name]`

- **Pull Requests:**
  - Raise PRs from your feature branch to `feature/import-tool/dev`.

---

## Workflow Example
1. Checkout the base branch:
  ```sh
  git checkout feature/import-tool/dev
  ```
2. Create a new feature branch:
   ```sh
   git checkout -b feature/import-tool/my-new-feature
   ```
3. Work on your feature, commit changes.
4. Push your branch and raise a PR to `feature/import-tool/dev`.

---

## Additional Notes
- Ensure `VITE_IMPORT_TOOL_ACTIVE=true` is set in `.env` before running or building the app.
- Follow the folder structure for new files/components.
- Keep feature branches focused and raise PRs early for review.

---

For any questions, contact the project maintainers or refer to the main project README.
