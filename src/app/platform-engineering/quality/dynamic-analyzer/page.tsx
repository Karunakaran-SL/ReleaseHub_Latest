
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

const iconMap = {
    CheckCircle: <CheckCircle className="h-3 w-3" />,
    HelpCircle: <HelpCircle className="h-3 w-3" />,
    CircleDot: <CircleDot className="h-3 w-3" />,
    Package: <Package className="h-3 w-3" />,
};

const statuses = [
    { text: 'Certified', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', icon: 'CheckCircle' },
    { text: 'In Qualification', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300', icon: 'HelpCircle' },
    { text: 'Evaluation Pending', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300', icon: 'CircleDot' },
    { text: 'In Inventory', color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300', icon: 'Package' },
];

const openSourceTools = [
    { id: 'zap', name: 'OWASP ZAP', features: ['Web app security testing', 'Proxy to intercept traffic', 'Automated and manual scanning'], benefits: ['Industry-standard for web security', 'Highly extensible with plugins', 'Free and community-supported'], status: statuses[0] },
    { id: 'valgrind', name: 'Valgrind', features: ['Memory leak detection (Memcheck)', 'Thread error detection (Helgrind)', 'Cache and branch-prediction profiling'], benefits: ['Finds complex memory bugs in C/C++', 'Improves application stability and performance'], status: statuses[0] },
    { id: 'llvm-sanitizers', name: 'LLVM/Clang Sanitizers', features: ['AddressSanitizer (ASan)', 'MemorySanitizer (MSan)', 'ThreadSanitizer (TSan)', 'UndefinedBehaviorSanitizer (UBSan)'], benefits: ['Compiler-based instrumentation', 'Low performance overhead', 'Detects a wide range of runtime errors'], status: statuses[1] },
    { id: 'klee', name: 'KLEE', features: ['Symbolic execution for C programs', 'Generates high-coverage test cases', 'Formally verifies code properties'], benefits: ['Finds deep, hard-to-reach bugs', 'Can prove the absence of certain errors'], status: statuses[2] },
    { id: 'chap', name: 'CHAP', features: ['Analyzes ELF core dump files', 'Detects memory corruption and leaks', 'No need to run the application live'], benefits: ['Useful for post-mortem debugging of crashes', 'Works on production crash dumps'], status: statuses[3] },
    { id: 'pex-and-moles', name: 'Pex and Moles', features: ['Automated white-box testing for .NET', 'Generates test inputs using dynamic analysis', 'Isolates code with "moles" (detours)'], benefits: ['Increases code coverage automatically', 'Finds edge-case bugs in .NET code'], status: statuses[3] },
    { id: 'intellitest', name: 'Microsoft IntelliTest', features: ['Generates unit tests for .NET code', 'Integrates with Visual Studio', 'Symbolic execution for test generation'], benefits: ['Automates creation of unit tests', 'Improves regression testing suite'], status: statuses[1] },
    { id: 'frida', name: 'Frida', features: ['Dynamic instrumentation toolkit', 'Inject JavaScript to explore native apps', 'Supports Windows, macOS, Linux, iOS, Android'], benefits: ['Powerful for reverse engineering and security research', 'Allows runtime manipulation and analysis'], status: statuses[2] },
    { id: 'dynamorio', name: 'DynamoRIO', features: ['Dynamic binary instrumentation framework', 'Build custom analysis tools', 'Cross-platform support'], benefits: ['Enables creation of powerful, custom dynamic tools', 'Used for performance analysis and security'], status: statuses[3] },
    { id: 'pin', name: 'Pin (Intel)', features: ['Dynamic binary analysis framework from Intel', 'Instrumentation at the instruction level', 'Supports Linux, Windows, macOS'], benefits: ['Fine-grained control for building analysis tools', 'Widely used in academic and industrial research'], status: statuses[3] },
];

const commercialTools = [
    { id: 'burp-suite', name: 'Burp Suite Professional', features: ['Advanced web vulnerability scanner', 'Manual testing tools (Proxy, Repeater)', 'Extensible via the BApp Store'], benefits: ['De-facto standard for web penetration testing', 'Combines automated and manual testing effectively'], status: statuses[0] },
    { id: 'acunetix', name: 'Acunetix', features: ['Automated DAST for web apps & APIs', 'Vulnerability scanning with low false positives', 'CI/CD integration'], benefits: ['Fast and easy to use for web security', 'Comprehensive reporting for compliance'], status: statuses[1] },
    { id: 'appscan', name: 'HCL AppScan', features: ['Enterprise DAST solution', 'IAST (Interactive Application Security Testing)', 'Mobile application scanning'], benefits: ['Scales for large enterprise needs', 'Broad coverage including mobile and APIs'], status: statuses[2] },
    { id: 'veracode-dynamic', name: 'Veracode Dynamic Analysis', features: ['Cloud-based DAST platform', 'Authentication and scheduling support', 'Detailed remediation guidance'], benefits: ['Simplifies security scanning with a SaaS model', 'Provides clear, actionable results for developers'], status: statuses[0] },
    { id: 'checkmarx-dast', name: 'Checkmarx DAST', features: ['Integration with SAST for full coverage', 'API and microservices scanning', 'Actionable results to fix vulnerabilities'], benefits: ['Correlates static and dynamic findings', 'Provides a holistic view of application security'], status: statuses[3] },
    { id: 'fortify-webinspect', name: 'Micro Focus Fortify WebInspect', features: ['Enterprise DAST scanner', 'Real-time analysis and feedback', 'Compliance reporting for major standards'], benefits: ['Deep analysis for complex web applications', 'Strong in enterprise environments'], status: statuses[3] },
    { id: 'insightappsec', name: 'Rapid7 InsightAppSec', features: ['Cloud-based DAST with CI/CD integration', 'Attack replay and validation', 'Universal translator for various API types'], benefits: ['Modern DAST for agile teams', 'Reduces false positives with attack replay'], status: statuses[1] },
    { id: 'qualys-was', name: 'Qualys Web Application Scanning', features: ['Cloud platform for security and compliance', 'Malware detection and vulnerability scanning', 'Integration with Qualys ecosystem'], benefits: ['Unified view of security across infrastructure and apps', 'Scalable cloud solution'], status: statuses[2] },
    { id: 'ldra', name: 'LDRA Testbed', features: ['Dynamic analysis for safety-critical systems', 'Code coverage analysis (DO-178B/C)', 'Target-based testing'], benefits: ['Ensures compliance with stringent safety standards', 'Essential for avionics, medical, and automotive'], status: statuses[0] },
];

type Tool = typeof openSourceTools[0];

function ToolCard({ tool }: { tool: Tool }) {
    return (
        <Card className="flex flex-col">
            <CardHeader>
                 <div className="flex justify-between items-start">
                    <CardTitle>{tool.name}</CardTitle>
                    <Badge className={cn("flex items-center gap-1", tool.status.color)}>
                        {iconMap[tool.status.icon as keyof typeof iconMap]}
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
