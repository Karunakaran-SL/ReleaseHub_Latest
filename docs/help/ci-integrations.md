# CI Integrations

Overview
- Purpose: Configure connections to CI systems (Jenkins, GitLab CI, GitHub Actions, etc.) to import build artifacts and trigger automated workflows.

Typical Fields
- `integration name`, `type` (Jenkins/GitLab/GitHub), `url`, `credentials` (token or service account), `project/repo` mapping.

Typical Workflows
- Configure integration: add credentials and test connection.
- Map CI jobs to Products: specify which job produces which product (artifact, image, or bundle).
- Enable automatic import: allow ReleaseHub to poll or receive webhooks to ingest new builds.

Security Notes
- Use ephemeral tokens or dedicated service accounts, and restrict scopes to only what is required to read artifacts.
