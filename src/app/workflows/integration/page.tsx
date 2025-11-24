
'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import type { User } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, Info } from 'lucide-react';
import Link from 'next/link';

const openSourceTools = [
    { id: 'airflow', name: 'Apache Airflow', features: ['Python-based DAGs', 'Rich UI for monitoring', 'Extensible with custom operators'], benefits: ['Excellent for complex, scheduled data pipelines', 'Strong community and large set of integrations'] },
    { id: 'temporal', name: 'Temporal', features: ['Durable, stateful workflows as code', 'Supports Go, Java, Python, TypeScript', 'Built-in support for retries, timeouts, and compensation logic (Sagas)'], benefits: ['Guarantees workflow execution', 'Highly resilient to process and infrastructure failures'] },
    { id: 'argo', name: 'Argo Workflows', features: ['Kubernetes-native workflow engine', 'Container-based steps', 'Directed Acyclic Graph (DAG) or step-based workflows'], benefits: ['Perfectly suited for orchestrating jobs on Kubernetes', 'Integrates well with other Argo projects like CD and Events'] },
    { id: 'n8n', name: 'n8n', features: ['Node-based visual workflow editor', 'Large library of pre-built integrations', 'Self-hostable or cloud version available'], benefits: ['Easy for non-developers to build automations', 'Great for connecting different SaaS applications'] },
    { id: 'camunda', name: 'Camunda Platform', features: ['BPMN 2.0 standard for workflow modeling', 'Human workflow and decision management (DMN)', 'REST API for integration'], benefits: ['Strong for business process automation involving human tasks', 'Visually model complex business logic'] },
    { id: 'bonita', name: 'Bonita', features: ['Low-code visual process design', 'Application generator for UI', 'Connectors for many systems (DBs, APIs)'], benefits: ['Accelerates development of process-driven applications', 'Empowers both developers and business users'] },
];

const commercialTools = [
    { id: 'zapier', name: 'Zapier', features: ['Connects thousands of web apps', 'Simple "trigger-action" model', 'No-code visual builder'], benefits: ['Extremely easy to use for simple integrations', 'Vast library of supported apps'] },
    { id: 'make', name: 'Make (formerly Integromat)', features: ['Visual workflow builder with advanced logic (routers, iterators)', 'Connects to hundreds of applications', 'Real-time execution visualization'], benefits: ['More powerful and flexible than simpler tools', 'Good for complex multi-step automations'] },
    { id: 'boomi', name: 'Boomi', features: ['Enterprise iPaaS (Integration Platform as a Service)', 'Visual process design', 'API management and master data hub'], benefits: ['Scales to handle enterprise-level integration challenges', 'Unified platform for data and application integration'] },
];

function ToolCard({ tool }: { tool: { id: string, name: string; features: string[]; benefits: string[] } }) {
    return (
        <Card className="flex flex-col">
            <CardHeader>
                <CardTitle>{tool.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 flex-grow">
                <div>
                    <h4 className="font-semibold text-sm">Features</h4>
                    <ul className="list-disc pl-5 text-sm text-muted-foreground">
                        {tool.features.map((f, i) => <li key={i}>{f}</li>)}
                    </ul>
                </div>
                <div>
                    <h4 className="font-semibold text-sm">Benefits</h4>
                    <ul className="list-disc pl-5 text-sm text-muted-foreground">
                        {tool.benefits.map((b, i) => <li key={i}>{b}</li>)}
                    </ul>
                </div>
            </CardContent>
            <CardFooter>
                 <Button variant="outline" asChild>
                    <Link href={`/workflows/integration/${tool.id}`}>
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
}

export default function WorkflowIntegrationPage() {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        getUser().then(setUser);
    }, []);

    return (
        <DashboardLayout user={user}>
            <main className="flex-1 p-6 md:p-10">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">Workflow Engine Integration</h1>
                    <p className="text-muted-foreground">
                        An overview of popular open-source and commercial workflow automation tools.
                    </p>
                </div>
                
                 <Accordion type="single" collapsible defaultValue="item-1" className="mb-8">
                    <AccordionItem value="item-1">
                        <AccordionTrigger className="text-lg font-semibold">
                            <div className="flex items-center gap-2">
                                <Info className="h-5 w-5" />
                                Introduction
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                            This page provides an overview of various workflow automation and orchestration tools. These tools can be integrated to automate complex business processes, data pipelines, and CI/CD workflows. You can configure the connection to each tool via its "Settings" page to enable seamless integration.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>

                <Accordion type="multiple" defaultValue={['open-source', 'commercial']} className="space-y-4">
                    <AccordionItem value="open-source">
                        <AccordionTrigger className="text-xl font-semibold bg-muted p-4 rounded-md">Open Source Tools</AccordionTrigger>
                        <AccordionContent className="p-4 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {openSourceTools.map(tool => <ToolCard key={tool.id} tool={tool} />)}
                        </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="commercial">
                        <AccordionTrigger className="text-xl font-semibold bg-muted p-4 rounded-md">Commercial Tools</AccordionTrigger>
                        <AccordionContent className="p-4 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                             {commercialTools.map(tool => <ToolCard key={tool.id} tool={tool} />)}
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>

            </main>
        </DashboardLayout>
    );
}
