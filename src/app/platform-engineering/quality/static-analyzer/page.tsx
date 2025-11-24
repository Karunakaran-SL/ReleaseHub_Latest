
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
    { id: 'sonarqube', name: 'SonarQube', features: ['Continuous code quality inspection', 'Supports 30+ languages', 'Integrates with CI/CD pipelines'], benefits: ['Comprehensive code health overview', 'Automates code reviews', 'Identifies bugs, vulnerabilities, and code smells early'], status: statuses[0] },
    { id: 'clang', name: 'Clang Static Analyzer', features: ['Built into the Clang compiler', 'Finds bugs in C, C++, and Objective-C', 'Control-flow graphs and path-sensitive analysis'], benefits: ['Deep analysis of C-family languages', 'Catches complex bugs like null pointer dereferences', 'Integrated directly into the build process'], status: statuses[1] },
    { id: 'eslint', name: 'ESLint', features: ['Pluggable linting utility for JavaScript/TypeScript', 'Customizable rules', 'Automatically fix problems'], benefits: ['Enforces consistent code style', 'Prevents common errors in JavaScript', 'Large ecosystem of plugins and configurations'], status: statuses[0] },
    { id: 'pmd', name: 'PMD', features: ['Source code analyzer for multiple languages', 'Detects common programming flaws like unused variables and empty catch blocks', 'Supports Java, JavaScript, Apex, etc.'], benefits: ['Improves code maintainability', 'Catches inefficient code patterns'], status: statuses[2] },
    { id: 'checkstyle', name: 'Checkstyle', features: ['Enforces coding standards for Java', 'Highly configurable rule sets', 'Validates Javadoc comments'], benefits: ['Ensures code adheres to a defined standard', 'Maintains a consistent look and feel across projects'], status: statuses[3] },
    { id: 'cppcheck', name: 'Cppcheck', features: ['Static analysis tool for C/C++ code', 'Detects undefined behavior and dangerous coding constructs', 'Command-line and GUI versions available'], benefits: ['Finds bugs that compilers usually don\'t see', 'Focuses on correctness and portability'], status: statuses[1] },
    { id: 'spotbugs', name: 'SpotBugs (formerly FindBugs)', features: ['Analyzes Java bytecode to find bugs', 'Over 400 bug patterns', 'Integrates with popular build tools (Maven, Gradle)'], benefits: ['Detects bugs at the bytecode level', 'Finds subtle issues that are hard to spot in source code'], status: statuses[2] },
    { id: 'bandit', name: 'Bandit', features: ['Security-focused static analysis for Python', 'Scans for common security issues like SQL injection', 'Generates security reports'], benefits: ['Secures Python codebases from known vulnerabilities', 'Easy to integrate into CI/CD for security checks'], status: statuses[0] },
    { id: 'flake8', name: 'Flake8', features: ['Wrapper around PyFlakes, pycodestyle, and McCabe script', 'Checks for PEP 8 compliance and logical errors', 'Pluggable architecture'], benefits: ['Simple and fast way to enforce Python code quality', 'Combines style, error, and complexity checking'], status: statuses[3] },
    { id: 'codeql', name: 'CodeQL', features: ['Semantic code analysis engine', 'Query language (QL) to find vulnerabilities', 'Supports a wide range of languages'], benefits: ['Enables discovery of complex, variant vulnerabilities', 'Used by GitHub for security analysis (Dependabot)'], status: statuses[1] },
    { id: 'coccinelle', name: 'Coccinelle', features: ['Pattern matching and transformation for C code', 'Automates large-scale code refactoring', 'Used extensively in the Linux kernel'], benefits: ['Ideal for evolving and maintaining large C codebases', 'Can automatically apply fixes for found issues'], status: statuses[3] },
    { id: 'infer', name: 'Infer (by Meta)', features: ['Static analysis for Java, C, C++, and Objective-C', 'Detects null pointer exceptions, resource leaks, and annotation reachability', 'Incremental analysis for speed'], benefits: ['Catches critical runtime errors before they happen', 'Scales to large mobile and backend applications'], status: statuses[1] },
    { id: 'semgrep', name: 'Semgrep', features: ['Lightweight static analysis for many languages', 'Simple, YAML-based custom rule syntax', 'Fast and CI-friendly'], benefits: ['Easy to write custom rules for your codebase', 'Finds security vulnerabilities and enforces code standards'], status: statuses[0] },
];

const commercialTools = [
    { id: 'checkmarx', name: 'Checkmarx SAST', features: ['Deep vulnerability scanning with query language', 'Incremental scanning for faster feedback', 'Supports a vast number of languages and frameworks'], benefits: ['High-accuracy vulnerability detection', 'Excellent for security-critical applications', 'Provides detailed remediation guidance'], status: statuses[0] },
    { id: 'coverity', name: 'Synopsys Coverity', features: ['Detects critical defects and security vulnerabilities', 'Integrates with developer IDEs and CI/CD pipelines', 'Compliance with standards like MISRA and AUTOSAR C++'], benefits: ['Trusted in safety-critical industries (automotive, medical)', 'Low false-positive rate'], status: statuses[1] },
    { id: 'fortify', name: 'Micro Focus Fortify SCA', features: ['Comprehensive security analysis across 27+ languages', 'Actionable remediation guidance with code examples', 'Supports OWASP Top 10, CWE, and other standards'], benefits: ['Enterprise-grade application security platform', 'Helps achieve regulatory compliance'], status: statuses[2] },
    { id: 'veracode', name: 'Veracode Static Analysis', features: ['Cloud-based scanning pipeline', 'Provides a pass/fail security score for applications', 'Integrates with build systems and IDEs'], benefits: ['Simplifies security scanning with a SaaS model', 'Provides clear, actionable results for developers'], status: statuses[0] },
    { id: 'mend', name: 'Mend SAST', features: ['AI-powered detection of security vulnerabilities', 'Automatic remediation suggestions', 'Focuses on both custom code and open-source dependencies'], benefits: ['Reduces manual triage with high-precision findings', 'Accelerates the fix process with automated suggestions'], status: statuses[3] },
    { id: 'aikido', name: 'Aikido Security', features: ['SaaS-based SAST designed for DevOps', 'Combines SAST, SCA, and other security scans in one platform', 'Focuses on "no false positives" and actionable issues'], benefits: ['Developer-friendly and easy to set up', 'Reduces security noise for engineering teams'], status: statuses[1] },
    { id: 'axivion', name: 'Axivion Suite', features: ['Static analysis for style checking, metrics, and architecture violations', 'Specializes in C/C++ for safety-critical systems', 'MISRA, AUTOSAR C++14 compliance'], benefits: ['Ensures code quality and safety for embedded systems', 'Visualizes architecture and dependencies'], status: statuses[3] },
    { id: 'astree', name: 'Astrée', features: ['Sound static analyzer that proves the absence of runtime errors', 'Focuses on C/C++ code', 'Used in aeronautics, space, and automotive industries'], benefits: ['Mathematically guarantees code is free from certain critical errors', 'Essential for the most safety-critical software'], status: statuses[2] },
    { id: 'codescene', name: 'CodeScene', features: ['Behavioral code analysis using version control history', 'Identifies technical debt hotspots and team coupling', 'Visualizes code health and development trends'], benefits: ['Prioritizes technical debt based on actual development activity', 'Provides insights into team productivity and knowledge silos'], status: statuses[1] },
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
                    <Link href={`/platform-engineering/quality/static-analyzer/${tool.id}`}>
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
}

export default function StaticAnalyzerPage() {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        getUser().then(setUser);
    }, []);

    return (
        <DashboardLayout user={user}>
            <main className="flex-1 p-6 md:p-10">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">Static Code Analysis Tool Integrations</h1>
                    <p className="text-muted-foreground">
                        An overview of popular open-source and commercial tools for static code analysis.
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
                            This page provides an overview of various Static Application Security Testing (SAST) tools. These tools analyze your source code to find security vulnerabilities, code quality issues, and compliance violations without executing the program. Use the "Settings" button on each card to configure the integration with your CI/CD pipelines.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>

                <Accordion type="multiple" defaultValue={['open-source', 'commercial']} className="space-y-4">
                    <AccordionItem value="open-source">
                        <AccordionTrigger className="text-xl font-semibold bg-muted p-4 rounded-md">Open Source Static Code Analysis Tools</AccordionTrigger>
                        <AccordionContent className="p-4 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {openSourceTools.map(tool => <ToolCard key={tool.id} tool={tool} />)}
                        </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="commercial">
                        <AccordionTrigger className="text-xl font-semibold bg-muted p-4 rounded-md">Commercial Static Code Analysis Tools</AccordionTrigger>
                        <AccordionContent className="p-4 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                             {commercialTools.map(tool => <ToolCard key={tool.id} tool={tool} />)}
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>

            </main>
        </DashboardLayout>
    );
}
