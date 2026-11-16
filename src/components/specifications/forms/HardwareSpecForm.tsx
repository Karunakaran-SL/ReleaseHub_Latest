// SPDX-License-Identifier: AGPL-3.0-only
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Save } from 'lucide-react';
import { useSpecOptions } from '@/hooks/useSpecOptions';
import type { HwDetails } from '@/models/Specification';

interface HardwareSpecFormProps {
  initialData?: {
    specId?: string;
    name?: string;
    version?: string;
    vendor?: string;
    hwDetails?: Partial<HwDetails>;
  };
  onSubmit: (payload: Record<string, any>) => Promise<void> | void;
  isSubmitting?: boolean;
}

export function HardwareSpecForm({
  initialData,
  onSubmit,
  isSubmitting = false,
}: HardwareSpecFormProps) {
  const { options: formFactorOptions } = useSpecOptions('HW_FORM_FACTORS');
  const { options: archOptions } = useSpecOptions('HW_ARCHITECTURES');
  const { options: vendorOptions } = useSpecOptions('VENDORS');

  const [specId, setSpecId] = useState(initialData?.specId || `hw-${Date.now()}`);
  const [name, setName] = useState(initialData?.name || 'On-Prem Hardware Spec');
  const [version, setVersion] = useState(initialData?.version || '1.0.0');
  const [vendor, setVendor] = useState(initialData?.vendor || '');
  const [formFactor, setFormFactor] = useState(initialData?.hwDetails?.formFactor || '');
  const [architecture, setArchitecture] = useState(initialData?.hwDetails?.architecture || '');
  const [airgapSupport, setAirgapSupport] = useState(
    initialData?.hwDetails?.airgapSupport ?? true
  );

  useEffect(() => {
    if (formFactorOptions.length > 0 && !formFactor) {
      setFormFactor(formFactorOptions[0].key);
    }
  }, [formFactorOptions, formFactor]);

  useEffect(() => {
    if (archOptions.length > 0 && !architecture) {
      setArchitecture(archOptions[0].key);
    }
  }, [archOptions, architecture]);

  useEffect(() => {
    if (vendorOptions.length > 0 && !vendor) {
      setVendor(vendorOptions[0].label);
    }
  }, [vendorOptions, vendor]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedFF = formFactorOptions.find((o) => o.key === formFactor);
    const ffLabel = selectedFF?.label || formFactor;
    await onSubmit({
      specId: specId.trim() || `hw-${Date.now()}`,
      name: name.trim() || 'On-Prem Hardware Spec',
      version: version.trim() || '1.0.0',
      specType: 'HW',
      vendor,
      hw_type: { id: formFactor, name: ffLabel },
      hwDetails: {
        formFactor,
        architecture,
        airgapSupport,
      },
      specDefinition: {
        target: formFactor.toLowerCase().replace(/\s+/g, '-'),
        steps: ['validate-hardware', 'configure-bios-raid', 'provision-os', 'verify-airgap'],
      },
    });
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="hw-spec-name">Specification Name</Label>
          <Input
            id="hw-spec-name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Airgapped Edge Rack Spec"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="hw-spec-id">Spec ID</Label>
          <Input
            id="hw-spec-id"
            name="specId"
            value={specId}
            onChange={(e) => setSpecId(e.target.value)}
            placeholder="hw-rack-01"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="hw-form-factor">Form Factor</Label>
          <select
            id="hw-form-factor"
            name="formFactor"
            value={formFactor}
            onChange={(e) => setFormFactor(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            required
          >
            {formFactorOptions.length === 0 ? (
              <option value="">Loading from DB...</option>
            ) : (
              formFactorOptions.map((opt) => (
                <option key={opt.key} value={opt.key}>
                  {opt.label}
                </option>
              ))
            )}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="hw-architecture">CPU Architecture</Label>
          <select
            id="hw-architecture"
            name="architecture"
            value={architecture}
            onChange={(e) => setArchitecture(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            required
          >
            {archOptions.length === 0 ? (
              <option value="">Loading from DB...</option>
            ) : (
              archOptions.map((opt) => (
                <option key={opt.key} value={opt.key}>
                  {opt.label}
                </option>
              ))
            )}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="hw-version">Version</Label>
          <Input
            id="hw-version"
            name="version"
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            placeholder="1.0.0"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
        <div className="space-y-1.5">
          <Label htmlFor="hw-vendor">OEM Vendor</Label>
          <select
            id="hw-vendor"
            name="vendor"
            value={vendor}
            onChange={(e) => setVendor(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {vendorOptions.length === 0 ? (
              <option value="">Loading from DB...</option>
            ) : (
              vendorOptions.map((opt) => (
                <option key={opt._id || opt.key} value={opt.label}>
                  {opt.label}
                </option>
              ))
            )}
          </select>
        </div>

        <div className="flex items-center gap-2 pt-5">
          <input
            id="hw-airgap"
            name="airgapSupport"
            type="checkbox"
            checked={airgapSupport}
            onChange={(e) => setAirgapSupport(e.target.checked)}
            className="h-4 w-4 rounded border-input"
          />
          <Label htmlFor="hw-airgap" className="cursor-pointer">
            Airgapped / Offline Provisioning Ready
          </Label>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting || !formFactor}>
        {isSubmitting ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Save className="mr-2 h-4 w-4" />
        )}
        Save Specification
      </Button>
    </form>
  );
}

export default HardwareSpecForm;
