
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import type { OnboardingPhase, OnboardingFormField } from '@/lib/definitions';
import { cn } from '@/lib/utils';
import { FileText } from 'lucide-react';

interface ValidationPhaseProps {
  phase: OnboardingPhase;
  phaseState: any;
  onStateChange: (fieldName: string, value: any) => void;
  onStatusChange: (status: string) => void;
  isExpanded: boolean;
  onExpand: () => void;
  statusColor: string;
  onSave: () => void;
  onCancel: () => void;
}

export default function ValidationPhaseComponent({
  phase,
  phaseState,
  onStateChange,
  onStatusChange,
  isExpanded,
  onExpand,
  statusColor,
  onSave,
  onCancel,
}: ValidationPhaseProps) {

  const renderField = (field: OnboardingFormField) => {
    const fieldId = `${phase.id}-${field.name}`;
    const fieldData = phaseState?.[field.name] || { value: '', proofLink: '' };
    const value = fieldData.value;
    const proofLink = fieldData.proofLink;

    const handleValueChange = (newValue: any) => {
        onStateChange(field.name, { value: newValue, proofLink: proofLink });
    };

    const handleProofLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onStateChange(field.name, { value: value, proofLink: e.target.value });
    };

    return (
      <div key={fieldId} className="space-y-2 p-4 border rounded-md">
        <div className="flex items-center justify-between">
           <Label htmlFor={fieldId}>{field.label}</Label>
           {field.helpText && <p className="text-xs text-muted-foreground">{field.helpText}</p>}
        </div>
        
        {field.type === 'TextField' && <Input id={fieldId} value={value || ''} onChange={e => handleValueChange(e.target.value)} />}
        {field.type === 'Checkbox' && <Checkbox id={fieldId} checked={!!value} onCheckedChange={checked => handleValueChange(!!checked)} />}
        {field.type === 'Link' && <Input id={fieldId} value={value || ''} onChange={e => handleValueChange(e.target.value)} placeholder="https://..."/>}
        {field.type === 'DropDown' && (
             <Select onValueChange={handleValueChange} value={value || ''}>
                <SelectTrigger id={fieldId}><SelectValue placeholder="Select..."/></SelectTrigger>
                <SelectContent>
                    {(field.options || []).map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                </SelectContent>
            </Select>
        )}
        {field.type === 'RadioBox' && (
            <div className="flex gap-4">
            {(field.options || []).map(opt => (
                <div key={opt} className="flex items-center space-x-2">
                    <input type="radio" id={`${fieldId}-${opt}`} name={fieldId} value={opt} checked={value === opt} onChange={e => handleValueChange(e.target.value)} />
                    <Label htmlFor={`${fieldId}-${opt}`}>{opt}</Label>
                </div>
            ))}
            </div>
        )}

        {field.proof && (
            <div className="mt-2 space-y-1">
                <Label htmlFor={`${fieldId}-proof`} className="text-xs">Proof Link</Label>
                <Input id={`${fieldId}-proof`} value={proofLink || ''} onChange={handleProofLinkChange} placeholder="Link to evidence"/>
            </div>
        )}

      </div>
    );
  };

  return (
    <div className="relative">
      <div 
        className={cn("w-48 h-24 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all duration-300", statusColor, {
            'ring-2 ring-primary ring-offset-2': isExpanded,
        })}
        onClick={onExpand}
        >
        <FileText className="h-6 w-6 mb-1" />
        <h4 className="font-bold text-center text-sm">{phase.name}</h4>
        <p className="text-xs text-center">{phaseState?.status || 'Not Started'}</p>
      </div>

      {isExpanded && (
        <Card className="absolute z-20 w-96 mt-2 left-1/2 -translate-x-1/2 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-xl flex justify-between items-center">
                <span>{phase.name}</span>
                <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onCancel(); }}>X</Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 max-h-96 overflow-y-auto">
             <div className="space-y-2">
                <Label>Owner: {phase.ownerName} ({phase.ownerEmail})</Label>
             </div>
             <div className="space-y-2">
                <Label htmlFor={`${phase.id}-status`}>Status</Label>
                <Select value={phaseState?.status || 'Not Started'} onValueChange={onStatusChange}>
                    <SelectTrigger id={`${phase.id}-status`}><SelectValue /></SelectTrigger>
                    <SelectContent>
                        {phase.statusOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                    </SelectContent>
                </Select>
             </div>
             {phase.fields.map(renderField)}
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={onCancel}>Cancel</Button>
            <Button onClick={onSave}>Save</Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
