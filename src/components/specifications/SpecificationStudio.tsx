'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Download,
  Upload,
  Copy,
  Plus,
  Layers,
  CheckCircle2,
  Eye,
  Edit,
  Sparkles,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ExportModal } from './ExportModal';
import { ImportWizard } from './ImportWizard';
import { DuplicateModal } from './DuplicateModal';
import { toStudioSpecObject } from '@/lib/spec-validator';

const DEFAULT_STUDIO_SPECS: Record<string, any>[] = [
  {
    _id: 'spec-k8s-prod-01',
    specId: 'spec-k8s-prod-01',
    name: 'Kubernetes Production Cluster',
    version: '1.2.0',
    target: 'kubernetes',
    vendor: 'CNCF',
    hw_type: { id: 'Virtual', name: 'Virtual' },
    steps: ['validate-nodes', 'provision-control-plane', 'deploy-cilium-cni', 'verify-readiness'],
  },
  {
    _id: 'spec-dell-r760-02',
    specId: 'spec-dell-r760-02',
    name: 'Dell PowerEdge R760 Bare-Metal',
    version: '2.1.0',
    target: 'rack',
    vendor: 'Dell EMC',
    hw_type: { id: 'Rack', name: 'Rack' },
    steps: ['configure-idrac', 'setup-raid-5', 'install-esxi', 'configure-vlans'],
  },
  {
    _id: 'spec-cisco-blade-03',
    specId: 'spec-cisco-blade-03',
    name: 'Cisco UCS B200 M7 Blade Blueprint',
    version: '1.0.0',
    target: 'blade',
    vendor: 'Cisco',
    hw_type: { id: 'Blade', name: 'Blade' },
    steps: ['discover-chassis', 'apply-service-profile', 'provision-gpu-nodes', 'run-burn-in-test'],
  },
];

export function SpecificationStudio() {
  const { toast } = useToast();
  const [specifications, setSpecifications] = useState<Record<string, any>[]>(DEFAULT_STUDIO_SPECS);
  const [selectedSpec, setSelectedSpec] = useState<Record<string, any>>(DEFAULT_STUDIO_SPECS[0]);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [duplicateTarget, setDuplicateTarget] = useState<Record<string, any> | null>(null);

  // Quick Studio Composer state
  const [draftSpec, setDraftSpec] = useState({
    specId: `spec-${Date.now()}`,
    name: '',
    version: '1.0.0',
    target: 'kubernetes',
    stepsText: 'validate-environment, provision-cluster, deploy-workloads',
  });

  useEffect(() => {
    let isMounted = true;
    async function loadSpecs() {
      try {
        const res = await fetch('/api/specifications');
        if (res.ok) {
          const data = await res.json();
          if (isMounted && Array.isArray(data) && data.length > 0) {
            const normalized = data.map((item) => toStudioSpecObject(item));
            setSpecifications(normalized);
            setSelectedSpec(normalized[0]);
          }
        }
      } catch {
        // Keep default studio specifications if API is unreachable
      }
    }
    loadSpecs();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleOpenExport = (spec?: Record<string, any>) => {
    if (spec) {
      setSelectedSpec(spec);
    }
    setIsExportOpen(true);
  };

  const handleOpenDuplicate = (spec: Record<string, any>) => {
    setDuplicateTarget(spec);
  };

  const handleDuplicated = (newSpec: Record<string, any>) => {
    const normalized = toStudioSpecObject(newSpec);
    setSpecifications((prev) => [normalized, ...prev]);
    setSelectedSpec(normalized);
    toast({
      title: 'Specification Duplicated',
      description: `"${normalized.name}" (${normalized.specId}) has been created.`,
    });
  };

  const handleImported = (newSpec: Record<string, any>) => {
    const normalized = toStudioSpecObject(newSpec);
    setSpecifications((prev) => [normalized, ...prev.filter((s) => s.specId !== normalized.specId)]);
    setSelectedSpec(normalized);
    toast({
      title: 'Specification Imported',
      description: `"${normalized.name}" validated against Schema v1.2 and imported.`,
    });
  };

  const handleCreateQuickSpec = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftSpec.name.trim()) return;

    const steps = draftSpec.stepsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      specId: draftSpec.specId.trim() || `spec-${Date.now()}`,
      name: draftSpec.name.trim(),
      version: draftSpec.version.trim() || '1.0.0',
      target: draftSpec.target.trim() || 'kubernetes',
      steps: steps.length > 0 ? steps : ['build', 'deploy'],
    };

    try {
      const res = await fetch('/api/specifications/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const result = await res.json();
        handleImported(result.specification || payload);
      } else {
        handleImported(payload);
      }
    } catch {
      handleImported(payload);
    }

    setDraftSpec({
      specId: `spec-${Date.now()}`,
      name: '',
      version: '1.0.0',
      target: 'kubernetes',
      stepsText: 'validate-environment, provision-cluster, deploy-workloads',
    });
  };

  return (
    <div className="space-y-8">
      {/* Studio Header & Action Toolbar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b pb-6">
        <div>
          <div className="flex items-center gap-2 text-primary text-sm font-medium mb-1">
            <Sparkles className="h-4 w-4" />
            <span>Schema v1.2 Blueprint Authoring</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Specification Studio</h1>
          <p className="text-muted-foreground mt-1">
            Design, validate, import, export, and duplicate infrastructure and deployment specifications.
          </p>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center gap-3" role="toolbar" aria-label="Specification Studio Toolbar">
          <Button variant="outline" onClick={() => handleOpenExport(selectedSpec)}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="default" onClick={() => setIsImportOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Import Specification
          </Button>
          <Button variant="secondary" asChild>
            <Link href="/specifications/builder">Advanced Hardware Wizard</Link>
          </Button>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Specifications Table (2 columns wide on large screens) */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <Layers className="h-5 w-5 text-primary" />
                Specification Blueprints
              </CardTitle>
              <CardDescription>
                Select any specification to inspect, export as JSON/YAML, or duplicate.
              </CardDescription>
            </div>
            <Badge variant="secondary">{specifications.length} Specs</Badge>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Specification Name</TableHead>
                  <TableHead>Spec ID</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {specifications.map((spec) => {
                  const id = spec._id || spec.specId;
                  const isSelected = (selectedSpec?._id || selectedSpec?.specId) === id;
                  return (
                    <TableRow
                      key={id}
                      className={isSelected ? 'bg-muted/50' : undefined}
                      onClick={() => setSelectedSpec(spec)}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <span>{spec.name}</span>
                          {isSelected && <CheckCircle2 className="h-3.5 w-3.5 text-primary" />}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {spec.specId || id}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">v{spec.version || '1.0.0'}</Badge>
                      </TableCell>
                      <TableCell className="capitalize">
                        {spec.target || spec.hw_type?.name || 'kubernetes'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenExport(spec)}
                          >
                            <Download className="mr-1.5 h-3.5 w-3.5" />
                            Export
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenDuplicate(spec)}
                          >
                            <Copy className="mr-1.5 h-3.5 w-3.5" />
                            Duplicate
                          </Button>
                          {spec._id && (
                            <Button variant="ghost" size="icon" asChild title="View details">
                              <Link href={`/specifications/${spec._id}/view`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                          )}
                          {spec._id && (
                            <Button variant="ghost" size="icon" asChild title="Edit specification">
                              <Link href={`/specifications/${spec._id}/edit`}>
                                <Edit className="h-4 w-4" />
                              </Link>
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Quick Specification Authoring Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              Quick Author Specification
            </CardTitle>
            <CardDescription>
              Create a Schema v1.2 compliant specification directly in Studio.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateQuickSpec} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="studio-spec-id">Spec ID</Label>
                <Input
                  id="studio-spec-id"
                  value={draftSpec.specId}
                  onChange={(e) => setDraftSpec((s) => ({ ...s, specId: e.target.value }))}
                  placeholder="spec-k8s-01"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="studio-spec-name">Name</Label>
                <Input
                  id="studio-spec-name"
                  value={draftSpec.name}
                  onChange={(e) => setDraftSpec((s) => ({ ...s, name: e.target.value }))}
                  placeholder="e.g. Production Kubernetes Spec"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="studio-spec-version">Version</Label>
                  <Input
                    id="studio-spec-version"
                    value={draftSpec.version}
                    onChange={(e) => setDraftSpec((s) => ({ ...s, version: e.target.value }))}
                    placeholder="1.0.0"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="studio-spec-target">Target</Label>
                  <Input
                    id="studio-spec-target"
                    value={draftSpec.target}
                    onChange={(e) => setDraftSpec((s) => ({ ...s, target: e.target.value }))}
                    placeholder="kubernetes"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="studio-spec-steps">Pipeline Steps (comma-separated)</Label>
                <Input
                  id="studio-spec-steps"
                  value={draftSpec.stepsText}
                  onChange={(e) => setDraftSpec((s) => ({ ...s, stepsText: e.target.value }))}
                  placeholder="build, validate, deploy"
                  required
                />
              </div>

              <Button type="submit" className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Save to Studio
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        specification={selectedSpec}
      />

      <ImportWizard
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImported={handleImported}
      />

      <DuplicateModal
        isOpen={Boolean(duplicateTarget)}
        onClose={() => setDuplicateTarget(null)}
        sourceSpecification={duplicateTarget}
        onDuplicated={handleDuplicated}
      />
    </div>
  );
}

export default SpecificationStudio;

