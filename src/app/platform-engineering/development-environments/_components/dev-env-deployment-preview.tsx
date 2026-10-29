'use client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Terminal } from "lucide-react";

interface DevEnvDeploymentPreviewProps {
    envName: string;
    tenants?: { id: string, name: string }[];
}

export function DevEnvDeploymentPreview({ envName, tenants = [] }: DevEnvDeploymentPreviewProps) {
    const sanitizedName = envName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const foundationNamespace = `${sanitizedName}-platform-foundation`;

    const ARGO_YAML = `apiVersion: apps/v1
kind: Deployment
metadata:
  name: argocd
  namespace: ${foundationNamespace}
spec:
  replicas: 1
  selector:
    matchLabels:
      app: argocd
  template:
    metadata:
      labels:
        app: argocd
    spec:
      containers:
      - name: argocd
        image: quay.io/argoproj/argocd:v2.10.4
        ports:
        - containerPort: 80`;

    const HARBOR_YAML = `apiVersion: apps/v1
kind: Deployment
metadata:
  name: harbor
  namespace: ${foundationNamespace}
spec:
  replicas: 1
  selector:
    matchLabels:
      app: harbor
  template:
    metadata:
      labels:
        app: harbor
    spec:
      containers:
      - name: harbor
        image: goharbor/harbor-core:v2.10.0
        ports:
        - containerPort: 80`;

    let shellCommands = `# 1. Create Foundation Namespace
kubectl create namespace ${foundationNamespace}

# 2. Deploy platform foundation components
kubectl apply -f argocd-deployment.yaml -n ${foundationNamespace}
kubectl apply -f harbor-deployment.yaml -n ${foundationNamespace}

# 3. Provision Tenant Namespaces`;

    if (tenants.length > 0) {
        tenants.forEach((tenant, idx) => {
            const tenantNs = `${sanitizedName}-${tenant.id.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
            shellCommands += `\n# Tenant: ${tenant.name}
kubectl create namespace ${tenantNs}
kubectl apply -f components.yaml -n ${tenantNs}`;
        });
    } else {
        shellCommands += `\n# No tenants selected in baseline.`;
    }

    shellCommands += `\n\n# 4. Verify status
kubectl get all -A | grep ${sanitizedName}`;

    return (
        <Card className="mt-6 border-primary/20 bg-primary/5">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                    <Terminal className="h-5 w-5" /> Orchestration Review
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="commands" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                        <TabsTrigger value="commands">Shell Commands</TabsTrigger>
                        <TabsTrigger value="manifests">YAML Manifests</TabsTrigger>
                    </TabsList>

                    <TabsContent value="commands">
                        <div className="bg-zinc-950 p-4 rounded-md overflow-x-auto">
                            <pre className="text-zinc-300 text-xs font-mono whitespace-pre leading-relaxed">
                                {shellCommands}
                            </pre>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-2 italic">
                            * These commands will be executed automatically via the K8s API during provisioning.
                        </p>
                    </TabsContent>

                    <TabsContent value="manifests">
                        <div className="space-y-4">
                            <div>
                                <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1 ml-1">ArgoCD (Foundation)</p>
                                <pre className="bg-muted p-3 rounded-md text-[10px] font-mono overflow-x-auto whitespace-pre">
                                    {ARGO_YAML}
                                </pre>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1 ml-1">Harbor (Foundation)</p>
                                <pre className="bg-muted p-3 rounded-md text-[10px] font-mono overflow-x-auto whitespace-pre">
                                    {HARBOR_YAML}
                                </pre>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
