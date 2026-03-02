import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getUser } from '@/lib/auth';

// All directories where plugin files can be installed
const PLUGIN_DIRS = [
    'src/app/settings',
    'src/app/dashboard/plugins',
    'src/app/plugins',
    'src/app/help',
    'src/app/api/plugins',
];

export async function DELETE(request: Request) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { pluginId } = await request.json();
        if (!pluginId) {
            return NextResponse.json({ error: 'Plugin ID is required' }, { status: 400 });
        }

        let deletedDirs = 0;

        // Delete plugin from all possible directories
        for (const relDir of PLUGIN_DIRS) {
            const pluginPath = path.join(process.cwd(), relDir, pluginId);
            if (fs.existsSync(pluginPath)) {
                fs.rmSync(pluginPath, { recursive: true, force: true });
                deletedDirs++;
            }
        }

        return NextResponse.json({
            success: true,
            message: `Plugin ${pluginId} uninstalled successfully. Cleaned ${deletedDirs} directories.`
        });
    } catch (error: any) {
        console.error('Uninstall Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
