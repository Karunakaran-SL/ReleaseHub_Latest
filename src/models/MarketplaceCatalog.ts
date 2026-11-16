import { type VendorMeta, type VendorType } from './Specification';

export interface MarketplaceCatalogSpec {
  specId: string;
  name: string;
  version: string;
  description: string;
  tags: string[];
  sourceType: 'MARKETPLACE';
  vendorMeta: VendorMeta & { vendorType: VendorType };
  target: string;
  steps: string[];
  vendor: string;
  hw_type: { id: string; name: string };
  total_cpu?: number;
  memory_gb?: number;
  storage_gb?: number;
  clusterType?: 'Standard' | 'Managed Kubernetes';
  clusterName?: string;
  nodeCount?: { controlPlane: number; worker: number };
  blades?: Record<string, any>[];
  bladeCount?: number;
  symmetric?: boolean;
  specDefinition: {
    target: string;
    steps: string[];
    [key: string]: any;
  };
}

export const CURATED_MARKETPLACE_CATALOG: MarketplaceCatalogSpec[] = [
  {
    specId: 'aws-eks-v1',
    name: 'AWS EKS Production Spec',
    version: '1.29.0',
    description:
      'Production-hardened Amazon EKS managed Kubernetes blueprint with multi-AZ node groups, VPC CNI, and Karpenter autoscaling.',
    tags: ['AWS', 'Kubernetes', 'Cloud'],
    sourceType: 'MARKETPLACE',
    vendor: 'Amazon Web Services',
    hw_type: { id: 'Virtual', name: 'Virtual' },
    clusterType: 'Managed Kubernetes',
    clusterName: 'aws-eks-prod-cluster',
    nodeCount: { controlPlane: 3, worker: 6 },
    total_cpu: 48,
    memory_gb: 192,
    storage_gb: 2000,
    vendorMeta: {
      publisherName: 'Amazon Web Services',
      vendorType: 'CLOUD',
      verified: true,
      marketplaceSpecId: 'aws-eks-v1',
    },
    target: 'aws-eks',
    steps: [
      'validate-iam-roles',
      'provision-vpc-subnets',
      'deploy-eks-control-plane',
      'attach-managed-node-groups',
      'verify-cluster-addons',
    ],
    specDefinition: {
      target: 'aws-eks',
      steps: [
        'validate-iam-roles',
        'provision-vpc-subnets',
        'deploy-eks-control-plane',
        'attach-managed-node-groups',
        'verify-cluster-addons',
      ],
      region: 'us-east-1',
      kubernetesVersion: '1.29',
    },
  },
  {
    specId: 'azure-aks-enterprise-v1',
    name: 'Azure AKS Enterprise Landing Zone',
    version: '1.28.4',
    description:
      'Microsoft Azure AKS enterprise cluster with Azure CNI Overlay, Entra ID workload identity, and Key Vault CSI driver.',
    tags: ['Azure', 'Kubernetes', 'Cloud'],
    sourceType: 'MARKETPLACE',
    vendor: 'Microsoft Azure',
    hw_type: { id: 'Virtual', name: 'Virtual' },
    clusterType: 'Managed Kubernetes',
    clusterName: 'aks-enterprise-cluster',
    nodeCount: { controlPlane: 3, worker: 5 },
    total_cpu: 40,
    memory_gb: 160,
    storage_gb: 1500,
    vendorMeta: {
      publisherName: 'Microsoft Azure',
      vendorType: 'CLOUD',
      verified: true,
      marketplaceSpecId: 'azure-aks-enterprise-v1',
    },
    target: 'azure-aks',
    steps: [
      'provision-resource-group',
      'configure-vnet-peering',
      'deploy-aks-cluster',
      'enable-workload-identity',
      'run-conformance-checks',
    ],
    specDefinition: {
      target: 'azure-aks',
      steps: [
        'provision-resource-group',
        'configure-vnet-peering',
        'deploy-aks-cluster',
        'enable-workload-identity',
        'run-conformance-checks',
      ],
      tier: 'Standard',
    },
  },
  {
    specId: 'dell-poweredge-r760-oem',
    name: 'Dell PowerEdge R760 High-Density Rack',
    version: '2.1.0',
    description:
      'OEM-certified Dell EMC PowerEdge R760 2U rack server blueprint with Dual Intel Xeon Scalable CPUs, iDRAC9 Enterprise, and RAID 5 NVMe.',
    tags: ['Dell', 'OEM', 'Hardware'],
    sourceType: 'MARKETPLACE',
    vendor: 'Dell EMC',
    hw_type: { id: 'Rack', name: 'Rack' },
    total_cpu: 64,
    memory_gb: 512,
    storage_gb: 8192,
    vendorMeta: {
      publisherName: 'Dell Technologies',
      vendorType: 'OEM',
      verified: true,
      marketplaceSpecId: 'dell-poweredge-r760-oem',
    },
    target: 'rack',
    steps: [
      'verify-idrac9-firmware',
      'configure-bios-performance-profile',
      'initialize-perc-raid5',
      'provision-esxi-hypervisor',
    ],
    specDefinition: {
      target: 'rack',
      steps: [
        'verify-idrac9-firmware',
        'configure-bios-performance-profile',
        'initialize-perc-raid5',
        'provision-esxi-hypervisor',
      ],
      biosVersion: '2.10.1',
      raidConfiguration: 'RAID 1 (OS), RAID 5 (Data)',
    },
  },
  {
    specId: 'nvidia-dgx-h100-ai-pod',
    name: 'NVIDIA DGX H100 AI Training Node',
    version: '1.4.0',
    description:
      'High-performance GPU hardware specification with 8x NVIDIA H100 Tensor Core GPUs, NVLink Switch System, and 400GbE InfiniBand.',
    tags: ['Nvidia', 'Hardware', 'Kubernetes'],
    sourceType: 'MARKETPLACE',
    vendor: 'NVIDIA',
    hw_type: { id: 'Blade', name: 'Blade' },
    symmetric: true,
    bladeCount: 4,
    total_cpu: 112,
    memory_gb: 2048,
    storage_gb: 30720,
    blades: [
      {
        name: 'DGX-H100-Blade-1',
        cpuType: 'Intel Xeon Platinum 8480C',
        cpuCores: 112,
        memory: 2048,
        diskType: 'SSD_NVMe_U2_PCIeGen4',
        diskCapacity: 7680,
        hasGpu: true,
        gpuType: 'NVIDIA H100',
        gpuCores: 8,
      },
    ],
    vendorMeta: {
      publisherName: 'NVIDIA Corporation',
      vendorType: 'HARDWARE',
      verified: true,
      marketplaceSpecId: 'nvidia-dgx-h100-ai-pod',
    },
    target: 'gpu-cluster',
    steps: [
      'validate-nvlink-fabric',
      'configure-infiniband-rdma',
      'install-nvidia-gpu-operator',
      'run-nccl-allreduce-benchmark',
    ],
    specDefinition: {
      target: 'gpu-cluster',
      steps: [
        'validate-nvlink-fabric',
        'configure-infiniband-rdma',
        'install-nvidia-gpu-operator',
        'run-nccl-allreduce-benchmark',
      ],
      gpuCount: 8,
      gpuModel: 'NVIDIA H100 80GB',
    },
  },
  {
    specId: 'hpe-proliant-dl380-gen11-oem',
    name: 'HPE ProLiant DL380 Gen11 Telco Edge',
    version: '1.1.0',
    description:
      'OEM-validated Hewlett Packard Enterprise DL380 Gen11 server blueprint with iLO 6 security and Redfish automation.',
    tags: ['HPE', 'OEM', 'Hardware'],
    sourceType: 'MARKETPLACE',
    vendor: 'HPE',
    hw_type: { id: 'Rack', name: 'Rack' },
    total_cpu: 48,
    memory_gb: 256,
    storage_gb: 4096,
    vendorMeta: {
      publisherName: 'Hewlett Packard Enterprise',
      vendorType: 'OEM',
      verified: true,
      marketplaceSpecId: 'hpe-proliant-dl380-gen11-oem',
    },
    target: 'rack',
    steps: [
      'verify-ilo6-silicon-root-of-trust',
      'apply-redfish-bios-baseline',
      'configure-smart-array-raid6',
      'enroll-fleet-management',
    ],
    specDefinition: {
      target: 'rack',
      steps: [
        'verify-ilo6-silicon-root-of-trust',
        'apply-redfish-bios-baseline',
        'configure-smart-array-raid6',
        'enroll-fleet-management',
      ],
    },
  },
  {
    specId: 'upstream-k8s-ha-v1',
    name: 'CNCF Upstream Kubernetes HA Cluster',
    version: '1.30.0',
    description:
      'Cloud-native high-availability Kubernetes cluster blueprint with stacked etcd, Cilium eBPF CNI, and kube-vip control plane load balancing.',
    tags: ['Kubernetes', 'Cloud'],
    sourceType: 'MARKETPLACE',
    vendor: 'CNCF',
    hw_type: { id: 'Virtual', name: 'Virtual' },
    clusterType: 'Standard',
    clusterName: 'cncf-ha-k8s',
    nodeCount: { controlPlane: 3, worker: 5 },
    total_cpu: 64,
    memory_gb: 256,
    storage_gb: 2000,
    vendorMeta: {
      publisherName: 'Cloud Native Computing Foundation',
      vendorType: 'CLOUD',
      verified: true,
      marketplaceSpecId: 'upstream-k8s-ha-v1',
    },
    target: 'kubernetes',
    steps: [
      'bootstrap-kube-vip',
      'init-control-plane-quorum',
      'install-cilium-ebpf-cni',
      'join-worker-nodes',
      'run-sonobuoy-conformance',
    ],
    specDefinition: {
      target: 'kubernetes',
      steps: [
        'bootstrap-kube-vip',
        'init-control-plane-quorum',
        'install-cilium-ebpf-cni',
        'join-worker-nodes',
        'run-sonobuoy-conformance',
      ],
    },
  },
];

export function filterMarketplaceCatalog(options?: {
  vendorType?: string | null;
  tag?: string | null;
  search?: string | null;
}): MarketplaceCatalogSpec[] {
  const vendorType = options?.vendorType?.trim().toUpperCase();
  const tag = options?.tag?.trim().toLowerCase();
  const search = options?.search?.trim().toLowerCase();

  return CURATED_MARKETPLACE_CATALOG.filter((item) => {
    if (vendorType && vendorType !== 'ALL' && item.vendorMeta.vendorType !== vendorType) {
      return false;
    }
    if (tag && tag !== 'all') {
      const hasTag =
        item.tags.some((t) => t.toLowerCase() === tag) ||
        item.vendor.toLowerCase().includes(tag) ||
        item.vendorMeta.publisherName.toLowerCase().includes(tag);
      if (!hasTag) return false;
    }
    if (search) {
      const haystack = `${item.name} ${item.description} ${item.vendor} ${item.vendorMeta.publisherName} ${item.tags.join(' ')}`.toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    return true;
  });
}

