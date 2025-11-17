
'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import type { User } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { Terminal } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function LicensePlistSettingsPage() {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        getUser().then(setUser);
    }, []);

    return (
        <DashboardLayout user={user}>
            <main className="flex-1 p-6 md:p-10">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">LicensePlist Integration</h1>
                    <p className="text-muted-foreground">Information on using the LicensePlist tool for iOS projects.</p>
                </div>

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Terminal /> Project-Level Configuration</CardTitle>
                        <CardDescription>
                            LicensePlist is typically configured and run within your Xcode project repository.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p>
                            To use LicensePlist, add it to your project (e.g., via Mint or CocoaPods) and configure it with a `license_plist.yml` file. It is run during the build process.
                        </p>
                        <pre className="p-4 rounded-md bg-muted text-sm">
                            <code>
                                # Example: Run as a build script in Xcode <br/>
                                if which mint &gt;/dev/null; then <br/>
                                  mint run mono0926/LicensePlist <br/>
                                else <br/>
                                  echo "warning: Mint not installed" <br/>
                                fi
                            </code>
                        </pre>
                         <p className="text-sm text-muted-foreground">
                            The output is added to your app's settings bundle for display within the app.
                        </p>
                    </CardContent>
                     <CardFooter>
                        <Button type="button" variant="outline" asChild>
                            <Link href="/license/tools">Back to Integrations</Link>
                        </Button>
                    </CardFooter>
                </Card>
            </main>
        </DashboardLayout>
    );
}
