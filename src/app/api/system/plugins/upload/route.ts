import { NextResponse } from 'next/server';
import AdmZip from 'adm-zip';
import fs from 'fs';
import path from 'path';
import { getUser } from '@/lib/auth';

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
                // Also create sub-dirs for children
                if (nav.children) {
                    for (const child of nav.children) {
                        const childSlug = child.path.split('/').pop();
                        if (childSlug && childSlug !== pluginId) {
                            uiDirs.push({ type: `main-child-${childSlug}`, dir: path.join(process.cwd(), 'src/app/plugins', pluginId, childSlug) });
                        }
                    }
                }
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
            if (entryName.endsWith('ui/dashboard/page.tsx')) {
                const dashDir = uiDirs.find(d => d.type === 'dashboard');
                if (dashDir) {
                    fs.writeFileSync(path.join(dashDir.dir, 'page.tsx'), content);
                    extractedFiles++;
                }
            }

            // ui/help/page.tsx → help plugin page
            if (entryName.endsWith('ui/help/page.tsx')) {
                const helpDir = uiDirs.find(d => d.type === 'help');
                if (helpDir) {
                    fs.writeFileSync(path.join(helpDir.dir, 'page.tsx'), content);
                    extractedFiles++;
                }
            }

            // ui/{child}/page.tsx → main-menu child pages (products, specifications, etc.)
            const childPageMatch = entryName.match(/ui\/([^/]+)\/page\.tsx$/);
            if (childPageMatch && childPageMatch[1] !== 'dashboard' && childPageMatch[1] !== 'help') {
                const childSlug = childPageMatch[1];
                const childDir = uiDirs.find(d => d.type === `main-child-${childSlug}`);
                if (childDir) {
                    fs.writeFileSync(path.join(childDir.dir, 'page.tsx'), content);
                    extractedFiles++;
                }
            }

            // api/route.ts → API route
            if (entryName.endsWith('api/route.ts')) {
                fs.writeFileSync(path.join(apiDir, 'route.ts'), content);
                extractedFiles++;
            }
        }

        if (extractedFiles === 0) {
            // Revert all directories if no files were extracted
            for (const { dir } of uiDirs) {
                fs.rmSync(dir, { recursive: true, force: true });
            }
            fs.rmSync(apiDir, { recursive: true, force: true });
            return NextResponse.json({ error: 'Invalid Plugin: Archive must contain recognizable UI or API files.' }, { status: 400 });
        }

        return NextResponse.json({
            success: true,
            message: `Plugin ${pluginConfig.name} installed successfully!`,
            pluginId: pluginId,
            installedDirs: uiDirs.map(d => d.type)
        });

    } catch (error: any) {
        console.error('Plugin Upload Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
