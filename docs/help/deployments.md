# Deployments

Overview
- Purpose: Manage release rollouts, view deployment history, and monitor deployment health across environments (online and offline).

Key Fields
- `id`, `name`, `product`, `version`, `environment`, `status`, `startedAt`, `finishedAt`.
- `target components`: list of CMDB components targeted by the deployment.

Typical Actions
- Start deployment: choose release/baseline, target environment and components, then run.
- Monitor: view logs, status, and health metrics for the deployment.
- Rollback: perform rollback to a previous version when needed.

Integration Points
- Deployments use CMDB for target inventory and `Offline CD` bundles when operating in air-gapped environments.

Troubleshooting
- If deployment fails on a component, inspect component logs and verify the spec/resource constraints in `Resource Management`.
