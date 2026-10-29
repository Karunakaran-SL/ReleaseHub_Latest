import { NextRequest, NextResponse } from 'next/server';
import https from 'https';

function parseQuantity(q: string): number {
    if (!q) return 0;
    if (q.endsWith('m')) return parseInt(q) / 1000;
    if (q.endsWith('Ki')) return parseInt(q) / (1024 * 1024);
    if (q.endsWith('Mi')) return parseInt(q) / 1024;
    if (q.endsWith('Gi')) return parseInt(q);
    if (q.endsWith('Ti')) return parseInt(q) * 1024;
    return parseInt(q); // raw bytes or cores if no suffix
}

function fetchK8sApi(apiUrl: string, token: string, endpoint: string): Promise<any> {
    return new Promise((resolve, reject) => {
        let url;
        try {
            const base = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
            url = new URL(`${base}${endpoint}`);
        } catch (err) {
            return reject(new Error("Invalid API URL provided."));
        }

        const options = {
            hostname: url.hostname,
            port: url.port || (url.protocol === 'https:' ? 443 : 80),
            path: url.pathname + url.search,
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            },
            rejectUnauthorized: false // Bypass self-signed certs for local/internal clusters
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
                    try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
                } else {
                    reject(new Error(`K8s API failed at ${endpoint} with status ${res.statusCode}.`));
                }
            });
        });

        req.on('error', (e) => reject(new Error(`Network error connecting to cluster: ${e.message}`)));
        req.end();
    });
}

export async function POST(request: NextRequest) {
    try {
        const { apiUrl, token } = await request.json();

        if (!apiUrl || !token) {
            return NextResponse.json({ message: "API URL and Token are required to connect." }, { status: 400 });
        }

        // Parallel Fetch for Nodes, Namespaces, Deployments, StatefulSets, DaemonSets
        const [nodesData, namespacesData, deploymentsData, statefulsetsData, daemonsetsData] = await Promise.all([
            fetchK8sApi(apiUrl, token, '/api/v1/nodes').catch(() => ({ items: [] })),
            fetchK8sApi(apiUrl, token, '/api/v1/namespaces').catch(() => ({ items: [] })),
            fetchK8sApi(apiUrl, token, '/apis/apps/v1/deployments').catch(() => ({ items: [] })),
            fetchK8sApi(apiUrl, token, '/apis/apps/v1/statefulsets').catch(() => ({ items: [] })),
            fetchK8sApi(apiUrl, token, '/apis/apps/v1/daemonsets').catch(() => ({ items: [] })),
        ]);

        if (!nodesData.items || nodesData.items.length === 0) {
            return NextResponse.json({ message: "No nodes found in the cluster. Check credentials." }, { status: 404 });
        }

        // Summarize Nodes
        let totalCores = 0;
        let totalMemGb = 0;
        let totalDiskGb = 0;
        let containerEngine = 'containerd';
        let kubernetesVersion = '';

        nodesData.items.forEach((node: any) => {
            const capacity = node.status?.capacity || {};
            const nodeInfo = node.status?.nodeInfo || {};

            totalCores += parseQuantity(capacity.cpu || '0');
            totalMemGb += parseQuantity(capacity.memory || '0');
            totalDiskGb += parseQuantity(capacity['ephemeral-storage'] || '0');

            if (!kubernetesVersion) {
                kubernetesVersion = nodeInfo.kubeletVersion || '';
                const runtime = (nodeInfo.containerRuntimeVersion || '').toLowerCase();
                if (runtime.includes('docker') || runtime.includes('moby')) {
                    containerEngine = 'dockerd';
                }
            }
        });

        // Summarize Namespaces
        const namespaces = (namespacesData.items || []).map((ns: any) => ns.metadata.name);

        // Summarize Workloads
        const workloads: any[] = [];

        (deploymentsData.items || []).forEach((d: any) => {
            workloads.push({
                type: 'Deployment',
                name: d.metadata.name,
                namespace: d.metadata.namespace,
                readyReplicas: d.status?.readyReplicas || 0
            });
        });

        (statefulsetsData.items || []).forEach((s: any) => {
            workloads.push({
                type: 'StatefulSet',
                name: s.metadata.name,
                namespace: s.metadata.namespace,
                readyReplicas: s.status?.readyReplicas || 0
            });
        });

        (daemonsetsData.items || []).forEach((ds: any) => {
            workloads.push({
                type: 'DaemonSet',
                name: ds.metadata.name,
                namespace: ds.metadata.namespace,
                readyReplicas: ds.status?.numberReady || 0
            });
        });

        return NextResponse.json({
            cpuCores: Math.round(totalCores) || 1,
            memoryGb: Math.round(totalMemGb) || 1,
            diskSizeGb: Math.round(totalDiskGb) || 10,
            containerEngine,
            kubernetesVersion,
            namespaces,
            workloads
        });

    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
