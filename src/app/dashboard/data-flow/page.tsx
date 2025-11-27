"use client";
import { useEffect, useState } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import { getUser } from '@/lib/auth';
import type { User, Deployment, Baseline, Product } from '@/lib/definitions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip, Legend, Cell } from 'recharts';
import { Loader2, Move, Trash2 } from 'lucide-react';

type Flow = {
    id: string;
    _id?: string;
    name: string;
    productId: string;
    status: string;
    throughput: number;
    successRate: number;
    lagSeconds: number;
    lastRunAt: string;
    createdAt: string;
    createdBy: string;
    stages: { id: string; name: string; status: string }[];
};

function Widget({ title, children, description }: { title: string; children: React.ReactNode; description?: string }) {
    return (
        <Card className="flex flex-col">
            <CardHeader className="flex-row items-center justify-between">
                <div>
                    <CardTitle>{title}</CardTitle>
                    {description && <CardDescription>{description}</CardDescription>}
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="cursor-move h-8 w-8">
                        <Move className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="flex-1">{children}</CardContent>
        </Card>
    );
}

export default function DataFlowMgmtPage() {
    const [user, setUser] = useState<User | null>(null);
    const [deployments, setDeployments] = useState<Deployment[]>([]);
    const [baselines, setBaselines] = useState<Baseline[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [flows, setFlows] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [useFallback, setUseFallback] = useState(false);

    useEffect(() => {
        getUser().then(u => setUser(u as any));
        setLoading(true);
        Promise.all([
            fetch('/api/deployments').then(r => r.json()),
            fetch('/api/baselines').then(r => r.json()),
            fetch('/api/products').then(r => r.json()),
            fetch('/api/data-flows').then(r => r.json()),
        ])
        .then(([deploymentsData, baselinesData, productsData, dataflowsData]) => {
            setDeployments(deploymentsData);
            setBaselines(baselinesData);
            setProducts(productsData);
            setFlows(dataflowsData);
            if (!dataflowsData || dataflowsData.length === 0) {
                setUseFallback(true);
            }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }, []);

    function generateDummyFlows(count = 8): Flow[] {
        const names = [
            'Ingest - Telemetry',
            'Ingest - Metrics',
            'Transform - Aggregation',
            'Transform - Normalization',
            'Delivery - Warehouse',
            'Delivery - RealTime API',
            'Enrichment - UserProfiles',
            'Enrichment - RiskScores',
            'Batch - Nightly ETL',
            'Streaming - ClickStream',
            'Streaming - OrderEvents',
        ];
        const statuses = ['RUNNING', 'PAUSED', 'FAILED', 'IDLE'];
        const ret: Flow[] = [];
        for (let i = 0; i < count; i++) {
            const name = names[i % names.length];
            const productId = products?.[i % (products.length || 1)]?._id || `Product${(i % 3) + 1}`;
            const status = statuses[i % statuses.length];
            const throughput = Math.round(50 + Math.random() * 2000);
            const successRate = +(70 + Math.random() * 30).toFixed(2);
            const lagSeconds = Math.round(Math.random() * 500);
            const lastRunAt = new Date(Date.now() - Math.round(Math.random() * 1000 * 60 * 60 * 24)).toISOString();
            ret.push({
                id: `DF-${1000 + i}`,
                _id: `DF-${1000 + i}`,
                name: `${name} (${i + 1})`,
                productId,
                status,
                throughput,
                successRate,
                lagSeconds,
                lastRunAt,
                createdAt: new Date().toISOString(),
                createdBy: 'seed-user',
                stages: [
                    { id: `s-${i}-1`, name: 'Ingest', status: 'OK' },
                    { id: `s-${i}-2`, name: 'Transform', status: 'OK' },
                    { id: `s-${i}-3`, name: 'Deliver', status: status === 'FAILED' ? 'Failed' : 'OK' },
                ],
            });
        }
        return ret;
    }

    function generateDummyDeployments(productsData: Product[]): Deployment[] {
        const ret: Deployment[] = [];
        const names = productsData && productsData.length ? productsData : [
            { _id: 'OneStopShop', name: 'OneStopShop' } as Product,
            { _id: 'DataFabric', name: 'Data Fabric' } as Product,
            { _id: 'RetailSuite', name: 'Retail Suite' } as Product,
        ];
        for (let i = 0; i < 8; i++) {
            const product = names[i % names.length];
            ret.push({
                _id: `DEP-${2000 + i}`,
                productId: product._id,
                specificationId: 'spec1',
                hypervisorId: 'KVM',
                foundationComponentIds: [],
                security: {},
                details: {
                    deploymentId: `DEP-${2000 + i}`,
                    customer: 'ACME',
                },
                createdBy: 'seed-user',
                createdAt: new Date(Date.now() - i * 1000 * 60 * 60).toISOString(),
                status: i % 3 === 0 ? 'ACTIVE' : i % 3 === 1 ? 'UPGRADING' : 'PROVISIONING',
            });
        }
        return ret;
    }

    function generateDummyBaselines(): Baseline[] {
        return [
            {
                _id: 'BASE-OneStopShop_1.0.0',
                product: { id: 'OneStopShop', name: 'OneStopShop', version: '1.0.0' },
                specifications: [],
                tenants: [],
                status: 'DRAFT',
                validation_phases: [],
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                created_by: 'seed-user',
                artifacts: [],
                package_properties: {
                    location: '',
                    checksum_md5: '',
                    checksum_sha256: '',
                }
            }
        ];
    }

    function generateDummyProducts(): Product[] {
        return [
            { _id: 'OneStopShop', name: 'OneStopShop', owner: 'Acme', owner_email: 'acme@example.com', product_image: '', approval_needed: false, default_workflow: { id: 'StandardApproval', name: 'Standard Approval' }, custom_workflows: [], compliance_checks: [], deployment_type: { id: 'Cloud', name: 'Cloud' }, git_repo: '', artifacts_repo: '', pipeline: '', version: '1.0.0', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
            { _id: 'DataFabric', name: 'Data Fabric', owner: 'Acme', owner_email: 'acme@example.com', product_image: '', approval_needed: true, default_workflow: { id: 'StandardApproval', name: 'Standard Approval' }, custom_workflows: [], compliance_checks: [], deployment_type: { id: 'Cloud', name: 'Cloud' }, git_repo: '', artifacts_repo: '', pipeline: '', version: '1.0.0', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
            { _id: 'RetailSuite', name: 'Retail Suite', owner: 'Acme', owner_email: 'acme@example.com', product_image: '', approval_needed: true, default_workflow: { id: 'StandardApproval', name: 'Standard Approval' }, custom_workflows: [], compliance_checks: [], deployment_type: { id: 'Cloud', name: 'Cloud' }, git_repo: '', artifacts_repo: '', pipeline: '', version: '1.0.0', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        ] as Product[];
    }

    const effectiveFlows = useFallback ? generateDummyFlows(12) : flows;
    const statusCounts = effectiveFlows.reduce((acc: Record<string, number>, f: Flow) => {
        const key = (f.status || 'unknown').toString().toLowerCase();
        acc[key] = (acc[key] || 0) + 1;
        return acc;
    }, {});

    const statusData = Object.entries(statusCounts).map(([status, value]) => ({ name: status, value }));

    const throughputData = effectiveFlows.map((f: Flow) => ({ name: f.name, throughput: f.throughput }));

    const productDeployMap: Record<string, number> = {};
    const effectiveProducts = products.length ? products : generateDummyProducts();
    const effectiveBaselines = baselines.length ? baselines : generateDummyBaselines();
    const effectiveDeployments = deployments.length ? deployments : generateDummyDeployments(effectiveProducts);
    effectiveDeployments.forEach(d => {
        const productId = d.productId || d.details?.deploymentId; // fallback
        productDeployMap[productId] = (productDeployMap[productId] || 0) + 1;
    });

    const productDeploymentData = Object.entries(productDeployMap).map(([k, v]) => ({ name: effectiveProducts.find(p => p._id === k)?.name || k, value: v }));

    return (
        <DashboardLayout user={user}>
            <main className="flex-1 space-y-8 p-6 md:p-10">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Data Flow Management</h1>
                    <p className="mt-2 text-muted-foreground">Monitor and manage data pipelines, baseline rollouts, and deployments with real-time metrics.</p>
                </div>

                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="rounded-md border p-4">
                            <div className="text-sm text-muted-foreground">Active Pipelines</div>
                            <div className="text-2xl font-bold">{effectiveFlows.filter(f => f.status.toLowerCase() === 'running').length}</div>
                        </div>
                        <div className="rounded-md border p-4">
                            <div className="text-sm text-muted-foreground">Avg Success Rate</div>
                            <div className="text-2xl font-bold">{effectiveFlows.length ? (effectiveFlows.reduce((a, b) => a + (b.successRate || 0), 0) / effectiveFlows.length).toFixed(1) + '%' : '-'}</div>
                        </div>
                        <div className="rounded-md border p-4">
                            <div className="text-sm text-muted-foreground">Avg Lag (s)</div>
                            <div className="text-2xl font-bold">{effectiveFlows.length ? Math.round(effectiveFlows.reduce((a,b) => a + (b.lagSeconds || 0), 0) / effectiveFlows.length) : '-'}</div>
                        </div>
                        <div className="rounded-md border p-4">
                            <div className="text-sm text-muted-foreground">Total Throughput</div>
                            <div className="text-2xl font-bold">{effectiveFlows.length ? effectiveFlows.reduce((a,b) => a + (b.throughput || 0), 0) : '-'}</div>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">Data Flow Mgmt Widgets</div>
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={() => { setLoading(true); setUseFallback(false); Promise.all([fetch('/api/deployments').then(r => r.json()), fetch('/api/baselines').then(r => r.json()), fetch('/api/products').then(r => r.json()), fetch('/api/data-flows').then(r => r.json())]).then(([deploymentsData, baselinesData, productsData, dataflowsData]) => { setDeployments(deploymentsData); setBaselines(baselinesData); setProducts(productsData); setFlows(dataflowsData); setUseFallback(!dataflowsData || dataflowsData.length === 0); }).catch(console.error).finally(() => setLoading(false)); }}>
                                Refresh
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => { setUseFallback(true); setFlows(generateDummyFlows(12)); }}>
                                Use Demo Data
                            </Button>
                            {useFallback && <div className="bg-amber-100 text-amber-900 px-2 py-1 rounded-md text-xs">Demo Data</div>}
                        </div>
                    </div>
                    <div className="grid gap-6 md:grid-cols-3">
                        <Widget title="Pipeline Health" description="Overview of pipeline statuses">
                            {loading ? <div className="h-40 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin"/></div> : (
                                <ChartContainer config={{ running: {label: 'Running', color: 'var(--color-active)'}, paused: {label: 'Paused', color: 'var(--color-upgrading)'}, failed: {label: 'Failed', color: 'var(--color-failed)'}}} className="min-h-[160px]">
                                    <ResponsiveContainer width="100%" height={160}>
                                        <PieChart>
                                            <Tooltip content={<ChartTooltipContent />} />
                                            <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={40} outerRadius={70}>
                                                {statusData.map((entry, idx) => {
                                                    const colorMap: Record<string, string> = {
                                                        running: 'var(--color-active)',
                                                        paused: 'var(--color-upgrading)',
                                                        failed: 'var(--color-failed)',
                                                        idle: 'var(--color-provisioning)',
                                                    };
                                                    const fillColor = colorMap[(entry.name || '').toString().toLowerCase()] || 'var(--color-active)';
                                                    return <Cell key={`cell-${idx}`} fill={fillColor} />;
                                                })}
                                            </Pie>
                                        </PieChart>
                                    </ResponsiveContainer>
                                </ChartContainer>
                            )}
                        </Widget>

                        <Widget title="Throughput" description="Stream records/sec across pipelines">
                            {loading ? <div className="h-40 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin"/></div> : (
                                <ChartContainer config={{ throughput: { label: 'Throughput', color: 'var(--color-active)' } }} className="min-h-[160px]">
                                    <ResponsiveContainer width="100%" height={160}>
                                        <BarChart data={throughputData}>
                                            <CartesianGrid vertical={false} />
                                            <XAxis dataKey="name" tickLine={false} axisLine={false} />
                                            <YAxis />
                                            <Tooltip content={<ChartTooltipContent />} />
                                            <Bar dataKey="throughput" fill="var(--color-active)" radius={[4,4,0,0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </ChartContainer>
                            )}
                        </Widget>

                        <Widget title="Deployments by Product" description="Number of deployments by product">
                            {loading ? <div className="h-40 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin"/></div> : (
                                <ChartContainer config={{ value: { label: 'Deployments' } }} className="min-h-[160px]">
                                    <ResponsiveContainer width="100%" height={160}>
                                        <BarChart data={productDeploymentData}>
                                            <CartesianGrid vertical={false} />
                                            <XAxis dataKey="name" tickLine={false} axisLine={false} />
                                            <YAxis />
                                            <Tooltip content={<ChartTooltipContent />} />
                                            <Bar dataKey="value" fill="var(--color-active)" radius={[4,4,0,0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </ChartContainer>
                            )}
                        </Widget>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        <Widget title="Recent Dataflows" description="Latest data pipelines and events">
                            {loading ? <div className="h-40 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin"/></div> : (
                                <div className="space-y-2">
                                    {effectiveFlows.map(flow => (
                                        <div key={flow._id || flow.id} className="flex items-center justify-between rounded-md border p-3">
                                            <div>
                                                <div className="font-medium">{flow.name}</div>
                                                <div className="text-sm text-muted-foreground">Product: {effectiveProducts.find(p => p._id === flow.productId)?.name || flow.productId} • Status: {flow.status} • Success: {flow.successRate}%</div>
                                            </div>
                                            <div className="text-xs text-muted-foreground">Last Run: {new Date(flow.lastRunAt).toLocaleString()}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Widget>

                        <Widget title="Recent Deployments & Baselines" description="Latest baseline and deployment activity">
                            {loading ? <div className="h-40 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin"/></div> : (
                                <div className="space-y-2">
                                    <div className="font-medium text-sm">Recent Deployments</div>
                                    {effectiveDeployments.slice(0, 5).map((d: Deployment) => (
                                        <div key={d._id || d.details?.deploymentId} className="flex items-center justify-between rounded-md border p-3">
                                            <div>
                                                <div className="font-medium">{d.details?.deploymentId || d._id}</div>
                                                <div className="text-sm text-muted-foreground">Product: {d.productId} • Status: {d.status}</div>
                                            </div>
                                            <div className="text-xs text-muted-foreground">{new Date(d.createdAt).toLocaleString?.() ?? d.createdAt}</div>
                                        </div>
                                    ))}
                                    <div className="mt-2 font-medium text-sm">Recent Baselines</div>
                                    {effectiveBaselines.slice(0, 5).map((b: Baseline) => (
                                        <div key={b._id} className="flex items-center justify-between rounded-md border p-3">
                                            <div>
                                                <div className="font-medium">{b.product?.name} v{b.product?.version}</div>
                                                <div className="text-sm text-muted-foreground">Status: {b.status}</div>
                                            </div>
                                            <div className="text-xs text-muted-foreground">{new Date(b.created_at).toLocaleString?.() ?? b.created_at}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Widget>
                    </div>
                </div>
            </main>
        </DashboardLayout>
    );
}
