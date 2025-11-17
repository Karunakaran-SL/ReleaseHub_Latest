
'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import type { User } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import Link from 'next/link';

const tools = [
  {
    id: 'fossology',
    name: 'FOSSology',
    features: ['Multi-scanner architecture (Nomos, Monk) for license detection', 'SPDX and Debian-copyright report generation', 'Copyright and export control scanning', 'Web-based UI and CLI integration', 'Bulk file processing and hierarchical license aggregation', 'User/group management and audit logs'],
    benefits: ['Comprehensive license compliance for large codebases', 'Standardized reporting for audits and legal compliance', 'Improved accuracy with multiple scanning algorithms', 'Scalable for enterprise environments']
  },
  {
    id: 'ort',
    name: 'OSS Review Toolkit (ORT)',
    features: ['Modular pipeline (Analyzer, Downloader, Scanner, Advisor, Evaluator, Reporter)', 'Supports 20+ package managers for dependency analysis', 'Generates SBOMs in SPDX and CycloneDX formats', 'Policy-as-Code for automated compliance enforcement', 'CI/CD integration for real-time checks'],
    benefits: ['Automates compliance workflows reducing manual effort', 'Ensures continuous compliance in DevOps pipelines', 'Provides vulnerability and license risk insights', 'Improves governance with policy-driven approach']
  },
  {
    id: 'licensee',
    name: 'Licensee',
    features: ['Detects project license from LICENSE files', 'Similarity scoring using Levenshtein distance', 'SPDX metadata support', 'Handles multiple license files and ambiguous cases'],
    benefits: ['Lightweight and easy to integrate for Ruby projects', 'Quick validation of license compliance', 'Reduces risk of using unlicensed dependencies']
  },
  {
    id: 'go-licenses',
    name: 'go-licenses',
    features: ['CLI tool for scanning Go dependencies', 'Generates CSV reports and SBOMs', 'Collects license documents and compliance artifacts', 'Checks for forbidden licenses'],
    benefits: ['Simplifies compliance for Go projects', 'Ensures redistribution requirements are met', 'Quick detection of incompatible licenses']
  },
  {
    id: 'licenseplist',
    name: 'LicensePlist',
    features: ['Generates plist of iOS dependencies’ licenses', 'Supports CocoaPods and Carthage', 'YAML configuration for custom entries', 'GitHub API integration for license info'],
    benefits: ['Automates license display in iOS apps', 'Improves transparency for end-users', 'Reduces manual effort in license tracking']
  },
  {
    id: 'snipe-it',
    name: 'Snipe-IT',
    features: ['Web-based IT asset and license management', 'REST API for integrations', 'License expiration alerts', 'LDAP/SAML integration for user management', 'Barcode/QR code support for assets'],
    benefits: ['Centralized tracking of software and hardware assets', 'Improves compliance and reduces unused licenses', 'Enhances security with role-based access']
  },
  {
    id: 'glpi',
    name: 'GLPI',
    features: ['Comprehensive ITSM with license tracking', 'CMDB for configuration and dependency mapping', 'Financial management for contracts and budgets', 'Plugin ecosystem for extended functionality', 'Compliance and audit reporting'],
    benefits: ['Combines ITSM and license management in one platform', 'Improves governance and cost control', 'Supports large-scale enterprise environments']
  },
  {
    id: 'aikido',
    name: 'Aikido',
    features: ['AI-powered license risk scoring', 'Generates SBOMs in multiple formats', 'CI/CD integration for automated compliance', 'Auto-remediation and actionable insights', 'Full software supply chain security'],
    benefits: ['Combines license compliance with security scanning', 'Reduces risk of legal and security issues', 'Speeds up remediation with AI-driven insights']
  }
];

export default function LicenseToolsPage() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    getUser().then(setUser);
  }, []);

  return (
    <DashboardLayout user={user}>
      <main className="flex-1 p-6 md:p-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">License Management Tools</h1>
          <p className="text-muted-foreground">An overview of popular open-source license compliance and management tools.</p>
        </div>
        <ScrollArea className="h-[calc(100vh-12rem)]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pr-4">
            {tools.map(tool => (
              <Card key={tool.name} className="flex flex-col">
                <CardHeader>
                  <CardTitle>{tool.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 flex-grow">
                  <div>
                    <h3 className="font-semibold mb-2">Features</h3>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      {tool.features.map((feature, i) => <li key={i}>{feature}</li>)}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Benefits</h3>
                     <ul className="list-disc pl-5 space-y-1 text-sm">
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
            ))}
          </div>
        </ScrollArea>
      </main>
    </DashboardLayout>
  );
}
