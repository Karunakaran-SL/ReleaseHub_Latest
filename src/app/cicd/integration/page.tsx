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
    { id: 'jenkins', name: 'Jenkins', features: ['Pipeline-as-code (Jenkinsfile)', 'Huge plugin ecosystem', 'Runs anywhere (Java)', 'Strong community'], benefits: ['Extremely flexible and battle-tested', 'Highly customizable for any environment'] },
    { id: 'gitlab', name: 'GitLab CI/CD (CE)', features: ['YAML pipelines inside the repo', 'Built-in runners', 'Auto DevOps', 'Security & artifact management'], benefits: ['Single integrated platform (repo, CI, issues)', 'Easy to adopt and operate', 'Strong DevSecOps features'] },
    { id: 'tekton', name: 'Tekton', features: ['CRDs for Tasks/Pipelines', 'Kubernetes-native, cloud-native', 'Pluggable Tekton Catalog'], benefits: ['Ideal for standardizing CI/CD on Kubernetes', 'Composable, vendor-neutral primitives'] },
    { id: 'argo', name: 'Argo (Argo CD / Argo Workflows)', features: ['Declarative GitOps (Argo CD)', 'Workflows for pipelines', 'Visual UI & automated sync'], benefits: ['Ideal where Kubernetes is the runtime', 'Safe, auditable deployments and rollbacks'] },
    { id: 'spinnaker', name: 'Spinnaker', features: ['Robust multi-cloud deploy strategies', 'Pipeline orchestration', 'Cloud provider integrations'], benefits: ['Designed for large, multi-cloud environments', 'Complex release strategies (Netflix/Google heritage)'] },
    { id: 'concourse', name: 'Concourse', features: ['Resource/job/task model', 'Pipelines as first-class objects', 'Reproducibility and portability'], benefits: ['Clean, opinionated model', 'Suited for reproducible, pipeline-first automation'] },
    { id: 'drone', name: 'Drone', features: ['Docker-native pipelines in YAML', 'Simple server + runners model', 'Pluggable SCM integrations'], benefits: ['Lightweight, easy to run (containerized)', 'Good for container-first pipelines'] },
    { id: 'semaphore', name: 'Semaphore', features: ['Fast parallel test execution', 'Hosted and open-source core', 'Easy GitHub/GitLab integration'], benefits: ['Designed for speed and developer ergonomics', 'SaaS convenience or self-hosted'] },
];

const commercialTools = [
    { id: 'github-actions', name: 'GitHub Actions', features: ['Workflow YAML in repo', 'Marketplace of actions', 'GitHub-native triggers', 'Hosted runners'], benefits: ['Tight GitHub integration', 'Simple to adopt', 'Pay-as-you-use runners'] },
    { id: 'circleci', name: 'CircleCI', features: ['Config-as-code', 'Orbs (reusable packages)', 'Advanced caching & executors', 'Scalable runners'], benefits: ['Strong scaling for teams', 'Advanced optimizations to reduce build time'] },
    { id: 'aws-codepipeline', name: 'AWS CodePipeline', features: ['Visual pipeline modeling', 'Deep integration with AWS services', 'Serverless model'], benefits: ['Best fit for AWS users', 'Minimal glue code for AWS services'] },
    { id: 'azure-pipelines', name: 'Azure Pipelines', features: ['YAML or visual pipelines', 'Hosted agents (Windows/Linux/macOS)', 'Integration with Azure DevOps'], benefits: ['Good cross-platform support', 'Tightly integrates with Azure DevOps'] },
    { id: 'google-cloud-build', name: 'Google Cloud Build', features: ['Serverless builds', 'Native GCP integrations', 'Build steps as containers', 'Private pools'], benefits: ['Scales automatically on GCP', 'Good for containerized workflows'] },
    { id: 'bamboo', name: 'Bamboo', features: ['Build/test/deploy plans', 'Deep integration with Atlassian suite', 'On-prem or Data Center'], benefits: ['Excellent for Jira/Bitbucket users', 'Traceability from commit to ticket'] },
    { id: 'teamcity', name: 'TeamCity', features: ['Flexible build configuration', 'Build agents', 'Excellent IDE integrations (IntelliJ)'], benefits: ['Strong UX for build configuration', 'Mature on-prem solution'] },
    { id: 'harness', name: 'Harness', features: ['Visual & YAML pipelines', 'AI-driven test intelligence', 'Progressive delivery and feature flags'], benefits: ['Accelerates delivery with intelligent optimization', 'Good for SaaS CD'] },
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
