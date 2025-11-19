
'use client';
import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import type { Specification } from '@/lib/definitions';
import { DiagramDisplay } from '@/app/specifications/_components/diagram-display';

interface Step1Props {
    data: any;
    onUpdate: (data: any) => void;
}

interface Hypervisor {
    _id: string;
    name: string;
}

export default function Step1Specification({ data, onUpdate }: Step1Props) {
    const [specifications, setSpecifications] = useState<Specification[]>([]);
    const [hypervisors, setHypervisors] = useState<Hypervisor[]>([]);
    const [loading, setLoading] = useState(true);

    const [needsHypervisor, setNeedsHypervisor] = useState(data.hypervisor !== undefined);

    useEffect(() => {
        async function loadSpecs() {
            try {
                const [specsRes, hypervisorsRes] = await Promise.all([
                    fetch('/api/specifications'),
                    fetch('/api/settings/specifications/hypervisors')
                ]);
                if (specsRes.ok) setSpecifications(await specsRes.json());
                if (hypervisorsRes.ok) setHypervisors(await hypervisorsRes.json());
            } catch (error) {
                console.error("Failed to load data for Step 1", error);
            } finally {
                setLoading(false);
            }
        }
        loadSpecs();
    }, []);

    const handleSpecChange = (specId: string) => {
        const selectedSpec = specifications.find(s => s._id === specId);
        if (selectedSpec) {
            onUpdate({ specification: selectedSpec });
            if(selectedSpec.hw_type?.name !== 'Blade') {
                setNeedsHypervisor(false);
                onUpdate({ hypervisor: undefined });
            }
        }
    };
    
    const handleHypervisorToggle = (checked: boolean) => {
        setNeedsHypervisor(checked);
        if (!checked) {
            onUpdate({ hypervisor: undefined });
        }
    }
    
    const handleHypervisorChange = (hypervisorId: string) => {
        const selectedHypervisor = hypervisors.find(h => h._id === hypervisorId);
        if(selectedHypervisor) {
            onUpdate({ hypervisor: selectedHypervisor });
        }
    }

    if (loading) {
        return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="spec-select">Select a Hardware Specification</Label>
                <Select onValueChange={handleSpecChange} defaultValue={data.specification?._id}>
                    <SelectTrigger id="spec-select"><SelectValue placeholder="Choose a specification..." /></SelectTrigger>
                    <SelectContent>
                        {specifications.map(s => (
                            <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {data.specification && (
                <div className="space-y-4">
                    <div className="h-64 border rounded-md">
                        <DiagramDisplay specJson={JSON.stringify(data.specification, null, 2)} />
                    </div>
                    {data.specification.hw_type?.name === 'Blade' && (
                        <div className="flex items-center space-x-2 pt-4">
                            <Switch id="needs-hypervisor" checked={needsHypervisor} onCheckedChange={handleHypervisorToggle} />
                            <Label htmlFor="needs-hypervisor">A Hypervisor is needed</Label>
                        </div>
                    )}
                    {needsHypervisor && data.specification.hw_type?.name === 'Blade' && (
                         <div className="space-y-2">
                            <Label htmlFor="hypervisor-select">Select a Hypervisor</Label>
                             <Select onValueChange={handleHypervisorChange} defaultValue={data.hypervisor?._id}>
                                <SelectTrigger id="hypervisor-select"><SelectValue placeholder="Choose a hypervisor..." /></SelectTrigger>
                                <SelectContent>
                                    {hypervisors.map(h => (
                                        <SelectItem key={h._id} value={h._id}>{h.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                     {data.specification.hw_type?.name !== 'Blade' && data.specification.hw_type?.name !== 'Virtual' && (
                         <p className="text-sm text-muted-foreground pt-4">A hypervisor can be installed, but this will be implemented in a future step.</p>
                     )}
                </div>
            )}
        </div>
    );
}
