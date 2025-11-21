'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import DashboardLayout from '@/app/dashboard-layout';
import type { User, Product, Deployment } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { Loader2, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DependencyTreeSidebar } from './_components/dependency-tree';
import { ResourceDetailsView } from './_components/resource-details-view';
import Link from 'next/link';

export default function DetailedResourceViewPage() {
    const [user, setUser] = useState<User | null>(null);
    const { toast } = useToast();

    const [products, setProducts] = useState<Product[]>([]);
    const [deployments, setDeployments] = useState<Deployment[]>([]);
    
    const [selectedProductId, setSelectedProductId] = useState<string>('');
    const [selectedDeploymentId, setSelectedDeploymentId] = useState<string>('');
    
    const [dependencyTree, setDependencyTree] = useState<any | null>(null);
    const [selectedNode, setSelectedNode] = useState<any | null>(null);

    const [loading, setLoading] = useState({ products: true, deployments: true, tree: false });

    useEffect(() => {
        getUser().then(setUser);
        async function fetchInitialData() {
            setLoading(p => ({...p, products: true, deployments: true}));
            try {
                const [productsRes, deploymentsRes] = await Promise.all([
                    fetch('/api/products'),
                    fetch('/api/deployments'),
                ]);
                if (productsRes.ok) {
                    const data = await productsRes.json();
                    setProducts(data);
                    if (data.length > 0) {
                        setSelectedProductId(data[0]._id);
                    }
                }
                if (deploymentsRes.ok) setDeployments(await deploymentsRes.json());
            } catch (error) {
                toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch initial data.' });
            } finally {
                setLoading(p => ({...p, products: false, deployments: false}));
            }
        }
        fetchInitialData();
    }, [toast]);
    
    const productDeployments = deployments.filter(d => d.productId === selectedProductId);

    useEffect(() => {
        if (productDeployments.length > 0) {
            if (!productDeployments.find(d => d._id === selectedDeploymentId)) {
                setSelectedDeploymentId(productDeployments[0]._id);
            }
        } else {
            setSelectedDeploymentId('');
            setDependencyTree(null);
        }
    }, [selectedProductId, productDeployments, selectedDeploymentId]);

    useEffect(() => {
        if (!selectedDeploymentId) {
            setDependencyTree(null);
            setSelectedNode(null);
            return;
        };

        async function fetchTree() {
            setLoading(p => ({...p, tree: true}));
            try {
                // Using the dependency tree for a product, which we can adapt.
                const res = await fetch(`/api/dependency-tree/product/${selectedProductId}`);
                if (!res.ok) throw new Error('Failed to fetch dependency data.');
                const tree = await res.json();
                
                // Add dummy resource data to the tree
                const addResourceData = (node: any): any => {
                    const isComponentOrApp = node.entityType === 'component' || node.entityType === 'application';
                    const isTenant = node.entityType === 'tenant';
                    
                    const allocatedCpu = isComponentOrApp ? Math.floor(Math.random() * 8) + 1 : (isTenant ? 32 : 128);
                    const allocatedMem = isComponentOrApp ? Math.floor(Math.random() * 16) + 2 : (isTenant ? 128 : 512);
                    const allocatedSto = isComponentOrApp ? Math.floor(Math.random() * 100) + 20 : (isTenant ? 1024 : 4096);

                    return {
                        ...node,
                        resources: {
                            allocated: { cpu: allocatedCpu, memory: allocatedMem, storage: allocatedSto },
                            used: { 
                                cpu: Math.floor(allocatedCpu * (Math.random() * 0.6 + 0.2)), 
                                memory: Math.floor(allocatedMem * (Math.random() * 0.7 + 0.1)),
                                storage: Math.floor(allocatedSto * (Math.random() * 0.8 + 0.1))
                            }
                        },
                        tenants: node.tenants?.map(addResourceData),
                        components: node.components?.map(addResourceData),
                        applications: node.applications?.map(addResourceData),
                    };
                };
                
                const treeWithResources = addResourceData(tree);
                setDependencyTree(treeWithResources);
                setSelectedNode(treeWithResources);
            } catch (error: any) {
                toast({ variant: 'destructive', title: 'Error loading tree', description: error.message });
                setDependencyTree(null);
            } finally {
                setLoading(p => ({...p, tree: false}));
            }
        }
        fetchTree();
    }, [selectedDeploymentId, selectedProductId, toast]);

    return (
        <DashboardLayout user={user}>
            <div className="flex-1 flex flex-col h-full">
                <header className="p-4 border-b flex items-center justify-between gap-4">
                     <div className="flex items-center gap-4">
                        <h1 className="text-2xl font-bold">Detailed Resource View</h1>
                        <Select value={selectedProductId} onValueChange={setSelectedProductId} disabled={loading.products}>
                            <SelectTrigger className="w-[200px]"><SelectValue placeholder="Select a product..." /></SelectTrigger>
                            <SelectContent>
                                {products.map(p => <SelectItem key={p._id} value={p._id}>{p.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Select value={selectedDeploymentId} onValueChange={setSelectedDeploymentId} disabled={!selectedProductId || loading.deployments}>
                            <SelectTrigger className="w-[250px]"><SelectValue placeholder="Select a deployment..." /></SelectTrigger>
                            <SelectContent>
                                {productDeployments.map(d => <SelectItem key={d._id} value={d._id}>{d.details.deploymentId}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                     <Button asChild disabled={!selectedDeploymentId}>
                        <Link href={`/fleet-management/resource-management/analysis/${selectedDeploymentId}`}>
                            <Zap className="mr-2 h-4 w-4" />
                            Run Analysis
                        </Link>
                    </Button>
                </header>

                <main className="flex-1 flex overflow-hidden">
                    <DependencyTreeSidebar tree={dependencyTree} isLoading={loading.tree} onNodeSelect={setSelectedNode} selectedNode={selectedNode} />
                     <div className="flex-1 flex items-center justify-center bg-muted/20 p-4">
                        <ResourceDetailsView node={selectedNode} isLoading={loading.tree} />
                    </div>
                </main>
            </div>
        </DashboardLayout>
    );
}
