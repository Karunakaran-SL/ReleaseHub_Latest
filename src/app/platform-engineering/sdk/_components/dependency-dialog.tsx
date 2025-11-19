
'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import type { CmdbComponent } from '@/lib/definitions';
import { Plus } from 'lucide-react';
import { Label } from '@/components/ui/label';

export interface Dependency {
    id: string;
    name: string;
    description: string;
    group: string;
}

const platformCapabilities: Dependency[] = [
  { id: 'sql-postgres', name: 'SQL Database (PostgreSQL)', description: 'Adds JDBC driver and configuration for PostgreSQL.', group: 'Databases' },
  { id: 'sql-mysql', name: 'SQL Database (MySQL)', description: 'Adds JDBC driver and configuration for MySQL.', group: 'Databases' },
  { id: 'nosql-mongodb', name: 'NoSQL Database (MongoDB)', description: 'Adds MongoDB driver and Spring Data MongoDB.', group: 'Databases' },
  { id: 'nosql-cassandra', name: 'NoSQL Database (Cassandra)', description: 'Adds Cassandra driver and Spring Data Cassandra.', group: 'Databases' },
  { id: 'messaging-kafka', name: 'Messaging (Kafka)', description: 'Adds Spring for Kafka for producing/consuming messages.', group: 'Messaging' },
  { id: 'messaging-rabbitmq', name: 'Messaging (RabbitMQ)', description: 'Adds Spring AMQP for RabbitMQ integration.', group: 'Messaging' },
  { id: 'web-react', name: 'Web Portal (React)', description: 'Generates a React frontend structure.', group: 'Web' },
  { id: 'web-angular', name: 'Web Portal (Angular)', description: 'Generates an Angular frontend structure.', group: 'Web' },
  { id: 'web-vue', name: 'Web Portal (Vue)', description: 'Generates a Vue.js frontend structure.', group: 'Web' },
  { id: 'auth-oauth2', name: 'Authentication (OAuth2)', description: 'Secures your application with OAuth2/OIDC.', group: 'Security' },
  { id: 'auth-jwt', name: 'Authentication (JWT)', description: 'Adds support for JWT-based authentication.', group: 'Security' },
  { id: 'monitoring-prometheus', name: 'Monitoring (Prometheus)', description: 'Exposes application metrics for Prometheus scraping.', group: 'Observability' },
  { id: 'monitoring-grafana', name: 'Monitoring (Grafana)', description: 'Includes dashboard templates for Grafana.', group: 'Observability' },
  { id: 'cicd', name: 'CI/CD Integration', description: 'Adds a sample CI/CD pipeline file (e.g., Jenkinsfile).', group: 'Tooling' },
  { id: 'api-gateway', name: 'API Gateway', description: 'Configures routing for an upstream API Gateway.', group: 'Networking' },
  { id: 'logging-elk', name: 'Logging (ELK)', description: 'Adds configuration for shipping logs to an ELK stack.', group: 'Observability' },
  { id: 'tracing-opentelemetry', name: 'Tracing (OpenTelemetry)', description: 'Adds OpenTelemetry for distributed tracing.', group: 'Observability' },
];

export function DependencyDialog({ onAddDependencies }: { onAddDependencies: (deps: Dependency[]) => void }) {
    const [open, setOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selected, setSelected] = useState<Record<string, Dependency>>({});
    const [customComponents, setCustomComponents] = useState<Dependency[]>([]);

    useEffect(() => {
        async function fetchComponents() {
            try {
                const res = await fetch('/api/cmdb/components');
                if (res.ok) {
                    const data: CmdbComponent[] = await res.json();
                    setCustomComponents(data.map(c => ({
                        id: c.id,
                        name: c.name,
                        description: c.description || `Custom platform service: ${c.name}`,
                        group: 'Custom Platform Services'
                    })));
                }
            } catch (error) {
                console.error("Failed to fetch custom components", error);
            }
        }
        fetchComponents();
    }, []);

    const allDependencies = useMemo(() => [...platformCapabilities, ...customComponents], [customComponents]);

    const filteredDependencies = useMemo(() => {
        if (!searchTerm) return allDependencies;
        return allDependencies.filter(dep => 
            dep.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            dep.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, allDependencies]);

    const groupedDependencies = useMemo(() => {
        return filteredDependencies.reduce((acc, dep) => {
            (acc[dep.group] = acc[dep.group] || []).push(dep);
            return acc;
        }, {} as Record<string, Dependency[]>);
    }, [filteredDependencies]);

    const handleSelect = (dep: Dependency, isChecked: boolean) => {
        setSelected(prev => {
            const newSelected = { ...prev };
            if (isChecked) {
                newSelected[dep.id] = dep;
            } else {
                delete newSelected[dep.id];
            }
            return newSelected;
        });
    };

    const handleAdd = () => {
        onAddDependencies(Object.values(selected));
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline"><Plus className="mr-2 h-4 w-4"/>Add Dependencies</Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl h-[70vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Add Dependencies</DialogTitle>
                    <DialogDescription>Select the capabilities and services your project needs.</DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-6 flex-1 min-h-0">
                    <div className="flex flex-col gap-4 min-h-0">
                        <Input placeholder="Search dependencies..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                        <ScrollArea className="flex-1 border rounded-md">
                            <div className="p-4 space-y-4">
                                {Object.entries(groupedDependencies).map(([group, deps]) => (
                                    <div key={group}>
                                        <h3 className="font-semibold mb-2">{group}</h3>
                                        <div className="space-y-2">
                                            {deps.map(dep => (
                                                <div key={dep.id} className="flex items-start p-2 rounded-md hover:bg-muted">
                                                    <Checkbox
                                                        id={`dep-${dep.id}`}
                                                        checked={!!selected[dep.id]}
                                                        onCheckedChange={(checked) => handleSelect(dep, !!checked)}
                                                        className="mt-1"
                                                    />
                                                    <div className="ml-3">
                                                        <Label htmlFor={`dep-${dep.id}`}>{dep.name}</Label>
                                                        <p className="text-xs text-muted-foreground">{dep.description}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>
                     <div className="border rounded-md flex flex-col">
                        <h3 className="font-semibold p-4 border-b">Selected ({Object.keys(selected).length})</h3>
                        <ScrollArea className="flex-1">
                             <div className="p-4 flex flex-wrap gap-2">
                                {Object.values(selected).map(dep => (
                                    <Badge key={dep.id} variant="secondary">{dep.name}</Badge>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleAdd}>Add Dependencies</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
