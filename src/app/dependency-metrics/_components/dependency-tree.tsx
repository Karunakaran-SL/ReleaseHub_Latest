
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { DependencyTree } from "@/lib/definitions";
import { Loader2, Box, Warehouse, Puzzle, AppWindow } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface DependencyTreeSidebarProps {
    tree: DependencyTree | null;
    isLoading: boolean;
}

function TreeItem({ 
    label, 
    icon, 
    children, 
    defaultOpen = false 
}: { 
    label: string, 
    icon: React.ReactNode, 
    children?: React.ReactNode, 
    defaultOpen?: boolean 
}) {
    const [isOpen, setIsOpen] = React.useState(defaultOpen);

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-start items-center gap-2">
                    <ChevronRight className={cn("h-4 w-4 transition-transform", isOpen && "rotate-90")} />
                    {icon}
                    <span className="font-semibold">{label}</span>
                </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
                <div className="pl-6 border-l-2 border-dashed ml-3 space-y-1">
                    {children}
                </div>
            </CollapsibleContent>
        </Collapsible>
    );
}


export function DependencyTreeSidebar({ tree, isLoading }: DependencyTreeSidebarProps) {
    if (isLoading) {
        return (
            <aside className="w-80 border-r p-4 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </aside>
        )
    }

    if (!tree) {
        return (
             <aside className="w-80 border-r p-4">
                <p className="text-sm text-muted-foreground text-center">Select a product to view its dependency tree, or run "Update Metrics" if no tree is found.</p>
            </aside>
        )
    }

    return (
        <aside className="w-80 border-r">
            <ScrollArea className="h-full">
                <div className="p-2">
                    <TreeItem label={tree.name} icon={<Box className="h-5 w-5 text-primary"/>} defaultOpen>
                        {tree.tenants?.map(tenant => (
                            <TreeItem key={tenant.id} label={tenant.name} icon={<Warehouse className="h-5 w-5 text-orange-500" />}>
                                {tenant.components?.map(component => (
                                    <TreeItem key={component.id} label={component.name} icon={<Puzzle className="h-5 w-5 text-green-500" />}>
                                        {/* Interface details can be nested here if available */}
                                    </TreeItem>
                                ))}
                                {tenant.applications?.map(app => (
                                    <TreeItem key={app.id} label={app.name} icon={<AppWindow className="h-5 w-5 text-blue-500" />}>
                                         {/* Interface details can be nested here if available */}
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
