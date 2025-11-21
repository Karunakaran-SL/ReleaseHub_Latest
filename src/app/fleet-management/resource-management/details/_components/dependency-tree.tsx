
'use client';

import * as React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Box, Warehouse, Puzzle, AppWindow } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

function TreeItem({ 
    label, 
    icon, 
    children, 
    defaultOpen = false,
    version,
    onClick,
    isSelected,
}: { 
    label: string, 
    icon: React.ReactNode, 
    children?: React.ReactNode, 
    defaultOpen?: boolean,
    version?: string,
    onClick?: () => void,
    isSelected?: boolean,
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
            <div className={cn("flex items-center gap-1 w-full rounded-md", isSelected && "bg-accent")}>
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


export function DependencyTreeSidebar({ tree, isLoading, onNodeSelect, selectedNode }: { tree: any | null, isLoading: boolean, onNodeSelect: (entity: any) => void, selectedNode: any | null }) {
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
                <p className="text-sm text-muted-foreground text-center">Select a deployment to view its resource tree.</p>
            </aside>
        )
    }
    
    return (
        <aside className="w-96 border-r">
            <ScrollArea className="h-full">
                <div className="p-2">
                    <TreeItem 
                        label={tree.name} 
                        icon={<Box className="h-5 w-5 text-primary"/>} 
                        version={tree.version} 
                        onClick={() => onNodeSelect(tree)}
                        isSelected={selectedNode?.id === tree.id}
                        defaultOpen
                    >
                        {tree.tenants?.map((tenant: any) => (
                            <TreeItem 
                                key={tenant.id} 
                                label={tenant.name} 
                                icon={<Warehouse className="h-5 w-5 text-orange-500" />} 
                                version={tenant.version}
                                onClick={() => onNodeSelect(tenant)}
                                isSelected={selectedNode?.id === tenant.id}
                                defaultOpen
                            >
                                {tenant.components?.map((component: any) => (
                                    <TreeItem 
                                        key={component.id} 
                                        label={component.name} 
                                        icon={<Puzzle className="h-5 w-5 text-green-500" />} 
                                        version={component.version}
                                        onClick={() => onNodeSelect(component)}
                                        isSelected={selectedNode?.id === component.id}
                                    />
                                ))}
                                {tenant.applications?.map((app: any) => (
                                    <TreeItem 
                                        key={app.id} 
                                        label={app.name} 
                                        icon={<AppWindow className="h-5 w-5 text-blue-500" />} 
                                        version={app.version}
                                        onClick={() => onNodeSelect(app)}
                                        isSelected={selectedNode?.id === app.id}
                                    />
                                ))}
                            </TreeItem>
                        ))}
                    </TreeItem>
                </div>
            </ScrollArea>
        </aside>
    );
}

