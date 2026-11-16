// SPDX-License-Identifier: AGPL-3.0-only
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit2, PowerOff, Power, Trash2 } from 'lucide-react';
import type { SpecificationOptionDoc } from '@/lib/specification-options-defaults';

interface OptionCategoryTableProps {
  options: SpecificationOptionDoc[];
  isLoading?: boolean;
  onEdit: (option: SpecificationOptionDoc) => void;
  onToggleActive: (option: SpecificationOptionDoc) => void;
  onDelete?: (option: SpecificationOptionDoc) => void;
}

export function OptionCategoryTable({
  options,
  isLoading = false,
  onEdit,
  onToggleActive,
  onDelete,
}: OptionCategoryTableProps) {
  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3">Key</th>
              <th className="px-4 py-3">Display Label</th>
              <th className="px-4 py-3 hidden md:table-cell">Description</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading && options.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  Loading options from database...
                </td>
              </tr>
            ) : options.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  No options found in database for this category. Click &quot;+ Add Option&quot; to create one.
                </td>
              </tr>
            ) : (
              options.map((opt) => (
                <tr key={opt._id || opt.key} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs font-semibold">{opt.key}</td>
                  <td className="px-4 py-3 font-medium">{opt.label}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground hidden md:table-cell">
                    {opt.description || '—'}
                  </td>
                  <td className="px-4 py-3">
                    {opt.active ? (
                      <Badge
                        variant="outline"
                        className="border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      >
                        ● Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-muted-foreground">
                        ○ Inactive
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => onEdit(opt)}
                        >
                          <Edit2 className="mr-1.5 h-3.5 w-3.5" />
                          Edit
                        </Button>
                        <Button
                          type="button"
                          variant={opt.active ? 'ghost' : 'secondary'}
                          size="sm"
                          onClick={() => onToggleActive(opt)}
                        >
                          {opt.active ? (
                            <>
                              <PowerOff className="mr-1.5 h-3.5 w-3.5 text-amber-600" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <Power className="mr-1.5 h-3.5 w-3.5 text-emerald-600" />
                              Activate
                            </>
                          )}
                        </Button>
                        {onDelete && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => onDelete(opt)}
                            title={`Delete ${opt.label}`}
                            aria-label={`Delete ${opt.label}`}
                          >
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                          </Button>
                        )}
                      </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default OptionCategoryTable;
