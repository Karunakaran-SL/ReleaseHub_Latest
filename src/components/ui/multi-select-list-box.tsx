'use client';
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronLeft, ChevronsRight, ChevronsLeft } from 'lucide-react';
import { ScrollArea } from './scroll-area';

interface Option {
  id: string;
  label: string;
}

interface MultiSelectListBoxProps {
  options: Option[];
  onChange: (selected: string[]) => void;
}

export function MultiSelectListBox({ options, onChange }: MultiSelectListBoxProps) {
  const [available, setAvailable] = useState<Option[]>(options);
  const [chosen, setChosen] = useState<Option[]>([]);
  const [selectedAvailable, setSelectedAvailable] = useState<Set<string>>(new Set());
  const [selectedChosen, setSelectedChosen] = useState<Set<string>>(new Set());

  const handleToggle = (id: string, listType: 'available' | 'chosen') => {
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
     if (direction === 'toChosen') {
        setChosen([...chosen, ...available]);
        setAvailable([]);
        onChange([...chosen, ...available].map(opt => opt.id));
     } else {
        setAvailable([...available, ...chosen]);
        setChosen([]);
        onChange([]);
     }
     setSelectedAvailable(new Set());
     setSelectedChosen(new Set());
  };

  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-4 mt-2">
      <Card>
        <CardHeader className="p-2 border-b">
          <h4 className="font-semibold text-sm">Choices</h4>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-40">
            <div className="p-2 space-y-1">
              {options.filter(opt => available.some(a => a.id === opt.id)).map(option => (
                <div key={option.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`available-${option.id}`}
                    checked={selectedAvailable.has(option.id)}
                    onCheckedChange={() => handleToggle(option.id, 'available')}
                  />
                  <label htmlFor={`available-${option.id}`} className="text-sm font-normal">
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-2 self-center">
        <Button variant="outline" size="icon" onClick={() => moveAll('toChosen')}>
          <ChevronsRight className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={() => moveSelected('toChosen')}>
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={() => moveSelected('toAvailable')}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
         <Button variant="outline" size="icon" onClick={() => moveAll('toAvailable')}>
          <ChevronsLeft className="h-4 w-4" />
        </Button>
      </div>

      <Card>
        <CardHeader className="p-2 border-b">
          <h4 className="font-semibold text-sm">Chosen</h4>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-40">
            <div className="p-2 space-y-1">
             {options.filter(opt => chosen.some(c => c.id === opt.id)).map(option => (
                <div key={option.id} className="flex items-center space-x-2">
                   <Checkbox
                    id={`chosen-${option.id}`}
                    checked={selectedChosen.has(option.id)}
                    onCheckedChange={() => handleToggle(option.id, 'chosen')}
                  />
                  <label htmlFor={`chosen-${option.id}`} className="text-sm font-normal">
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
