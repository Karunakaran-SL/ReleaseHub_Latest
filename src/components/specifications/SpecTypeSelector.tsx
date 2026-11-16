// SPDX-License-Identifier: AGPL-3.0-only
'use client';

import React from 'react';
import { Server, Cloud, Layers, Box } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useSpecOptions } from '@/hooks/useSpecOptions';
import type { SpecificationType } from '@/models/Specification';

interface SpecTypeSelectorProps {
  selectedType: SpecificationType;
  onSelectType: (type: SpecificationType) => void;
}

function getSpecTypeIcon(key: string) {
  switch (key) {
    case 'HW':
      return Server;
    case 'CLOUD':
      return Cloud;
    case 'MANAGED_K8S':
      return Layers;
    default:
      return Box;
  }
}

export function SpecTypeSelector({ selectedType, onSelectType }: SpecTypeSelectorProps) {
  const { options: specTypes } = useSpecOptions('SPEC_TYPES');

  return (
    <div
      className="grid grid-cols-1 md:grid-cols-3 gap-3"
      role="tablist"
      aria-label="Specification Type Selector"
    >
      {specTypes.map((item) => {
        const Icon = getSpecTypeIcon(item.key);
        const isActive = selectedType === item.key;
        return (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelectType(item.key as SpecificationType)}
            className={`flex flex-col items-start justify-between rounded-lg border-2 p-4 text-left transition-all ${
              isActive
                ? 'border-primary bg-primary/5 shadow-sm'
                : 'border-border bg-card hover:border-primary/50'
            }`}
          >
            <div className="flex w-full items-center justify-between mb-2">
              <div
                className={`rounded-md p-2 ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <Badge variant={isActive ? 'default' : 'outline'} className="text-[10px]">
                {item.key}
              </Badge>
            </div>
            <div>
              <h3 className="font-semibold text-sm">{item.label}</h3>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                {item.description || `${item.label} Specification`}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export default SpecTypeSelector;
