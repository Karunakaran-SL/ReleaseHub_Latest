'use client';
import { useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, Package, FileCode } from "lucide-react";
import { DeploymentManifests } from "./deployment-manifests";

interface Step4Props {
    data: any;
    onUpdate: (data: any) => void;
}

const COMPONENT_NAMES = [
    "GitOps Client",
    "GitOps Server",
    "Git Repo",
    "Container Registry (Harbor)",
    "Helm Registry",
    "ArgoCD",
    "Artifact Loader",
    "Spider Test Runner",
    "Report Generator",
    "Observability Stack",
    "Security Stack"
];

const getRandomVersion = () => `v${Math.floor(Math.random() * 5) + 1}.${Math.floor(Math.random() * 20)}.${Math.floor(Math.random() * 10)}`;
const getRandomResource = (min: number, max: number, unit: string) => `${Math.floor(Math.random() * (max - min + 1) + min)}${unit}`;

const generateComponents = () => COMPONENT_NAMES.map(name => ({
    name,
    version: getRandomVersion(),
    cpu: getRandomResource(100, 1000, 'm'),
    memory: getRandomResource(128, 1024, 'Mi'),
    disk: getRandomResource(1, 10, 'Gi')
}));

export default function Step4Summary({ data, onUpdate }: Step4Props) {
    useEffect(() => {
        const currentComps = data.kubernetes?.platformComponents;
        // Generate if missing or if it's the old string format
        if (!currentComps || (Array.isArray(currentComps) && typeof currentComps[0] === 'string')) {
            const platformVersion = `v2024.${Math.floor(Math.random() * 12) + 1}.${Math.floor(Math.random() * 28) + 1}`;
            onUpdate({
                kubernetes: {
                    ...data.kubernetes,
                    platformVersion,
                    platformComponents: generateComponents()
                }
            });
        }
    }, [data.kubernetes, onUpdate]);

    return (
        <div className="space-y-6">
            <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Review and Confirm</AlertTitle>
                <AlertDescription>
                    Please review the final platform foundation configuration below. Once you save, a deployable package will be prepared.
                </AlertDescription>
            </Alert>
            <div className="p-4 bg-muted rounded-lg text-left">
                <p className="font-semibold flex items-center gap-2"><Package /> Package Summary</p>
                <ul className="list-disc pl-5 mt-2 text-sm text-muted-foreground">
                    <li>Hardware Spec: <strong>{data.specification?.name || 'N/A'}</strong></li>
                    {data.hypervisor && <li>Hypervisor: <strong>{data.hypervisor.name}</strong></li>}
                    {data.specification?.clusterType === 'Managed Kubernetes' ? (
                        <li>Nodes: <strong>Managed via API</strong> (Synced from {data.specification.name})</li>
                    ) : (
                        <li>VMs: <strong>{data.virtual_machines?.length || 0} nodes</strong> ({data.kubernetes?.controlPlaneNodes?.length || 0} control, {data.kubernetes?.workerNodes?.length || 0} worker)</li>
                    )}
                    <li>Kubernetes: <strong>{data.specification?.clusterType === 'Managed Kubernetes' ? 'Managed Sync' : (data.kubernetes?.distribution || 'N/A')}</strong></li>
                    <li>CNI: <strong>{data.kubernetes?.cniPlugin || 'N/A'}</strong></li>
                </ul>
            </div>

            {data.specification?.clusterType === 'Managed Kubernetes' && (
                <DeploymentManifests />
            )}

            <div className="space-y-2">
                <p className="text-sm text-muted-foreground">For air-gapped environments, you will need to pre-download required container images and binaries.</p>
                <p className="text-sm font-mono bg-background p-2 rounded">Local Registry: to be configured</p>
            </div>
        </div>
    );
}
