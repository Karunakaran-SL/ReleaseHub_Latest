
'use client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import DashboardLayout from '@/app/dashboard-layout';
import { getUser } from '@/lib/auth';
import type { User } from '@/lib/definitions';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { SlidersHorizontal, Settings2, GanttChartSquare, DatabaseZap, HardDrive, CheckSquare, Info, GitBranch, ShieldCheck } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { isAdminRole } from '@/lib/role-utils';

const settingsLinks = [
    { name: 'General', href: '/settings/general', icon: Settings2 },
    { name: 'Onboarding', href: '/settings/onboarding', icon: SlidersHorizontal },
    { name: 'Approval', href: '/settings/approval', icon: CheckSquare },
    { name: 'CI/CD', href: '/settings/cicd', icon: GitBranch },
    { name: 'Specifications', href: '/settings/specifications', icon: HardDrive },
    { name: 'CMDB', href: '/settings/cmdb', icon: DatabaseZap },
    { name: 'Baseline', href: '/settings/baseline', icon: GanttChartSquare },
];

const adminOnlyLinks = [
    { name: 'User Management', href: '/settings/user-management', icon: ShieldCheck, description: 'Manage users, roles & permissions' },
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

                <Accordion type="single" collapsible defaultValue="item-1" className="mb-8">
                    <AccordionItem value="item-1">
                        <AccordionTrigger className="text-lg font-semibold">
                            <div className="flex items-center gap-2">
                                <Info className="h-5 w-5" />
                                Introduction
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                            The Settings section is the administrative heart of the application. Here, you can configure the foundational data and processes that drive the entire platform, including onboarding workflows, approval steps, and reference data for CMDB entities and hardware specifications.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {settingsLinks.map((setting) => (
                        <Card key={setting.name} className="hover:shadow-lg transition-shadow">
                            <Link href={setting.href} className="block h-full p-6">
                                <div className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-lg font-medium">{setting.name}</CardTitle>
                                    <setting.icon className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Configure {setting.name.toLowerCase()} settings</p>
                                </div>
                            </Link>
                        </Card>
                    ))}
                </div>

                {isAdminRole(user?.role) && (
                    <>
                        <div className="mt-8 mb-4">
                            <h2 className="text-xl font-semibold flex items-center gap-2">
                                <ShieldCheck className="h-5 w-5 text-blue-500" />
                                Administration
                            </h2>
                            <p className="text-sm text-muted-foreground">Admin-only settings for user and system management.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {adminOnlyLinks.map((setting) => (
                                <Card key={setting.name} className="hover:shadow-lg transition-shadow border-blue-200 dark:border-blue-900">
                                    <Link href={setting.href} className="block h-full p-6">
                                        <div className="flex flex-row items-center justify-between pb-2">
                                            <CardTitle className="text-lg font-medium">{setting.name}</CardTitle>
                                            <setting.icon className="h-6 w-6 text-blue-500" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">{setting.description}</p>
                                        </div>
                                    </Link>
                                </Card>
                            ))}
                        </div>
                    </>
                )}
            </main>
        </DashboardLayout>
    );
}
