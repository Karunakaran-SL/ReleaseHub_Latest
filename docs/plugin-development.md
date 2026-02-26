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
* **Authorization**: If your plugin requires specific roles (e.g., restricted to "Admin"), verify the role logic before executing sensitive code.

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
  "navigation": {
    "type": "submenu",       // Options: "root", "submenu"
    "parent": "Settings",    // Required if type is "submenu"
    "label": "My Plugin",
    "icon": "Box",           // Must be a valid lucide-react icon name
    "path": "/settings/my-plugin"
  },
  "dependencies": [
    {
      "pluginId": "sample-plugin-1",
      "version": "^2.0.0",
      "required": true
    }
  ]
}
```

* **Navigation Parsing**: The application will parse this metadata. When `navigation.type` is `submenu`, the application will inject an entry into the Sidebar under the specified `parent` menu. If `root`, it adds a top-level menu item.
* **Dependency Resolution**: During installation, the system will check the `dependencies` array to ensure required plugins (and their compatible versions) are present in the active registry.
