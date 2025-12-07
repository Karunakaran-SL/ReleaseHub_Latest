# Workflows

Overview
- Purpose: Define automated sequences (CI/CD pipelines, approval gates, manual steps) for delivering software across environments.

Key Concepts
- `Steps`: actions like build, test, package, sign, export.
- `Approvals`: manual gates with assigned approvers and comments.
- `Triggers`: scheduled, webhook, or manual.

Typical Use
- Create or import a workflow template.
- Customize steps for your product and environment.
- Attach to a product or baseline to run automatically on new versions.

Troubleshooting
- If a workflow fails, inspect step logs and check permissions for systems called by the step (CI, artifact storage, signing services).
