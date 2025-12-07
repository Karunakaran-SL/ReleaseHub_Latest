# Release & Baseline

Overview
- Purpose: Create release baselines to group product versions, artifacts and deployment policies for a coordinated release.

Key Fields
- `baseline name`, `description`, `included products`, `baseline version`, `approval state`.

Typical Actions
- Create baseline: pick product versions and associated artifacts.
- Lock baseline: promote baseline to an approval state for packaging.
- Export baseline as part of an `Offline CD` Transfer Bundle.

Best Practices
- Keep baseline names descriptive and include environment targeting information.
