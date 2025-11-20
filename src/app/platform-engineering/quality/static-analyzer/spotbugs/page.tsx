'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import type { User } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { Terminal } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function SpotBugsSettingsPage() {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        getUser().then(setUser);
    }, []);

    return (
        <DashboardLayout user={user}>
            <main className="flex-1 p-6 md:p-10">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">SpotBugs Integration</h1>
                    <p className="text-muted-foreground">Information on using the SpotBugs static analysis tool for Java.</p>
                </div>

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Terminal /> Build Tool Integration</CardTitle>
                        <CardDescription>
                            SpotBugs is typically run as a plugin for build tools like Maven or Gradle.
                            <a href="https://spotbugs.readthedocs.io/en/latest/maven.html" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-2">
                                Documentation
                            </a>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p>
                            To use SpotBugs, add the plugin to your `pom.xml` or `build.gradle` and configure it to run during the build.
                        </p>
                        <pre className="p-4 rounded-md bg-muted text-sm">
                            <code>
                                &lt;!-- Example Maven pom.xml configuration --&gt; <br/>
                                &lt;plugin&gt;<br/>
                                  &lt;groupId&gt;com.github.spotbugs&lt;/groupId&gt;<br/>
                                  &lt;artifactId&gt;spotbugs-maven-plugin&lt;/artifactId&gt;<br/>
                                  &lt;version&gt;4.8.3.0&lt;/version&gt;<br/>
                                  &lt;executions&gt;...&lt;/executions&gt;<br/>
                                &lt;/plugin&gt;
                            </code>
                        </pre>
                    </CardContent>
                     <CardFooter>
                        <Button type="button" variant="outline" asChild>
                            <Link href="/platform-engineering/quality/static-analyzer">Back to Integrations</Link>
                        </Button>
                    </CardFooter>
                </Card>
            </main>
        </DashboardLayout>
    );
}
