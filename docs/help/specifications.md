# Specifications

Overview
- Purpose: Manage and maintain hardware, cloud and platform specifications used by templates, CMDB records, and deployment pipelines.

Key Fields
- `name`: Human-friendly spec name.
- `type`: Hardware | Cloud | Hypervisor | Platform.
- `cpu`, `memory`, `storage`: resource sizing attributes.
- `network`: network profile (VLANs, CIDR, ingress rules).
- `tags`: environment identifiers (dev, qa, prod, airgapped).

Common Workflows
- Create a spec: Click `New Specification`, enter name/type and resource sizing.
- Attach spec to a product or deployment template to ensure consistent resource allocation.

Integration Points
- Specifications feed the CMDB when provisioning components and are referenced by `Offline CD` transfer packages.

Troubleshooting
- If deployments fail due to sizing, confirm the spec attached to the product and check `Resource Management` for available capacity.
