# Offline CD

Overview
- Purpose: Build, package and deliver releases to air-gapped/offline environments with strict approvals and bundled artifacts.

Key Concepts
- Transfer Bundle: a signed archive that contains artifacts, manifests, configuration and checksums to enable offline installation.
- Approval Workflow: staged approvals for package creation and deployment.
- Provenance: metadata and checksums that allow offline recipients to verify artifacts.

Typical Flow
1. Author a Release and include product versions and specs.
2. Run `Offline CD` to assemble a Transfer Bundle.
3. Attach approvals and sign the bundle.
4. Export bundle (signed) and deliver via secure media to target site.
5. At target, use the Offline installer to verify checksums and apply the release.

Fields & UI Elements
- `bundle name`, `version`, `included products`, `approvals`, `signatures`, `checksum`.

Troubleshooting
- If bundle verification fails, compare checksums and ensure all referenced artifacts were included.
