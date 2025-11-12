
'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import DashboardLayout from '@/app/dashboard-layout';
import type { User } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { PlusCircle, Upload, GitMerge, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DeploymentDashboardPage() {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        getUser().then(setUser);
    }, []);

    return (
        <DashboardLayout user={user}>
            <main className="flex-1 p-6 md:p-10">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">Deployment Dashboard</h1>
                        <p className="text-muted-foreground">Centralized view of all worldwide deployments.</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline"><Upload className="mr-2 h-4 w-4" /> Upgrade Wizard</Button>
                        <Button><PlusCircle className="mr-2 h-4 w-4" /> New Deployment Wizard</Button>
                        <Button variant="outline"><GitMerge className="mr-2 h-4 w-4" /> Migration Wizard</Button>
                        <Button variant="destructive"><Trash2 className="mr-2 h-4 w-4" /> Decommission Wizard</Button>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Card className="col-span-1 lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Global Deployment View</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-96 bg-muted rounded-md flex items-center justify-center">
                                <p className="text-muted-foreground">Map placeholder</p>
                            </div>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle>Deployment by Product</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-96 bg-muted rounded-md flex items-center justify-center">
                                <p className="text-muted-foreground">Chart placeholder</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Deployment by Specifications</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <div className="h-64 bg-muted rounded-md flex items-center justify-center">
                                <p className="text-muted-foreground">Chart placeholder</p>
                            </div>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>User Widget</CardTitle>
                            <Button variant="ghost" size="sm">Remove</Button>
                        </CardHeader>
                        <CardContent>
                            <div className="h-64 bg-muted rounded-md flex items-center justify-center">
                                <p className="text-muted-foreground">User-defined widget</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

            </main>
        </DashboardLayout>
    );
}
