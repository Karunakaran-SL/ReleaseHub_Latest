// SPDX-License-Identifier: AGPL-3.0-only
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Save } from 'lucide-react';
import { useSpecOptions } from '@/hooks/useSpecOptions';
import type { CloudDetails } from '@/models/Specification';

interface CloudSpecFormProps {
  initialData?: {
    specId?: string;
    name?: string;
    version?: string;
    cloudDetails?: Partial<CloudDetails>;
  };
  onSubmit: (payload: Record<string, any>) => Promise<void> | void;
  isSubmitting?: boolean;
}

export function CloudSpecForm({
  initialData,
  onSubmit,
  isSubmitting = false,
}: CloudSpecFormProps) {
  const { options: providerOptions } = useSpecOptions('CLOUD_PROVIDERS');
  const { options: cloudTypeOptions } = useSpecOptions('CLOUD_TYPES');

  const [specId, setSpecId] = useState(initialData?.specId || `cloud-${Date.now()}`);
  const [name, setName] = useState(initialData?.name || 'Cloud Infrastructure Spec');
  const [version, setVersion] = useState(initialData?.version || '1.0.0');
  const [provider, setProvider] = useState(initialData?.cloudDetails?.provider || '');
  const [cloudType, setCloudType] = useState(initialData?.cloudDetails?.cloudType || '');
  const [region, setRegion] = useState(initialData?.cloudDetails?.region || 'us-east-1');

  useEffect(() => {
    if (providerOptions.length > 0 && !provider) {
      setProvider(providerOptions[0].key);
    }
  }, [providerOptions, provider]);

  useEffect(() => {
    if (cloudTypeOptions.length > 0 && !cloudType) {
      setCloudType(cloudTypeOptions[0].key);
    }
  }, [cloudTypeOptions, cloudType]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      specId: specId.trim() || `cloud-${Date.now()}`,
      name: name.trim() || `${provider} Cloud Spec`,
      version: version.trim() || '1.0.0',
      specType: 'CLOUD',
      vendor: provider,
      hw_type: { id: 'Virtual', name: 'Virtual' },
      cloudDetails: {
        provider,
        cloudType,
        region: region.trim() || 'us-east-1',
      },
      specDefinition: {
        target: provider.toLowerCase(),
        steps: ['validate-credentials', 'provision-network', 'deploy-compute', 'verify-endpoints'],
      },
    });
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="cloud-spec-name">Specification Name</Label>
          <Input
            id="cloud-spec-name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. AWS Multi-AZ Cloud Spec"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cloud-spec-id">Spec ID</Label>
          <Input
            id="cloud-spec-id"
            name="specId"
            value={specId}
            onChange={(e) => setSpecId(e.target.value)}
            placeholder="cloud-aws-01"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="cloud-provider">Cloud Provider</Label>
          <select
            id="cloud-provider"
            name="provider"
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            required
          >
            {providerOptions.length === 0 ? (
              <option value="">Loading from DB...</option>
            ) : (
              providerOptions.map((opt) => (
                <option key={opt.key} value={opt.key}>
                  {opt.label}
                </option>
              ))
            )}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="cloud-type">Cloud Deployment Model</Label>
          <select
            id="cloud-type"
            name="cloudType"
            value={cloudType}
            onChange={(e) => setCloudType(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            required
          >
            {cloudTypeOptions.length === 0 ? (
              <option value="">Loading from DB...</option>
            ) : (
              cloudTypeOptions.map((opt) => (
                <option key={opt.key} value={opt.key}>
                  {opt.label}
                </option>
              ))
            )}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="cloud-region">Region / Datacenter</Label>
          <Input
            id="cloud-region"
            name="region"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            placeholder="us-east-1"
            required
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="cloud-version">Version</Label>
        <Input
          id="cloud-version"
          name="version"
          value={version}
          onChange={(e) => setVersion(e.target.value)}
          placeholder="1.0.0"
          required
        />
      </div>

        <Button type="submit" className="w-full" disabled={isSubmitting || !provider || !cloudType}>
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

export default CloudSpecForm;
