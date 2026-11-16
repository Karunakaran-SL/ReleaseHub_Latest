'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Store,
  ShieldCheck,
  Search,
  Download,
  Loader2,
  X,
  Server,
  Cloud,
  Cpu,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  CURATED_MARKETPLACE_CATALOG,
  type MarketplaceCatalogSpec,
} from '@/models/MarketplaceCatalog';
import { validateSpecification } from '@/lib/spec-validator';

interface MarketplaceCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImported: (importedSpec: Record<string, any>) => void;
}

const VENDOR_TYPES = ['ALL', 'CLOUD', 'OEM', 'HARDWARE'] as const;
const VENDOR_TAGS = ['All', 'AWS', 'Azure', 'Dell', 'Nvidia', 'Kubernetes', 'HPE'] as const;

export function MarketplaceCatalogModal({
  isOpen,
  onClose,
  onImported,
}: MarketplaceCatalogModalProps) {
  const { toast } = useToast();
  const [catalog, setCatalog] = useState<MarketplaceCatalogSpec[]>(CURATED_MARKETPLACE_CATALOG);
  const [selectedVendorType, setSelectedVendorType] = useState<string>('ALL');
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [importingId, setImportingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;
    const params = new URLSearchParams();
    if (selectedVendorType !== 'ALL') params.set('vendorType', selectedVendorType);
    if (selectedTag !== 'All') params.set('tag', selectedTag);
    if (searchQuery.trim()) params.set('search', searchQuery.trim());

    fetch(`/api/specifications/marketplace?${params.toString()}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (isMounted && data && Array.isArray(data.items)) {
          setCatalog(data.items);
        }
      })
      .catch(() => {
        // Fallback to local curated catalog
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, selectedVendorType, selectedTag, searchQuery]);

  const filteredItems = useMemo(() => {
    return catalog.filter((item) => {
      if (
        selectedVendorType !== 'ALL' &&
        item.vendorMeta.vendorType !== selectedVendorType
      ) {
        return false;
      }
      if (selectedTag !== 'All') {
        const tagLower = selectedTag.toLowerCase();
        const matchesTag =
          item.tags.some((t) => t.toLowerCase() === tagLower) ||
          item.vendor.toLowerCase().includes(tagLower) ||
          item.vendorMeta.publisherName.toLowerCase().includes(tagLower);
        if (!matchesTag) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const text = `${item.name} ${item.description} ${item.vendor} ${item.vendorMeta.publisherName} ${item.tags.join(' ')}`.toLowerCase();
        if (!text.includes(q)) return false;
      }
      return true;
    });
  }, [catalog, selectedVendorType, selectedTag, searchQuery]);

  if (!isOpen) return null;

  const handleImportSpec = async (specTemplate: MarketplaceCatalogSpec) => {
    setImportingId(specTemplate.specId);
    try {
      // Step 1: Execute AJV schema validation via spec-validator.ts
      const validationResult = validateSpecification(JSON.stringify(specTemplate), 'json');
      if (!validationResult.isValid) {
        toast({
          variant: 'destructive',
          title: 'Schema Validation Failed',
          description: validationResult.errors[0]?.message || 'Invalid marketplace specification.',
        });
        return;
      }

      // Step 2: Import into local MongoDB instance with sourceType: 'MARKETPLACE'
      const payload = {
        ...specTemplate,
        sourceType: 'MARKETPLACE',
        vendorMeta: {
          ...specTemplate.vendorMeta,
          marketplaceSpecId: specTemplate.specId,
        },
      };

      const res = await fetch('/api/specifications/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawContent: JSON.stringify(payload),
          format: 'json',
          sourceType: 'MARKETPLACE',
          vendorMeta: payload.vendorMeta,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to import marketplace specification.');
      }

      toast({
        title: 'Marketplace Specification Imported',
        description: `"${specTemplate.name}" by ${specTemplate.vendorMeta.publisherName} imported successfully.`,
      });
      onImported(data.specification || payload);
      onClose();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Import Error',
        description: error?.message || 'Could not import specification from Marketplace.',
      });
    } finally {
      setImportingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <dialog
        open
        aria-modal="true"
        aria-labelledby="marketplace-catalog-title"
        className="relative m-0 w-full max-w-4xl rounded-xl border bg-background p-6 text-foreground shadow-2xl max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Store className="h-5 w-5 text-primary" />
              <h2 id="marketplace-catalog-title" className="text-xl font-bold">
                Specification Marketplace Catalog
              </h2>
              <Badge variant="secondary">Verified Blueprints</Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Import curated OEM, Hardware, and Cloud Vendor specifications validated against Schema v1.2.
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close marketplace modal">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Filter Bar: Vendor Types, Tags & Search */}
        <div className="my-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Vendor Type Filter Tabs */}
            <div className="inline-flex rounded-lg border bg-muted p-1" role="group" aria-label="Vendor Type Filter">
              {VENDOR_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSelectedVendorType(type)}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                    selectedVendorType === type
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search AWS, Dell, Nvidia, K8s..."
                className="pl-8 h-9 text-sm"
              />
            </div>
          </div>

          {/* Vendor Tag Pills */}
          <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Vendor Tags">
            <span className="text-xs text-muted-foreground mr-1">Filter by Tag:</span>
            {VENDOR_TAGS.map((tag) => (
              <Button
                key={tag}
                type="button"
                size="sm"
                variant={selectedTag === tag ? 'default' : 'outline'}
                className="h-7 px-2.5 text-xs"
                onClick={() => setSelectedTag(tag)}
              >
                {tag}
              </Button>
            ))}
          </div>
        </div>

        {/* Catalog Grid */}
        <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.length === 0 ? (
            <div className="col-span-2 py-12 text-center text-muted-foreground">
              No marketplace specifications match the selected filters.
            </div>
          ) : (
            filteredItems.map((item) => {
              const isImporting = importingId === item.specId;
              return (
                <div
                  key={item.specId}
                  className="flex flex-col justify-between rounded-lg border bg-card p-4 shadow-sm hover:border-primary/60 transition-colors"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                          {item.vendorMeta.vendorType === 'CLOUD' ? (
                            <Cloud className="h-3.5 w-3.5 text-blue-500" />
                          ) : item.vendorMeta.vendorType === 'HARDWARE' ? (
                            <Cpu className="h-3.5 w-3.5 text-emerald-500" />
                          ) : (
                            <Server className="h-3.5 w-3.5 text-purple-500" />
                          )}
                          <span className="font-medium text-foreground">
                            {item.vendorMeta.publisherName}
                          </span>
                          {item.vendorMeta.verified && (
                            <span
                              className="inline-flex items-center gap-0.5 text-blue-600 dark:text-blue-400 font-medium"
                              title="Verified Publisher"
                            >
                              <ShieldCheck className="h-3.5 w-3.5" />
                              Verified
                            </span>
                          )}
                        </div>
                        <h3 className="font-semibold text-base">{item.name}</h3>
                      </div>
                      <Badge variant="outline" className="shrink-0">
                        {item.vendorMeta.vendorType}
                      </Badge>
                    </div>

                    <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
                      {item.description}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-1.5">
                      <Badge variant="secondary" className="text-[10px]">
                        v{item.version}
                      </Badge>
                      <Badge variant="secondary" className="text-[10px]">
                        target: {item.target}
                      </Badge>
                      {item.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-[10px]">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t pt-3">
                    <span className="font-mono text-[11px] text-muted-foreground">
                      ID: {item.specId}
                    </span>
                    <Button
                      size="sm"
                      onClick={() => handleImportSpec(item)}
                      disabled={Boolean(importingId)}
                    >
                      {isImporting ? (
                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Download className="mr-1.5 h-3.5 w-3.5" />
                      )}
                      Import Spec
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between border-t pt-4">
          <span className="text-xs text-muted-foreground">
            Showing {filteredItems.length} of {CURATED_MARKETPLACE_CATALOG.length} curated blueprints
          </span>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </dialog>
    </div>
  );
}

export default MarketplaceCatalogModal;

