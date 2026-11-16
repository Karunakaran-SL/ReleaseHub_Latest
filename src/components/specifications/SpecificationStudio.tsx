// SPDX-License-Identifier: AGPL-3.0-only
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  Store,
  ShieldCheck,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ExportModal } from './ExportModal';
import { ImportWizard } from './ImportWizard';
import { DuplicateModal } from './DuplicateModal';
import { IngestionSourceModal, type IngestionStream } from './IngestionSourceModal';
import { MarketplaceCatalogModal } from './MarketplaceCatalogModal';
import { SpecTypeSelector } from './SpecTypeSelector';
import { HardwareSpecForm } from './forms/HardwareSpecForm';
import { CloudSpecForm } from './forms/CloudSpecForm';
import { K8sSpecForm } from './forms/K8sSpecForm';
import { toStudioSpecObject } from '@/lib/spec-validator';
import type { SpecificationType } from '@/models/Specification';

const DEFAULT_STUDIO_SPECS: Record<string, any>[] = [
  {
    _id: 'spec-k8s-prod-01',
    specId: 'spec-k8s-prod-01',
    name: 'Kubernetes Production Cluster',
    version: '1.2.0',
    specType: 'MANAGED_K8S',
    target: 'kubernetes',
    sourceType: 'MARKETPLACE',
    vendor: 'CNCF',
    k8sDetails: {
      k8sDistro: 'EKS',
      clusterScope: 'CLOUD_MANAGED',
      k8sVersion: '1.30',
    },
    vendorMeta: {
      publisherName: 'Cloud Native Computing Foundation',
      vendorType: 'CLOUD',
      verified: true,
    },
    hw_type: { id: 'Virtual', name: 'Virtual' },
    steps: ['validate-nodes', 'provision-control-plane', 'deploy-cilium-cni', 'verify-readiness'],
  },
  {
    _id: 'spec-dell-r760-02',
    specId: 'spec-dell-r760-02',
    name: 'Dell PowerEdge R760 Bare-Metal',
    version: '2.1.0',
    specType: 'HW',
    target: 'rack',
    sourceType: 'MARKETPLACE',
    vendor: 'Dell EMC',
    hwDetails: {
      formFactor: 'Rack',
      architecture: 'x86_64',
      airgapSupport: true,
    },
    vendorMeta: {
      publisherName: 'Dell Technologies',
      vendorType: 'OEM',
      verified: true,
    },
    hw_type: { id: 'Rack', name: 'Rack' },
    steps: ['configure-idrac', 'setup-raid-5', 'install-esxi', 'configure-vlans'],
  },
  {
    _id: 'spec-aws-cloud-03',
    specId: 'spec-aws-cloud-03',
    name: 'AWS Multi-AZ Cloud Landing Zone',
    version: '1.0.0',
    specType: 'CLOUD',
    target: 'aws',
    sourceType: 'STUDIO_CUSTOM',
    vendor: 'AWS',
    cloudDetails: {
      provider: 'AWS',
      cloudType: 'PUBLIC',
      region: 'us-east-1',
    },
    hw_type: { id: 'Virtual', name: 'Virtual' },
    steps: ['provision-vpc', 'deploy-subnets', 'configure-nat-gateway'],
  },
];

export function SpecificationStudio() {
  const { toast } = useToast();
  const [specifications, setSpecifications] = useState<Record<string, any>[]>(DEFAULT_STUDIO_SPECS);
  const [selectedSpec, setSelectedSpec] = useState<Record<string, any>>(DEFAULT_STUDIO_SPECS[0]);
  const [selectedSpecType, setSelectedSpecType] = useState<SpecificationType>('HW');
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [isIngestionModalOpen, setIsIngestionModalOpen] = useState(false);
  const [isMarketplaceOpen, setIsMarketplaceOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [duplicateTarget, setDuplicateTarget] = useState<Record<string, any> | null>(null);

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

  const handleSelectIngestionSource = (source: IngestionStream) => {
    if (source === 'MARKETPLACE') {
      setIsMarketplaceOpen(true);
    } else if (source === 'FILE_IMPORT') {
      setIsImportOpen(true);
    } else if (source === 'STUDIO_CUSTOM') {
      setSelectedSpecType('HW');
    }
  };

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
  };

  const handleSaveTriModalSpec = async (payload: Record<string, any>) => {
    setIsSubmittingForm(true);
    try {
      const res = await fetch('/api/specifications/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawContent: JSON.stringify({
            ...payload,
            sourceType: 'STUDIO_CUSTOM',
          }),
          format: 'json',
          sourceType: 'STUDIO_CUSTOM',
        }),
      });

      if (res.ok) {
        const result = await res.json();
        handleImported(result.specification || payload);
      } else {
        handleImported(payload);
      }

      toast({
        title: 'Specification Saved',
        description: `"${payload.name}" (${payload.specType}) saved to Specification Studio.`,
      });
    } catch {
      handleImported(payload);
    } finally {
      setIsSubmittingForm(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Studio Header & Action Toolbar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b pb-6">
        <div>
          <div className="flex items-center gap-2 text-primary text-sm font-medium mb-1">
            <Sparkles className="h-4 w-4" />
            <span>Tri-Modal Infrastructure &amp; Kubernetes Blueprint Authoring</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Specification Studio</h1>
          <p className="text-muted-foreground mt-1">
            Author Hardware (On-Prem), Cloud Infrastructure, and Managed Kubernetes specifications.
          </p>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5" role="toolbar" aria-label="Specification Studio Toolbar">
          <Button variant="default" onClick={() => setIsIngestionModalOpen(true)}>
            <Plus className="mr-1.5 h-4 w-4" />
            + Add Specification
          </Button>
          <Button variant="secondary" onClick={() => setIsMarketplaceOpen(true)}>
            <Store className="mr-1.5 h-4 w-4" />
            Browse Marketplace
          </Button>
          <Button variant="outline" onClick={() => setIsImportOpen(true)}>
            <Upload className="mr-1.5 h-4 w-4" />
            Import Specification
          </Button>
          <Button variant="outline" onClick={() => handleOpenExport(selectedSpec)}>
            <Download className="mr-1.5 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Tri-Modal Type Selector & Dynamic Composer */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Select Specification Type</CardTitle>
          <CardDescription>
            Choose between On-Prem Hardware, Public/Private Cloud, or Managed Kubernetes blueprints.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <SpecTypeSelector
            selectedType={selectedSpecType}
            onSelectType={setSelectedSpecType}
          />

          <div className="rounded-lg border bg-muted/20 p-5">
            {selectedSpecType === 'HW' && (
              <HardwareSpecForm
                onSubmit={handleSaveTriModalSpec}
                isSubmitting={isSubmittingForm}
              />
            )}
            {selectedSpecType === 'CLOUD' && (
              <CloudSpecForm
                onSubmit={handleSaveTriModalSpec}
                isSubmitting={isSubmittingForm}
              />
            )}
            {selectedSpecType === 'MANAGED_K8S' && (
              <K8sSpecForm
                onSubmit={handleSaveTriModalSpec}
                isSubmitting={isSubmittingForm}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Specifications Table */}
      <Card>
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
                <TableHead>Type</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Details / Distro</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {specifications.map((spec) => {
                const id = spec._id || spec.specId;
                const isSelected = (selectedSpec?._id || selectedSpec?.specId) === id;
                const sourceType = spec.sourceType || (spec.vendorMeta ? 'MARKETPLACE' : 'STUDIO_CUSTOM');
                const specType =
                  spec.specType ||
                  (spec.k8sDetails
                    ? 'MANAGED_K8S'
                    : spec.cloudDetails
                    ? 'CLOUD'
                    : 'HW');
                const detailSummary =
                  spec.k8sDetails?.k8sDistro ||
                  spec.cloudDetails?.provider ||
                  spec.hwDetails?.formFactor ||
                  spec.hw_type?.name ||
                  spec.target;

                return (
                  <TableRow
                    key={id}
                    className={isSelected ? 'bg-muted/50' : undefined}
                    onClick={() => setSelectedSpec(spec)}
                  >
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span>{spec.name}</span>
                          {isSelected && <CheckCircle2 className="h-3.5 w-3.5 text-primary" />}
                        </div>
                        {spec.vendorMeta?.publisherName && (
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            {spec.vendorMeta.publisherName}
                            {spec.vendorMeta.verified && (
                              <ShieldCheck className="h-3 w-3 text-blue-500" />
                            )}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px]">
                        {specType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          sourceType === 'MARKETPLACE'
                            ? 'default'
                            : sourceType === 'FILE_IMPORT'
                            ? 'secondary'
                            : 'outline'
                        }
                        className="text-[10px]"
                      >
                        {sourceType}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs font-medium">
                      {detailSummary}
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

      {/* Multi-Source Ingestion Modal */}
      <IngestionSourceModal
        isOpen={isIngestionModalOpen}
        onClose={() => setIsIngestionModalOpen(false)}
        onSelectSource={handleSelectIngestionSource}
      />

      {/* Marketplace Catalog Modal */}
      <MarketplaceCatalogModal
        isOpen={isMarketplaceOpen}
        onClose={() => setIsMarketplaceOpen(false)}
        onImported={handleImported}
      />

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        specification={selectedSpec}
      />

      {/* Import Wizard */}
      <ImportWizard
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImported={handleImported}
      />

      {/* Duplicate Modal */}
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
