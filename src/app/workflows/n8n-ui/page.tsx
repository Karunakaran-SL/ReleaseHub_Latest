
'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import type { User } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { Loader2 } from 'lucide-react';

export default function N8nUiPage() {
    const [user, setUser] = useState<User | null>(null);
    const [n8nUrl, setN8nUrl] = useState('http://localhost:5678');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getUser().then(setUser);
        // In a real app, you would fetch the configured n8n URL from your settings API
        // For now, we'll just use the default localhost URL.
        setLoading(false);
    }, []);

    return (
        <DashboardLayout user={user}>
            <main className="flex-1 flex flex-col bg-muted/40 h-[calc(100vh-7rem)]">
                {loading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                ) : (
                    <iframe
                        src={n8nUrl}
                        className="w-full h-full min-h-[400px] border-0 block"
                        title="Default Workflow Editor"
                    />
                )}
            </main>
        </DashboardLayout>
    );
}
