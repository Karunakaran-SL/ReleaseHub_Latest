'use client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ARGO_YAML = `apiVersion: apps/v1
kind: Deployment
metadata:
  name: argocd
  namespace: platform-foundation
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
  namespace: platform-foundation
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

const NS_YAML = `apiVersion: v1
kind: Namespace
metadata:
  name: platform-foundation`;

export function DeploymentManifests() {
    return (
        <Card className="mt-6">
            <CardHeader>
                <CardTitle className="text-lg">Deployment Manifests (Preview)</CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="namespace" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="namespace">Namespace</TabsTrigger>
                        <TabsTrigger value="argocd">ArgoCD</TabsTrigger>
                        <TabsTrigger value="harbor">Harbor</TabsTrigger>
                    </TabsList>
                    <TabsContent value="namespace">
                        <pre className="bg-muted p-4 rounded-md text-xs font-mono overflow-x-auto whitespace-pre">
                            {NS_YAML}
                        </pre>
                    </TabsContent>
                    <TabsContent value="argocd">
                        <pre className="bg-muted p-4 rounded-md text-xs font-mono overflow-x-auto whitespace-pre">
                            {ARGO_YAML}
                        </pre>
                    </TabsContent>
                    <TabsContent value="harbor">
                        <pre className="bg-muted p-4 rounded-md text-xs font-mono overflow-x-auto whitespace-pre">
                            {HARBOR_YAML}
                        </pre>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
