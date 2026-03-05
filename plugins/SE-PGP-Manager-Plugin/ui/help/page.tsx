'use client';
import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import type { User } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { HelpCircle, GitMerge, CheckSquare, Bookmark } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PGPHelpWrapper() {
    const [user, setUser] = useState<User | null>(null);
    useEffect(() => { getUser().then(setUser); }, []);
    return <DashboardLayout user={user}><PGPHelpPage /></DashboardLayout>;
}

function PGPHelpPage() {
    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-50 dark:bg-background overflow-auto p-8">
            <div className="max-w-4xl mx-auto w-full space-y-8">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3"><HelpCircle className="h-8 w-8 text-emerald-600" /> PGP Manager Help</h1>
                    <p className="text-muted-foreground mt-2">Learn how to manage your Product Generation Process via PBS and KDs.</p>
                </div>

                <div className="space-y-6">
                    <Card className="shadow-none border-t-emerald-500 border-t-4">
                        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><GitMerge className="h-5 w-5" /> Product Breakdown Structure (PBS)</CardTitle></CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">The <strong>PBS Tree</strong> allows you to build out the hierarchical deliverables required to achieve a system implementation. You can allocate specific budgets and compliance targets (e.g., ISO26262 ASIL targets) to each individual node. Nodes can be nested to create a clean Parent/Child breakdown.</p>
                        </CardContent>
                    </Card>

                    <Card className="shadow-none border-t-blue-500 border-t-4">
                        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><CheckSquare className="h-5 w-5" /> Key Decisions (KD) & Action Tracking</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h3 className="font-semibold text-sm">KD Lifecycles</h3>
                                <p className="text-sm text-muted-foreground">Key Decisions dictate progress passing between gates. KDs start at <strong>Pending</strong>, transition to <strong>In Progress</strong> when meetings/conduct happen, and end at <strong>Closed</strong> when signed off.</p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-sm">Action Items</h3>
                                <p className="text-sm text-muted-foreground">Attach actionable tracker items directly to a Key Decision. Action items have assignees and can be toggled straight from the KD card during a follow-up meeting.</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-none border-t-indigo-500 border-t-4">
                        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Bookmark className="h-5 w-5" /> System Composition Integration</CardTitle></CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                If you have the <strong>System Composition Manager</strong> plugin installed, the PGP Manager will automatically detect it. This unlocks the ability to explicitly map <code>Technical Functions</code> defined by systems engineers directly into the PBS nodes, ensuring business budgets align with written code interfaces.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
