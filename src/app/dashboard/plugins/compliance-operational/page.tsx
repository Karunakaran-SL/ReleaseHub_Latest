import DashboardLayout from '@/app/dashboard-layout';
import { getUser } from '@/lib/auth';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { UserCheck, ClipboardList, AlertCircle, CheckCircle2 } from 'lucide-react';

export default async function OperationalComplianceDashboardWidget() {
    const user = await getUser();
    const layoutUser = user ? { _id: user._id, username: user.username, roles: user.roles } : null;
    return (
        <DashboardLayout user={layoutUser}>
            <main className="flex-1 p-6 md:p-10 space-y-6">
                <div className="flex items-center gap-3">
                    <UserCheck className="h-7 w-7 text-teal-500" />
                    <div>
                        <h1 className="text-2xl font-bold">Operational Compliance</h1>
                        <p className="text-muted-foreground text-sm">Dashboard overview of operational controls</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { icon: ClipboardList, label: 'Active SOPs', value: '18', color: 'text-teal-500' },
                        { icon: CheckCircle2, label: 'Approved SOPs', value: '15', color: 'text-green-500' },
                        { icon: AlertCircle, label: 'Open Deviations', value: '4', color: 'text-orange-500' },
                        { icon: UserCheck, label: 'Pending Review', value: '3', color: 'text-amber-500' },
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
                <Card><CardContent className="pt-4"><p className="text-sm text-muted-foreground">View full details on the <a href="/compliance/operational" className="underline text-primary">Operational Compliance</a> page.</p></CardContent></Card>
            </main>
        </DashboardLayout>
    );
}
