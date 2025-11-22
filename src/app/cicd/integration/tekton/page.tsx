'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import type { User } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { Terminal } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function TektonSettingsPage() {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        getUser().then(setUser);
    }, []);

    return (
        <DashboardLayout user={user}>
            <main className="flex-1 p-6 md:p-10">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">Tekton Integration</h1>
                    <p className="text-muted-foreground">Information on using Tekton for Kubernetes-native CI/CD.</p>
                </div>

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Terminal /> Kubernetes-Native Configuration</CardTitle>
                        <CardDescription>
                            Tekton is configured via Kubernetes Custom Resource Definitions (CRDs) directly in your cluster.
                            <a href="https://tekton.dev/docs/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-2">
                                Documentation
                            </a>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p>
                            To use Tekton, you apply YAML files defining `Task`, `Pipeline`, `TaskRun`, and `PipelineRun` resources to your cluster using `kubectl`.
                        </p>
                        <pre className="p-4 rounded-md bg-muted text-sm">
                            <code>
                                # Example command to apply a Tekton pipeline: <br/>
                                kubectl apply -f my-pipeline.yaml
                            </code>
                        </pre>
                         <p className="text-sm text-muted-foreground">
                            There are no external API keys to configure in this UI.
                        </p>
                    </CardContent>
                     <CardFooter>
                        <Button type="button" variant="outline" asChild>
                            <Link href="/cicd/integration">Back to Integrations</Link>
                        </Button>
                    </CardFooter>
                </Card>
            </main>
        </DashboardLayout>
    );
}
