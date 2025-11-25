
'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import type { User } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, Info } from 'lucide-react';
import Link from 'next/link';

const scmTools = [
    { id: 'github', name: 'GitHub', description: 'Code hosting platform for version control and collaboration.' },
    { id: 'gitlab', name: 'GitLab', description: 'A complete DevOps platform, delivered as a single application.' },
    { id: 'bitbucket', name: 'Bitbucket', description: 'Git repository management for professional teams.' },
];

const ciTools = [
    { id: 'jenkins', name: 'Jenkins', description: 'The leading open source automation server.' },
    { id: 'gitlab', name: 'GitLab CI', description: 'CI/CD built into the GitLab platform.' },
    { id: 'github-actions', name: 'GitHub Actions', description: 'Automate your workflow from idea to production.' },
    { id: 'circleci', name: 'CircleCI', description: 'Continuous integration and delivery platform.' },
];

const artifactRepos = [
    { id: 'jfrog', name: 'JFrog Artifactory', description: 'Universal Artifact Repository Manager.' },
    { id: 'nexus', name: 'Sonatype Nexus', description: 'Manage binaries and build artifacts across your software supply chain.' },
];

const containerRegistries = [
    { id: 'docker-hub', name: 'Docker Hub', description: 'The world\'s largest library and community for container images.' },
    { id: 'harbor', name: 'Harbor', description: 'An open source trusted cloud native registry project.' },
    { id: 'gcr', name: 'Google Container Registry', description: 'Store, manage, and secure your Docker container images.' },
    { id: 'acr', name: 'Azure Container Registry', description: 'A managed, private Docker registry service based on open-source Docker Registry 2.0.' },
];

const helmRegistries = [
    { id: 'chartmuseum', name: 'ChartMuseum', description: 'Open-source Helm Chart Repository.' },
    { id: 'harbor', name: 'Harbor', description: 'Harbor can also serve as a Helm chart repository.' },
];

type Tool = { id: string, name: string; description: string };

function IntegrationCard({ tool, type }: { tool: Tool; type: string }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{tool.name}</CardTitle>
                <CardDescription>{tool.description}</CardDescription>
            </CardHeader>
            <CardFooter>
                 <Button asChild variant="outline">
                    <Link href={`/settings/cicd/${type}/${tool.id}`}>
                        <Settings className="mr-2 h-4 w-4" />
                        Configure
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
}


export default function CICDSettingsPage() {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        getUser().then(setUser);
    }, []);

    return (
        <DashboardLayout user={user}>
            <main className="flex-1 p-6 md:p-10">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">CI/CD Settings</h1>
                    <p className="text-muted-foreground">Manage integrations with your CI/CD toolchain.</p>
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
                           This section allows you to configure connections to your various SCM, CI/CD tools, artifact repositories, and container registries. By integrating these services, ReleaseHub can automate tasks, track build and deployment statuses, and manage artifacts seamlessly across your software development lifecycle. Each integration is configured with security in mind, storing credentials securely on the backend.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>

                <div className="space-y-8">
                    <section>
                        <h2 className="text-2xl font-semibold mb-4">Git repo</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {scmTools.map(tool => <IntegrationCard key={tool.id} tool={tool} type="scm" />)}
                        </div>
                    </section>
                    <section>
                        <h2 className="text-2xl font-semibold mb-4">CI/CD Task Runners</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {ciTools.map(tool => <IntegrationCard key={tool.id} tool={tool} type="ci" />)}
                        </div>
                    </section>
                     <section>
                        <h2 className="text-2xl font-semibold mb-4">Artifact Repositories</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {artifactRepos.map(tool => <IntegrationCard key={tool.id} tool={tool} type="artifacts"/>)}
                        </div>
                    </section>
                     <section>
                        <h2 className="text-2xl font-semibold mb-4">Container Registries</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {containerRegistries.map(tool => <IntegrationCard key={tool.id} tool={tool} type="container-registry"/>)}
                        </div>
                    </section>
                     <section>
                        <h2 className="text-2xl font-semibold mb-4">Helm Registries</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                             {helmRegistries.map(tool => <IntegrationCard key={tool.id} tool={tool} type="helm-registry"/>)}
                        </div>
                    </section>
                </div>
            </main>
        </DashboardLayout>
    );
}
