// SPDX-License-Identifier: AGPL-3.0-only
'use client';

import { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '@/app/dashboard-layout';
import type { User } from '@/lib/definitions';
import { getUser } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, RefreshCw, Search, Database } from 'lucide-react';
import { useSpecOptions } from '@/hooks/useSpecOptions';
import { useToast } from '@/hooks/use-toast';
import { OptionCategoryTable } from '@/components/settings/OptionCategoryTable';
import { AddOptionModal } from '@/components/settings/AddOptionModal';
import type { SpecificationOptionDoc } from '@/lib/specification-options-defaults';

  interface CategoryTab {
    key: string;
    label: string;
    group: 'studio' | 'hardware';
    collection: string;
  }

const OPTION_CATEGORIES: CategoryTab[] = [
  // Specification Studio Categories
  { key: 'HW_FORM_FACTORS', label: 'HW Form Factors', group: 'studio', collection: 'specification_hw_types' },
  { key: 'SPEC_TYPES', label: 'Spec Types', group: 'studio', collection: 'specification_options' },
  { key: 'HW_ARCHITECTURES', label: 'HW Architectures', group: 'studio', collection: 'specification_options' },
  { key: 'CLOUD_PROVIDERS', label: 'Cloud Providers', group: 'studio', collection: 'specification_options' },
  { key: 'CLOUD_TYPES', label: 'Cloud Types', group: 'studio', collection: 'specification_options' },
  { key: 'K8S_DISTROS', label: 'K8s Distros', group: 'studio', collection: 'specification_options' },
  { key: 'K8S_SCOPES', label: 'K8s Scopes', group: 'studio', collection: 'specification_options' },
  // Hardware & Platform Reference Categories (shared MongoDB collections)
  { key: 'VENDORS', label: 'Vendors', group: 'hardware', collection: 'specification_vendors' },
  { key: 'CPU_TYPES', label: 'CPU Types', group: 'hardware', collection: 'specification_cpu_types' },
  { key: 'GPU_TYPES', label: 'GPU Types', group: 'hardware', collection: 'specification_gpu_types' },
  { key: 'DISK_TYPES', label: 'Disk Types', group: 'hardware', collection: 'specification_disk_types' },
  { key: 'NETWORK_CARDS', label: 'Network Cards', group: 'hardware', collection: 'specification_network_cards' },
  { key: 'PLUG_POWER_CORDS', label: 'Plug / Power Cords', group: 'hardware', collection: 'specification_plug_power_cords' },
  { key: 'HYPERVISORS', label: 'Hypervisors', group: 'hardware', collection: 'specification_hypervisors' },
];

export default function SpecificationsSettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryTab>(OPTION_CATEGORIES[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOption, setEditingOption] = useState<SpecificationOptionDoc | null>(null);
  const { toast } = useToast();

  const { options, isLoading, isError, errorMessage, refresh } = useSpecOptions(
    selectedCategory.key,
    { includeInactive: true }
  );

  useEffect(() => {
    getUser().then(setUser);
  }, []);

  const filteredOptions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (opt) =>
        opt.key.toLowerCase().includes(q) ||
        opt.label.toLowerCase().includes(q) ||
        (opt.description || '').toLowerCase().includes(q)
    );
  }, [options, searchQuery]);

  const handleOpenAdd = () => {
    setEditingOption(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (option: SpecificationOptionDoc) => {
    setEditingOption(option);
    setModalOpen(true);
  };

  const handleToggleActive = async (option: SpecificationOptionDoc) => {
    try {
        const res = await fetch(
          `/api/settings/specifications/options/${encodeURIComponent(option._id)}`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ active: !option.active }),
          }
        );
        if(!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update status');
      }
      toast({
        title: option.active ? 'Option Deactivated' : 'Option Activated',
        description: `"${option.label}" updated in MongoDB.`,
      });
      await refresh();
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Database Error',
        description: err?.message || 'Unable to update option status.',
      });
    }
  };

  const handleDelete = async (option: SpecificationOptionDoc) => {
    try {
      const res = await fetch(
        `/api/settings/specifications/options/${encodeURIComponent(option._id)}`,
        { method: 'DELETE' }
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete option');
      }
      toast({
        title: 'Option Deleted',
        description: `"${option.label}" removed from MongoDB.`,
      });
      await refresh();
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Database Error',
        description: err?.message || 'Unable to delete option.',
      });
    }
  };

  const studioCategories = OPTION_CATEGORIES.filter((c) => c.group === 'studio');
  const hardwareCategories = OPTION_CATEGORIES.filter((c) => c.group === 'hardware');

  return (
    <DashboardLayout user={user}>
        <main className="flex-1 p-6 md:p-10 space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Specification Settings</h1>
            <p className="text-muted-foreground">
              Unified MongoDB-backed configuration for Specification Studio and hardware reference data.
            </p>
          </div>

          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  Specification Option Management
                  <Badge variant="outline" className="font-mono text-[11px] font-normal">
                    <Database className="mr-1 h-3 w-3" />
                    {selectedCategory.collection}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  All categories below read from and persist directly to MongoDB. Changes reflect
                  immediately in Specification Studio and Hardware Builder.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={refresh} title="Refresh Options">
                  <RefreshCw className="mr-1.5 h-4 w-4" />
                  Refresh
                </Button>
                <Button size="sm" onClick={handleOpenAdd}>
                  <Plus className="mr-1.5 h-4 w-4" />
                  Add Option
                </Button>
              </div>
            </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-3 border-b pb-4">
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Specification Studio
                      </span>
                      <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Studio Categories">
                        {studioCategories.map((cat) => {
                          const isActive = selectedCategory.key === cat.key;
                          return (
                            <button
                              key={cat.key}
                              type="button"
                              role="tab"
                              aria-selected={isActive}
                              onClick={() => {
                                setSelectedCategory(cat);
                                setSearchQuery('');
                              }}
                              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${isActive
                                  ? 'bg-primary text-primary-foreground shadow-sm'
                                  : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                                }`}
                            >
                              {cat.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Hardware &amp; Platform Reference Data
                      </span>
                      <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Hardware Reference Categories">
                        {hardwareCategories.map((cat) => {
                          const isActive = selectedCategory.key === cat.key;
                          return (
                            <button
                              key={cat.key}
                              type="button"
                              role="tab"
                              aria-selected={isActive}
                              onClick={() => {
                                setSelectedCategory(cat);
                                setSearchQuery('');
                              }}
                              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${isActive
                                  ? 'bg-primary text-primary-foreground shadow-sm'
                                  : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                                }`}
                            >
                              {cat.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="relative w-full sm:max-w-xs">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={`Filter ${selectedCategory.label}...`}
                        className="pl-8 h-9 text-sm"
                      />
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Showing {filteredOptions.length} of {options.length} database records
                    </div>
                  </div>

                  {isError && (
                    <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                      Failed to load options from MongoDB: {errorMessage || 'Unknown error'}
                    </div>
                  )}

                  <OptionCategoryTable
                    options={filteredOptions}
                    isLoading={isLoading}
                    onEdit={handleOpenEdit}
                    onToggleActive={handleToggleActive}
                    onDelete={handleDelete}
                  />
                </CardContent>
              </Card>

              <AddOptionModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                category={selectedCategory.key}
                categoryLabel={selectedCategory.label}
                editingOption={editingOption}
                onSaved={() => refresh()}
              />
            </main>
          </DashboardLayout>
          );
}
