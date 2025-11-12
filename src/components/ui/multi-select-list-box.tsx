

'use client';
import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronLeft, ChevronsRight, ChevronsLeft } from 'lucide-react';
import { ScrollArea } from './scroll-area';
import { cn } from '@/lib/utils';

export interface Option {
  id: string;
  label: string;
}

interface MultiSelectListBoxProps {
  available?: Option[];
  chosen?: Option[];
  onMoveToChosen: (ids: string[]) => void;
  onMoveToAvailable: (ids: string[]) => void;
  onMoveAllToChosen: () => void;
  onMoveAllToAvailable: () => void;
  disabled?: boolean;
}

export function MultiSelectListBox({ 
  available = [], 
  chosen = [], 
  onMoveToChosen,
  onMoveToAvailable,
  onMoveAllToChosen,
  onMoveAllToAvailable,
  disabled = false 
}: MultiSelectListBoxProps) {
  const [selectedAvailable, setSelectedAvailable] = useState<Set<string>>(new Set());
  const [selectedChosen, setSelectedChosen] = useState<Set<string>>(new Set());

  const handleToggle = (id: string, listType: 'available' | 'chosen') => {
    if (disabled) return;
    if (listType === 'available') {
      const newSelection = new Set(selectedAvailable);
      newSelection.has(id) ? newSelection.delete(id) : newSelection.add(id);
      setSelectedAvailable(newSelection);
    } else {
      const newSelection = new Set(selectedChosen);
      newSelection.has(id) ? newSelection.delete(id) : newSelection.add(id);
      setSelectedChosen(newSelection);
    }
  };
  
  const handleMoveSelected = (direction: 'toChosen' | 'toAvailable') => {
    if (disabled) return;
    if (direction === 'toChosen') {
      onMoveToChosen(Array.from(selectedAvailable));
      setSelectedAvailable(new Set());
    } else {
      onMoveToAvailable(Array.from(selectedChosen));
      setSelectedChosen(new Set());
    }
  };

  const handleMoveAll = (direction: 'toChosen' | 'toAvailable') => {
    if (disabled) return;
     if (direction === 'toChosen') {
        onMoveAllToChosen();
     } else {
        onMoveAllToAvailable();
     }
     setSelectedAvailable(new Set());
     setSelectedChosen(new Set());
  };

  const containerClasses = cn("grid grid-cols-[1fr_auto_1fr] items-start gap-4 mt-2", {
      'opacity-70 cursor-not-allowed': disabled
  });
  
  const cardClasses = cn({ 'bg-muted/50': disabled });

  return (
    <div className={containerClasses}>
      <Card className={cardClasses}>
        <CardHeader className="p-2 border-b">
          <h4 className="font-semibold text-sm">Choices</h4>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-40">
            <div className="p-2 space-y-1">
              {(available || []).map(option => (
                <div key={option.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`available-${option.id}`}
                    checked={selectedAvailable.has(option.id)}
                    onCheckedChange={() => handleToggle(option.id, 'available')}
                    disabled={disabled}
                  />
                  <label htmlFor={`available-${option.id}`} className={cn("text-sm font-normal", {'text-muted-foreground': disabled})}>
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-2 self-center">
        <Button variant="outline" size="icon" onClick={() => handleMoveAll('toChosen')} disabled={disabled || available.length === 0}>
          <ChevronsRight className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={() => handleMoveSelected('toChosen')} disabled={disabled || selectedAvailable.size === 0}>
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={() => handleMoveSelected('toAvailable')} disabled={disabled || selectedChosen.size === 0}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
         <Button variant="outline" size="icon" onClick={() => handleMoveAll('toAvailable')} disabled={disabled || chosen.length === 0}>
          <ChevronsLeft className="h-4 w-4" />
        </Button>
      </div>

      <Card className={cardClasses}>
        <CardHeader className="p-2 border-b">
          <h4 className="font-semibold text-sm">Chosen</h4>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-40">
            <div className="p-2 space-y-1">
             {(chosen || []).map(option => (
                <div key={option.id} className="flex items-center space-x-2">
                   <Checkbox
                    id={`chosen-${option.id}`}
                    checked={selectedChosen.has(option.id)}
                    onCheckedChange={() => handleToggle(option.id, 'chosen')}
                    disabled={disabled}
                  />
                  <label htmlFor={`chosen-${option.id}`} className={cn("text-sm font-normal", {'text-muted-foreground': disabled})}>
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}