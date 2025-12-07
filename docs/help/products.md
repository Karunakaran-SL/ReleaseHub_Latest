# Products

Overview
- Purpose: Track software products, their versions, owners, and associated artifacts used for releases.

Key Fields
- `name`: Product name.
- `id` / `slug`: Unique identifier used in APIs.
- `team` / `owner`: Responsible team or person.
- `versions`: Published versions and associated artifacts (images, archives).
- `tags` and `labels`: For grouping and filtering.

Typical Actions
- Create Product: `Products` → `Create` → fill `name`, `owner`, `description`.
- Upload artifacts: Attach build artifacts or images to a product version, specify checksums and provenance.
- Promote versions: Use `Release & Baseline` to include product versions in a release.

API Endpoints
- `GET /api/products` – list products
- `GET /api/products/:id` – product details
- `POST /api/products` – create product

Troubleshooting
- If a product version doesn't appear in a baseline, confirm the artifact was uploaded and the product `versions` list is populated.
