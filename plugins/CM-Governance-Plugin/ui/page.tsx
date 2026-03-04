'use client';
import React, { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import type { User } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollText, RefreshCw, User as UserIcon } from 'lucide-react';

const API = '/api/plugins/cm-governance';

export default function GovernanceWrapper() {
    const [user, setUser] = useState<User | null>(null);
    useEffect(() => { getUser().then(setUser); }, []);
    return <DashboardLayout user={user}><GovernancePage /></DashboardLayout>;
}

function GovernancePage() {
    const [logs, setLogs] = useState<any[]>([]);
    const fetchAll = useCallback(async () => {
        const r = await fetch(API).then(r => r.json());
        if (r.data) setLogs(r.data);
    }, []);
    useEffect(() => { fetchAll(); }, [fetchAll]);

    const moduleColor = (m: string) => {
        const map: Record<string, string> = { 'cm-skill-taxonomy': 'bg-blue-50 text-blue-700', 'cm-employee-profiles': 'bg-emerald-50 text-emerald-700', 'cm-assessments': 'bg-orange-50 text-orange-700', 'cm-certifications': 'bg-yellow-50 text-yellow-700', 'cm-competency-risk': 'bg-red-50 text-red-700' };
        return map[m] || 'bg-slate-50 text-slate-700';
    };

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-50 dark:bg-background">
            <div className="border-b bg-background px-6 py-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-slate-100 text-slate-700 rounded-lg flex items-center justify-center"><ScrollText className="h-5 w-5" /></div>
                    <div><h1 className="text-xl font-bold">Security & Governance</h1><p className="text-sm text-muted-foreground">Immutable audit trail — {logs.length} events logged</p></div>
                </div>
                <Button variant="outline" onClick={fetchAll}><RefreshCw className="h-4 w-4" /></Button>
            </div>
            <div className="flex-1 overflow-auto p-6 space-y-2">
                {logs.length === 0 && <div className="text-center py-16 text-muted-foreground border rounded-xl bg-white dark:bg-slate-900/30">No audit events yet. Actions across all CM plugins are logged here.</div>}
                {logs.map((l, i) => (
                    <div key={l._id?.toString() || i} className="flex items-center gap-3 bg-white dark:bg-slate-900/30 rounded-lg p-3 border text-sm">
                        <span className="text-xs text-muted-foreground w-36 shrink-0">{l.timestamp ? new Date(l.timestamp).toLocaleString() : '–'}</span>
                        <Badge className={`text-[10px] border shrink-0 ${moduleColor(l.module)}`}>{l.module?.replace('cm-', '')}</Badge>
                        <Badge variant="outline" className="text-[10px] shrink-0">{l.action}</Badge>
                        <span className="flex-1 text-xs text-muted-foreground truncate">{l.entityId}</span>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0"><UserIcon className="h-3 w-3" />{l.performedBy}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
