// SPDX-License-Identifier: AGPL-3.0-only
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Loader2, Save } from 'lucide-react';
import type { SpecificationOptionDoc } from '@/lib/specification-options-defaults';

interface AddOptionModalProps {
  open: boolean;
  onClose: () => void;
  category: string;
  categoryLabel: string;
  editingOption?: SpecificationOptionDoc | null;
  onSaved: (option: SpecificationOptionDoc) => void;
}

export function AddOptionModal({
  open,
  onClose,
  category,
  categoryLabel,
  editingOption,
  onSaved,
}: AddOptionModalProps) {
  const [key, setKey] = useState('');
  const [label, setLabel] = useState('');
  const [description, setDescription] = useState('');
  const [active, setActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      if (editingOption) {
        setKey(editingOption.key);
        setLabel(editingOption.label);
        setDescription(editingOption.description || '');
        setActive(editingOption.active);
      } else {
        setKey('');
        setLabel('');
        setDescription('');
        setActive(true);
      }
      setError(null);
    }
  }, [open, editingOption]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!key.trim() || !label.trim()) {
      setError('Both Key and Display Label are required.');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const url = editingOption
        ? `/api/settings/specifications/options/${encodeURIComponent(editingOption._id)}`
        : '/api/settings/specifications/options';
      const method = editingOption ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          key: key.trim().toUpperCase(),
          label: label.trim(),
          description: description.trim(),
          active,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save option');
      }

      onSaved(data.option);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Unable to save option');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-label={editingOption ? 'Edit Option' : 'Add Option'}
    >
      <div className="w-full max-w-md rounded-xl border bg-background shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b px-6 py-4 bg-muted/40">
          <div>
            <h2 className="text-lg font-semibold">
              {editingOption ? 'Edit Option' : `Add ${categoryLabel} Option`}
            </h2>
            <p className="text-xs text-muted-foreground">Category: {category}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close modal">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="option-key">Option Key (Unique Identifier)</Label>
            <Input
              id="option-key"
              name="key"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="e.g. QUANTUM_BLADE"
              disabled={Boolean(editingOption)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="option-label">Display Label</Label>
            <Input
              id="option-label"
              name="label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Quantum Compute Blade"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="option-description">Description (Optional)</Label>
            <Input
              id="option-description"
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description for Specification Studio"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              id="option-active"
              name="active"
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="h-4 w-4 rounded border-input"
            />
            <Label htmlFor="option-active" className="cursor-pointer text-sm">
              Active in Specification Studio dropdowns
            </Label>
          </div>

          {error && (
            <div className="rounded-md bg-destructive/10 border border-destructive/30 px-3 py-2 text-xs text-destructive">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save Option
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddOptionModal;
