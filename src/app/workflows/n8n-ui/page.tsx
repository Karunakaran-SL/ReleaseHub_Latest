
"use client";
import { useState, useEffect, useRef } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import type { User } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { Loader2 } from 'lucide-react';

export default function N8nUiPage() {
    const [user, setUser] = useState<User | null>(null);
    const [n8nUrl, setN8nUrl] = useState('http://localhost:5678');
    const [loading, setLoading] = useState(true);
    const iframeRef = useRef<HTMLIFrameElement | null>(null);
    const [iframeLoaded, setIframeLoaded] = useState(false);
    const [iframeTimeout, setIframeTimeout] = useState(false);
    const [retryKey, setRetryKey] = useState(0);

    useEffect(() => {
        // normalize user shape: some server methods return `id` while our app types expect `_id`
        getUser().then((u) => {
            if (!u) return setUser(null);
            if ((u as any)._id) return setUser(u as unknown as User);
            return setUser({ ...(u as any), _id: (u as any).id } as unknown as User);
        });
        // In a real app, you would fetch the configured n8n URL from your settings API
        // For now, we'll just use the default localhost URL.
        setLoading(false);
    }, []);

    // start a timeout to show the overlay if the iframe hasn't loaded yet
    useEffect(() => {
        if (loading) return;
        setIframeTimeout(false);
        setIframeLoaded(false);
        const timer = setTimeout(() => {
            if (!iframeLoaded) setIframeTimeout(true);
        }, 2500);
        return () => clearTimeout(timer);
    }, [loading, retryKey]);

    return (
        <DashboardLayout user={user}>
            <main className="flex-1 flex flex-col items-stretch">
                {loading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                ) : (
                    <div className="relative w-full h-[calc(100vh-7rem)]">
                        <iframe
                            key={retryKey}
                            ref={iframeRef}
                            src={n8nUrl}
                            className="absolute inset-0 w-full h-full border-0"
                            title="Default Workflow Editor"
                            loading="lazy"
                            allowFullScreen
                            onLoad={() => {
                                setIframeLoaded(true);
                                setIframeTimeout(false);
                            }}
                            onError={() => setIframeTimeout(true)}
                        />
                        {iframeTimeout && !iframeLoaded && (
                            <div className="absolute inset-0 flex items-center justify-center bg-muted/40">
                                <div className="p-4 rounded bg-white shadow-md">
                                    <p className="mb-2">n8n appears blocked in the iframe or is taking too long to respond.</p>
                                    <div className="flex gap-2">
                                        <a className="btn" href={n8nUrl} target="_blank" rel="noreferrer">Open in new tab</a>
                                        <button
                                            className="btn"
                                            onClick={() => {
                                                if (!iframeRef.current) return;
                                                // force a reload of the iframe safely by bumping the src
                                                iframeRef.current.src = `${n8nUrl}?r=${Date.now()}`;
                                                setIframeTimeout(false);
                                                setIframeLoaded(false);
                                                // increment retryKey to re-run the overlay timer
                                                setRetryKey((k) => k + 1);
                                            }}
                                        >
                                            Retry
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </DashboardLayout>
    );
}
