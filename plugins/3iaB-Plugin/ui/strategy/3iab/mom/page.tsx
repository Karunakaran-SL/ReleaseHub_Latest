'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import type { User } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { BookOpenText, CheckSquare, Save, Lock, AlertCircle, CalendarDays, Plus } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function MomManagerWrapper() {
    const [user, setUser] = useState<User | null>(null);
    useEffect(() => {
        getUser().then(setUser);
    }, []);
    return (
        <DashboardLayout user={user}>
            <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
                <MomManager />
            </div>
        </DashboardLayout>
    );
}

function MomManager() {
    const [status, setStatus] = useState<'Draft' | 'Closed'>('Draft');

    return (
        <div className="space-y-6 max-w-5xl mx-auto border rounded-xl overflow-hidden bg-background shadow-sm h-full flex flex-col min-h-[80vh]">
            <div className="bg-slate-50 dark:bg-slate-900/50 p-6 border-b flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Badge variant="outline" className="text-indigo-600 bg-indigo-50 border-indigo-200"><CalendarDays className="h-3 w-3 mr-1" /> WK 13 - 2026</Badge>
                        <Badge variant="outline" className="font-mono">3IAB-01</Badge>
                        <Badge variant={status === 'Closed' ? 'secondary' : 'default'} className={status === 'Draft' ? 'bg-amber-500' : ''}>
                            {status === 'Closed' ? <Lock className="h-3 w-3 mr-1" /> : <BookOpenText className="h-3 w-3 mr-1" />}
                            {status}
                        </Badge>
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight">Minutes of Meeting</h2>
                    <p className="text-sm text-muted-foreground mt-1">Payment Gateway Sync</p>
                </div>
                <div className="flex gap-2">
                    {status === 'Draft' ? (
                        <>
                            <Button variant="outline"><Save className="h-4 w-4 mr-2" /> Save Draft</Button>
                            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setStatus('Closed')}>
                                <Lock className="h-4 w-4 mr-2" /> Close & Lock Meeting
                            </Button>
                        </>
                    ) : (
                        <Alert className="bg-slate-50 w-64 pt-2 pb-2">
                            <Lock className="h-4 w-4" />
                            <AlertDescription className="text-xs">Meeting locked on March 24, 2026. Audit logs immutable.</AlertDescription>
                        </Alert>
                    )}
                </div>
            </div>

            <div className="p-6 grid grid-cols-3 gap-8 flex-1">
                <div className="col-span-2 space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Meeting Notes</h3>
                        <Textarea
                            className="min-h-[300px] font-mono text-sm resize-none bg-slate-50/50"
                            placeholder="Document the discussion here..."
                            defaultValue={status === 'Closed' ? "1. Discussed API limitations with external Auth provider.\n2. Agreed to use internal circuit breaker strategy.\n3. Marcus will provide schema by EOW." : ""}
                            readOnly={status === 'Closed'}
                        />
                    </div>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader className="pb-3 border-b">
                            <CardTitle className="text-base flex items-center justify-between">
                                <span className="flex items-center gap-2"><CheckSquare className="h-4 w-4 text-indigo-500" /> Action Items</span>
                                {status === 'Draft' && <Button variant="ghost" size="sm" className="h-6"><Plus className="h-4 w-4" /></Button>}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-3">
                            <div className="text-sm p-3 border rounded-md bg-white dark:bg-slate-900 border-indigo-200 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                                <p className="font-medium mb-1">Create API Schema for Auth</p>
                                <div className="flex justify-between items-end mt-2">
                                    <Badge variant="outline" className="text-[10px]">Marcus W.</Badge>
                                    <span className="text-xs text-emerald-600 font-medium tracking-tight">Tracked</span>
                                </div>
                            </div>
                            <div className="text-sm p-3 border rounded-md bg-white dark:bg-slate-900 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-slate-300"></div>
                                <p className="font-medium mb-1">Schedule risk review with Security</p>
                                <div className="flex justify-between items-end mt-2">
                                    <Badge variant="outline" className="text-[10px]">Sarah J.</Badge>
                                    {status === 'Draft' && <Button variant="link" className="h-auto p-0 text-[10px] text-indigo-600">Sync to Tracker</Button>}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {status === 'Draft' && (
                        <Card className="border-amber-200 bg-amber-50/30">
                            <CardContent className="p-4 flex items-start gap-3">
                                <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                                <div className="text-sm text-amber-800">
                                    <p className="font-semibold mb-1">Action Items required</p>
                                    <p>Any newly typed action items here will be automatically registered in the Actions Tracker when the meeting is Closed & Locked.</p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
