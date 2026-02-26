import { NextResponse } from 'next/server';
import AdmZip from 'adm-zip';
import fs from 'fs';
import path from 'path';
import { getUser } from '@/lib/auth';

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
            return NextResponse.json({ error: 'Invalid Plugin: plugin.json must defined a unique "id".' }, { status: 400 });
        }

        // 2. Define target installation directories
        const uiTargetDir = path.join(process.cwd(), 'src/app/settings', pluginId);
        const apiTargetDir = path.join(process.cwd(), 'src/app/api/plugins', pluginId);

        // Ensure directories exist
        if (!fs.existsSync(uiTargetDir)) fs.mkdirSync(uiTargetDir, { recursive: true });
        if (!fs.existsSync(apiTargetDir)) fs.mkdirSync(apiTargetDir, { recursive: true });

        // 3. Extract core files into the Next.js App Router hierarchy
        let extractedUI = false;
        let extractedAPI = false;

        // Write plugin.json to the UI folder so the sidebar layout can read it dynamically
        fs.writeFileSync(path.join(uiTargetDir, 'plugin.json'), pluginConfigContent);

        for (const entry of zipEntries) {
            if (entry.isDirectory) continue;

            if (entry.entryName.endsWith('ui/page.tsx')) {
                const content = zip.readAsText(entry);
                fs.writeFileSync(path.join(uiTargetDir, 'page.tsx'), content);
                extractedUI = true;
            }

            if (entry.entryName.endsWith('api/route.ts')) {
                const content = zip.readAsText(entry);
                fs.writeFileSync(path.join(apiTargetDir, 'route.ts'), content);
                extractedAPI = true;
            }
        }

        if (!extractedUI && !extractedAPI) {
            // Revert if completely invalid
            fs.rmSync(uiTargetDir, { recursive: true, force: true });
            fs.rmSync(apiTargetDir, { recursive: true, force: true });
            return NextResponse.json({ error: 'Invalid Plugin: Archive must contain ui/page.tsx or api/route.ts' }, { status: 400 });
        }

        return NextResponse.json({
            success: true,
            message: `Plugin ${pluginConfig.name} installed successfully!`,
            pluginId: pluginId
        });

    } catch (error: any) {
        console.error('Plugin Upload Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
