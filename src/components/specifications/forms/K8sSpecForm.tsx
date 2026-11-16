// SPDX-License-Identifier: AGPL-3.0-only
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Save } from 'lucide-react';
import { useSpecOptions } from '@/hooks/useSpecOptions';
import type { K8sDetails } from '@/models/Specification';

interface K8sSpecFormProps {
  initialData?: {
    specId?: string;
    name?: string;
    version?: string;
    k8sDetails?: Partial<K8sDetails>;
  };
  onSubmit: (payload: Record<string, any>) => Promise<void> | void;
  isSubmitting?: boolean;
}

export function K8sSpecForm({
  initialData,
  onSubmit,
  isSubmitting = false,
}: K8sSpecFormProps) {
  const { options: distroOptions } = useSpecOptions('K8S_DISTROS');
  const { options: scopeOptions } = useSpecOptions('K8S_SCOPES');

  const [specId, setSpecId] = useState(initialData?.specId || `k8s-${Date.now()}`);
  const [name, setName] = useState(initialData?.name || 'EKS Production Cluster');
  const [version, setVersion] = useState(initialData?.version || '1.0.0');
  const [k8sDistro, setK8sDistro] = useState(initialData?.k8sDetails?.k8sDistro || '');
  const [clusterScope, setClusterScope] = useState(initialData?.k8sDetails?.clusterScope || '');
  const [k8sVersion, setK8sVersion] = useState(initialData?.k8sDetails?.k8sVersion || '1.30');

  useEffect(() => {
    if (distroOptions.length > 0 && !k8sDistro) {
      setK8sDistro(distroOptions[0].key);
    }
  }, [distroOptions, k8sDistro]);

  useEffect(() => {
    if (scopeOptions.length > 0 && !clusterScope) {
      setClusterScope(scopeOptions[0].key);
    }
  }, [scopeOptions, clusterScope]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      specId: specId.trim() || `k8s-${Date.now()}`,
      name: name.trim() || `${k8sDistro} Managed Cluster (${k8sVersion})`,
      version: version.trim() || '1.0.0',
      specType: 'MANAGED_K8S',
      vendor: k8sDistro,
      hw_type: { id: 'Virtual', name: 'Virtual' },
      clusterType: 'Managed Kubernetes',
      k8sDetails: {
        k8sDistro,
        clusterScope,
        k8sVersion: k8sVersion.trim() || '1.30',
      },
      specDefinition: {
        target: k8sDistro.toLowerCase(),
        steps: [
          'provision-control-plane',
          'configure-cni-plugin',
          'join-worker-pool',
          'verify-cluster-readiness',
        ],
      },
    });
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="k8s-spec-name">Specification Name</Label>
          <Input
            id="k8s-spec-name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. EKS Production Cluster"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="k8s-spec-id">Spec ID</Label>
          <Input
            id="k8s-spec-id"
            name="specId"
            value={specId}
            onChange={(e) => setSpecId(e.target.value)}
            placeholder="k8s-eks-prod"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="k8s-distro">Kubernetes Distribution</Label>
          <select
            id="k8s-distro"
            name="k8sDistro"
            value={k8sDistro}
            onChange={(e) => setK8sDistro(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            required
          >
            {distroOptions.length === 0 ? (
              <option value="">Loading from DB...</option>
            ) : (
              distroOptions.map((opt) => (
                <option key={opt.key} value={opt.key}>
                  {opt.label}
                </option>
              ))
            )}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="k8s-cluster-scope">Cluster Scope</Label>
          <select
            id="k8s-cluster-scope"
            name="clusterScope"
            value={clusterScope}
            onChange={(e) => setClusterScope(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            required
          >
            {scopeOptions.length === 0 ? (
              <option value="">Loading from DB...</option>
            ) : (
              scopeOptions.map((opt) => (
                <option key={opt.key} value={opt.key}>
                  {opt.label}
                </option>
              ))
            )}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="k8s-version">Kubernetes Version</Label>
          <Input
            id="k8s-version"
            name="k8sVersion"
            value={k8sVersion}
            onChange={(e) => setK8sVersion(e.target.value)}
            placeholder="1.30"
            required
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="k8s-blueprint-version">Blueprint Version</Label>
        <Input
          id="k8s-blueprint-version"
          name="version"
          value={version}
          onChange={(e) => setVersion(e.target.value)}
          placeholder="1.0.0"
          required
        />
      </div>

        <Button type="submit" className="w-full" disabled={isSubmitting || !k8sDistro || !clusterScope}>
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

export default K8sSpecForm;
