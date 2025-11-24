
'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import type { User } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Settings, Info, CheckCircle, HelpCircle, CircleDot, Package } from 'lucide-react';
import Link from 'next/link';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { cn } from '@/lib/utils';

const statuses = [
    { text: 'Certified', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', icon: <CheckCircle className="h-3 w-3" /> },
    { text: 'In Qualification', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300', icon: <HelpCircle className="h-3 w-3" /> },
    { text: 'Evaluation Pending', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300', icon: <CircleDot className="h-3 w-3" /> },
    { text: 'In Inventory', color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300', icon: <Package className="h-3 w-3" /> },
];

const tools = [
  {
    id: 'fossology',
    name: 'FOSSology',
    features: ['Multi-scanner architecture (Nomos, Monk) for license detection', 'SPDX and Debian-copyright report generation', 'Copyright and export control scanning', 'Web-based UI and CLI integration', 'Bulk file processing and hierarchical license aggregation'],
    benefits: ['Comprehensive license compliance for large codebases', 'Standardized reporting for audits and legal compliance', 'Improved accuracy with multiple scanning algorithms', 'Scalable for enterprise environments'],
    status: statuses[0]
  },
  {
    id: 'ort',
    name: 'OSS Review Toolkit (ORT)',
    features: ['Modular pipeline (Analyzer, Downloader, Scanner, Advisor, Evaluator, Reporter)', 'Supports 20+ package managers for dependency analysis', 'Generates SBOMs in SPDX and CycloneDX formats', 'Policy-as-Code for automated compliance enforcement', 'CI/CD integration for real-time checks'],
    benefits: ['Automates compliance workflows reducing manual effort', 'Ensures continuous compliance in DevOps pipelines', 'Provides vulnerability and license risk insights', 'Improves governance with policy-driven approach'],
    status: statuses[0]
  },
  {
    id: 'licensee',
    name: 'Licensee',
    features: ['Detects project license from LICENSE files', 'Similarity scoring using Levenshtein distance', 'SPDX metadata support', 'Handles multiple license files and ambiguous cases'],
    benefits: ['Lightweight and easy to integrate for Ruby projects', 'Quick validation of license compliance', 'Reduces risk of using unlicensed dependencies'],
    status: statuses[1]
  },
  {
    id: 'go-licenses',
    name: 'go-licenses',
    features: ['CLI tool for scanning Go dependencies', 'Generates CSV reports and SBOMs', 'Collects license documents and compliance artifacts', 'Checks for forbidden licenses'],
    benefits: ['Simplifies compliance for Go projects', 'Ensures redistribution requirements are met', 'Quick detection of incompatible licenses'],
    status: statuses[2]
  },
  {
    id: 'licenseplist',
    name: 'LicensePlist',
    features: ['Generates plist of iOS dependencies’ licenses', 'Supports CocoaPods and Carthage', 'YAML configuration for custom entries', 'GitHub API integration for license info'],
    benefits: ['Automates license display in iOS apps', 'Improves transparency for end-users', 'Reduces manual effort in license tracking'],
    status: statuses[3]
  },
  {
    id: 'snipe-it',
    name: 'Snipe-IT',
    features: ['Web-based IT asset and license management', 'REST API for integrations', 'License expiration alerts', 'LDAP/SAML integration for user management', 'Barcode/QR code support for assets'],
    benefits: ['Centralized tracking of software and hardware assets', 'Improves compliance and reduces unused licenses', 'Enhances security with role-based access'],
    status: statuses[1]
  },
  {
    id: 'glpi',
    name: 'GLPI',
    features: ['Comprehensive ITSM with license tracking', 'CMDB for configuration and dependency mapping', 'Financial management for contracts and budgets', 'Plugin ecosystem for extended functionality', 'Compliance and audit reporting'],
    benefits: ['Combines ITSM and license management in one platform', 'Improves governance and cost control', 'Supports large-scale enterprise environments'],
    status: statuses[0]
  },
  {
    id: 'aikido',
    name: 'Aikido',
    features: ['AI-powered license risk scoring', 'Generates SBOMs in multiple formats', 'CI/CD integration for automated compliance', 'Auto-remediation and actionable insights', 'Full software supply chain security'],
    benefits: ['Combines license compliance with security scanning', 'Reduces risk of legal and security issues', 'Speeds up remediation with AI-driven insights'],
    status: statuses[2]
  }
];

type Tool = typeof tools[0];

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
          <h3 className="font-semibold mb-2">Features</h3>
          <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
            {tool.features.map((feature, i) => <li key={i}>{feature}</li>)}
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Benefits</h3>
           <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
            {tool.benefits.map((benefit, i) => <li key={i}>{benefit}</li>)}
          </ul>
        </div>
      </CardContent>
       <CardFooter>
          <Button variant="outline" asChild>
              <Link href={`/license/tools/${tool.id}`}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
              </Link>
          </Button>
      </CardFooter>
    </Card>
  );
}

export default function LicenseToolsPage() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    getUser().then(setUser);
  }, []);

  return (
    <DashboardLayout user={user}>
      <main className="flex-1 p-6 md:p-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">LMS Integrations</h1>
          <p className="text-muted-foreground">An overview of popular open-source license compliance and management tools.</p>
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
                    This page provides an overview of various License Management System (LMS) tools that can be integrated into your CI/CD and development workflows. These tools help automate the process of license scanning, compliance checking, and reporting. You can configure the connection to each tool via its "Settings" page to enable seamless integration.
                </AccordionContent>
            </AccordionItem>
        </Accordion>
        
        <ScrollArea className="h-[calc(100vh-16rem)]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pr-4">
            {tools.map(tool => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </ScrollArea>
      </main>
    </DashboardLayout>
  );
}
