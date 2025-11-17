'use client';
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import DashboardLayout from '@/app/dashboard-layout';
import type { User, Product, DependencyTree, AnyCmdbEntity } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { DependencyTreeSidebar } from './_components/dependency-tree';
import { DependencyGraph } from './_components/dependency-graph';

export default function DependencyMetricsPage() {
    const [user, setUser] = useState<User | null>(null);
    const [isUpdatingMetrics, setIsUpdatingMetrics] = useState(false);
    const { toast } = useToast();

    const [products, setProducts] = useState<Product[]>([]);
    const [selectedProductId, setSelectedProductId] = useState<string>('');
    const [productTree, setProductTree] = useState<DependencyTree | null>(null);
    const [loadingTree, setLoadingTree] = useState(false);

    const [selectedNode, setSelectedNode] = useState<AnyCmdbEntity | null>(null);
    const [graphData, setGraphData] = useState<any>(null);
    const [loadingGraph, setLoadingGraph] = useState(false);

    useEffect(() => {
        getUser().then(setUser);
        async function fetchProducts() {
            try {
                const response = await fetch('/api/products');
                if (response.ok) {
                    const data = await response.json();
                    setProducts(data);
                    if (data.length > 0) {
                        setSelectedProductId(data[0]._id);
                    }
                } else {
                    toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch products.' });
                }
            } catch (error) {
                toast({ variant: 'destructive', title: 'Error', description: 'An error occurred while fetching products.' });
            }
        }
        fetchProducts();
    }, [toast]);
    
    useEffect(() => {
        if (!selectedProductId) return;

        async function fetchTree() {
            setLoadingTree(true);
            try {
                const response = await fetch(`/api/dependency-tree/product/${selectedProductId}`);
                if (response.ok) {
                    const data = await response.json();
                    setProductTree(data);
                    setSelectedNode({ ...data, entityType: 'product' });
                } else {
                    const errorData = await response.json();
                    setProductTree(null);
                    setSelectedNode(null);
                    toast({ variant: 'destructive', title: 'Failed to load tree', description: errorData.message || 'Could not fetch dependency data.' });
                }
            } catch (error: any) {
                 setProductTree(null);
                 setSelectedNode(null);
                toast({ variant: 'destructive', title: 'Error', description: error.message });
            } finally {
                setLoadingTree(false);
            }
        }
        fetchTree();

    }, [selectedProductId, toast]);

    const fetchGraphData = useCallback(async (node: AnyCmdbEntity | null) => {
        if (!node) {
            setGraphData(null);
            return;
        };

        setLoadingGraph(true);
        try {
             const response = await fetch(`/api/dependency-tree/${node.entityType}/${node.id}`);
             if(response.ok) {
                setGraphData(await response.json());
             } else {
                const errorData = await response.json();
                toast({ variant: 'destructive', title: 'Error', description: errorData.message || 'Could not fetch graph data.' });
                setGraphData(null);
             }
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
            setGraphData(null);
        } finally {
            setLoadingGraph(false);
        }

    }, [toast]);

    useEffect(() => {
        fetchGraphData(selectedNode);
    }, [selectedNode, fetchGraphData]);

    const handleNodeSelect = (node: AnyCmdbEntity) => {
        setSelectedNode(node);
    };

    const handleUpdateMetrics = async () => {
        setIsUpdatingMetrics(true);
        toast({ title: 'Updating Metrics', description: 'Generating dependency trees for all products...' });
        try {
            const response = await fetch('/api/dependency-tree/update-all', { method: 'POST' });
            const result = await response.json();
            if (response.ok) {
                toast({ title: 'Success', description: result.message });
                // Refetch the tree for the currently selected product
                if(selectedProductId) {
                    const treeResponse = await fetch(`/api/dependency-tree/product/${selectedProductId}`);
                    if (treeResponse.ok) {
                        const data = await treeResponse.json();
                        setProductTree(data);
                        setSelectedNode({ ...data, entityType: 'product' });
                    }
                }
            } else {
                throw new Error(result.message || 'Failed to update metrics.');
            }
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        } finally {
            setIsUpdatingMetrics(false);
        }
    };

    return (
        <DashboardLayout user={user}>
            <div className="flex-1 flex flex-col h-full">
                <header className="p-4 border-b flex items-center justify-between gap-4">
                     <div className="flex items-center gap-4">
                        <h1 className="text-2xl font-bold">Dependency Metrics</h1>
                        <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                            <SelectTrigger className="w-[250px]">
                                <SelectValue placeholder="Select a product..." />
                            </SelectTrigger>
                            <SelectContent>
                                {products.map(p => <SelectItem key={p._id} value={p._id}>{p.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button onClick={handleUpdateMetrics} disabled={isUpdatingMetrics}>
                        {isUpdatingMetrics && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Update All Metrics
                    </Button>
                </header>

                <main className="flex-1 flex overflow-hidden">
                    <DependencyTreeSidebar tree={productTree} isLoading={loadingTree} onNodeSelect={handleNodeSelect} />
                     <div className="flex-1 flex items-center justify-center bg-muted/20 p-4">
                        <DependencyGraph 
                            data={graphData} 
                            isLoading={loadingGraph} 
                            onNodeSelect={handleNodeSelect} 
                        />
                    </div>
                </main>
            </div>
        </DashboardLayout>
    );
}
