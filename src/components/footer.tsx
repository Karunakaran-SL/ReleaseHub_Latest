
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { AuditLog } from '@/lib/definitions';
import { formatDistanceToNow } from 'date-fns';

export default function Footer() {
    const [latestLog, setLatestLog] = useState<AuditLog | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchLatestLog() {
            try {
                const res = await fetch('/api/audits?limit=1');
                if (res.ok) {
                    const data = await res.json();
                    if (data.length > 0) {
                        setLatestLog(data[0]);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch latest audit log:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchLatestLog();
    }, []);

    const formatLogMessage = (log: AuditLog) => {
        let actionText = '';
        switch (log.action) {
            case 'CREATE': actionText = 'created'; break;
            case 'UPDATE': actionText = 'updated'; break;
            case 'DELETE': actionText = 'deleted'; break;
        }
        return `${log.user} ${actionText} the ${log.entity} "${log.comment}"`;
    }

    return (
        <footer className="fixed bottom-0 left-0 z-40 w-full border-t bg-background text-foreground">
            <div className="flex h-12 items-center justify-between px-4 md:px-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-4">
                     <p>&copy; {new Date().getFullYear()} ReleaseHub. All rights reserved.</p>
                     <div className="hidden md:flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        <span>All Systems Operational</span>
                    </div>
                </div>
                <div className="flex items-center">
                    {loading ? (
                        <span>Loading latest activity...</span>
                    ) : latestLog ? (
                        <Link href="/audits" className="hover:underline hover:text-foreground transition-colors">
                           <span className='font-semibold'>Latest Activity:</span> {formatLogMessage(latestLog)} ({formatDistanceToNow(new Date(latestLog.timestamp), { addSuffix: true })})
                        </Link>
                    ) : (
                        <span>No recent activity.</span>
                    )}
                </div>
            </div>
        </footer>
    );
}
