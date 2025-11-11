
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
import { BaselineForm } from './_components/baseline-form';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';

type OnboardingType = 'baseline';

export default function BaselineSettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [configs, setConfigs] = useState<Record<OnboardingType, OnboardingConfiguration[]>>({
    baseline: [],
  });

  const fetchConfigs = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/settings/baseline-onboarding`);

      const newConfigs: Record<OnboardingType, OnboardingConfiguration[]> = { baseline: [] };

      if (response.ok) {
        const data = await response.json();
        newConfigs.baseline = data;
      } else {
        toast({
          variant: 'destructive',
          title: `Failed to fetch baseline onboarding configurations.`,
        });
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
          const response = await fetch(`/api/settings/baseline-onboarding`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data),
          });

          if (response.ok) {
              toast({ title: 'Success', description: `Baseline onboarding configuration saved.` });
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


  const renderVersionHistory = (type: OnboardingType) => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Version History</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Baseline Onboarding Version History</DialogTitle>
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
            <h1 className="text-3xl font-bold">Baseline Configuration</h1>
            <p className="text-muted-foreground">
              Define the phases and steps for the baseline validation process.
            </p>
          </div>
        </div>

        {loading && !Object.values(configs).some(c => c.length > 0) ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <Accordion type="single" collapsible className="w-full space-y-4">
            <AccordionItem value="baseline-onboarding">
              <AccordionTrigger className="bg-muted hover:bg-muted/90 text-foreground font-bold text-lg p-4 rounded-md">
                Baseline Validation Phases
              </AccordionTrigger>
              <AccordionContent className="p-4 border border-t-0 rounded-b-md">
                {renderVersionHistory('baseline')}
                <BaselineForm
                    key={getLatestConfig('baseline')?.version || 0}
                    initialData={getLatestConfig('baseline')}
                    onSave={(data) => handleSave('baseline', data)}
                    isLoading={loading}
                    name="Baseline Onboarding"
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
      </main>
    </DashboardLayout>
  );
}
