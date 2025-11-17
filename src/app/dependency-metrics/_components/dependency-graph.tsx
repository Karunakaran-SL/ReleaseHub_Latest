'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2, Box, Warehouse, Puzzle, AppWindow, Network, ArrowRight, ArrowLeft, Link as LinkIcon } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AnyCmdbEntity, CmdbInterface } from '@/lib/definitions';
import Link from 'next/link';

interface GraphNodeProps {
    node: AnyCmdbEntity;
    onNodeSelect: (node: AnyCmdbEntity) => void;
    isCenter?: boolean;
}

const entityIcons: Record<string, React.ReactNode> = {
    product: <Box className="h-5 w-5 text-primary" />,
    tenant: <Warehouse className="h-5 w-5 text-orange-500" />,
    component: <Puzzle className="h-5 w-5 text-green-500" />,
    application: <AppWindow className="h-5 w-5 text-blue-500" />,
    interface: <Network className="h-5 w-5 text-gray-500" />,
};


function GraphNode({ node, onNodeSelect, isCenter = false }: GraphNodeProps) {
    if (!node) return null;

    const icon = entityIcons[node.entityType] || <Box className="h-5 w-5" />;

    return (
        <Card 
            className={cn("w-64 cursor-pointer hover:shadow-lg hover:ring-2 hover:ring-primary/50 transition-all", isCenter && "ring-2 ring-primary shadow-xl")}
            onClick={() => onNodeSelect(node)}
        >
            <CardHeader className="p-3 flex-row items-center gap-3 space-y-0">
                {icon}
                <CardTitle className="text-base flex-1">{node.name}</CardTitle>
                <Button variant="ghost" size="icon" className="h-6 w-6" asChild onClick={(e) => e.stopPropagation()}>
                    <Link href={`/cmdb/${node.entityType}s/${node.id}/view`}>
                        <LinkIcon className="h-4 w-4 text-muted-foreground" />
                    </Link>
                </Button>
            </CardHeader>
            <CardContent className="p-3 pt-0 text-xs text-muted-foreground">
                <p>Version: {node.version || 'N/A'}</p>
                 <p className="font-mono text-[10px] break-all">ID: {node.id}</p>
            </CardContent>
        </Card>
    )
}

export function DependencyGraph({ data, isLoading, onNodeSelect }: { data: any, isLoading: boolean, onNodeSelect: (node: AnyCmdbEntity) => void }) {
    if (isLoading) {
        return <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />;
    }

    if (!data || !data.id) {
        return <p className="text-muted-foreground">Select a node from the tree to view its dependencies.</p>;
    }
    
    const centerNode = {
        id: data.id,
        name: data.name,
        version: data.version,
        entityType: data.entityType,
    };
    
    const upstreamNodes = data.parents || [];
    const downstreamNodes = data.children || [];


    return (
        <div className="w-full h-full flex items-center justify-center gap-8 overflow-auto p-8">
            {/* Upstream Column */}
            <div className="flex flex-col items-center gap-4">
                <h3 className="font-bold text-lg text-muted-foreground">Depends On</h3>
                <div className="space-y-4">
                    {upstreamNodes.length > 0 ? (
                        upstreamNodes.map((node: any) => <GraphNode key={node.id} node={node} onNodeSelect={onNodeSelect} />)
                    ) : (
                        <p className="text-sm text-muted-foreground w-64 text-center p-4 bg-background rounded-lg">No upstream dependencies found.</p>
                    )}
                </div>
            </div>

             <ArrowRight className="h-10 w-10 text-muted-foreground shrink-0" />
            
            {/* Center Column */}
            <div className="flex flex-col items-center gap-4">
                 <h3 className="font-bold text-lg text-muted-foreground">Selected Item</h3>
                 <GraphNode node={centerNode} onNodeSelect={onNodeSelect} isCenter />
            </div>

            <ArrowRight className="h-10 w-10 text-muted-foreground shrink-0" />
            
            {/* Downstream Column */}
            <div className="flex flex-col items-center gap-4">
                <h3 className="font-bold text-lg text-muted-foreground">Depended On By</h3>
                 <div className="space-y-4">
                    {downstreamNodes.length > 0 ? (
                        downstreamNodes.map((node: any) => <GraphNode key={node.id} node={node} onNodeSelect={onNodeSelect} />)
                    ) : (
                         <p className="text-sm text-muted-foreground w-64 text-center p-4 bg-background rounded-lg">No downstream dependencies found.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
