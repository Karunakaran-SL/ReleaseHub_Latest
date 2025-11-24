
'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import type { User } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, Info, CheckCircle, HelpCircle, CircleDot, Package } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const statuses = [
    { text: 'Certified', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', icon: <CheckCircle className="h-3 w-3" /> },
    { text: 'In Qualification', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300', icon: <HelpCircle className="h-3 w-3" /> },
    { text: 'Evaluation Pending', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300', icon: <CircleDot className="h-3 w-3" /> },
    { text: 'In Inventory', color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300', icon: <Package className="h-3 w-3" /> },
];

const openSourceTools = [
    { id: 'jenkins', name: 'Jenkins', features: ['Pipeline-as-code (Jenkinsfile)', 'Huge plugin ecosystem', 'Runs anywhere (Java)', 'Strong community'], benefits: ['Extremely flexible and battle-tested', 'Highly customizable for any environment'], status: statuses[0] },
    { id: 'gitlab', name: 'GitLab CI/CD (CE)', features: ['YAML pipelines inside the repo', 'Built-in runners', 'Auto DevOps', 'Security & artifact management'], benefits: ['Single integrated platform (repo, CI, issues)', 'Easy to adopt and operate', 'Strong DevSecOps features'], status: statuses[0] },
    { id: 'tekton', name: 'Tekton', features: ['CRDs for Tasks/Pipelines', 'Kubernetes-native, cloud-native', 'Pluggable Tekton Catalog'], benefits: ['Ideal for standardizing CI/CD on Kubernetes', 'Composable, vendor-neutral primitives'], status: statuses[1] },
    { id: 'argo', name: 'Argo (Argo CD / Argo Workflows)', features: ['Declarative GitOps (Argo CD)', 'Workflows for pipelines', 'Visual UI & automated sync'], benefits: ['Ideal where Kubernetes is the runtime', 'Safe, auditable deployments and rollbacks'], status: statuses[0] },
    { id: 'spinnaker', name: 'Spinnaker', features: ['Robust multi-cloud deploy strategies', 'Pipeline orchestration', 'Cloud provider integrations'], benefits: ['Designed for large, multi-cloud environments', 'Complex release strategies (Netflix/Google heritage)'], status: statuses[2] },
    { id: 'concourse', name: 'Concourse', features: ['Resource/job/task model', 'Pipelines as first-class objects', 'Reproducibility and portability'], benefits: ['Clean, opinionated model', 'Suited for reproducible, pipeline-first automation'], status: statuses[3] },
    { id: 'drone', name: 'Drone', features: ['Docker-native pipelines in YAML', 'Simple server + runners model', 'Pluggable SCM integrations'], benefits: ['Lightweight, easy to run (containerized)', 'Good for container-first pipelines'], status: statuses[1] },
    { id: 'semaphore', name: 'Semaphore', features: ['Fast parallel test execution', 'Hosted and open-source core', 'Easy GitHub/GitLab integration'], benefits: ['Designed for speed and developer ergonomics', 'SaaS convenience or self-hosted'], status: statuses[2] },
];

const commercialTools = [
    { id: 'github-actions', name: 'GitHub Actions', features: ['Workflow YAML in repo', 'Marketplace of actions', 'GitHub-native triggers', 'Hosted runners'], benefits: ['Tight GitHub integration', 'Simple to adopt', 'Pay-as-you-use runners'], status: statuses[0] },
    { id: 'circleci', name: 'CircleCI', features: ['Config-as-code', 'Orbs (reusable packages)', 'Advanced caching & executors', 'Scalable runners'], benefits: ['Strong scaling for teams', 'Advanced optimizations to reduce build time'], status: statuses[0] },
    { id: 'aws-codepipeline', name: 'AWS CodePipeline', features: ['Visual pipeline modeling', 'Deep integration with AWS services', 'Serverless model'], benefits: ['Best fit for AWS users', 'Minimal glue code for AWS services'], status: statuses[1] },
    { id: 'azure-pipelines', name: 'Azure Pipelines', features: ['YAML or visual pipelines', 'Hosted agents (Windows/Linux/macOS)', 'Integration with Azure DevOps'], benefits: ['Good cross-platform support', 'Tightly integrates with Azure DevOps'], status: statuses[1] },
    { id: 'google-cloud-build', name: 'Google Cloud Build', features: ['Serverless builds', 'Native GCP integrations', 'Build steps as containers', 'Private pools'], benefits: ['Scales automatically on GCP', 'Good for containerized workflows'], status: statuses[2] },
    { id: 'bamboo', name: 'Bamboo', features: ['Build/test/deploy plans', 'Deep integration with Atlassian suite', 'On-prem or Data Center'], benefits: ['Excellent for Jira/Bitbucket users', 'Traceability from commit to ticket'], status: statuses[3] },
    { id: 'teamcity', name: 'TeamCity', features: ['Flexible build configuration', 'Build agents', 'Excellent IDE integrations (IntelliJ)'], benefits: ['Strong UX for build configuration', 'Mature on-prem solution'], status: statuses[3] },
    { id: 'harness', name: 'Harness', features: ['Visual & YAML pipelines', 'AI-driven test intelligence', 'Progressive delivery and feature flags'], benefits: ['Accelerates delivery with intelligent optimization', 'Good for SaaS CD'], status: statuses[2] },
];

type Tool = typeof openSourceTools[0];

function ToolCard({ tool }: { tool: Tool }) {
    return (
        <Card className="flex flex-col">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <CardTitle>{tool.name}</CardTitle>
                    <Badge className={cn("flex items-center gap-1", tool.status.color)}>
                        {tool.status.icon}
                        <span>{tool.status.text}</span>
                    </Badge>
                </div>
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
                    <Link href={`/cicd/integration/${tool.id}`}>
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
}

export default function CICDIntegrationPage() {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        getUser().then(setUser);
    }, []);

    return (
        <DashboardLayout user={user}>
            <main className="flex-1 p-6 md:p-10">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">CI/CD Integration</h1>
                    <p className="text-muted-foreground">
                        An overview of popular open-source and commercial CI/CD tools.
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
                            This page provides an overview of various Continuous Integration and Continuous Deployment (CI/CD) tools. These tools automate the build, test, and deployment phases of your release process. You can configure the connection to each tool via its "Settings" page to enable seamless integration with your development workflows.
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
