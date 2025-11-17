
'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import type { User } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const openSourceTools = [
    { name: 'GLPI', features: ['ITIL-compliant service desk with CMDB', 'Hardware & software inventory management', 'License tracking and software auditing'], benefits: ['Cost-effective for enterprises', 'Highly customizable and community-supported', 'Integrates with FusionInventory'] },
    { name: 'iTop', features: ['Complete ITIL service management suite', 'CMDB with relationship mapping', 'Incident, change, and SLA management'], benefits: ['Ideal for organizations needing ITSM + CMDB', 'Strong plugin ecosystem', 'Supports automation'] },
    { name: 'Ralph', features: ['Asset management and DCIM', 'CMDB for hardware and software assets', 'Barcode support'], benefits: ['Great for data center environments', 'Simple yet powerful for asset tracking'] },
    { name: 'CMDBuild', features: ['Customizable CMDB for asset and workflow management', 'Advanced modeling for relationships'], benefits: ['Flexible for complex IT environments', 'Supports workflow automation'] },
    { name: 'i-doit', features: ['Web-based IT documentation and CMDB', 'Supports ITIL processes', 'Deep customization and add-ons'], benefits: ['Ideal for detailed IT documentation', 'Strong community support'] },
    { name: 'DATAGERRY', features: ['Enterprise-grade open-source CMDB', 'Dynamic object type configuration'], benefits: ['Highly adaptable for custom environments', 'Scalable for large deployments'] },
];

const commercialTools = [
    { name: 'ServiceNow CMDB', features: ['Cloud-based CMDB with ITSM', 'Automated discovery and service mapping', 'Visualization dashboards'], benefits: ['Enterprise-grade with strong ITIL alignment', 'AI-ready for predictive insights', 'Seamless ServiceNow ecosystem integration'] },
    { name: 'BMC Helix CMDB', features: ['Comprehensive IT asset and service mapping', 'Automated discovery and reconciliation', 'Integration with ITIL processes'], benefits: ['Ideal for large, complex IT landscapes', 'Strong compliance and governance features'] },
    { name: 'Device42', features: ['Agentless auto-discovery for hybrid environments', 'Relationship mapping and visualization', 'RESTful APIs for custom integrations'], benefits: ['Excellent for hybrid cloud and on-prem', 'Reduces manual effort with automation'] },
    { name: 'Freshservice', features: ['Auto-updating CMDB with real-time connectors', 'SaaS, hardware, and software asset management', 'Integration with orchestration tools'], benefits: ['Great for modern enterprises using SaaS', 'Improves change management'] },
    { name: 'SolarWinds CMDB', features: ['Network-focused CMDB with asset discovery', 'Integration with monitoring and ITSM tools'], benefits: ['Ideal for network-heavy environments', 'Strong visualization capabilities'] },
    { name: 'Virima', features: ['Advanced service mapping and visualization', 'Automated maintenance and near real-time insights'], benefits: ['Great for contextual visualization', 'Enhances ITSM processes'] },
];

function ToolCard({ tool }: { tool: { name: string; features: string[]; benefits: string[] } }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{tool.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
        </Card>
    );
}

export default function CMDBIntegrationPage() {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        getUser().then(setUser);
    }, []);

    return (
        <DashboardLayout user={user}>
            <main className="flex-1 p-6 md:p-10">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">CMDB Integration</h1>
                    <p className="text-muted-foreground">
                        An overview of popular open-source and commercial Configuration Management Database (CMDB) tools.
                    </p>
                </div>
                
                <Accordion type="multiple" defaultValue={['open-source', 'commercial']} className="space-y-4">
                    <AccordionItem value="open-source">
                        <AccordionTrigger className="text-xl font-semibold bg-muted p-4 rounded-md">Open Source Tools</AccordionTrigger>
                        <AccordionContent className="p-4 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {openSourceTools.map(tool => <ToolCard key={tool.name} tool={tool} />)}
                        </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="commercial">
                        <AccordionTrigger className="text-xl font-semibold bg-muted p-4 rounded-md">Commercial Tools</AccordionTrigger>
                        <AccordionContent className="p-4 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                             {commercialTools.map(tool => <ToolCard key={tool.name} tool={tool} />)}
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>

            </main>
        </DashboardLayout>
    );
}
