
'use client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import DashboardLayout from '@/app/dashboard-layout';
import { getUser } from '@/lib/auth';
import type { User } from '@/lib/definitions';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { SlidersHorizontal, Settings2, GanttChartSquare, DatabaseZap, HardDrive, CheckSquare } from 'lucide-react';

const settingsLinks = [
  { name: 'General', href: '/settings/general', icon: Settings2 },
  { name: 'Onboarding', href: '/settings/onboarding', icon: SlidersHorizontal },
  { name: 'Approval', href: '/settings/approval', icon: CheckSquare },
  { name: 'Specifications', href: '/settings/specifications', icon: HardDrive },
  { name: 'CMDB', href: '/settings/cmdb', icon: DatabaseZap },
  { name: 'Baseline', href: '/settings/baseline', icon: GanttChartSquare },
];

export default function SettingsPage() {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        getUser().then(setUser);
    }, []);

    return (
        <DashboardLayout user={user}>
            <main className="flex-1 p-6 md:p-10">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">Settings</h1>
                    <p className="text-muted-foreground">Manage your application settings and configurations.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {settingsLinks.map((setting) => (
                        <Link href={setting.href} key={setting.name}>
                            <Card className="hover:shadow-lg transition-shadow">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-lg font-medium">{setting.name}</CardTitle>
                                    <setting.icon className="h-6 w-6 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <p className="text-xs text-muted-foreground">Configure {setting.name.toLowerCase()} settings</p>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </main>
        </DashboardLayout>
    );
}
