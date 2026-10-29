'use client';
import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import type { User } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { Settings, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function PGPSettingsWrapper() {
    const [user, setUser] = useState<User | null>(null);
    useEffect(() => { getUser().then(setUser); }, []);
    return <DashboardLayout user={user}><PGPSettingsPage /></DashboardLayout>;
}

function PGPSettingsPage() {
    const [saving, setSaving] = useState(false);

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-50 dark:bg-background overflow-auto p-8">
            <div className="max-w-2xl mx-auto w-full space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-3"><Settings className="h-8 w-8 text-emerald-600" /> PGP Settings</h1>
                        <p className="text-muted-foreground mt-2">Configure budgeting parameters and process strictness.</p>
                    </div>
                    <Button onClick={() => { setSaving(true); setTimeout(() => setSaving(false), 800) }} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">
                        <Save className="h-4 w-4 mr-2" /> {saving ? 'Saving...' : 'Save Preferences'}
                    </Button>
                </div>

                <Card className="shadow-none">
                    <CardHeader><CardTitle className="text-lg">Key Decision Process</CardTitle></CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label className="text-base">Block KD Closure on Open Actions</Label>
                                <p className="text-sm text-muted-foreground">Prevent moving a KD to &quot;Closed&quot; if there are pending actions assigned to it.</p>
                            </div>
                            <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <Label className="text-base">Require Owner Assignment</Label>
                                <p className="text-sm text-muted-foreground">All KDs and Actions must have an explicit owner defined before saving.</p>
                            </div>
                            <Switch defaultChecked />
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-none">
                    <CardHeader><CardTitle className="text-lg">Budgeting & Tracking</CardTitle></CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label className="text-base">Budget Currency Code</Label>
                                <p className="text-sm text-muted-foreground">Default currency for all PBS node inputs.</p>
                            </div>
                            <div className="w-32"><Input defaultValue="USD" /></div>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <Label className="text-base">Enforce Parent Budget Limits</Label>
                                <p className="text-sm text-muted-foreground">Ensure sum of child PBS node budgets do not exceed their parent&apos;s budget.</p>
                            </div>
                            <Switch />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
