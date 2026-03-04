# ReleaseHub Plugin Development Guide

This document provides instructions for developers (and AI assistants) on how to generate and integrate plugins into the ReleaseHub application.

## 1. UI Code Structure

ReleaseHub plugins should integrate seamlessly into the existing Next.js App Router structure.

* **Components & Styling**: 
  * Use **Tailwind CSS** for all styling.
  * Leverage existing **shadcn/ui** components located in `@/components/ui` (e.g., `Card`, `Button`, `Badge`, `Table`). 
  * Use **Lucide React** (`lucide-react`) for icons.
* **Routing**: 
  * Plugin pages should be created within the App Router structure, typically under a specific feature folder or a dedicated `/plugins/[plugin-name]` route.
  * Ensure pages use the `"use client"` directive only when interactivity (hooks, state, event listeners) is strictly required to maximize Server Component performance.
* **Layout Integration**: 
  * To ensure the plugin renders within the main application shell, wrap the page content in the standard layout component:
    ```tsx
    import DashboardLayout from '@/app/dashboard-layout';
    import { getUser } from '@/lib/auth';

    export default async function MyPluginPage() {
      const user = await getUser();
      // Map user id to _id for DashboardLayout compatibility
      const layoutUser = user ? { _id: user.id, username: user.username } : null;

      return (
        <DashboardLayout user={layoutUser}>
          {/* Plugin Content */}
        </DashboardLayout>
      );
    }
    ```

## 2. Backend Node API Structure

ReleaseHub utilizes Next.js Route Handlers for its backend API.

* **Route Handlers**: Create API routes under `src/app/api/plugins/[plugin-name]/route.ts`.
* **Methods**: Export standard asynchronous HTTP method functions (`GET`, `POST`, `PUT`, `DELETE`).
* **Request Handling**: Use the standard `Request` and `NextResponse` APIs.
  ```typescript
  import { NextResponse } from 'next/server';

  export async function GET(request: Request) {
    // Basic logic
    return NextResponse.json({ success: true, data: [] });
  }
  ```

## 3. MongoDB Access and Code Structure

ReleaseHub uses the standard native Node.js MongoDB driver.

* **Connection**: Import the global MongoDB client promise from `src/lib/mongodb.ts`.
* **Best Practices**:
  * Always await the database promise: `const client = await clientPromise; const db = client.db();`
  * Use the specific database initialized by the utility.
  * Do not create new connection pools within the route handlers; reuse `clientPromise`.
  
  ```typescript
  import clientPromise from '@/lib/mongodb';
  import { NextResponse } from 'next/server';

  export async function GET() {
    try {
      const client = await clientPromise;
      const db = client.db();
      const collection = db.collection('my_plugin_data');
      const data = await collection.find({}).toArray();
      
      return NextResponse.json({ success: true, data });
    } catch (error) {
      return NextResponse.json({ success: false, error: 'Failed to access database' }, { status: 500 });
    }
  }
  ```

## 4. Using Backend API via Documentation

When building plugins that consume existing ReleaseHub APIs:
* **Internal APIs**: Fetch data internally using the absolute URL (e.g., `http://localhost:3000/api/...` or utilizing `process.env.NEXT_PUBLIC_API_URL`).
* **Server Components**: It is highly recommended to perform data fetching directly in Server Components without hitting the API routes if the API simply wraps a database call. You can call the DB logic directly from the Server Component for better performance.
* **Client Components**: Use standard `fetch` or a data fetching library like `SWR` / `React Query` to hit the Next.js API route handlers.
* **API Reference**: See the API documentation at `/api-docs` for available endpoints including:
  * `GET /api/products` — List all products
  * `GET /api/specifications` — List all specifications
  * `GET /api/deployments` — List all deployments (sorted by `createdAt`)

## 5. Security Roles and Parameters

Plugins must adhere to the application's security model.

* **Authentication**: Ensure the user is authenticated before allowing access to plugin pages or API routes.
* **Verification**: Use the existing `getUser()` function from `@/lib/auth`.
  ```typescript
  import { getUser } from '@/lib/auth';
  import { NextResponse } from 'next/server';

  export async function POST(request: Request) {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Proceed with secure action using user.id
  }
  ```
* **Authorization (RBAC)**: The system supports five default roles: `admin`, `release_engineer`, `platform_engineer`, `auditor`, `viewer`. Use the `hasPermission()` utility:
  ```typescript
  import { getUser } from '@/lib/auth';
  import { hasPermission } from '@/lib/rbac';
  import { isAdminRole } from '@/lib/role-utils';
  import { NextResponse } from 'next/server';

  export async function POST(request: Request) {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!hasPermission(user.role, 'my_plugin_feature', 'create')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    // proceed...
  }
  ```
* **Plugin Permissions**: Plugins declare their roles and features in `plugin.json` under `roles[]` and `features[]`. These are automatically registered in the DB on install and removed on uninstall.

## 6. Plugin Metadata and Dependencies

Plugins should define their structure, menu integration, and dependencies using a standardized `plugin.json` metadata file. This ensures the installer can dynamically append side-menu logic and verify prerequisites.

### Standard Metadata Schema

```json
{
  "id": "my-custom-plugin",
  "version": "1.0.0",
  "name": "My Custom Plugin",
  "description": "Extends ReleaseHub with custom functionality.",
  "publisher": "Your Name",
  "navigation": [
    {
      "type": "dashboard-submenu",
      "label": "Plugin Overview",
      "icon": "Box",
      "path": "/dashboard/plugins/my-custom-plugin"
    },
    {
      "type": "main-menu",
      "label": "My Plugin",
      "icon": "Puzzle",
      "path": "/plugins/my-custom-plugin",
      "children": [
        { "label": "Feature A", "icon": "Box", "path": "/plugins/my-custom-plugin/feature-a" },
        { "label": "Feature B", "icon": "FileText", "path": "/plugins/my-custom-plugin/feature-b" }
      ]
    },
    {
      "type": "help",
      "label": "My Plugin Help",
      "icon": "HelpCircle",
      "path": "/help/my-custom-plugin"
    },
    {
      "type": "submenu",
      "parent": "Settings",
      "label": "My Plugin",
      "icon": "Box",
      "path": "/settings/my-custom-plugin"
    }
  ],
  "widgets": [
    {
      "id": "my-widget",
      "title": "Widget Title",
      "description": "Short description of the widget.",
      "size": "small"
    }
  ],
  "features": [
    {
      "key": "my_plugin_incidents",
      "label": "My Plugin Incidents",
      "description": "Incident tracking provided by My Custom Plugin."
    }
  ],
  "roles": [
    {
      "name": "my_plugin_operator",
      "label": "My Plugin Operator",
      "description": "Can view and manage My Plugin incidents.",
      "permissions": {
        "my_plugin_incidents": ["view", "create", "edit"],
        "dashboard": ["view"]
      }
    }
  ],
  "dependencies": [
    {
      "pluginId": "sample-plugin-1",
      "version": "^2.0.0",
      "required": true
    }
  ]
}
```

### Navigation Types

The `navigation` field is an **array** allowing plugins to add menus in multiple locations:

| Type | Description | Installation Directory |
|------|-------------|----------------------|
| `dashboard-submenu` | Adds an entry under the Dashboard collapsible menu | `src/app/dashboard/plugins/{pluginId}/` |
| `main-menu` | Adds a top-level collapsible menu with optional `children` sub-items | `src/app/plugins/{pluginId}/` |
| `help` | Adds an entry under the Help collapsible menu | `src/app/help/{pluginId}/` |
| `submenu` | Adds an entry under a specified `parent` menu (e.g. Settings) | `src/app/settings/{pluginId}/` |

> **Backward Compatibility**: A single navigation object (non-array) is still supported for legacy plugins.

### Widget Definitions

The `widgets` array defines dashboard widgets that will be rendered on the main dashboard page. Each widget:
- Fetches data from the plugin's API route (`/api/plugins/{pluginId}`)
- Renders within the existing Widget component wrapper
- Supports sizes: `small`, `medium`, `large`

### Features (RBAC)

The `features[]` array defines **new feature scopes** your plugin introduces. Each entry is registered in the `features` DB collection and appears in the User Management → Features tab and all role permission matrices.

```json
"features": [
  {
    "key": "my_plugin_incidents",
    "label": "My Plugin Incidents",
    "description": "Incident management provided by this plugin."
  }
]
```

On **install**, these features are upserted into MongoDB. On **uninstall**, they are removed.

### Roles (RBAC)

The `roles[]` array defines **new roles** your plugin introduces. Each role is stored in the `roles` DB collection and appears in User Management → Roles.

```json
"roles": [
  {
    "name": "my_plugin_operator",
    "label": "My Plugin Operator",
    "description": "Can manage My Plugin incidents.",
    "permissions": {
      "my_plugin_incidents": ["view", "create", "edit"],
      "dashboard": ["view"]
    }
  }
]
```

Actions supported: `view`, `create`, `edit`, `delete`.

### Plugin File Structure

```
my-custom-plugin/
├── plugin.json              # Metadata, navigation, widgets, permissions
├── api/
│   └── route.ts             # Backend API route handler
└── ui/
    ├── page.tsx              # Main plugin page (settings/main-menu root)
    ├── dashboard/
    │   └── page.tsx          # Dashboard sub-page
    ├── help/
    │   └── page.tsx          # Help sub-page
    ├── feature-a/
    │   └── page.tsx          # Main-menu child page
    └── feature-b/
        └── page.tsx          # Main-menu child page
```

* **Navigation Parsing**: The application will parse the `navigation` array. For each entry, it dynamically injects sidebar menu items in the appropriate location.
* **Dependency Resolution**: During installation, the system will check the `dependencies` array to ensure required plugins (and their compatible versions) are present in the active registry.
