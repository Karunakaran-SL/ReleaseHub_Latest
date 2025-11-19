
'use client';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, Package } from "lucide-react";

interface Step4Props {
    data: any;
}

export default function Step4Summary({ data }: Step4Props) {
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
                    <li>VMs: <strong>{data.virtual_machines?.length || 0} nodes</strong> ({data.kubernetes?.controlPlaneNodes?.length || 0} control, {data.kubernetes?.workerNodes?.length || 0} worker)</li>
                    <li>Kubernetes: <strong>{data.kubernetes?.distribution || 'N/A'}</strong></li>
                    <li>CNI: <strong>{data.kubernetes?.cniPlugin || 'N/A'}</strong></li>
                </ul>
            </div>
            <div className="space-y-2">
                <p className="text-sm text-muted-foreground">For air-gapped environments, you will need to pre-download required container images and binaries.</p>
                <p className="text-sm font-mono bg-background p-2 rounded">Local Registry: to be configured</p>
            </div>
        </div>
    );
}
