'use client';

import React, { useState, useMemo } from 'react';
import * as yaml from 'js-yaml';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Copy, Check, X, FileCode, FileJson } from 'lucide-react';
import { toStudioSpecObject } from '@/lib/spec-validator';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  specification: Record<string, any> | null;
}

export function ExportModal({ isOpen, onClose, specification }: ExportModalProps) {
  const [format, setFormat] = useState<'json' | 'yaml'>('json');
  const [copied, setCopied] = useState(false);

  const normalizedSpec = useMemo(() => {
    return toStudioSpecObject(
      specification || {
        specId: 'spec-k8s-prod',
        name: 'Kubernetes Production Cluster',
        version: '1.2.0',
        target: 'kubernetes',
        steps: ['validate-hardware', 'provision-nodes', 'deploy-cni', 'verify-readiness'],
      }
    );
  }, [specification]);

  const formattedContent = useMemo(() => {
    if (format === 'yaml') {
      return yaml.dump(normalizedSpec, { indent: 2, lineWidth: 100 });
    }
    return JSON.stringify(normalizedSpec, null, 2);
  }, [normalizedSpec, format]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formattedContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore clipboard errors in headless environments
    }
  };

  const handleDownload = () => {
    const mimeType = format === 'json' ? 'application/json' : 'application/x-yaml';
    const extension = format === 'json' ? 'json' : 'yaml';
    const safeFileName = String(normalizedSpec.specId || normalizedSpec.name || 'specification')
      .toLowerCase()
      .replace(/[^a-z0-9-_]/g, '-');

    const blob = new Blob([formattedContent], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${safeFileName}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <dialog
        open
        aria-modal="true"
        aria-labelledby="export-modal-title"
        className="relative m-0 w-full max-w-2xl rounded-lg border bg-background p-6 text-foreground shadow-xl"
      >
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <h2 id="export-modal-title" className="text-xl font-semibold flex items-center gap-2">
              {format === 'json' ? (
                <FileJson className="h-5 w-5 text-primary" />
              ) : (
                <FileCode className="h-5 w-5 text-primary" />
              )}
              Export Specification
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Preview and download <span className="font-medium text-foreground">{normalizedSpec.name}</span> in JSON or YAML format.
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close export modal">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="my-4 flex items-center justify-between">
          <div className="inline-flex items-center rounded-md border bg-muted p-1" role="group" aria-label="Export format toggle">
            <button
              type="button"
              onClick={() => setFormat('json')}
              className={`px-3 py-1.5 text-sm font-medium rounded-sm transition-colors ${
                format === 'json'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              JSON
            </button>
            <button
              type="button"
              onClick={() => setFormat('yaml')}
              className={`px-3 py-1.5 text-sm font-medium rounded-sm transition-colors ${
                format === 'yaml'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              YAML
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline">Schema v1.2</Badge>
            <Button variant="outline" size="sm" onClick={handleCopy}>
              {copied ? (
                <>
                  <Check className="mr-1.5 h-4 w-4 text-green-600" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="mr-1.5 h-4 w-4" />
                  Copy
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="relative rounded-md border bg-slate-950 text-slate-50 p-4 max-h-96 overflow-auto font-mono text-xs leading-relaxed">
          <pre data-testid="export-preview-code">
            <code>{formattedContent}</code>
          </pre>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 border-t pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download {format.toUpperCase()}
          </Button>
        </div>
      </dialog>
    </div>
  );
}
export default ExportModal;

