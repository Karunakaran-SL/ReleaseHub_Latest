'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Store, Cloud, Upload, FileText, PlusCircle, X, ArrowRight } from 'lucide-react';

export type IngestionStream = 'MARKETPLACE' | 'FILE_IMPORT' | 'STUDIO_CUSTOM';

interface IngestionSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSource: (source: IngestionStream) => void;
}

export function IngestionSourceModal({
  isOpen,
  onClose,
  onSelectSource,
}: IngestionSourceModalProps) {
  if (!isOpen) return null;

  const handleChoose = (source: IngestionStream) => {
    onClose();
    onSelectSource(source);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <dialog
        open
        aria-modal="true"
        aria-labelledby="ingestion-source-modal-title"
        className="relative m-0 w-full max-w-3xl rounded-xl border bg-background p-6 text-foreground shadow-2xl"
      >
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <Badge variant="outline" className="mb-1.5">
              Multi-Source Ingestion
            </Badge>
            <h2 id="ingestion-source-modal-title" className="text-2xl font-bold tracking-tight">
              Add Specification
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Select how you would like to ingest or author your infrastructure specification blueprint.
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close source selector">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card A: Browse Marketplace */}
          <button
            type="button"
            onClick={() => handleChoose('MARKETPLACE')}
            className="group flex flex-col justify-between rounded-xl border-2 border-border bg-card p-5 text-left transition-all hover:border-primary hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-lg bg-blue-500/10 p-3 text-blue-600 dark:text-blue-400">
                <Store className="h-6 w-6" />
                <Cloud className="h-5 w-5" />
              </div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-base group-hover:text-primary transition-colors">
                  Browse Marketplace
                </h3>
              </div>
              <Badge variant="secondary" className="mb-2 text-[10px]">
                OEM • HARDWARE • CLOUD
              </Badge>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Import verified blueprints from AWS, Azure, Dell, NVIDIA, HPE, and CNCF Kubernetes catalogs.
              </p>
            </div>
            <div className="mt-5 flex items-center text-xs font-semibold text-primary">
              <span>Explore Catalog</span>
              <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </button>

          {/* Card B: Import File */}
          <button
            type="button"
            onClick={() => handleChoose('FILE_IMPORT')}
            className="group flex flex-col justify-between rounded-xl border-2 border-border bg-card p-5 text-left transition-all hover:border-primary hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-lg bg-emerald-500/10 p-3 text-emerald-600 dark:text-emerald-400">
                <Upload className="h-6 w-6" />
                <FileText className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-base group-hover:text-primary transition-colors mb-1">
                Import File
              </h3>
              <Badge variant="secondary" className="mb-2 text-[10px]">
                JSON • YAML • SCHEMA v1.2
              </Badge>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Upload or paste an existing JSON or YAML specification with live AJV schema validation and fix suggestions.
              </p>
            </div>
            <div className="mt-5 flex items-center text-xs font-semibold text-primary">
              <span>Launch Import Wizard</span>
              <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </button>

          {/* Card C: Create from Scratch */}
          <button
            type="button"
            onClick={() => handleChoose('STUDIO_CUSTOM')}
            className="group flex flex-col justify-between rounded-xl border-2 border-border bg-card p-5 text-left transition-all hover:border-primary hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-lg bg-purple-500/10 p-3 text-purple-600 dark:text-purple-400">
                <PlusCircle className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-base group-hover:text-primary transition-colors mb-1">
                Create from Scratch
              </h3>
              <Badge variant="secondary" className="mb-2 text-[10px]">
                STUDIO COMPOSER
              </Badge>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Design a custom rack, blade, or virtual Kubernetes specification interactively in Specification Studio.
              </p>
            </div>
            <div className="mt-5 flex items-center text-xs font-semibold text-primary">
              <span>Start Blank Spec</span>
              <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </button>
        </div>

        <div className="mt-6 flex justify-end border-t pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </dialog>
    </div>
  );
}

export default IngestionSourceModal;

