import DashboardLayout from '@/app/dashboard-layout';
import { getUser } from '@/lib/auth';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Fingerprint, Database, FileSearch, Clock } from 'lucide-react';

export default async function DataComplianceDashboardWidget() {
    const user = await getUser();
    const layoutUser = user ? { _id: user._id, username: user.username, roles: user.roles } : null;
    return (
        <DashboardLayout user={layoutUser}>
            <main className="flex-1 p-6 md:p-10 space-y-6">
                <div className="flex items-center gap-3">
                    <Fingerprint className="h-7 w-7 text-violet-500" />
                    <div>
                        <h1 className="text-2xl font-bold">Data Compliance</h1>
                        <p className="text-muted-foreground text-sm">Dashboard overview of data governance</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { icon: Database, label: 'Data Assets', value: '142', color: 'text-violet-500' },
                        { icon: FileSearch, label: 'Open DSARs', value: '7', color: 'text-amber-500' },
                        { icon: Clock, label: 'Overdue DSARs', value: '2', color: 'text-red-500' },
                        { icon: Fingerprint, label: 'Restricted Assets', value: '38', color: 'text-blue-500' },
                    ].map(({ icon: Icon, label, value, color }) => (
                        <Card key={label}>
                            <CardHeader className="pb-2 flex-row items-center gap-2">
                                <Icon className={`h-5 w-5 ${color}`} />
                                <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
                            </CardHeader>
                            <CardContent><p className="text-2xl font-bold">{value}</p></CardContent>
                        </Card>
                    ))}
                </div>
                <Card><CardContent className="pt-4"><p className="text-sm text-muted-foreground">View full details on the <a href="/compliance/data" className="underline text-primary">Data Compliance</a> page.</p></CardContent></Card>
            </main>
        </DashboardLayout>
    );
}
