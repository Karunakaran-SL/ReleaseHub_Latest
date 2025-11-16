
'use client';
import { useState, useEffect, useCallback } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/app/dashboard-layout';
import type { User, OnboardingConfiguration } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { ApprovalForm } from './_components/approval-form';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';

type ApprovalType = 
    | 'product-onboarding' 
    | 'tenant-approval' 
    | 'components-approval'
    | 'application-approval'
    | 'interface-approval'
    | 'baseline-approval'
    | 'deployment-approval'
    | 'upgrade-approval'
    | 'migration-approval'
    | 'decommission-approval'
    | 'license-approval'
    | 'export-control-approval'
    | 'security-approval';

const approvalTypes: { key: ApprovalType, name: string }[] = [
    { key: 'product-onboarding', name: 'Product Onboarding Approval' },
    { key: 'tenant-approval', name: 'Tenant Approval' },
    { key: 'components-approval', name: 'Components Approval' },
    { key: 'application-approval', name: 'Application Approval' },
    { key: 'interface-approval', name: 'Interface Approval' },
    { key: 'baseline-approval', name: 'Baseline Approval' },
    { key: 'deployment-approval', name: 'Deployment Approval' },
    { key: 'upgrade-approval', name: 'Upgrade Approval' },
    { key: 'migration-approval', name: 'Migration Approval' },
    { key: 'decommission-approval', name: 'Decommission Approval' },
    { key: 'license-approval', name: 'License Approval' },
    { key: 'export-control-approval', name: 'Export Control Approval' },
    { key: 'security-approval', name: 'Security Approval' },
];


export default function ApprovalSettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [configs, setConfigs] = useState<Record<string, OnboardingConfiguration[]>>({});

  const fetchConfigs = useCallback(async () => {
    setLoading(true);
    try {
      const responses = await Promise.all(
        approvalTypes.map(type => fetch(`/api/settings/approvals/${type.key}`))
      );

      const newConfigs: Record<string, OnboardingConfiguration[]> = {};

      for (let i = 0; i < approvalTypes.length; i++) {
        const typeKey = approvalTypes[i].key;
        if (responses[i].ok) {
          const data = await responses[i].json();
          newConfigs[typeKey] = data;
        } else {
          toast({
            variant: 'destructive',
            title: `Failed to fetch ${approvalTypes[i].name} configurations.`,
          });
          newConfigs[typeKey] = [];
        }
      }
      setConfigs(newConfigs);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'An error occurred while fetching configurations.',
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    getUser().then(setUser);
    fetchConfigs();
  }, [fetchConfigs]);

  const getLatestConfig = (type: string): OnboardingConfiguration | null => {
    const history = configs[type];
    if (!history || history.length === 0) {
        return null;
    }
    // Find the config with the highest version number
    return history.reduce((latest, current) => 
        (current.version > latest.version) ? current : latest
    );
  };
  
  const handleSave = async (type: string, data: OnboardingConfiguration) => {
      setLoading(true);
      try {
          const response = await fetch(`/api/settings/approvals/${type}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data),
          });

          if (response.ok) {
              toast({ title: 'Success', description: `Approval configuration saved.` });
              fetchConfigs();
          } else {
              const errorData = await response.json();
              toast({ variant: 'destructive', title: 'Error', description: errorData.message || 'Failed to save configuration.' });
          }
      } catch (error) {
          console.error(error);
          toast({ variant: 'destructive', title: 'Error', description: 'An unexpected error occurred.' });
      } finally {
          setLoading(false);
      }
  };


  const renderVersionHistory = (type: string, name: string) => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Version History</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{name} Version History</DialogTitle>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Version</TableHead>
                        <TableHead>Created At</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {(configs[type] || []).map(config => (
                        <TableRow key={config._id}>
                           <TableCell>v{config.version}</TableCell>
                           <TableCell>{config._id ? format(new Date(parseInt(config._id.substring(0, 8), 16) * 1000), "yyyy-MM-dd HH:mm:ss") : 'N/A'}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <DashboardLayout user={user}>
      <main className="flex-1 p-6 md:p-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Approval Configuration</h1>
            <p className="text-muted-foreground">
              Define the phases and steps for different approval processes.
            </p>
          </div>
        </div>

        {loading && Object.keys(configs).length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <Accordion type="single" collapsible className="w-full space-y-4">
            {approvalTypes.map((type) => (
              <AccordionItem value={type.key} key={type.key}>
                <AccordionTrigger className="bg-muted hover:bg-muted/90 text-foreground font-bold text-lg p-4 rounded-md">
                  {type.name}
                </AccordionTrigger>
                <AccordionContent className="p-4 border border-t-0 rounded-b-md">
                  {renderVersionHistory(type.key, type.name)}
                  <ApprovalForm
                      key={`${type.key}-${getLatestConfig(type.key)?.version || 0}`}
                      initialData={getLatestConfig(type.key)}
                      onSave={(data) => handleSave(type.key, data)}
                      isLoading={loading}
                      name={type.name}
                  />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </main>
    </DashboardLayout>
  );
}
