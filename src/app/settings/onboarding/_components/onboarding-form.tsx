
'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { PlusCircle, Trash2, GripVertical, Loader2 } from 'lucide-react';
import type { OnboardingConfiguration, OnboardingPhase, OnboardingFormField } from '@/lib/definitions';
import { Card, CardContent } from '@/components/ui/card';

interface OnboardingFormProps {
    initialData: OnboardingConfiguration | null;
    onSave: (data: OnboardingConfiguration) => void;
    isLoading: boolean;
    name: string;
}

const defaultStatuses = ['Not Started', 'In Progress', 'Done', 'Cancelled', 'Skipped'];

export function OnboardingForm({ initialData, onSave, isLoading, name }: OnboardingFormProps) {
    const [config, setConfig] = useState<OnboardingConfiguration | null>(null);

    useEffect(() => {
        if (initialData) {
            setConfig(JSON.parse(JSON.stringify(initialData))); // Deep copy
        } else {
             setConfig({ _id: '', name, version: 1, phases: [] });
        }
    }, [initialData, name]);
    
    if (!config) return <Loader2 className="h-8 w-8 animate-spin" />;

    const updatePhase = (phaseIndex: number, updatedPhase: Partial<OnboardingPhase>) => {
        const newPhases = [...config.phases];
        newPhases[phaseIndex] = { ...newPhases[phaseIndex], ...updatedPhase };
        setConfig({ ...config, phases: newPhases });
    };

    const addPhase = () => {
        const newPhase: OnboardingPhase = {
            id: `phase-${Date.now()}`,
            name: `New Phase ${config.phases.length + 1}`,
            ownerName: '',
            ownerEmail: '',
            sendEmailOnComplete: false,
            statusOptions: defaultStatuses,
            fields: [],
        };
        setConfig({ ...config, phases: [...config.phases, newPhase] });
    };

    const removePhase = (phaseIndex: number) => {
        const newPhases = config.phases.filter((_, i) => i !== phaseIndex);
        setConfig({ ...config, phases: newPhases });
    };

    const addFieldToPhase = (phaseIndex: number) => {
        const newField: OnboardingFormField = {
            type: 'TextField',
            name: `newField${Date.now()}`,
            label: 'New Field',
            helpText: '',
            options: [],
            proof: false,
        };
        const newPhases = [...config.phases];
        newPhases[phaseIndex].fields.push(newField);
        setConfig({ ...config, phases: newPhases });
    };

    const updateField = (phaseIndex: number, fieldIndex: number, updatedField: Partial<OnboardingFormField>) => {
        const newPhases = [...config.phases];
        newPhases[phaseIndex].fields[fieldIndex] = { ...newPhases[phaseIndex].fields[fieldIndex], ...updatedField };
        setConfig({ ...config, phases: newPhases });
    };

    const removeField = (phaseIndex: number, fieldIndex: number) => {
        const newPhases = [...config.phases];
        newPhases[phaseIndex].fields = newPhases[phaseIndex].fields.filter((_, i) => i !== fieldIndex);
        setConfig({ ...config, phases: newPhases });
    };
    
    const handleSaveClick = () => {
        const newVersion = (initialData?.version || 0) + 1;
        onSave({ ...config, version: newVersion });
    }

    const renderField = (phase: OnboardingPhase, field: OnboardingFormField, phaseIndex: number, fieldIndex: number) => {
        const fieldId = `${phase.id}-${field.name}`;
        
        return (
            <Card key={fieldIndex}>
                <CardContent className="p-4 space-y-4">
                    <div className="flex justify-between items-start">
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <Label>Field Type</Label>
                                <Select value={field.type} onValueChange={(value: OnboardingFormField['type']) => updateField(phaseIndex, fieldIndex, { type: value, options: [] })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="TextField">Text Field</SelectItem>
                                        <SelectItem value="Checkbox">Checkbox</SelectItem>
                                        <SelectItem value="RadioBox">Radio Box</SelectItem>
                                        <SelectItem value="DropDown">Drop Down</SelectItem>
                                        <SelectItem value="Link">Link</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Field Name / Label</Label>
                                <Input value={field.label} onChange={(e) => updateField(phaseIndex, fieldIndex, { label: e.target.value })} />
                            </div>
                            {(field.type === 'RadioBox' || field.type === 'DropDown') && (
                                <div>
                                    <Label>Options (comma-separated)</Label>
                                    <Input value={field.options?.join(', ')} onChange={(e) => updateField(phaseIndex, fieldIndex, { options: e.target.value.split(',').map(s => s.trim()) })} />
                                </div>
                            )}
                                <div>
                                <Label>Help Text</Label>
                                <Input value={field.helpText} onChange={(e) => updateField(phaseIndex, fieldIndex, { helpText: e.target.value })} />
                            </div>
                            <div className="flex items-center space-x-2 pt-6">
                                <Checkbox 
                                    checked={field.proof}
                                    onCheckedChange={(checked) => updateField(phaseIndex, fieldIndex, { proof: !!checked })}
                                />
                                <Label>Requires Proof Link</Label>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => removeField(phaseIndex, fieldIndex)} className="ml-4">
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-6 pt-4">
             <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">Current Configuration - v{config.version}</h3>
            </div>
            
            <Accordion type="multiple" className="space-y-4">
                {config.phases.map((phase, phaseIndex) => (
                    <AccordionItem value={phase.id} key={phase.id} className="border rounded-md">
                        <AccordionTrigger className="p-4 hover:no-underline">
                             <div className="flex items-center gap-2 w-full">
                                <GripVertical className="h-5 w-5 text-muted-foreground" />
                                <span className="font-semibold text-lg">{phase.name}</span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="p-4 space-y-6">
                            <Card>
                                <CardContent className="p-4 space-y-4">
                                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <Label>Phase Name</Label>
                                            <Input value={phase.name} onChange={(e) => updatePhase(phaseIndex, { name: e.target.value })} />
                                        </div>
                                        <div>
                                            <Label>Owner Name</Label>
                                            <Input value={phase.ownerName} onChange={(e) => updatePhase(phaseIndex, { ownerName: e.target.value })} />
                                        </div>
                                        <div>
                                            <Label>Owner Email</Label>
                                            <Input type="email" value={phase.ownerEmail} onChange={(e) => updatePhase(phaseIndex, { ownerEmail: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox 
                                            checked={phase.sendEmailOnComplete}
                                            onCheckedChange={(checked) => updatePhase(phaseIndex, { sendEmailOnComplete: !!checked })}
                                        />
                                        <Label>Send email to Owners on Phase complete</Label>
                                    </div>
                                    <div>
                                         <Label>Status Options (comma-separated)</Label>
                                         <Input 
                                            value={phase.statusOptions.join(', ')} 
                                            onChange={(e) => updatePhase(phaseIndex, { statusOptions: e.target.value.split(',').map(s => s.trim()) })}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            <h4 className="font-semibold">Form Fields</h4>
                            <div className="space-y-4">
                                {phase.fields.map((field, fieldIndex) => (
                                    renderField(phase, field, phaseIndex, fieldIndex)
                                ))}
                            </div>
                            <Button variant="outline" size="sm" onClick={() => addFieldToPhase(phaseIndex)}>
                                <PlusCircle className="mr-2 h-4 w-4" /> Add Field
                            </Button>
                             <div className="text-right">
                                <Button variant="destructive" onClick={() => removePhase(phaseIndex)}>Remove Phase</Button>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
            <div className="flex justify-between items-center mt-6">
                <Button variant="outline" onClick={addPhase}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Phase
                </Button>
                <Button onClick={handleSaveClick} disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save as New Version (v{(config.version || 0) + 1})
                </Button>
            </div>
        </div>
    );
}
