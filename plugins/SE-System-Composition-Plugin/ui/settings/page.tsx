'use client';
import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import type { User } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { Settings2, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function SECSettingsWrapper() {
    const [user, setUser] = useState<User | null>(null);
    useEffect(() => { getUser().then(setUser); }, []);
    return <DashboardLayout user={user}><SECSettingsPage /></DashboardLayout>;
}

function SECSettingsPage() {
    const [saving, setSaving] = useState(false);

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-50 dark:bg-background overflow-auto p-8">
            <div className="max-w-2xl mx-auto w-full space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-3"><Settings2 className="h-8 w-8 text-indigo-600" /> System Composition Settings</h1>
                        <p className="text-muted-foreground mt-2">Configure architectural defaults and nomenclature.</p>
                    </div>
                    <Button onClick={() => { setSaving(true); setTimeout(() => setSaving(false), 800) }} disabled={saving} className="bg-indigo-600 hover:bg-indigo-700">
                        <Save className="h-4 w-4 mr-2" /> {saving ? 'Saving...' : 'Save Preferences'}
                    </Button>
                </div>

                <Card className="shadow-none">
                    <CardHeader><CardTitle className="text-lg">General Preferences</CardTitle></CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label className="text-base">Strict Function Checking</Label>
                                <p className="text-sm text-muted-foreground">Require all technical functions to have a defined return type before saving.</p>
                            </div>
                            <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <Label className="text-base">Enable Audit Log Purging</Label>
                                <p className="text-sm text-muted-foreground">Automatically prune system audit logs older than 90 days.</p>
                            </div>
                            <Switch />
                        </div>
                        <div className="pt-4 border-t">
                            <Label className="text-base mb-2 block">Default View Mode</Label>
                            <Select defaultValue="card">
                                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="card">Card View (Visual)</SelectItem>
                                    <SelectItem value="table">Table View (Dense)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
