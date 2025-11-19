
'use client';
import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, AlertTriangle } from 'lucide-react';
import type { VirtualNode } from '@/lib/definitions';
import { MultiSelectListBox } from '@/components/ui/multi-select-list-box';

interface Step3Props {
    data: any;
    onUpdate: (data: any) => void;
}

const KUBERNETES_REQUIREMENTS = {
    cpu: 2,
    memory: 4, // 8GB for control plane
    disk: 20
};

export default function Step3Kubernetes({ data, onUpdate }: Step3Props) {
    const k8sData = data.kubernetes || {};
    const vms: VirtualNode[] = data.virtual_machines || [];
    
    const [verificationResult, setVerificationResult] = useState({
        meetsRequirements: false,
        issues: [] as string[]
    });

    useEffect(() => {
        if (vms.length > 0) {
            const issues: string[] = [];
            let meetsRequirements = true;
            
            vms.forEach(vm => {
                if (vm.cpuCores < KUBERNETES_REQUIREMENTS.cpu) {
                    issues.push(`${vm.vmName}: Needs at least ${KUBERNETES_REQUIREMENTS.cpu} CPU cores (has ${vm.cpuCores}).`);
                    meetsRequirements = false;
                }
                 if (vm.memory < KUBERNETES_REQUIREMENTS.memory) {
                    issues.push(`${vm.vmName}: Needs at least ${KUBERNETES_REQUIREMENTS.memory}GB Memory (has ${vm.memory}).`);
                    meetsRequirements = false;
                }
                 if (vm.diskSize < KUBERNETES_REQUIREMENTS.disk) {
                    issues.push(`${vm.vmName}: Needs at least ${KUBERNETES_REQUIREMENTS.disk}GB Disk (has ${vm.diskSize}).`);
                    meetsRequirements = false;
                }
            });
            setVerificationResult({ meetsRequirements, issues });
        }
    }, [vms]);

    const handleUpdate = (field: string, value: any) => {
        onUpdate({ kubernetes: { ...k8sData, [field]: value } });
    };
    
    const controlPlaneCandidates = vms.filter(vm => vm.role === 'Control Plane').map(vm => ({ id: vm.vmName, label: vm.vmName }));
    const workerCandidates = vms.filter(vm => vm.role === 'Worker').map(vm => ({ id: vm.vmName, label: vm.vmName }));
    
    const assignedControlPlaneIds = new Set((k8sData.controlPlaneNodes || []).map((n: any) => n.id));
    const availableControlPlane = controlPlaneCandidates.filter(vm => !assignedControlPlaneIds.has(vm.id));

    const assignedWorkerIds = new Set((k8sData.workerNodes || []).map((n: any) => n.id));
    const availableWorkers = workerCandidates.filter(vm => !assignedWorkerIds.has(vm.id));

    return (
        <div className="space-y-6">
            <div>
                {verificationResult.meetsRequirements ? (
                    <Alert variant="default" className="bg-green-50 border-green-200 dark:bg-green-900/20">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertTitle>Requirements Met</AlertTitle>
                        <AlertDescription>The selected VMs meet the minimum requirements for Kubernetes installation.</AlertDescription>
                    </Alert>
                ) : (
                     <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Requirements Not Met</AlertTitle>
                        <AlertDescription>
                            <ul className="list-disc pl-5">
                                {verificationResult.issues.map((issue, i) => <li key={i}>{issue}</li>)}
                            </ul>
                        </AlertDescription>
                    </Alert>
                )}
            </div>

            <div className="space-y-2">
                <Label>Kubernetes Distribution</Label>
                <Select onValueChange={(v) => handleUpdate('distribution', v)} defaultValue={k8sData.distribution}>
                    <SelectTrigger><SelectValue placeholder="Select a distribution..." /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="rke2">RKE2</SelectItem>
                        <SelectItem value="k3s">K3S</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            
             <div className="space-y-4">
                <h3 className="font-semibold">Node Role Assignment</h3>
                 <div className="space-y-2">
                    <Label>Control Plane Nodes</Label>
                    <MultiSelectListBox
                        available={availableControlPlane}
                        chosen={k8sData.controlPlaneNodes || []}
                        onMoveToChosen={(ids) => handleUpdate('controlPlaneNodes', [...(k8sData.controlPlaneNodes || []), ...availableControlPlane.filter(c => ids.includes(c.id))])}
                        onMoveToAvailable={(ids) => handleUpdate('controlPlaneNodes', (k8sData.controlPlaneNodes || []).filter((c: any) => !ids.includes(c.id)))}
                        onMoveAllToChosen={() => handleUpdate('controlPlaneNodes', controlPlaneCandidates)}
                        onMoveAllToAvailable={() => handleUpdate('controlPlaneNodes', [])}
                     />
                 </div>
                  <div className="space-y-2">
                    <Label>Worker Nodes</Label>
                     <MultiSelectListBox
                        available={availableWorkers}
                        chosen={k8sData.workerNodes || []}
                        onMoveToChosen={(ids) => handleUpdate('workerNodes', [...(k8sData.workerNodes || []), ...availableWorkers.filter(c => ids.includes(c.id))])}
                        onMoveToAvailable={(ids) => handleUpdate('workerNodes', (k8sData.workerNodes || []).filter((c: any) => !ids.includes(c.id)))}
                        onMoveAllToChosen={() => handleUpdate('workerNodes', workerCandidates)}
                        onMoveAllToAvailable={() => handleUpdate('workerNodes', [])}
                     />
                 </div>
            </div>

            <div className="space-y-4">
                <h3 className="font-semibold">Networking</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><Label>Cluster CIDR</Label><Input value={k8sData.clusterCidr || '10.42.0.0/16'} onChange={(e) => handleUpdate('clusterCidr', e.target.value)} /></div>
                    <div><Label>Service CIDR</Label><Input value={k8sData.serviceCidr || '10.43.0.0/16'} onChange={(e) => handleUpdate('serviceCidr', e.target.value)} /></div>
                </div>
                 <div><Label>Cluster DNS Domain</Label><Input value={k8sData.dnsDomain || 'cluster.local'} onChange={(e) => handleUpdate('dnsDomain', e.target.value)} /></div>
                <div>
                     <Label>CNI Plugin</Label>
                     <Select onValueChange={(v) => handleUpdate('cniPlugin', v)} defaultValue={k8sData.cniPlugin || 'canal'}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="canal">Canal (Flannel + Calico)</SelectItem>
                            <SelectItem value="calico">Calico</SelectItem>
                            <SelectItem value="cilium">Cilium</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            
            <div className="space-y-4">
                <h3 className="font-semibold">Security</h3>
                <div className="flex items-center space-x-2">
                    <Switch id="custom-certs" checked={k8sData.useCustomCerts} onCheckedChange={(c) => handleUpdate('useCustomCerts', c)} />
                    <Label htmlFor="custom-certs">Use Custom TLS Certificates</Label>
                </div>
            </div>
        </div>
    );
}
