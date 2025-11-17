'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import type { User } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import Link from 'next/link';

const openSourceTools = [
    { id: 'n8n', name: 'n8n', features: ['Node-based visual editor', 'Self-hostable or cloud version', 'Extensive library of pre-built integrations'], benefits: ['Highly flexible for connecting APIs', 'Cost-effective for complex workflows', 'Strong community support'] },
    { id: 'temporal', name: 'Temporal', features: ['Durable, stateful workflows as code', 'Supports Go, TypeScript, Python, etc.', 'Built for high reliability and scalability'], benefits: ['Guarantees workflow completion', 'Excellent for long-running, critical processes', 'Developer-centric approach'] },
    { id: 'camunda', name: 'Camunda Platform', features: ['BPMN 2.0 standard for modeling', 'Human task management and decision tables', 'REST API for integration'], benefits: ['Great for complex, human-in-the-loop business processes', 'Strong governance and auditing capabilities'] },
    { id: 'bonita', name: 'Bonita', features: ['Low-code platform for process automation', 'Visual UI designer and process modeler', 'Connector framework for integrations'], benefits: ['Accelerates development of business applications', 'Empowers both developers and business users'] },
    { id: 'airflow', name: 'Apache Airflow', features: ['Workflows as DAGs (Directed Acyclic Graphs) defined in Python', 'Scalable and distributed architecture', 'Extensible with custom operators'], benefits: ['Industry standard for data engineering pipelines (ETL)', 'Powerful scheduling and backfilling capabilities'] },
];

const commercialTools = [
    { id: 'make', name: 'Make (formerly Integromat)', features: ['Visual canvas with real-time execution flow', 'Massive library of app connectors', 'Advanced error handling and data manipulation'], benefits: ['Extremely intuitive and fast to build with', 'Excellent for connecting a wide range of SaaS apps'] },
    { id: 'zapier', name: 'Zapier', features: ['Simple trigger-action model ("Zaps")', 'Largest ecosystem of app integrations (5,000+)', 'User-friendly, no-code interface'], benefits: ['Easiest and fastest way to connect two apps', 'Ideal for simple, linear task automation'] },
    { id: 'boomi', name: 'Boomi', features: ['Enterprise iPaaS (Integration Platform as a Service)', 'Low-code, visual interface', 'Handles application and data integration, API management'], benefits: ['Scalable for enterprise-wide integration challenges', 'Unified platform for various integration needs'] },
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
                    <h1 className="text-3xl font-bold">Workflow Integration</h1>
                    <p className="text-muted-foreground">
                        An overview of popular open-source and commercial Workflow/BPM tools.
                    </p>
                </div>
                
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