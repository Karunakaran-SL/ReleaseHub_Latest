# 🚀 Deployment Management Blueprint

## Overview
The **Deployment Management** is a new section under *Fleet Management*.  
It is designed to provide a centralized view of all deployments worldwide and to guide users through deployment lifecycle operations such as upgrades, new installations, migrations, and decommissions.  

This module is completely independent and does not reuse existing components, logic, or user interface elements from other pages.

---

## Navigation and Structure

- **Main Section:** Fleet Management  
- **Submenu Item:** Deployment  
- **Default View:** Deployment Dashboard

The dashboard appears inside the Deployment page and can host multiple movable widgets, allowing each user to customize their workspace.

---

## Dashboard Overview

The **Deployment Dashboard** serves as the central place to visualize deployment data and perform key actions.

### Main Widgets
1. **Global Deployment View**
   - Displays deployments across the world on a visual map.
   - Each location represents one or more deployment sites.
   - Users can zoom, pan, and click on deployment sites to view details.

2. **Deployment by Product**
   - Shows how deployments are distributed across products.
   - Can display counts, versions, and compliance summaries.

3. **User-Defined Widgets**
   - Users can add new widgets, rearrange them, or remove them.
   - Widget positions and layout preferences are saved per user.

4. **Deployment by Specifications**
   - Shows how deployments are distributed across products.
   - Can display counts, versions, and compliance summaries.
---

## User Preferences

Each user’s personalized dashboard layout is saved in a user preferences storage (MongoDB).  
This ensures when users log back in, they see the same widget arrangement and selections as before.  

Preferences include:
- Widget type and position
- Widget size
- Visibility state (added or removed)
- Any filters or custom data applied

---

## Primary Actions on the Deployment Page

At the top of the dashboard, users can access several main actions represented as buttons:

1. **Upgrade Wizard**  
2. **New Deployment Wizard**  
3. **Migration Wizard**  
4. **Decommission Wizard**

Each button launches a guided multi-step process (Stepper) that assists users through their chosen operation.

---

## Upgrade Wizard — Step-by-Step Blueprint

This wizard helps users upgrade existing deployments.

1. **Select Product and Specifications**  
   - The user chooses a specific product and its specification version to upgrade.

2. **List All Deployments**  
   - The system lists all active deployments related to that product.  
   - The user can select one or multiple deployments to include in this upgrade.

3. **Choose Upgrade Scope**  
   - The user decides whether to:
     - Use a *Baseline upgrade* (global, consistent upgrade), or
     - Perform an *Individual upgrade* (select tenants, components, or applications manually).

4. **Dependency and Compliance Analysis**  
   - The system compares current versions with the target version.
   - Shows which deployments are compliant, partially compliant, or incompatible.
   - Identifies dependencies that must also be upgraded.

5. **Baseline Compatibility Summary**  
   - If the baseline path is chosen, a summary displays which deployments are already compatible, which require updates, and which need additional remediation.

6. **Upgrade Summary and Release Notes**  
   - The user reviews detailed release notes and upgrade impact before proceeding.

7. **Field Operations and Additional Procedures**  
   - Optional step to record any physical or manual field operations that must occur before or after the upgrade.

8. **Custom Workflows (Optional)**  
   - Allows linking a default workflow or a temporary custom workflow for automation, such as a pre-upgrade script or validation routine.

9. **Maintenance Window Planning**  
   - The user defines a maintenance window during which the upgrade will take place.

10. **Approval Process Setup**  
    - Multi-level approval sequence, typically including:
      - Release Owner  
      - Product Owner  
      - Product Manager  
      - Field Engineer  
      - Customer Representative  
    - These approval flows can be configured from a separate *Settings / Approval* section - Simillar to Settings/Onbaoring

11. **Package Creation for Deployment**  
    - A package is created per deployment with site-specific configuration and release notes.  
    - A placeholder image (e.g., CICD diagram) shows progress and contents.

12. **Air-Gapped Environment Report Upload**  
    - Users can upload deployment status reports and results from offline systems.

13. **Completion Summary**  
    - After successful validation, the system marks the upgrade as complete and logs it in the deployment history.

---

## New Deployment Wizard — Step-by-Step Blueprint

This wizard supports new (greenfield) deployments.

1. **Select Product and Specifications**  
   - Choose which product and version to deploy.

2. **Select Hypervisor or Platform Type**  
   - Choose the hosting environment (e.g., specific hypervisor or cloud base).

3. **Select Default Platform Foundation**  
   - Based on the above selections, recommended foundational components are listed.
   - The user selects one or multiple to include.

4. **Enter Deployment Security and Access Details**  
   - Configure encryption keys, signing certificates, PKI details, and IAM tokens.  
   - Users can either generate new credentials or connect to an external Vault/PKI system.
5. Deployemment details such as 
   - Deployment ID
   - Customer
   - Factory
   - Locations
   - Customer Key Pair

5. **Deployment Summary**  
   - Displays a summary of selected configurations for confirmation.

6. **Create Foundational Deployment Package**  
   - A deployment package is generated with instructions and release notes.

7. **Air-Gapped Deployment Reporting**  
   - The system displays folder paths or locations where deployment reports must be uploaded.

8. **Report Validation and Completion**  
   - Once the reports are uploaded and validated, a success summary is displayed.

9. **Mark as Active Deployment**  
   - The new deployment appears in the global dashboard as a “Greenfield” deployment, ready for future upgrades.

---

## Migration Wizard — High-Level Blueprint

Used to migrate deployments from one platform or product version to another.

**Best Practices (Air-Gapped Deployments):**
- Always export complete configuration snapshots from the source deployment.
- Validate hardware and software compatibility before migration.
- Perform simulation runs using the same package in a staging environment.
- Ensure the migration package contains rollback options and version control.
- Require approvals before execution and post-validation after completion.

---

## Decommission Wizard — High-Level Blueprint

Used for safely removing or retiring deployments.

**Recommended Steps:**
- Identify all dependent tenants, components, or applications.
- Ensure no active dependencies remain before decommissioning.
- Archive deployment logs, reports, and version history.
- Mark the deployment as “Retired” but retain metadata for traceability.
- Generate a closure summary report and approval audit.

---

## Key Notes

- Every action (upgrade, new deployment, migration, decommission) should generate a summary record stored under Deployment History and Audits.
- The module is designed for **air-gapped and hardware-based environments**, meaning external automation must rely on manual or offline file uploads.
- All operations are auditable and traceable, ensuring regulatory and field operation compliance.
<!-- force restart -->
<!-- force restart -->
<!-- force restart -->
<!-- force restart -->
<!-- force restart -->