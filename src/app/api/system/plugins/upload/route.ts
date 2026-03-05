import { NextResponse } from 'next/server';
import AdmZip from 'adm-zip';
import fs from 'fs';
import path from 'path';
import { getUser } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';

// Determine install directories based on navigation config
function getInstallDirs(pluginId: string, navigation: any): { uiDirs: { type: string; dir: string }[]; apiDir: string } {
    const uiDirs: { type: string; dir: string }[] = [];
    const apiDir = path.join(process.cwd(), 'src/app/api/plugins', pluginId);

    // Handle both array and single-object navigation (backward compat)
    const navItems = Array.isArray(navigation) ? navigation : [navigation];

    for (const nav of navItems) {
        switch (nav.type) {
            case 'dashboard-submenu':
                uiDirs.push({ type: 'dashboard', dir: path.join(process.cwd(), 'src/app/dashboard/plugins', pluginId) });
                break;
            case 'main-menu':
                uiDirs.push({ type: 'main', dir: path.join(process.cwd(), 'src/app/plugins', pluginId) });
                break;
            case 'help':
                uiDirs.push({ type: 'help', dir: path.join(process.cwd(), 'src/app/help', pluginId) });
                break;
            case 'submenu':
                uiDirs.push({ type: 'settings', dir: path.join(process.cwd(), 'src/app/settings', pluginId) });
                break;
            default:
                // Legacy: default to settings
                if (nav.parent === 'Settings') {
                    uiDirs.push({ type: 'settings', dir: path.join(process.cwd(), 'src/app/settings', pluginId) });
                }
        }
    }

    // Ensure at least the settings dir as fallback
    if (uiDirs.length === 0) {
        uiDirs.push({ type: 'settings', dir: path.join(process.cwd(), 'src/app/settings', pluginId) });
    }

    return { uiDirs, apiDir };
}

export async function POST(request: Request) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const zip = new AdmZip(buffer);
        const zipEntries = zip.getEntries();

        // 1. Locate and parse plugin.json to extract pluginId
        let pluginConfigEntry = zipEntries.find((entry) => entry.entryName.endsWith('plugin.json'));
        if (!pluginConfigEntry) {
            return NextResponse.json({ error: 'Invalid Plugin: plugin.json missing from archive.' }, { status: 400 });
        }

        const pluginConfigContent = zip.readAsText(pluginConfigEntry);
        const pluginConfig = JSON.parse(pluginConfigContent);
        const pluginId = pluginConfig.id;

        if (!pluginId) {
            return NextResponse.json({ error: 'Invalid Plugin: plugin.json must define a unique "id".' }, { status: 400 });
        }

        // 2. Calculate all target directories from navigation
        const { uiDirs, apiDir } = getInstallDirs(pluginId, pluginConfig.navigation);

        // Ensure all directories exist
        for (const { dir } of uiDirs) {
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        }
        if (!fs.existsSync(apiDir)) fs.mkdirSync(apiDir, { recursive: true });

        // 3. Write plugin.json to all UI directories so the list API can find it
        for (const { dir } of uiDirs) {
            fs.writeFileSync(path.join(dir, 'plugin.json'), pluginConfigContent);
        }

        // 4. Extract files from zip
        let extractedFiles = 0;

        for (const entry of zipEntries) {
            if (entry.isDirectory) continue;

            const entryName = entry.entryName;
            const content = zip.readAsText(entry);

            // Map zip paths to install directories
            // ui/page.tsx → main plugin page (settings or main-menu root)
            if (entryName.endsWith('ui/page.tsx')) {
                // Install to settings dir if present, otherwise first dir
                const settingsDir = uiDirs.find(d => d.type === 'settings');
                const mainDir = uiDirs.find(d => d.type === 'main');
                if (settingsDir) fs.writeFileSync(path.join(settingsDir.dir, 'page.tsx'), content);
                if (mainDir) fs.writeFileSync(path.join(mainDir.dir, 'page.tsx'), content);
                extractedFiles++;
            }

            // ui/dashboard/page.tsx → dashboard plugin page  
            else if (entryName.endsWith('ui/dashboard/page.tsx')) {
                const dashDir = uiDirs.find(d => d.type === 'dashboard');
                if (dashDir) {
                    fs.writeFileSync(path.join(dashDir.dir, 'page.tsx'), content);
                    extractedFiles++;
                }
            }

            // ui/help/page.tsx → help plugin page
            else if (entryName.endsWith('ui/help/page.tsx')) {
                const helpDir = uiDirs.find(d => d.type === 'help');
                if (helpDir) {
                    fs.writeFileSync(path.join(helpDir.dir, 'page.tsx'), content);
                    extractedFiles++;
                }
            }

            // ui/{...}/page.tsx → main-menu nested pages (e.g. ui/strategy/3iab/teams/page.tsx)
            else if (entryName.match(/ui\/(.+)\/page\.tsx$/)) {
                const match = entryName.match(/ui\/(.+)\/page\.tsx$/);
                if (match) {
                    const relativePath = match[1];
                    const mainDir = uiDirs.find(d => d.type === 'main');
                    if (mainDir) {
                        const targetDir = path.join(mainDir.dir, relativePath);
                        if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
                        fs.writeFileSync(path.join(targetDir, 'page.tsx'), content);
                        extractedFiles++;
                    }
                }
            }

            // api/route.ts → API route
            if (entryName.endsWith('api/route.ts')) {
                fs.writeFileSync(path.join(apiDir, 'route.ts'), content);
                extractedFiles++;
            }
        }

        // 5. Register plugin roles and features in DB (if declared in plugin.json)
        const client = await clientPromise;
        const db = client.db();
        const now = new Date().toISOString();

        if (Array.isArray(pluginConfig.features) && pluginConfig.features.length > 0) {
            for (const feature of pluginConfig.features) {
                if (!feature.key || !feature.label) continue;
                await db.collection('features').updateOne(
                    { key: feature.key },
                    { $set: { key: feature.key, label: feature.label, description: feature.description ?? '', isSystem: false, pluginId, createdAt: now } },
                    { upsert: true }
                );
            }
        }

        if (Array.isArray(pluginConfig.roles) && pluginConfig.roles.length > 0) {
            for (const role of pluginConfig.roles) {
                if (!role.name || !role.label) continue;
                await db.collection('roles').updateOne(
                    { name: role.name },
                    { $set: { name: role.name, label: role.label, description: role.description ?? '', permissions: role.permissions ?? {}, isDefault: false, pluginId, createdAt: now, updatedAt: now } },
                    { upsert: true }
                );
            }
        }

        return NextResponse.json({
            success: true,
            message: `Plugin ${pluginConfig.name} installed successfully!`,
            pluginId: pluginId,
            installedDirs: uiDirs.map(d => d.type),
            registeredFeatures: (pluginConfig.features ?? []).length,
            registeredRoles: (pluginConfig.roles ?? []).length,
        });

    } catch (error: any) {
        console.error('Plugin Upload Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
