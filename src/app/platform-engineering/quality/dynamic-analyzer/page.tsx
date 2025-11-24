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
    { id: 'zap', name: 'OWASP ZAP', features: ['Web app security testing', 'Proxy to intercept traffic', 'Automated and manual scanning'], benefits: ['Industry-standard for web security', 'Highly extensible with plugins', 'Free and community-supported'] },
    { id: 'valgrind', name: 'Valgrind', features: ['Memory leak detection (Memcheck)', 'Thread error detection (Helgrind)', 'Cache and branch-prediction profiling'], benefits: ['Finds complex memory bugs in C/C++', 'Improves application stability and performance'] },
    { id: 'llvm-sanitizers', name: 'LLVM/Clang Sanitizers', features: ['AddressSanitizer (ASan)', 'MemorySanitizer (MSan)', 'ThreadSanitizer (TSan)', 'UndefinedBehaviorSanitizer (UBSan)'], benefits: ['Compiler-based instrumentation', 'Low performance overhead', 'Detects a wide range of runtime errors'] },
    { id: 'klee', name: 'KLEE', features: ['Symbolic execution for C programs', 'Generates high-coverage test cases', 'Formally verifies code properties'], benefits: ['Finds deep, hard-to-reach bugs', 'Can prove the absence of certain errors'] },
    { id: 'chap', name: 'CHAP', features: ['Analyzes ELF core dump files', 'Detects memory corruption and leaks', 'No need to run the application live'], benefits: ['Useful for post-mortem debugging of crashes', 'Works on production crash dumps'] },
    { id: 'pex-and-moles', name: 'Pex and Moles', features: ['Automated white-box testing for .NET', 'Generates test inputs using dynamic analysis', 'Isolates code with "moles" (detours)'], benefits: ['Increases code coverage automatically', 'Finds edge-case bugs in .NET code'] },
    { id: 'intellitest', name: 'Microsoft IntelliTest', features: ['Generates unit tests for .NET code', 'Integrates with Visual Studio', 'Symbolic execution for test generation'], benefits: ['Automates creation of unit tests', 'Improves regression testing suite'] },
    { id: 'frida', name: 'Frida', features: ['Dynamic instrumentation toolkit', 'Inject JavaScript to explore native apps', 'Supports Windows, macOS, Linux, iOS, Android'], benefits: ['Powerful for reverse engineering and security research', 'Allows runtime manipulation and analysis'] },
    { id: 'dynamorio', name: 'DynamoRIO', features: ['Dynamic binary instrumentation framework', 'Build custom analysis tools', 'Cross-platform support'], benefits: ['Enables creation of powerful, custom dynamic tools', 'Used for performance analysis and security'] },
    { id: 'pin', name: 'Pin (Intel)', features: ['Dynamic binary analysis framework from Intel', 'Instrumentation at the instruction level', 'Supports Linux, Windows, macOS'], benefits: ['Fine-grained control for building analysis tools', 'Widely used in academic and industrial research'] },
];

const commercialTools = [
    { id: 'burp-suite', name: 'Burp Suite Professional', features: ['Advanced web vulnerability scanner', 'Manual testing tools (Proxy, Repeater)', 'Extensible via the BApp Store'], benefits: ['De-facto standard for web penetration testing', 'Combines automated and manual testing effectively'] },
    { id: 'acunetix', name: 'Acunetix', features: ['Automated DAST for web apps & APIs', 'Vulnerability scanning with low false positives', 'CI/CD integration'], benefits: ['Fast and easy to use for web security', 'Comprehensive reporting for compliance'] },
    { id: 'appscan', name: 'HCL AppScan', features: ['Enterprise DAST solution', 'IAST (Interactive Application Security Testing)', 'Mobile application scanning'], benefits: ['Scales for large enterprise needs', 'Broad coverage including mobile and APIs'] },
    { id: 'veracode-dynamic', name: 'Veracode Dynamic Analysis', features: ['Cloud-based DAST platform', 'Authentication and scheduling support', 'Detailed remediation guidance'], benefits: ['Easy to manage scans without local setup', 'Integrates with other Veracode security tools'] },
    { id: 'checkmarx-dast', name: 'Checkmarx DAST', features: ['Integration with SAST for full coverage', 'API and microservices scanning', 'Actionable results to fix vulnerabilities'], benefits: ['Correlates static and dynamic findings', 'Provides a holistic view of application security'] },
    { id: 'fortify-webinspect', name: 'Micro Focus Fortify WebInspect', features: ['Enterprise DAST scanner', 'Real-time analysis and feedback', 'Compliance reporting for major standards'], benefits: ['Deep analysis for complex web applications', 'Strong in enterprise environments'] },
    { id: 'insightappsec', name: 'Rapid7 InsightAppSec', features: ['Cloud-based DAST with CI/CD integration', 'Attack replay and validation', 'Universal translator for various API types'], benefits: ['Modern DAST for agile teams', 'Reduces false positives with attack replay'] },
    { id: 'qualys-was', name: 'Qualys Web Application Scanning', features: ['Cloud platform for security and compliance', 'Malware detection and vulnerability scanning', 'Integration with Qualys ecosystem'], benefits: ['Unified view of security across infrastructure and apps', 'Scalable cloud solution'] },
    { id: 'ldra', name: 'LDRA Testbed', features: ['Dynamic analysis for safety-critical systems', 'Code coverage analysis (DO-178B/C)', 'Target-based testing'], benefits: ['Ensures compliance with stringent safety standards', 'Essential for avionics, medical, and automotive'] },
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
                    <Link href={`/platform-engineering/quality/dynamic-analyzer/${tool.id}`}>
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
}

export default function DynamicAnalyzerIntegrationPage() {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        getUser().then(setUser);
    }, []);

    return (
        <DashboardLayout user={user}>
            <main className="flex-1 p-6 md:p-10">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">Dynamic Code Analysis Tool Integrations</h1>
                    <p className="text-muted-foreground">
                        An overview of popular open-source and commercial tools for dynamic code analysis (DAST).
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
                            This page provides an overview of various Dynamic Application Security Testing (DAST) and instrumentation tools. These tools analyze your running application to find security vulnerabilities, memory errors, and performance bottlenecks. Use the "Settings" button on each card to configure the integration with your CI/CD pipelines and development workflows.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
                
                <Accordion type="multiple" defaultValue={['open-source', 'commercial']} className="space-y-4">
                    <AccordionItem value="open-source">
                        <AccordionTrigger className="text-xl font-semibold bg-muted p-4 rounded-md">Open Source Dynamic Analysis Tools</AccordionTrigger>
                        <AccordionContent className="p-4 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {openSourceTools.map(tool => <ToolCard key={tool.id} tool={tool} />)}
                        </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="commercial">
                        <AccordionTrigger className="text-xl font-semibold bg-muted p-4 rounded-md">Commercial Dynamic Analysis Tools</AccordionTrigger>
                        <AccordionContent className="p-4 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                             {commercialTools.map(tool => <ToolCard key={tool.id} tool={tool} />)}
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>

            </main>
        </DashboardLayout>
    );
}
