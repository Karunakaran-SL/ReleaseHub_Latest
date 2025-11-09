'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronLeft, ChevronsRight, ChevronsLeft } from 'lucide-react';
import { ScrollArea } from './scroll-area';
import { cn } from '@/lib/utils';

interface Option {
  id: string;
  label: string;
}

interface MultiSelectListBoxProps {
  options: Option[];
  chosen?: string[];
  onChange: (selected: string[]) => void;
  disabled?: boolean;
}

export function MultiSelectListBox({ options, chosen: initialChosen = [], onChange, disabled = false }: MultiSelectListBoxProps) {
  const [available, setAvailable] = useState<Option[]>([]);
  const [chosen, setChosen] = useState<Option[]>([]);
  const [selectedAvailable, setSelectedAvailable] = useState<Set<string>>(new Set());
  const [selectedChosen, setSelectedChosen] = useState<Set<string>>(new Set());

  useEffect(() => {
    const chosenSet = new Set(initialChosen);
    const availableOptions = options.filter(opt => !chosenSet.has(opt.id));
    const chosenOptions = options.filter(opt => chosenSet.has(opt.id));
    setAvailable(availableOptions);
    setChosen(chosenOptions);
  }, [options, initialChosen]);

  const handleToggle = (id: string, listType: 'available' | 'chosen') => {
    if (disabled) return;
    if (listType === 'available') {
      const newSelection = new Set(selectedAvailable);
      if (newSelection.has(id)) {
        newSelection.delete(id);
      } else {
        newSelection.add(id);
      }
      setSelectedAvailable(newSelection);
    } else {
      const newSelection = new Set(selectedChosen);
      if (newSelection.has(id)) {
        newSelection.delete(id);
      } else {
        newSelection.add(id);
      }
      setSelectedChosen(newSelection);
    }
  };
  
  const moveSelected = (direction: 'toChosen' | 'toAvailable') => {
    if (disabled) return;
    if (direction === 'toChosen') {
      const toMove = available.filter(opt => selectedAvailable.has(opt.id));
      const newAvailable = available.filter(opt => !selectedAvailable.has(opt.id));
      const newChosen = [...chosen, ...toMove];
      
      setAvailable(newAvailable);
      setChosen(newChosen);
      setSelectedAvailable(new Set());
      onChange(newChosen.map(opt => opt.id));
    } else {
      const toMove = chosen.filter(opt => selectedChosen.has(opt.id));
      const newChosen = chosen.filter(opt => !selectedChosen.has(opt.id));
      const newAvailable = [...available, ...toMove];

      setAvailable(newAvailable);
      setChosen(newChosen);
      setSelectedChosen(new Set());
      onChange(newChosen.map(opt => opt.id));
    }
  };

  const moveAll = (direction: 'toChosen' | 'toAvailable') => {
    if (disabled) return;
     if (direction === 'toChosen') {
        const newChosen = [...chosen, ...available];
        setChosen(newChosen);
        setAvailable([]);
        onChange(newChosen.map(opt => opt.id));
     } else {
        const newAvailable = [...available, ...chosen];
        setAvailable(newAvailable);
        setChosen([]);
        onChange([]);
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
              {available.map(option => (
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
        <Button variant="outline" size="icon" onClick={() => moveAll('toChosen')} disabled={disabled || available.length === 0}>
          <ChevronsRight className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={() => moveSelected('toChosen')} disabled={disabled || selectedAvailable.size === 0}>
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={() => moveSelected('toAvailable')} disabled={disabled || selectedChosen.size === 0}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
         <Button variant="outline" size="icon" onClick={() => moveAll('toAvailable')} disabled={disabled || chosen.length === 0}>
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
             {chosen.map(option => (
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
