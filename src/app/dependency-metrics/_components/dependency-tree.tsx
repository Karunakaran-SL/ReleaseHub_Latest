'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { DependencyTree, CmdbInterface, AnyCmdbEntity } from "@/lib/definitions";
import { Loader2, Box, Warehouse, Puzzle, AppWindow, Network, ArrowRight, ArrowLeft } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

function InterfaceList({ interfaces, title, icon, onNodeSelect }: { interfaces: CmdbInterface[], title: string, icon: React.ReactNode, onNodeSelect: (entity: AnyCmdbEntity) => void }) {
    if (!interfaces || interfaces.length === 0) return null;
    return (
        <TreeItem 
            label={`${title} (${interfaces.length})`}
            icon={icon}
        >
            {interfaces.map(iface => (
                 <TreeItem 
                    key={iface.id} 
                    label={iface.name} 
                    icon={<Network className="h-4 w-4 text-gray-500" />} 
                    version={iface.version}
                    onClick={() => onNodeSelect({ ...iface, entityType: 'interface' })}
                />
            ))}
        </TreeItem>
    );
}

function TreeItem({ 
    label, 
    icon, 
    children, 
    defaultOpen = false,
    version,
    onClick
}: { 
    label: string, 
    icon: React.ReactNode, 
    children?: React.ReactNode, 
    defaultOpen?: boolean,
    version?: string,
    onClick?: () => void
}) {
    const [isOpen, setIsOpen] = React.useState(defaultOpen);

    const handleItemClick = (e: React.MouseEvent) => {
        if (onClick) {
            e.stopPropagation();
            onClick();
        }
    }

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <div className="flex items-center gap-1 w-full">
                <Button variant="ghost" className="w-full justify-start items-center gap-2 h-auto py-1" onClick={handleItemClick}>
                    {icon}
                    <div className="flex flex-col items-start">
                        <span className="font-semibold text-sm">{label}</span>
                        {version && <span className="text-xs text-muted-foreground">v{version}</span>}
                    </div>
                </Button>
                {children && (
                     <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                            <ChevronRight className={cn("h-4 w-4 transition-transform", isOpen && "rotate-90")} />
                        </Button>
                    </CollapsibleTrigger>
                )}
            </div>
            <CollapsibleContent>
                <div className="pl-6 border-l-2 border-dashed ml-3 space-y-1 py-1">
                    {children}
                </div>
            </CollapsibleContent>
        </Collapsible>
    );
}


export function DependencyTreeSidebar({ tree, isLoading, onNodeSelect }: { tree: DependencyTree | null, isLoading: boolean, onNodeSelect: (entity: AnyCmdbEntity) => void }) {
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
    
    const productNode = { ...tree, entityType: 'product' } as AnyCmdbEntity;


    return (
        <aside className="w-96 border-r">
            <ScrollArea className="h-full">
                <div className="p-2">
                    <TreeItem 
                        label={tree.name} 
                        icon={<Box className="h-5 w-5 text-primary"/>} 
                        version={tree.version} 
                        onClick={() => onNodeSelect(productNode)}
                        defaultOpen
                    >
                        {tree.tenants?.map(tenant => (
                            <TreeItem 
                                key={tenant.id} 
                                label={tenant.name} 
                                icon={<Warehouse className="h-5 w-5 text-orange-500" />} 
                                version={tenant.version}
                                onClick={() => onNodeSelect({ ...tenant, entityType: 'tenant' })}
                            >
                                {tenant.components?.map(component => (
                                    <TreeItem 
                                        key={component.id} 
                                        label={component.name} 
                                        icon={<Puzzle className="h-5 w-5 text-green-500" />} 
                                        version={component.version}
                                        onClick={() => onNodeSelect({ ...component, entityType: 'component' })}
                                    >
                                        <InterfaceList interfaces={component.provides_interfaces} title="Provides" icon={<ArrowRight className="h-3 w-3 text-green-600"/>} onNodeSelect={onNodeSelect} />
                                        <InterfaceList interfaces={component.depends_on_interfaces} title="Requires" icon={<ArrowLeft className="h-3 w-3 text-red-600"/>} onNodeSelect={onNodeSelect} />
                                    </TreeItem>
                                ))}
                                {tenant.applications?.map(app => (
                                    <TreeItem 
                                        key={app.id} 
                                        label={app.name} 
                                        icon={<AppWindow className="h-5 w-5 text-blue-500" />} 
                                        version={app.version}
                                        onClick={() => onNodeSelect({ ...app, entityType: 'application' })}
                                    >
                                        <InterfaceList interfaces={app.provides_interfaces} title="Provides" icon={<ArrowRight className="h-3 w-3 text-green-600"/>} onNodeSelect={onNodeSelect} />
                                        <InterfaceList interfaces={app.depends_on_interfaces} title="Requires" icon={<ArrowLeft className="h-3 w-3 text-red-600"/>} onNodeSelect={onNodeSelect} />
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
