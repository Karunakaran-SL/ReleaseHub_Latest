
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { DependencyTree, CmdbInterface } from "@/lib/definitions";
import { Loader2, Box, Warehouse, Puzzle, AppWindow, Network, ArrowRight, ArrowLeft } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

function InterfaceList({ interfaces, title, icon }: { interfaces: CmdbInterface[], title: string, icon: React.ReactNode }) {
    if (!interfaces || interfaces.length === 0) return null;
    return (
        <TreeItem 
            label={`${title} (${interfaces.length})`}
            icon={icon}
        >
            {interfaces.map(iface => (
                <div key={iface.id} className="flex items-center gap-2 pl-4 text-xs">
                   <Network className="h-3 w-3 text-gray-500" />
                   <span>{iface.name} (v{iface.version})</span>
                </div>
            ))}
        </TreeItem>
    );
}

function TreeItem({ 
    label, 
    icon, 
    children, 
    defaultOpen = false,
    version
}: { 
    label: string, 
    icon: React.ReactNode, 
    children?: React.ReactNode, 
    defaultOpen?: boolean,
    version?: string
}) {
    const [isOpen, setIsOpen] = React.useState(defaultOpen);

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-start items-center gap-2 h-auto py-1">
                    <ChevronRight className={cn("h-4 w-4 transition-transform", isOpen && "rotate-90")} />
                    {icon}
                    <div className="flex flex-col items-start">
                        <span className="font-semibold text-sm">{label}</span>
                        {version && <span className="text-xs text-muted-foreground">v{version}</span>}
                    </div>
                </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
                <div className="pl-6 border-l-2 border-dashed ml-3 space-y-1 py-1">
                    {children}
                </div>
            </CollapsibleContent>
        </Collapsible>
    );
}


export function DependencyTreeSidebar({ tree, isLoading }: { tree: DependencyTree | null, isLoading: boolean }) {
    if (isLoading) {
        return (
            <aside className="w-96 border-r p-4 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </aside>
        )
    }

    if (!tree) {
        return (
             <aside className="w-96 border-r p-4">
                <p className="text-sm text-muted-foreground text-center">Select a product to view its dependency tree, or run "Update Metrics" if no tree is found.</p>
            </aside>
        )
    }

    return (
        <aside className="w-96 border-r">
            <ScrollArea className="h-full">
                <div className="p-2">
                    <TreeItem label={tree.name} icon={<Box className="h-5 w-5 text-primary"/>} version={tree.version} defaultOpen>
                        {tree.tenants?.map(tenant => (
                            <TreeItem key={tenant.id} label={tenant.name} icon={<Warehouse className="h-5 w-5 text-orange-500" />} version={tenant.version}>
                                {tenant.components?.map(component => (
                                    <TreeItem key={component.id} label={component.name} icon={<Puzzle className="h-5 w-5 text-green-500" />} version={component.version}>
                                        <InterfaceList interfaces={component.provides_interfaces} title="Provides" icon={<ArrowRight className="h-3 w-3 text-green-600"/>} />
                                        <InterfaceList interfaces={component.depends_on_interfaces} title="Requires" icon={<ArrowLeft className="h-3 w-3 text-red-600"/>} />
                                    </TreeItem>
                                ))}
                                {tenant.applications?.map(app => (
                                    <TreeItem key={app.id} label={app.name} icon={<AppWindow className="h-5 w-5 text-blue-500" />} version={app.version}>
                                        <InterfaceList interfaces={app.provides_interfaces} title="Provides" icon={<ArrowRight className="h-3 w-3 text-green-600"/>} />
                                        <InterfaceList interfaces={app.depends_on_interfaces} title="Requires" icon={<ArrowLeft className="h-3 w-3 text-red-600"/>} />
                                    </TreeItem>
                                ))}
                            </TreeItem>
                        ))}
                    </TreeItem>
                </div>
            </ScrollArea>
        </aside>
    );
}
