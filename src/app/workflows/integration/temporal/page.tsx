'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { Loader2, Terminal } from 'lucide-react';
import Link from 'next/link';

export default function TemporalSettingsPage() {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        getUser().then(setUser);
    }, []);

    return (
        <DashboardLayout user={user}>
            <main className="flex-1 p-6 md:p-10">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">Temporal Integration</h1>
                    <p className="text-muted-foreground">Information on using the Temporal SDK.</p>
                </div>

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Terminal /> SDK Configuration</CardTitle>
                        <CardDescription>
                            Temporal workflows are defined in code using an SDK. There are no API keys to configure in this UI.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p>
                            To use Temporal, you'll need to install the TypeScript SDK and configure the client to connect to your Temporal Cloud namespace or self-hosted server.
                        </p>
                        <pre className="p-4 rounded-md bg-muted text-sm">
                            <code>
                                # 1. Install the SDK <br/>
                                npm install @temporalio/client <br/><br/>
                                # 2. Connect in your code <br/>
                                import &#123; Connection, Client &#125; from '@temporalio/client';<br/>
                                const connection = await Connection.connect(&#123; address: 'your-namespace.tmprl.cloud:7233' &#125;);<br/>
                                const client = new Client(&#123; connection &#125;);
                            </code>
                        </pre>
                         <p className="text-sm text-muted-foreground">
                            Workflows can then be triggered from your API routes or services.
                        </p>
                    </CardContent>
                     <CardFooter>
                        <Button type="button" variant="outline" asChild>
                            <Link href="/workflows/integration">Back to Integrations</Link>
                        </Button>
                    </CardFooter>
                </Card>
            </main>
        </DashboardLayout>
    );
}