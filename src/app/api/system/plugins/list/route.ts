import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
    try {
        const settingsPath = path.join(process.cwd(), 'src/app/settings');
        const plugins = [];

        if (fs.existsSync(settingsPath)) {
            const directories = fs.readdirSync(settingsPath, { withFileTypes: true })
                .filter(dirent => dirent.isDirectory())
                .map(dirent => dirent.name);

            for (const dir of directories) {
                const pluginJsonPath = path.join(settingsPath, dir, 'plugin.json');
                if (fs.existsSync(pluginJsonPath)) {
                    try {
                        const pluginContent = fs.readFileSync(pluginJsonPath, 'utf-8');
                        plugins.push(JSON.parse(pluginContent));
                    } catch (e) {
                        console.error(`Failed to parse plugin.json in ${dir}`);
                    }
                }
            }
        }

        return NextResponse.json({ success: true, plugins });
    } catch (error) {
        console.error('List Plugins Error:', error);
        return NextResponse.json({ success: false, error: 'Failed to list plugins', plugins: [] }, { status: 500 });
    }
}
