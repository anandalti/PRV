---
applyTo: "**"
description: Snyk Security At Inception
name: Snyk security instructions
---
When generating code using AI tools, it is important to ensure that the generated code is secure and does not introduce any vulnerabilities. To achieve this, follow these instructions:
- Always run **snyk_code_scan** tool for new first party code that is generated in a Snyk-supported language.
- Always run **snyk_code_scan** tool when suggesting vulnerability fixes for new or modified code.
- If any security issues are found based on newly introduced or modified code or dependencies, fix them using the results context from **Snyk**.
- Rescan the code after fixing the issues to ensure the issues were fixed and that no new issues were introduced.
- Repeat this process until no issues remain, and only then deliver the AI-generated code to developers.
When asked to run an sca or sast scan, run the appropriate Snyk tool in the whole project workspace, not just the modified files and list all the founded issues in the chat.