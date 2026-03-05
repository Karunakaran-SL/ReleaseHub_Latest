'use client';
import React, { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import type { User } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlugZap, CheckCircle, XCircle, RefreshCw, Wifi, WifiOff } from 'lucide-react';

const API = '/api/plugins/cm-integrations';

export default function IntegrationsWrapper() {
    const [user, setUser] = useState<User | null>(null);
    useEffect(() => { getUser().then(setUser); }, []);
    return <DashboardLayout user={user}><IntegrationsPage /></DashboardLayout>;
}

function IntegrationsPage() {
    const [integrations, setIntegrations] = useState<any[]>([]);
    const [syncing, setSyncing] = useState<string | null>(null);

    const fetchAll = useCallback(async () => {
        const r = await fetch(API).then(r => r.json());
        if (r.data) setIntegrations(r.data);
    }, []);
    useEffect(() => { fetchAll(); }, [fetchAll]);

    const sync_ = async (id: string) => {
        setSyncing(id);
        await fetch(API, { method: 'POST', body: JSON.stringify({ actionType: 'SYNC', id }) });
        setSyncing(null);
        fetchAll();
    };

    const toggle = async (int_: any) => {
        await fetch(API, { method: 'POST', body: JSON.stringify({ ...int_, status: int_.status === 'connected' ? 'disconnected' : 'connected' }) });
        fetchAll();
    };

    const typeColor = (t: string) => t === 'HRIS' ? 'bg-blue-50 text-blue-700' : t === 'LMS' ? 'bg-emerald-50 text-emerald-700' : 'bg-purple-50 text-purple-700';

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-50 dark:bg-background">
            <div className="border-b bg-background px-6 py-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-slate-100 text-slate-700 rounded-lg flex items-center justify-center"><PlugZap className="h-5 w-5" /></div>
                    <div><h1 className="text-xl font-bold">Integrations</h1><p className="text-sm text-muted-foreground">{integrations.filter(i => i.status === 'connected').length} connected · {integrations.filter(i => i.status !== 'connected').length} disconnected</p></div>
                </div>
                <Button variant="outline" onClick={fetchAll}><RefreshCw className="h-4 w-4" /></Button>
            </div>
            <div className="flex-1 overflow-auto p-6 grid md:grid-cols-2 lg:grid-cols-3 gap-4 content-start">
                {integrations.map(i => (
                    <Card key={i.id} className="shadow-none">
                        <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                                <Badge className={`text-[10px] border ${typeColor(i.type)}`}>{i.type}</Badge>
                                {i.status === 'connected' ? <CheckCircle className="h-5 w-5 text-emerald-500" /> : <XCircle className="h-5 w-5 text-slate-300" />}
                            </div>
                            <p className="font-semibold text-sm mb-1">{i.name}</p>
                            <p className="text-xs text-muted-foreground mb-3">{i.description}</p>
                            <div className="text-xs text-muted-foreground mb-4">
                                <p>Sync: {i.syncFrequency}</p>
                                {i.lastSync && <p>Last: {new Date(i.lastSync).toLocaleDateString()}</p>}
                            </div>
                            <div className="flex gap-2">
                                <Button size="sm" variant="outline" className="flex-1 h-7 text-xs" onClick={() => toggle(i)}>
                                    {i.status === 'connected' ? <><WifiOff className="h-3 w-3 mr-1" />Disconnect</> : <><Wifi className="h-3 w-3 mr-1" />Connect</>}
                                </Button>
                                {i.status === 'connected' && <Button size="sm" className="flex-1 h-7 text-xs bg-slate-700 hover:bg-slate-800" onClick={() => sync_(i.id)} disabled={syncing === i.id}>
                                    <RefreshCw className={`h-3 w-3 mr-1 ${syncing === i.id ? 'animate-spin' : ''}`} />Sync
                                </Button>}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
