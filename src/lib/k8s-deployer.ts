import https from 'https';

export interface K8sConfig {
    apiUrl: string;
    token: string;
}

export interface K8sResource {
    apiVersion: string;
    kind: string;
    metadata: {
        name: string;
        namespace?: string;
        labels?: Record<string, string>;
    };
    spec: any;
}

const COMPONENT_IMAGE_MAP: Record<string, string> = {
    'ArgoCD': 'quay.io/argoproj/argocd:v2.10.4',
    'Harbor': 'goharbor/harbor-core:v2.10.0',
    'Container Registry (Harbor)': 'goharbor/harbor-core:v2.10.0',
    'GitOps Server': 'quay.io/argoproj/argocd:v2.10.4',
    'Observability Stack': 'prom/prometheus:v2.45.0',
    'Security Stack': 'aquasec/trivy:0.41.0'
};

function sanitizeK8sName(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

export interface ExecutionLog {
    command: string;
    status: 'Success' | 'Exists' | 'Failed';
    message: string;
    timestamp: string;
}

async function callK8sApi(config: K8sConfig, method: 'GET' | 'POST' | 'PUT' | 'DELETE', endpoint: string, body?: any): Promise<{ status: number, data?: any, message?: string }> {
    return new Promise((resolve, reject) => {
        let url: URL;
        try {
            const base = config.apiUrl.endsWith('/') ? config.apiUrl.slice(0, -1) : config.apiUrl;
            url = new URL(`${base}${endpoint}`);
        } catch (err) {
            return reject(new Error("Invalid Kubernetes API URL."));
        }

        const options: https.RequestOptions = {
            hostname: url.hostname,
            port: url.port || (url.protocol === 'https:' ? 443 : 80),
            path: url.pathname + url.search,
            method,
            headers: {
                'Authorization': `Bearer ${config.token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            rejectUnauthorized: false
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                const responseData = data ? JSON.parse(data) : null;
                if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
                    resolve({ status: res.statusCode, data: responseData });
                } else if (res.statusCode === 409) {
                    resolve({ status: 409, message: 'Resource already exists' });
                } else {
                    reject(new Error(`K8s API ${method} failed at ${endpoint} with status ${res.statusCode}: ${data}`));
                }
            });
        });

        req.on('error', (e) => reject(new Error(`Network error: ${e.message}`)));
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

export async function createNamespace(config: K8sConfig, name: string): Promise<ExecutionLog> {
    const nsName = sanitizeK8sName(name);
    const command = `kubectl create namespace ${nsName}`;
    try {
        const result = await callK8sApi(config, 'POST', '/api/v1/namespaces', {
            apiVersion: 'v1',
            kind: 'Namespace',
            metadata: { name: nsName }
        });
        return {
            command,
            status: result.status === 409 ? 'Exists' : 'Success',
            message: result.status === 409 ? `Namespace "${nsName}" already exists.` : `Namespace "${nsName}" created successfully.`,
            timestamp: new Date().toISOString()
        };
    } catch (err: any) {
        return {
            command,
            status: 'Failed',
            message: err.message,
            timestamp: new Date().toISOString()
        };
    }
}

export async function createDeployment(config: K8sConfig, namespace: string, name: string, image: string, replicas: number = 1): Promise<ExecutionLog> {
    const deployName = sanitizeK8sName(name);
    const nsName = sanitizeK8sName(namespace);
    const command = `kubectl apply -f ${deployName}.yaml -n ${nsName}`;
    try {
        const result = await callK8sApi(config, 'POST', `/apis/apps/v1/namespaces/${nsName}/deployments`, {
            apiVersion: 'apps/v1',
            kind: 'Deployment',
            metadata: { name: deployName, namespace: nsName },
            spec: {
                replicas,
                selector: { matchLabels: { app: deployName } },
                template: {
                    metadata: { labels: { app: deployName } },
                    spec: {
                        containers: [{
                            name: deployName,
                            image,
                            ports: [{ containerPort: 80 }]
                        }]
                    }
                }
            }
        });
        return {
            command,
            status: result.status === 409 ? 'Exists' : 'Success',
            message: result.status === 409 ? `Deployment "${deployName}" already exists in namespace "${nsName}".` : `Deployment "${deployName}" created in namespace "${nsName}".`,
            timestamp: new Date().toISOString()
        };
    } catch (err: any) {
        return {
            command,
            status: 'Failed',
            message: err.message,
            timestamp: new Date().toISOString()
        };
    }
}

export async function deployPlatformComponents(config: K8sConfig, namespace: string, components: any[]): Promise<ExecutionLog[]> {
    const logs: ExecutionLog[] = [];
    const nsName = sanitizeK8sName(namespace);

    // 1. Create Namespace
    logs.push(await createNamespace(config, nsName));

    // 2. Deploy each component
    for (const comp of components) {
        const componentName = comp.name || 'unknown';
        const image = comp.image || COMPONENT_IMAGE_MAP[componentName] || `releasehub/${sanitizeK8sName(componentName)}:latest`;
        logs.push(await createDeployment(config, nsName, componentName, image));
    }
    return logs;
}

export async function deployTenantComponents(config: K8sConfig, envName: string, tenant: any): Promise<ExecutionLog[]> {
    const logs: ExecutionLog[] = [];
    const sanitizedEnv = sanitizeK8sName(envName);
    const sanitizedTenant = sanitizeK8sName(tenant.id || tenant.name);
    const nsName = `${sanitizedEnv}-${sanitizedTenant}`;

    // 1. Create Tenant Namespace
    logs.push(await createNamespace(config, nsName));

    // 2. Deploy Applications/Components for this tenant
    const apps = tenant.applications || [];
    const comps = tenant.components || [];

    for (const app of apps) {
        logs.push(await createDeployment(config, nsName, app.name, app.image || `releasehub/${sanitizeK8sName(app.name)}:latest`));
    }
    for (const comp of comps) {
        logs.push(await createDeployment(config, nsName, comp.name, comp.image || `releasehub/${sanitizeK8sName(comp.name)}:latest`));
    }

    return logs;
}

