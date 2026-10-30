'use client';

import React, { useState, useRef, useEffect } from 'react';
import * as yaml from 'js-yaml';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Upload,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  X,
  RefreshCw,
  FileUp,
  ArrowRight,
  Loader2,
  Wand2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { validateSpecification, toStudioSpecObject, type ValidationErrorItem } from '@/lib/spec-validator';

interface ImportWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onImported: (newSpec: Record<string, any>) => void;
}

const SAMPLE_VALID_JSON = JSON.stringify(
  {
    specId: 'spec-k8s-edge-01',
    name: 'Edge Kubernetes Cluster Spec',
    version: '1.2.0',
    target: 'kubernetes',
    vendor: 'CNCF',
    steps: [
      'validate-hardware',
      'provision-control-plane',
      'join-worker-nodes',
      'verify-cluster',
    ],
  },
  null,
  2
);

const SAMPLE_VALID_YAML = `specId: spec-k8s-edge-01
name: Edge Kubernetes Cluster Spec
version: "1.2.0"
target: kubernetes
vendor: CNCF
steps:
  - validate-hardware
  - provision-control-plane
  - join-worker-nodes
  - verify-cluster
`;

export function ImportWizard({ isOpen, onClose, onImported }: ImportWizardProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [rawContent, setRawContent] = useState<string>('');
  const [format, setFormat] = useState<'json' | 'yaml'>('json');
  const [fileName, setFileName] = useState<string>('');
  const [isValidating, setIsValidating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [hasValidated, setHasValidated] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrorItem[]>([]);
  const [validatedData, setValidatedData] = useState<Record<string, any> | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setHasValidated(false);
      setIsValid(false);
      setValidationErrors([]);
      setValidatedData(null);
      setFileName('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const detectFormat = (content: string, name?: string): 'json' | 'yaml' => {
    const trimmed = content.trim().replace(/^\uFEFF/, '');
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) return 'json';
    if (name?.toLowerCase().endsWith('.json')) return 'json';
    if (name?.toLowerCase().endsWith('.yaml') || name?.toLowerCase().endsWith('.yml')) return 'yaml';
    return 'yaml';
  };

    const runValidationWithContent = async (
      contentToValidate: string,
      nameHint?: string
    ): Promise<{ valid: boolean; data: Record<string, any> | null }> => {
      setIsValidating(true);
      const currentFormat = detectFormat(contentToValidate, nameHint ?? fileName);
      setFormat(currentFormat);

      try {
        const res = await fetch('/api/specifications/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rawContent: contentToValidate, format: currentFormat }),
        });

        if (res.ok) {
          const result = await res.json();
          const valid = Boolean(result.isValid);
          setIsValid(valid);
          setValidationErrors(result.errors || []);
          setValidatedData(result.data || null);
          setHasValidated(true);
          setStep(valid ? 3 : 2);
          return { valid, data: result.data || null };
        }
      } catch {
        // Fallback to local validator if network request fails
      } finally {
        setIsValidating(false);
      }

      const localResult = validateSpecification(contentToValidate, currentFormat);
      setIsValid(localResult.isValid);
      setValidationErrors(localResult.errors);
      setValidatedData(localResult.data || null);
      setHasValidated(true);
      setStep(localResult.isValid ? 3 : 2);
      return { valid: localResult.isValid, data: localResult.data || null };
    };

    const handleFileUpload = (file: File) => {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = String(event.target?.result || '');
        const detected = detectFormat(content, file.name);
        setRawContent(content);
        setFormat(detected);
        // Automatically validate upon file selection so valid JSON/YAML files are ready to import immediately
        void runValidationWithContent(content, file.name);
      };
      reader.readAsText(file);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files?.[0];
      if (file) {
        handleFileUpload(file);
      }
    };

    const handleAutoFix = () => {
      try {
        const currentFormat = detectFormat(rawContent, fileName);
        const parsed =
          currentFormat === 'json'
            ? JSON.parse(rawContent.replace(/^\uFEFF/, ''))
            : yaml.load(rawContent.replace(/^\uFEFF/, ''));

        const fixedObj = toStudioSpecObject(
          parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {}
        );
        const formatted =
          currentFormat === 'json'
            ? JSON.stringify(fixedObj, null, 2)
            : yaml.dump(fixedObj, { indent: 2 });

        setRawContent(formatted);
        void runValidationWithContent(formatted, fileName);
      } catch {
        setRawContent(SAMPLE_VALID_JSON);
        setFormat('json');
        void runValidationWithContent(SAMPLE_VALID_JSON, 'sample.json');
      }
    };

    const handleImportCommit = async () => {
      let currentValid = isValid;
      const currentFormat = detectFormat(rawContent, fileName);

      if (!currentValid) {
        const check = await runValidationWithContent(rawContent, fileName);
        currentValid = check.valid;
        if (!currentValid) return;
      }

      setIsImporting(true);
      try {
        const res = await fetch('/api/specifications/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rawContent, format: currentFormat }),
        });

        const data = await res.json();
        if (res.ok) {
          toast({
            title: 'Specification Imported',
            description: `"${data.specification?.name || 'Specification'}" imported successfully.`,
          });
          onImported(data.specification || validatedData || {});
          onClose();
          return;
        } else {
          if (Array.isArray(data.errors) && data.errors.length > 0) {
            setIsValid(false);
            setValidationErrors(data.errors);
            setHasValidated(true);
            setStep(2);
          }
          toast({
            variant: 'destructive',
            title: 'Import Failed',
            description: data.message || 'Could not import specification.',
          });
          return;
        }
      } catch (err: any) {
        toast({
          variant: 'destructive',
          title: 'Import Error',
          description: err?.message || 'Network error while importing specification.',
        });
      } finally {
        setIsImporting(false);
      }
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <dialog
          open
          aria-modal="true"
          aria-labelledby="import-wizard-title"
          className="relative m-0 w-full max-w-3xl rounded-lg border bg-background p-6 text-foreground shadow-xl max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h2 id="import-wizard-title" className="text-xl font-semibold flex items-center gap-2">
                <FileUp className="h-5 w-5 text-primary" />
                Import Specification Wizard
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Upload or paste a JSON/YAML specification, validate against Schema v1.2, and import.
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close import wizard">
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Wizard Step Indicator */}
          <div className="my-4 flex items-center gap-3 text-sm">
            <Badge variant={step === 1 ? 'default' : 'secondary'}>1. Upload &amp; Preview</Badge>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <Badge variant={step === 2 ? 'destructive' : hasValidated && isValid ? 'secondary' : 'outline'}>
              2. Schema Validation
            </Badge>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <Badge variant={step === 3 && isValid ? 'default' : 'outline'}>3. Import Commit</Badge>
          </div>

          {/* Dropzone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="cursor-pointer rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/30 p-4 text-center hover:border-primary/60 transition-colors"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,.yaml,.yml"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file);
                e.target.value = '';
              }}
            />
            <div className="flex flex-col items-center gap-1.5">
              <Upload className="h-6 w-6 text-muted-foreground" />
              <p className="text-sm font-medium">
                {fileName ? `Loaded: ${fileName}` : 'Click or drag & drop a .json, .yaml, or .yml file here'}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setRawContent(SAMPLE_VALID_JSON);
                    setFormat('json');
                    setFileName('sample-spec.json');
                    void runValidationWithContent(SAMPLE_VALID_JSON, 'sample-spec.json');
                  }}
                >
                  Load JSON Sample
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setRawContent(SAMPLE_VALID_YAML);
                    setFormat('yaml');
                    setFileName('sample-spec.yaml');
                    void runValidationWithContent(SAMPLE_VALID_YAML, 'sample-spec.yaml');
                  }}
                >
                  Load YAML Sample
                </Button>
              </div>
            </div>
          </div>

          {/* Editable Preview Area */}
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="specPreview" className="font-semibold">
                Specification Content Preview ({format.toUpperCase()})
              </Label>
              <span className="text-xs text-muted-foreground">Editable — fix issues inline and re-validate</span>
            </div>
            <textarea
              id="specPreview"
              name="specPreview"
              rows={9}
              value={rawContent}
              onChange={(e) => {
                const nextVal = e.target.value;
                setRawContent(nextVal);
                setFormat(detectFormat(nextVal, fileName));
                if (hasValidated) {
                  setIsValid(false);
                }
              }}
              placeholder="Paste your JSON or YAML specification here..."
              className="w-full rounded-md border bg-slate-950 p-3 font-mono text-xs text-slate-50 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Validation Error Box */}
          {hasValidated && !isValid && validationErrors.length > 0 && (
            <div
              role="alert"
              className="validation-error-box mt-4 rounded-lg border border-red-500/50 bg-red-500/10 p-4 text-red-900 dark:text-red-200"
            >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 font-semibold text-red-600 dark:text-red-400">
                    <AlertTriangle className="h-5 w-5 shrink-0" />
                    <span>
                      Schema Validation Failed ({validationErrors.length}{' '}
                      {validationErrors.length === 1 ? 'issue' : 'issues'})
                    </span>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={handleAutoFix}>
                    <Wand2 className="mr-1.5 h-3.5 w-3.5" />
                    Auto-Fix Missing Fields
                  </Button>
                </div>
                <ul className="space-y-2.5 text-sm">
                  {validationErrors.map((err, idx) => (
                    <li key={idx} className="rounded border border-red-500/30 bg-background/80 p-2.5">
                      <div className="flex items-center justify-between font-mono text-xs font-semibold text-red-600 dark:text-red-400">
                        <span>Field: {err.path}</span>
                        {err.line && <span>Line {err.line}</span>}
                      </div>
                      <p className="mt-1 text-xs text-foreground">{err.message}</p>
                      <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-amber-700 dark:text-amber-300">
                        <Lightbulb className="h-3.5 w-3.5 shrink-0" />
                        <span>💡 Suggestion to fix: {err.suggestion}</span>
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
        )}

              {/* Validation Success Box */}
              {hasValidated && isValid && (
                <div className="mt-4 flex items-center gap-3 rounded-lg border border-green-500/50 bg-green-500/10 p-4 text-sm text-green-800 dark:text-green-200">
                  <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                  <div>
                    <p className="font-semibold">Specification is valid against Schema v1.2!</p>
                    <p className="text-xs opacity-90">
                      Ready to import <strong>{validatedData?.name}</strong> ({validatedData?.specId}, v{validatedData?.version}).
                    </p>
                  </div>
                </div>
              )}

              {/* Footer Actions */}
              <div className="mt-6 flex items-center justify-between border-t pt-4">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <div className="flex items-center gap-3">
                  {hasValidated && !isValid && (
                      <Button
                        variant="secondary"
                        onClick={() => runValidationWithContent(rawContent, fileName)}
                        disabled={isValidating}
                      >
                        {isValidating ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <RefreshCw className="mr-2 h-4 w-4" />
                        )}
                        Re-validate
                      </Button>
            )}

                      <Button
                        type="button"
                        variant={isValid ? 'outline' : 'default'}
                        onClick={() => runValidationWithContent(rawContent, fileName)}
                        disabled={isValidating}
                      >
                        {isValidating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Next: Validate Schema
                      </Button>

                      <Button
                        type="button"
                        onClick={handleImportCommit}
                        disabled={!rawContent.trim() || isImporting}
                      >
                        {isImporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Import Specification
                      </Button>
                    </div>
        </div>
              </dialog>
            </div>
          );
}
          export default ImportWizard;
