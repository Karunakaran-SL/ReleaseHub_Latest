
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
import { OnboardingForm } from './_components/onboarding-form';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';

type OnboardingType = 'tenant' | 'component' | 'application';

export default function OnboardingSettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [configs, setConfigs] = useState<Record<OnboardingType, OnboardingConfiguration[]>>({
    tenant: [],
    component: [],
    application: [],
  });

  const fetchConfigs = useCallback(async () => {
    setLoading(true);
    try {
      const types: OnboardingType[] = ['tenant', 'component', 'application'];
      const responses = await Promise.all(
        types.map(type => fetch(`/api/settings/${type}-onboarding`))
      );

      const newConfigs: Record<OnboardingType, OnboardingConfiguration[]> = {
        tenant: [],
        component: [],
        application: [],
      };

      for (let i = 0; i < types.length; i++) {
        if (responses[i].ok) {
          const data = await responses[i].json();
          newConfigs[types[i]] = data;
        } else {
          toast({
            variant: 'destructive',
            title: `Failed to fetch ${types[i]} onboarding configurations.`,
          });
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

  const getLatestConfig = (type: OnboardingType) => {
    const history = configs[type];
    if (!history || history.length === 0) return null;
    return history.reduce((latest, current) =>
      current.version > latest.version ? current : latest
    );
  };
  
  const handleSave = async (type: OnboardingType, data: OnboardingConfiguration) => {
      setLoading(true);
      try {
          const response = await fetch(`/api/settings/${type}-onboarding`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data),
          });

          if (response.ok) {
              toast({ title: 'Success', description: `${type.charAt(0).toUpperCase() + type.slice(1)} onboarding configuration saved.` });
              fetchConfigs(); // Re-fetch to get the latest version
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


  const renderVersionHistory = (type: OnboardingType) => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Version History</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{type.charAt(0).toUpperCase() + type.slice(1)} Onboarding Version History</DialogTitle>
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
                    {configs[type].map(config => (
                        <TableRow key={config._id}>
                           <TableCell>v{config.version}</TableCell>
                           {/* Assuming the _id is an ObjectId from mongo */}
                           <TableCell>{format(new Date(parseInt(config._id.substring(0, 8), 16) * 1000), "yyyy-MM-dd HH:mm:ss")}</TableCell>
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
            <h1 className="text-3xl font-bold">Onboarding Configuration</h1>
            <p className="text-muted-foreground">
              Define the phases and steps for different onboarding processes.
            </p>
          </div>
        </div>

        {loading && !Object.values(configs).some(c => c.length > 0) ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <Accordion type="single" collapsible className="w-full space-y-4">
            <AccordionItem value="tenant-onboarding">
              <AccordionTrigger className="bg-muted hover:bg-muted/90 text-foreground font-bold text-lg p-4 rounded-md">
                Tenant Onboarding
              </AccordionTrigger>
              <AccordionContent className="p-4 border border-t-0 rounded-b-md">
                {renderVersionHistory('tenant')}
                <OnboardingForm
                    key={getLatestConfig('tenant')?.version || 0} // Force re-render on new version
                    initialData={getLatestConfig('tenant')}
                    onSave={(data) => handleSave('tenant', data)}
                    isLoading={loading}
                    name="Tenant Onboarding"
                />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="component-onboarding">
              <AccordionTrigger className="bg-muted hover:bg-muted/90 text-foreground font-bold text-lg p-4 rounded-md">
                Component Onboarding
              </AccordionTrigger>
              <AccordionContent className="p-4 border border-t-0 rounded-b-md">
                 {renderVersionHistory('component')}
                 <OnboardingForm
                    key={getLatestConfig('component')?.version || 0}
                    initialData={getLatestConfig('component')}
                    onSave={(data) => handleSave('component', data)}
                    isLoading={loading}
                    name="Component Onboarding"
                />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="application-onboarding">
              <AccordionTrigger className="bg-muted hover:bg-muted/90 text-foreground font-bold text-lg p-4 rounded-md">
                Application Onboarding
              </AccordionTrigger>
              <AccordionContent className="p-4 border border-t-0 rounded-b-md">
                 {renderVersionHistory('application')}
                 <OnboardingForm
                    key={getLatestConfig('application')?.version || 0}
                    initialData={getLatestConfig('application')}
                    onSave={(data) => handleSave('application', data)}
                    isLoading={loading}
                    name="Application Onboarding"
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
      </main>
    </DashboardLayout>
  );
}

    