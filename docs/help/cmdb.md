# CMDB (Configuration Management Database)

Overview
- Purpose: Inventory and manage infrastructure and platform components (hosts, hypervisors, networks, clusters) used by ReleaseHub.

Key Entities & Fields
- `Component`:
  - `id`, `name`, `hostname`
  - `type`: host | cluster | network | storage | hypervisor
  - `environment`: dev | qa | prod | airgapped
  - `spec`: linked specification (CPU/memory/storage)
  - `location`: datacenter, rack, or geographic location
- `Tenant` / `Application`: logical grouping for ownership and access control

Common Workflows
- Add component: `CMDB` → `Create` → complete required fields and attach `spec`.
- Link component to product or deployment when building release packages.
- Use CMDB for inventory exports to supply `Offline CD` transfer bundles.

Integration Points
- CMDB is a source of truth for deployments, resource planning, and export bundles used in offline deployments.

Troubleshooting
- If a component is missing for a deployment, verify it exists in CMDB and is tagged with correct environment and availability.
