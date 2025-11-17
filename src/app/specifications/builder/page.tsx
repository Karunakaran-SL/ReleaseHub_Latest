
'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import type { User } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HardDrive, Server } from 'lucide-react';

export default function SpecificationBuilderPage() {
    const [user, setUser] = useState<User | null>(null);
    const [builderMode, setBuilderMode] = useState<'hardware' | 'vm' | null>(null);

    useEffect(() => {
        getUser().then(setUser);
    }, []);

    const renderInitialSelection = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setBuilderMode('hardware')}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><HardDrive /> Hardware Specification</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Define physical hardware specifications for Rack, Blade, or Tower servers for Air-Gapped and On-Prem environments.</p>
                </CardContent>
            </Card>
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setBuilderMode('vm')}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Server /> Data Center VM Specification</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Define virtual machine specifications including size, resources, and connectivity for data center deployments.</p>
                </CardContent>
            </Card>
        </div>
    );
    
    const renderWizard = () => {
        return (
             <div>
                <Button onClick={() => setBuilderMode(null)}>Back to Selection</Button>
                <h2 className="text-2xl font-bold mt-4">
                    Building a {builderMode === 'hardware' ? 'Hardware' : 'VM'} Specification
                </h2>
                <p className="text-muted-foreground">This multi-step wizard is under construction.</p>
            </div>
        )
    }

    return (
        <DashboardLayout user={user}>
            <main className="flex-1 p-6 md:p-10">
                 <div className="mb-8">
                    <h1 className="text-3xl font-bold">Specification Builder</h1>
                    <p className="text-muted-foreground">
                        A guided wizard to define hardware and VM specifications.
                    </p>
                </div>
                
                 <Card>
                    <CardHeader>
                        <CardTitle>Select Specification Type</CardTitle>
                        <CardDescription>Choose the type of specification you want to build.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {builderMode ? renderWizard() : renderInitialSelection()}
                    </CardContent>
                </Card>

            </main>
        </DashboardLayout>
    );
}
