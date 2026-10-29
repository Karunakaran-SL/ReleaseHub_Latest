'use client';
import React, { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import type { User } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Smartphone, Bell, Wifi, RefreshCw, Save } from 'lucide-react';

const API = '/api/plugins/cm-mobile';

export default function MobileWrapper() {
    const [user, setUser] = useState<User | null>(null);
    useEffect(() => { getUser().then(setUser); }, []);
    return <DashboardLayout user={user}><MobilePage /></DashboardLayout>;
}

function MobilePage() {
    const [config, setConfig] = useState<any>({});
    const [saving, setSaving] = useState(false);

    const fetchAll = useCallback(async () => {
        const r = await fetch(API).then(r => r.json());
        if (r.data) setConfig(r.data);
    }, []);
    useEffect(() => { fetchAll(); }, [fetchAll]);

    const save = async () => {
        setSaving(true);
        await fetch(API, { method: 'POST', body: JSON.stringify(config) });
        setSaving(false);
    };

    const toggle = (key: string) => setConfig((prev: any) => ({ ...prev, [key]: !prev[key] }));

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-50 dark:bg-background">
            <div className="border-b bg-background px-6 py-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-cyan-100 text-cyan-700 rounded-lg flex items-center justify-center"><Smartphone className="h-5 w-5" /></div>
                    <div><h1 className="text-xl font-bold">Mobile Experience</h1><p className="text-sm text-muted-foreground">Push notifications & offline configuration</p></div>
                </div>
                <div className="flex gap-2"><Button variant="outline" onClick={fetchAll}><RefreshCw className="h-4 w-4" /></Button><Button className="bg-cyan-600 hover:bg-cyan-700" onClick={save} disabled={saving}><Save className="h-4 w-4 mr-2" />{saving ? 'Saving…' : 'Save Settings'}</Button></div>
            </div>
            <div className="flex-1 overflow-auto p-6 space-y-4 max-w-lg">
                <Card className="shadow-none">
                    <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Bell className="h-4 w-4" />Push Notifications</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        {[
                            { key: 'enablePushNotifications', label: 'Enable Push Notifications', desc: 'Allow in-app and device notifications.' },
                            { key: 'pushNotifyOnAssessmentDue', label: 'Assessment Reminders', desc: 'Notify when an assessment is due.' },
                            { key: 'pushNotifyOnCertExpiry', label: 'Certification Expiry Alerts', desc: 'Notify 90 days before cert expiry.' },
                            { key: 'pushNotifyOnNewOpportunity', label: 'New Opportunities', desc: 'Notify when a talent marketplace opportunity matches your skills.' },
                        ].map(s => (
                            <div key={s.key} className="flex items-center justify-between">
                                <div><p className="text-sm font-medium">{s.label}</p><p className="text-xs text-muted-foreground">{s.desc}</p></div>
                                <Switch checked={!!config[s.key]} onCheckedChange={() => toggle(s.key)} />
                            </div>
                        ))}
                    </CardContent>
                </Card>
                <Card className="shadow-none">
                    <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Wifi className="h-4 w-4" />Offline & Appearance</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div><p className="text-sm font-medium">Offline Mode</p><p className="text-xs text-muted-foreground">Cache skill data for offline access.</p></div>
                            <Switch checked={!!config.enableOfflineMode} onCheckedChange={() => toggle('enableOfflineMode')} />
                        </div>
                        <div>
                            <Label className="text-sm block mb-2">Mobile Theme</Label>
                            <Select value={config.mobileTheme || 'system'} onValueChange={v => setConfig({ ...config, mobileTheme: v })}>
                                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                                <SelectContent><SelectItem value="system">System Default</SelectItem><SelectItem value="light">Light</SelectItem><SelectItem value="dark">Dark</SelectItem></SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
