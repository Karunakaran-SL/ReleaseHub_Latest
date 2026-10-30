'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, Loader2, X } from 'lucide-react';

interface DuplicateModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceSpecification: Record<string, any> | null;
  onDuplicated: (newSpec: Record<string, any>) => void;
}

export function DuplicateModal({
  isOpen,
  onClose,
  sourceSpecification,
  onDuplicated,
}: DuplicateModalProps) {
  const [name, setName] = useState('');
  const [specId, setSpecId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && sourceSpecification) {
      const originalName = sourceSpecification.name || 'Specification';
      setName(`${originalName} (Copy)`);
      setSpecId(`spec-${Date.now()}`);
      setError(null);
    }
  }, [isOpen, sourceSpecification]);

  if (!isOpen || !sourceSpecification) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Specification name is required.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const payload = {
      sourceId: sourceSpecification._id || sourceSpecification.specId,
      name: name.trim(),
      specId: specId.trim() || `spec-${Date.now()}`,
      sourceSpec: sourceSpecification,
    };

    try {
      const res = await fetch('/api/specifications/duplicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        onDuplicated(data.specification);
        onClose();
        return;
      }
    } catch {
      // Fallback to local state update if API is offline
    } finally {
      setIsSubmitting(false);
    }

    onDuplicated({
      ...sourceSpecification,
      _id: payload.specId,
      specId: payload.specId,
      name: payload.name,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <dialog
        open
        aria-modal="true"
        aria-labelledby="duplicate-modal-title"
        className="relative m-0 w-full max-w-md rounded-lg border bg-background p-6 text-foreground shadow-xl"
      >
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <h2 id="duplicate-modal-title" className="text-xl font-semibold flex items-center gap-2">
              <Copy className="h-5 w-5 text-primary" />
              Duplicate Specification
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Create a copy of <span className="font-medium text-foreground">{sourceSpecification.name}</span>.
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close duplicate modal">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="duplicate-spec-name">Specification Name</Label>
            <Input
              id="duplicate-spec-name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter new specification name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="duplicate-spec-id">Specification ID (specId)</Label>
            <Input
              id="duplicate-spec-id"
              name="specId"
              value={specId}
              onChange={(e) => setSpecId(e.target.value)}
              placeholder="spec-..."
              required
            />
          </div>

          {error && <p className="text-xs font-medium text-destructive">{error}</p>}

          <div className="mt-6 flex items-center justify-end gap-3 border-t pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm Duplicate
            </Button>
          </div>
        </form>
      </dialog>
    </div>
  );
}
export default DuplicateModal;

