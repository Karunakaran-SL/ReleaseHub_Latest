'use client';
import React, { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import type { User } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { Settings2, Save, Code, Database, GitBranch, ShieldCheck, Layers, FolderGit2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const API = '/api/plugins/sdk-capability-marketplace';

export default function CapSettingsWrapper() {
    const [user, setUser] = useState<User | null>(null);
    useEffect(() => { getUser().then(setUser); }, []);
    return <DashboardLayout user={user}><CapSettingsPage /></DashboardLayout>;
}

function CapSettingsPage() {
    const [langs, setLangs] = useState<any[]>([]);
    const [saving, setSaving] = useState(false);

    // Mock data for new sections
    const categories = [
        { id: 'db', name: 'Databases', count: 4 },
        { id: 'msg', name: 'Messaging Systems', count: 2 },
        { id: 'obs', name: 'Observability Tools', count: 2 },
        { id: 'sec', name: 'Security Integrations', count: 3 },
        { id: 'storage', name: 'Storage Services', count: 2 },
        { id: 'sdk', name: 'Internal Platform SDKs', count: 5 },
        { id: 'infra', name: 'Infrastructure Services', count: 1 },
        { id: 'gov', name: 'Platform Governance Modules', count: 1 },
        { id: 'cache', name: 'Cache', count: 1 },
        { id: 'ips', name: 'Internal Platform Services', count: 5 }
    ];

    const fetchAll = useCallback(async () => {
        const l = await fetch(`${API}?module=languages`).then(r => r.json());
        if (l.data) setLangs(l.data);
    }, []);
    useEffect(() => { fetchAll(); }, [fetchAll]);

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-50 dark:bg-background overflow-auto p-8">
            <div className="max-w-3xl mx-auto w-full space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-3"><Settings2 className="h-8 w-8 text-indigo-600" /> Marketplace Settings</h1>
                        <p className="text-muted-foreground mt-2">Manage language registries and governance policies.</p>
                    </div>
                </div>

                <Card className="shadow-none">
                    <CardHeader>
                        <CardTitle className="text-lg">Governance Policies</CardTitle>
                        <CardDescription>Rules on capability publishing</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label className="text-base">Require Approval</Label>
                                <p className="text-sm text-muted-foreground">Force all new capabilities into PENDING_APPROVAL state.</p>
                            </div>
                            <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <Label className="text-base">Strict Language Coverage</Label>
                                <p className="text-sm text-muted-foreground">Block capability publish if requested languages lack defined dependency blocks.</p>
                            </div>
                            <Switch />
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-none border-t-pink-500 border-t-4">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2"><ShieldCheck className="h-5 w-5" /> Capability Approval Workflow</CardTitle>
                        <CardDescription>Configure the approval process for new capabilities</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label className="text-base">Security Review Required</Label>
                                <p className="text-sm text-muted-foreground">Mandate security team sign-off before publishing.</p>
                            </div>
                            <Switch defaultChecked />
                        </div>
                        <div className="space-y-3">
                            <Label>Default Approver Group</Label>
                            <Input defaultValue="platform-engineering-leads" />
                            <p className="text-xs text-muted-foreground">AD or Okta group responsible for reviewing new submissions.</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-none border-t-purple-500 border-t-4">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg flex items-center gap-2"><Layers className="h-5 w-5" /> Capability Categories</CardTitle>
                                <CardDescription>Manage capability classifications (Databases, Messaging, etc.)</CardDescription>
                            </div>
                            <Button size="sm" variant="outline">Add Category</Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {categories.map(c => (
                                <div key={c.id} className="border rounded-lg p-4 bg-white dark:bg-slate-900 flex justify-between items-center">
                                    <h3 className="font-medium">{c.name}</h3>
                                    <span className="bg-slate-100 dark:bg-slate-800 text-xs py-1 px-2 rounded-full border">{c.count} Capabilities</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-none border-t-indigo-500 border-t-4">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg flex items-center gap-2"><Code className="h-5 w-5" /> Language Registry</CardTitle>
                                <CardDescription>Supported programming languages & build tools configuration</CardDescription>
                            </div>
                            <Button size="sm" variant="outline">Add Language</Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {langs.map(l => (
                                <div key={l.id} className="border rounded-lg p-4 bg-white dark:bg-slate-900 border-l-4 border-l-slate-400">
                                    <h3 className="font-bold mb-2">{l.name} <span className="text-xs font-mono text-muted-foreground font-normal">({l.id})</span></h3>
                                    <div className="grid grid-cols-2 gap-4 text-sm mt-3 pt-3 border-t">
                                        <div>
                                            <p className="text-xs text-muted-foreground mb-1 uppercase font-semibold">Frameworks</p>
                                            <p>{(l.frameworks || []).join(', ') || 'None'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground mb-1 uppercase font-semibold">Build Tools</p>
                                            <p>{(l.buildTools || []).join(', ') || 'None'}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {langs.length === 0 && <p className="text-sm text-muted-foreground">No languages registered. Refresh DB or use the Dashboard seed button.</p>}
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-none border-t-amber-500 border-t-4">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg flex items-center gap-2"><FolderGit2 className="h-5 w-5" /> Template Repository</CardTitle>
                                <CardDescription>Storage location and sync settings for plugin templates</CardDescription>
                            </div>
                            <Button size="sm" variant="outline" className="gap-2"><Save className="h-4 w-4" /> Sync Now</Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Git Repository URL</Label>
                            <Input defaultValue="git@github.com:internal/marketplace-templates.git" />
                        </div>
                        <div className="space-y-2">
                            <Label>Branch/Tag</Label>
                            <Input defaultValue="main" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-none border-t-emerald-500 border-t-4">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2"><GitBranch className="h-5 w-5" /> Version Management</CardTitle>
                        <CardDescription>Policies for versioning and deprecation</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label className="text-base">Allow Multiple Active Versions</Label>
                                <p className="text-sm text-muted-foreground">Permit multiple versions of the same capability (e.g. Kafka 2.0 and 3.0) to be active simultaneously.</p>
                            </div>
                            <Switch defaultChecked />
                        </div>
                        <div className="space-y-3">
                            <Label>Deprecation Grace Period (Days)</Label>
                            <Input type="number" defaultValue={90} />
                            <p className="text-xs text-muted-foreground">Number of days a capability remains available after being marked deprecated.</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-none border-t-cyan-500 border-t-4">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">Dashboard Widgets</CardTitle>
                        <CardDescription>Configure which widgets are visible for Platform Teams</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label className="text-base">Top Used Capabilities</Label>
                                <p className="text-sm text-muted-foreground">Show widgets for the most adopted capabilities.</p>
                            </div>
                            <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <Label className="text-base">Language Adoption</Label>
                                <p className="text-sm text-muted-foreground">Show programming languages usage chart.</p>
                            </div>
                            <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <Label className="text-base">Capability Health</Label>
                                <p className="text-sm text-muted-foreground">Show active vs deprecated capabilities metrics.</p>
                            </div>
                            <Switch defaultChecked />
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-none border-t-red-500 border-t-4">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">Security & Governance Roles</CardTitle>
                        <CardDescription>Map IDP groups to marketplace roles</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Platform Admin Group</Label>
                            <Input defaultValue="marketplace-admins" />
                            <p className="text-xs text-muted-foreground">Has full access to publish, deprecate, and approve capabilities.</p>
                        </div>
                        <div className="space-y-2">
                            <Label>Capability Maintainer Group</Label>
                            <Input defaultValue="marketplace-maintainers" />
                            <p className="text-xs text-muted-foreground">Can publish and edit owned capabilities.</p>
                        </div>
                        <div className="space-y-2">
                            <Label>Developer Group</Label>
                            <Input defaultValue="marketplace-consumers" />
                            <p className="text-xs text-muted-foreground">Can view and consume capabilities in the SDK generator.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
