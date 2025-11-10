
'use client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import DashboardLayout from '@/app/dashboard-layout';
import { getUser } from '@/lib/auth';
import type { User } from '@/lib/definitions';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Workflow, Database, ShieldCheck, Ship, Network } from 'lucide-react';

const cmdbSettings = [
  { name: 'Workflows', href: '/settings/cmdb/workflows', icon: Workflow },
  { name: 'CMDBs', href: '/settings/cmdb/cmdb-items', icon: Database },
  { name: 'Compliance Checks', href: '/settings/cmdb/compliance-checks', icon: ShieldCheck },
  { name: 'Deployment Types', href: '/settings/cmdb/deployment-types', icon: Ship },
  { name: 'Interface Types', href: '/cmdb/interface-types', icon: Network },
];

export default function CmdbSettingsPage() {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        getUser().then(setUser);
    }, []);

    return (
        <DashboardLayout user={user}>
            <main className="flex-1 p-6 md:p-10">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">CMDB Settings</h1>
                    <p className="text-muted-foreground">Manage the reference tables and lookup data for the CMDB.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {cmdbSettings.map((setting) => (
                        <Link href={setting.href} key={setting.name}>
                            <Card className="hover:shadow-lg transition-shadow">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-lg font-medium">{setting.name}</CardTitle>
                                    <setting.icon className="h-6 w-6 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <p className="text-xs text-muted-foreground">Manage {setting.name.toLowerCase()}</p>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </main>
        </DashboardLayout>
    );
}
