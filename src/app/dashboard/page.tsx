
'use client';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Move, Trash2, Rocket, FileCode, Users, HardDrive, Puzzle, AppWindow, Plug, BarChart3, PieChart as PieChartIcon, FileText } from 'lucide-react';
import DashboardLayout from '@/app/dashboard-layout';
import { getUser } from '@/lib/auth';
import type { User, Deployment, Product, Baseline, CmdbTenant, CmdbComponent, CmdbApplication } from '@/lib/definitions';
import { Loader2 } from 'lucide-react';
import { Bar, BarChart, Pie, PieChart, Cell, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import Link from 'next/link';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search, Plus } from 'lucide-react';

const DeploymentMap = dynamic(() => import('@/app/fleet-management/deployment/_components/deployment-map'), {
    ssr: false,
    loading: () => <div className="h-full bg-muted rounded-md flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
});

const statusColors: Record<string, string> = {
    DRAFT: 'bg-gray-200 text-gray-800',
    VALIDATING: 'bg-blue-200 text-blue-800',
    VALIDATED: 'bg-indigo-200 text-indigo-800',
    RELEASED: 'bg-green-200 text-green-800',
    ARCHIVED: 'bg-red-200 text-red-800',
    REJECTED: 'bg-red-300 text-red-900',
    PROVISIONING: 'bg-yellow-200 text-yellow-800',
    ACTIVE: 'bg-green-200 text-green-800',
    FAILED: 'bg-red-200 text-red-800',
    UPGRADING: 'bg-blue-200 text-blue-800',
    UPGRADE_APPROVAL: 'bg-orange-200 text-orange-800',
    DECOMMISSIONED: 'bg-gray-300 text-gray-900',
};

function Widget({ title, children, description, onRemove }: { title: string, children: React.ReactNode, description?: string, onRemove?: () => void }) {
    return (
        <Card className="flex flex-col group relative">
            <CardHeader className='flex-row items-center justify-between'>
                <div>
                    <CardTitle className="text-lg">{title}</CardTitle>
                    {description && <CardDescription className="line-clamp-1">{description}</CardDescription>}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="cursor-move h-7 w-7">
                        <Move className="h-3.5 w-3.5" />
                    </Button>
                    {onRemove && (
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onRemove}>
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent className="flex-1">
                {children}
            </CardContent>
        </Card>
    )
}

function GlobalViewWidget({ deployments, loading }: { deployments: Deployment[], loading: boolean }) {
    return (
        <Widget title="Global View" description="Worldwide operational status of all deployments.">
            <div className="h-[60vh]">
                {loading ? <div className="h-full bg-muted rounded-md flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div> : <DeploymentMap deployments={deployments} />}
            </div>
        </Widget>
    );
}

const chartConfig = {
    active: { label: 'Active', color: 'hsl(var(--chart-2))' },
    upgrading: { label: 'Upgrading', color: 'hsl(var(--chart-3))' },
    provisioning: { label: 'Provisioning', color: 'hsl(var(--chart-4))' },
    failed: { label: 'Failed', color: 'hsl(var(--chart-1))' },
    decommissioned: { label: 'Decommissioned', color: 'hsl(var(--chart-5))' },
    compliant: { label: 'Compliant', color: 'hsl(var(--chart-2))' },
    noncompliant: { label: 'Non-Compliant', color: 'hsl(var(--chart-1))' },
    unknown: { label: 'Unknown', color: 'hsl(var(--chart-5))' },
    tenants: { label: 'Tenants', color: 'hsl(var(--chart-2))' },
};

function DeploymentStatusPieChart({ deployments, loading }: { deployments: Deployment[], loading: boolean }) {
    const deploymentStatusData = Object.entries(
        deployments.reduce((acc, d) => {
            acc[d.status] = (acc[d.status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>)
    ).map(([name, value]) => ({ name, value }));

    return (
        <Widget title="Deployments by Status">
            {loading ? (
                <div className="h-full flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
            ) : (
                <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                            <Pie data={deploymentStatusData} dataKey="value" nameKey="name" >
                                {deploymentStatusData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={`var(--color-${entry.name.toLowerCase()})`} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                </ChartContainer>
            )}
        </Widget>
    );
}

function BaselineComplianceChart({ baselines, loading }: { baselines: Baseline[], loading: boolean }) {
    const complianceData = baselines.reduce((acc, b) => {
        const status = b.status === 'RELEASED' ? 'Compliant' : 'Non-Compliant';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const baselineComplianceData = Object.entries(complianceData).map(([name, value]) => ({ name, value, fill: name === 'Compliant' ? 'var(--color-compliant)' : 'var(--color-noncompliant)' }));

    return (
        <Widget title="Baseline Compliance">
            {loading ? (
                <div className="h-full flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
            ) : (
                <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={baselineComplianceData} layout="vertical" margin={{ left: 20 }}>
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Bar dataKey="value" layout="vertical" radius={5}>
                                {baselineComplianceData.map((entry) => (
                                    <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>
            )}
        </Widget>
    );
}

function ProductDeploymentChart({ deployments, products, loading }: { deployments: Deployment[], products: Product[], loading: boolean }) {
    const productDeploymentData = products.map(product => {
        const productDeployments = deployments.filter(d => d.productId === product._id);
        return {
            name: product.name,
            active: productDeployments.filter(d => d.status === 'ACTIVE').length,
            upgrading: productDeployments.filter(d => d.status === 'UPGRADING').length,
            failed: productDeployments.filter(d => d.status === 'FAILED').length,
        };
    });

    return (
        <Widget title="Deployments by Product">
            {loading ? (
                <div className="h-full flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
            ) : (
                <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={productDeploymentData}>
                            <CartesianGrid vertical={false} />
                            <XAxis dataKey="name" tickLine={false} axisLine={false} />
                            <YAxis />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Legend />
                            <Bar dataKey="active" stackId="a" fill="var(--color-active)" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="upgrading" stackId="a" fill="var(--color-upgrading)" />
                            <Bar dataKey="failed" stackId="a" fill="var(--color-failed)" />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>
            )}
        </Widget>
    )
}

function ProductTenantChart({ products, tenants }: { products: Product[], tenants: CmdbTenant[] }) {
    const productTenantData = products.map(p => ({
        name: p.name,
        tenants: tenants.filter(t => t.products?.some(prod => prod.id === p._id)).length
    }));

    return (
        <Widget title="Tenants per Product">
            <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={productTenantData}>
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="name" tickLine={false} axisLine={false} />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="tenants" fill="var(--color-tenants)" radius={4} />
                    </BarChart>
                </ResponsiveContainer>
            </ChartContainer>
        </Widget>
    )
}

export default function DashboardPage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [deployments, setDeployments] = useState<Deployment[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [baselines, setBaselines] = useState<Baseline[]>([]);
    const [tenants, setTenants] = useState<CmdbTenant[]>([]);
    const [components, setComponents] = useState<CmdbComponent[]>([]);
    const [applications, setApplications] = useState<CmdbApplication[]>([]);
    const [pluginWidgets, setPluginWidgets] = useState<any[]>([]);
    const [pluginWidgetData, setPluginWidgetData] = useState<Record<string, any>>({});
    const [activeWidgetIds, setActiveWidgetIds] = useState<string[]>([]);
    const [isAddWidgetOpen, setIsAddWidgetOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const CORE_WIDGETS = [
        { id: 'global-view', title: 'Global View', description: 'Worldwide operational status map.', icon: <Rocket className="h-4 w-4" />, size: 'full' },
        { id: 'deployment-status', title: 'Deployments by Status', description: 'Breakdown of deployment states.', icon: <PieChartIcon className="h-4 w-4" />, size: 'half' },
        { id: 'baseline-compliance', title: 'Baseline Compliance', description: 'Compliant vs Non-Compliant baselines.', icon: <FileCode className="h-4 w-4" />, size: 'half' },
        { id: 'product-deployment', title: 'Deployments by Product', description: 'Stacked bar chart of product health.', icon: <BarChart3 className="h-4 w-4" />, size: 'half' },
        { id: 'product-tenant', title: 'Tenants per Product', description: 'Number of tenants assigned per product.', icon: <Users className="h-4 w-4" />, size: 'half' },
        { id: 'recent-baselines', title: 'Recent Baselines', description: 'List of the last 5 created baselines.', icon: <FileText className="h-4 w-4" />, size: 'half' },
        { id: 'recent-deployments', title: 'Recent Deployments', description: 'List of the last 5 operational changes.', icon: <HardDrive className="h-4 w-4" />, size: 'half' },
    ];

    useEffect(() => {
        getUser().then(setUser);

        // Load active widgets from localStorage or use default
        const savedWidgets = localStorage.getItem('dashboard_widgets');
        if (savedWidgets) {
            setActiveWidgetIds(JSON.parse(savedWidgets));
        } else {
            setActiveWidgetIds(['global-view', 'deployment-status', 'baseline-compliance', 'product-deployment', 'product-tenant', 'recent-baselines', 'recent-deployments']);
        }

        async function fetchData() {
            setLoading(true);
            try {
                const [deploymentsRes, productsRes, baselinesRes, tenantsRes, componentsRes, applicationsRes] = await Promise.all([
                    fetch('/api/deployments'),
                    fetch('/api/products'),
                    fetch('/api/baselines'),
                    fetch('/api/cmdb/tenants'),
                    fetch('/api/cmdb/components'),
                    fetch('/api/cmdb/applications')
                ]);
                setDeployments(await deploymentsRes.json());
                setProducts(await productsRes.json());
                setBaselines(await baselinesRes.json());
                setTenants(await tenantsRes.json());
                setComponents(await componentsRes.json());
                setApplications(await applicationsRes.json());
            } catch (error) {
                console.error("Failed to load dashboard data", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();

        // Fetch plugin widgets
        fetch('/api/system/plugins/list')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    const widgetPlugins = data.plugins.filter((p: any) => p.widgets && p.widgets.length > 0);
                    setPluginWidgets(widgetPlugins);
                    // Fetch data for each widget plugin
                    widgetPlugins.forEach((plugin: any) => {
                        fetch(`/api/plugins/${plugin.id}`)
                            .then(res => res.json())
                            .then(widgetData => {
                                setPluginWidgetData(prev => ({ ...prev, [plugin.id]: widgetData }));
                            })
                            .catch(() => { });
                    });
                }
            })
            .catch(() => { });
    }, []);

    const toggleWidget = (id: string) => {
        const newIds = activeWidgetIds.includes(id)
            ? activeWidgetIds.filter(i => i !== id)
            : [...activeWidgetIds, id];
        setActiveWidgetIds(newIds);
        localStorage.setItem('dashboard_widgets', JSON.stringify(newIds));
    };

    const removeWidget = (id: string) => {
        const newIds = activeWidgetIds.filter(i => i !== id);
        setActiveWidgetIds(newIds);
        localStorage.setItem('dashboard_widgets', JSON.stringify(newIds));
    };

    const allAvailableWidgets = [
        ...CORE_WIDGETS.map(w => ({ ...w, source: 'Core' })),
        ...pluginWidgets.flatMap(p => (p.widgets || []).map((w: any) => ({
            id: `plugin-${p.id}-${w.id}`,
            originalId: w.id,
            pluginId: p.id,
            title: w.title,
            description: w.description,
            icon: <Plug className="h-4 w-4" />,
            source: p.name,
            isPlugin: true
        })))
    ];

    const filteredWidgets = allAvailableWidgets.filter(w =>
        w.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.source.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <DashboardLayout user={user}>
            <main className="flex-1 space-y-8 p-6 md:p-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                        <p className="mt-2 text-muted-foreground">Your central hub for monitoring and managing all operations.</p>
                    </div>
                    <Dialog open={isAddWidgetOpen} onOpenChange={setIsAddWidgetOpen}>
                        <DialogTrigger asChild>
                            <Button className="gap-2">
                                <Plus className="h-4 w-4" /> Add Widget
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
                            <DialogHeader>
                                <DialogTitle>Add Widgets</DialogTitle>
                                <DialogDescription>
                                    Customize your dashboard by adding widgets from core features and installed plugins.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="relative my-4">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search widgets by name, description or source..."
                                    className="pl-9"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                                {filteredWidgets.map((widget) => {
                                    const isActive = activeWidgetIds.includes(widget.id);
                                    return (
                                        <div
                                            key={widget.id}
                                            className={cn(
                                                "flex items-center justify-between p-3 rounded-lg border transition-colors",
                                                isActive ? "bg-muted/50 border-primary/50" : "hover:bg-muted/30"
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-md bg-background border">
                                                    {widget.icon}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-sm">{widget.title}</p>
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="outline" className="text-[10px] py-0 px-1 h-4">
                                                            {widget.source}
                                                        </Badge>
                                                        <span className="text-xs text-muted-foreground line-clamp-1">
                                                            {widget.description}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <Button
                                                size="sm"
                                                variant={isActive ? "destructive" : "default"}
                                                onClick={() => toggleWidget(widget.id)}
                                            >
                                                {isActive ? "Remove" : "Add"}
                                            </Button>
                                        </div>
                                    );
                                })}
                                {filteredWidgets.length === 0 && (
                                    <div className="text-center py-8 text-muted-foreground">
                                        No widgets found matching your search.
                                    </div>
                                )}
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                    <Card><CardHeader className="pb-2"><CardDescription>Products</CardDescription><CardTitle className="text-4xl">{loading ? <Loader2 className="h-8 w-8 animate-spin" /> : products.length}</CardTitle></CardHeader></Card>
                    <Card><CardHeader className="pb-2"><CardDescription>Tenants</CardDescription><CardTitle className="text-4xl">{loading ? <Loader2 className="h-8 w-8 animate-spin" /> : tenants.length}</CardTitle></CardHeader></Card>
                    <Card><CardHeader className="pb-2"><CardDescription>Components</CardDescription><CardTitle className="text-4xl">{loading ? <Loader2 className="h-8 w-8 animate-spin" /> : components.length}</CardTitle></CardHeader></Card>
                    <Card><CardHeader className="pb-2"><CardDescription>Applications</CardDescription><CardTitle className="text-4xl">{loading ? <Loader2 className="h-8 w-8 animate-spin" /> : applications.length}</CardTitle></CardHeader></Card>
                    <Card><CardHeader className="pb-2"><CardDescription>Baselines</CardDescription><CardTitle className="text-4xl">{loading ? <Loader2 className="h-8 w-8 animate-spin" /> : baselines.length}</CardTitle></CardHeader></Card>
                    <Card><CardHeader className="pb-2"><CardDescription>Deployments</CardDescription><CardTitle className="text-4xl">{loading ? <Loader2 className="h-8 w-8 animate-spin" /> : deployments.length}</CardTitle></CardHeader></Card>
                </div>

                <div className="space-y-6">
                    {/* Render Core Widgets */}
                    {activeWidgetIds.includes('global-view') && <GlobalViewWidget deployments={deployments} loading={loading} />}

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
                        {activeWidgetIds.includes('deployment-status') && <DeploymentStatusPieChart deployments={deployments} loading={loading} />}
                        {activeWidgetIds.includes('baseline-compliance') && <BaselineComplianceChart baselines={baselines} loading={loading} />}
                        {activeWidgetIds.includes('product-deployment') && <ProductDeploymentChart deployments={deployments} products={products} loading={loading} />}
                        {activeWidgetIds.includes('product-tenant') && <ProductTenantChart products={products} tenants={tenants} />}
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        {activeWidgetIds.includes('recent-baselines') && (
                            <Widget
                                title="Recent Baselines"
                                description="The last 5 baselines that were created or updated."
                                onRemove={() => removeWidget('recent-baselines')}
                            >
                                <Table>
                                    <TableHeader><TableRow><TableHead>Product</TableHead><TableHead>Version</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
                                    <TableBody>
                                        {loading ? <TableRow><TableCell colSpan={4} className="text-center h-24"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></TableCell></TableRow>
                                            : baselines.slice(0, 5).map(b => (
                                                <TableRow key={b._id}>
                                                    <TableCell>
                                                        <Link href={`/release-management/baseline/${b._id}/summary`} className="font-medium hover:underline">{b.product.name}</Link>
                                                    </TableCell>
                                                    <TableCell>{b.product.version}</TableCell>
                                                    <TableCell><Badge className={cn(statusColors[b.status] || 'bg-gray-200')}>{b.status}</Badge></TableCell>
                                                    <TableCell>{format(parseISO(b.updated_at), 'PPP')}</TableCell>
                                                </TableRow>
                                            ))}
                                    </TableBody>
                                </Table>
                            </Widget>
                        )}
                        {activeWidgetIds.includes('recent-deployments') && (
                            <Widget
                                title="Recent Deployments"
                                description="The last 5 deployments that were created or updated."
                                onRemove={() => removeWidget('recent-deployments')}
                            >
                                <Table>
                                    <TableHeader><TableRow><TableHead>Deployment ID</TableHead><TableHead>Customer</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
                                    <TableBody>
                                        {loading ? <TableRow><TableCell colSpan={4} className="text-center h-24"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></TableCell></TableRow>
                                            : deployments.slice(0, 5).map(d => (
                                                <TableRow key={d._id}>
                                                    <TableCell>
                                                        <Link href={`/fleet-management/deployment/${d._id}/view`} className="font-medium hover:underline font-mono text-xs">{d.details.deploymentId}</Link>
                                                    </TableCell>
                                                    <TableCell>{d.details.customer}</TableCell>
                                                    <TableCell><Badge className={cn(statusColors[d.status] || 'bg-gray-200')}>{d.status}</Badge></TableCell>
                                                    <TableCell>{format(parseISO(d.createdAt), 'PPP')}</TableCell>
                                                </TableRow>
                                            ))}
                                    </TableBody>
                                </Table>
                            </Widget>
                        )}
                    </div>

                    {/* Plugin Widgets */}
                    <div className="space-y-4">
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {pluginWidgets.flatMap((plugin: any) =>
                                (plugin.widgets || []).map((widget: any) => {
                                    const id = `plugin-${plugin.id}-${widget.id}`;
                                    if (!activeWidgetIds.includes(id)) return null;

                                    const data = pluginWidgetData[plugin.id];
                                    return (
                                        <Widget
                                            key={id}
                                            title={widget.title}
                                            description={widget.description}
                                            onRemove={() => removeWidget(id)}
                                        >
                                            {data ? (
                                                <div className="space-y-3">
                                                    {data.data && (
                                                        <div className="grid grid-cols-2 gap-3">
                                                            {Object.entries(data.data).filter(([k]) => k !== 'timestamp' && k !== 'user').map(([key, value]) => (
                                                                <div key={key} className="p-3 rounded-lg bg-muted/50">
                                                                    <p className="text-xs text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                                                                    <p className="text-lg font-semibold">{String(value)}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                    <p className="text-xs text-muted-foreground">From plugin: {plugin.name}</p>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-center h-20">
                                                    <Loader2 className="h-6 w-6 animate-spin" />
                                                </div>
                                            )}
                                        </Widget>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </DashboardLayout>
    );
}
