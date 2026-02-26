import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getUser } from '@/lib/auth';

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

        // Define paths to delete
        const uiPath = path.join(process.cwd(), 'src/app/settings', pluginId);
        const apiPath = path.join(process.cwd(), 'src/app/api/plugins', pluginId);

        // Delete UI directory safely
        if (fs.existsSync(uiPath)) {
            fs.rmSync(uiPath, { recursive: true, force: true });
        }

        // Delete API directory safely
        if (fs.existsSync(apiPath)) {
            fs.rmSync(apiPath, { recursive: true, force: true });
        }

        return NextResponse.json({ success: true, message: `Plugin ${pluginId} uninstalled successfully.` });
    } catch (error: any) {
        console.error('Uninstall Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
