import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// All directories where plugins can be installed
const PLUGIN_SCAN_DIRS = [
    'src/app/settings',
    'src/app/dashboard/plugins',
    'src/app/plugins',
    'src/app/help',
];

export async function GET() {
    try {
        const pluginsMap = new Map<string, any>();

        for (const relDir of PLUGIN_SCAN_DIRS) {
            const scanPath = path.join(process.cwd(), relDir);
            if (!fs.existsSync(scanPath)) continue;

            const directories = fs.readdirSync(scanPath, { withFileTypes: true })
                .filter(dirent => dirent.isDirectory())
                .map(dirent => dirent.name);

            for (const dir of directories) {
                const pluginJsonPath = path.join(scanPath, dir, 'plugin.json');
                if (fs.existsSync(pluginJsonPath)) {
                    try {
                        const pluginContent = fs.readFileSync(pluginJsonPath, 'utf-8');
                        const plugin = JSON.parse(pluginContent);
                        // Deduplicate by plugin id (same plugin may be in multiple dirs)
                        if (!pluginsMap.has(plugin.id)) {
                            pluginsMap.set(plugin.id, plugin);
                        }
                    } catch (e) {
                        console.error(`Failed to parse plugin.json in ${relDir}/${dir}`);
                    }
                }
            }
        }

        return NextResponse.json({ success: true, plugins: Array.from(pluginsMap.values()) });
    } catch (error) {
        console.error('List Plugins Error:', error);
        return NextResponse.json({ success: false, error: 'Failed to list plugins', plugins: [] }, { status: 500 });
    }
}
