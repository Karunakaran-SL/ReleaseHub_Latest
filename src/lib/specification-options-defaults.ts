// SPDX-License-Identifier: AGPL-3.0-only

export type OptionCategory =
  | 'HW_FORM_FACTORS'
  | 'HW_TYPES'
  | 'VENDORS'
  | 'CPU_TYPES'
  | 'GPU_TYPES'
  | 'DISK_TYPES'
  | 'NETWORK_CARDS'
  | 'PLUG_POWER_CORDS'
  | 'HYPERVISORS'
  | 'SPEC_TYPES'
  | 'HW_ARCHITECTURES'
  | 'CLOUD_PROVIDERS'
  | 'CLOUD_TYPES'
  | 'K8S_DISTROS'
  | 'K8S_SCOPES'
  | string;

export interface SpecificationOptionDoc {
  _id: string;
  category: OptionCategory;
  key: string;
  label: string;
  name?: string;
  description?: string;
  active: boolean;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Maps option categories to existing ReleaseHub MongoDB collections where applicable,
 * so existing hardware/reference settings and Specification Studio options share the exact same DB data.
 */
export const CATEGORY_COLLECTION_MAP: Record<string, string> = {
  HW_FORM_FACTORS: 'specification_hw_types',
  HW_TYPES: 'specification_hw_types',
  VENDORS: 'specification_vendors',
  CPU_TYPES: 'specification_cpu_types',
  GPU_TYPES: 'specification_gpu_types',
  DISK_TYPES: 'specification_disk_types',
  NETWORK_CARDS: 'specification_network_cards',
  PLUG_POWER_CORDS: 'specification_plug_power_cords',
  HYPERVISORS: 'specification_hypervisors',
};

export const DEFAULT_SPECIFICATION_OPTIONS: Omit<SpecificationOptionDoc, '_id'>[] = [
  // SPEC_TYPES
  {
    category: 'SPEC_TYPES',
    key: 'HW',
    label: 'Hardware (On-Prem)',
    description: 'Airgapped / On-Prem Rack, Blade, Standalone Server & Edge',
    active: true,
    sortOrder: 1,
  },
  {
    category: 'SPEC_TYPES',
    key: 'CLOUD',
    label: 'Cloud Infrastructure',
    description: 'Public & Private Cloud for AWS, Azure, GCP, OpenStack & VMware',
    active: true,
    sortOrder: 2,
  },
  {
    category: 'SPEC_TYPES',
    key: 'MANAGED_K8S',
    label: 'Managed Kubernetes',
    description: 'EKS, GKE, AKS, OpenShift, Rancher, Talos & Custom Clusters',
    active: true,
    sortOrder: 3,
  },

  // HW_FORM_FACTORS (shared with specification_hw_types)
  {
    category: 'HW_FORM_FACTORS',
    key: 'RACK',
    label: 'Rack',
    description: 'Standard EIA-310 rackmount server (1U/2U/4U)',
    active: true,
    sortOrder: 1,
  },
  {
    category: 'HW_FORM_FACTORS',
    key: 'BLADE',
    label: 'Blade',
    description: 'Modular blade chassis enclosure',
    active: true,
    sortOrder: 2,
  },
  {
    category: 'HW_FORM_FACTORS',
    key: 'VIRTUAL',
    label: 'Virtual',
    description: 'Virtualized or hypervisor-hosted cluster nodes',
    active: true,
    sortOrder: 3,
  },
  {
    category: 'HW_FORM_FACTORS',
    key: 'STANDALONE_SERVER',
    label: 'Standalone Server',
    description: 'Tower or standalone appliance server',
    active: true,
    sortOrder: 4,
  },
  {
    category: 'HW_FORM_FACTORS',
    key: 'EDGE_NODE',
    label: 'Edge Node',
    description: 'Ruggedized or compact far-edge compute node',
    active: true,
    sortOrder: 5,
  },

  // VENDORS (shared with specification_vendors)
  {
    category: 'VENDORS',
    key: 'DELL_EMC',
    label: 'Dell EMC',
    description: 'Dell PowerEdge &VxRail Infrastructure',
    active: true,
    sortOrder: 1,
  },
  {
    category: 'VENDORS',
    key: 'HPE',
    label: 'HPE',
    description: 'Hewlett Packard Enterprise ProLiant & Synergy',
    active: true,
    sortOrder: 2,
  },
  {
    category: 'VENDORS',
    key: 'CISCO',
    label: 'Cisco',
    description: 'Cisco UCS Blade & Rack Systems',
    active: true,
    sortOrder: 3,
  },
  {
    category: 'VENDORS',
    key: 'LENOVO',
    label: 'Lenovo',
    description: 'Lenovo ThinkSystem & ThinkAgile',
    active: true,
    sortOrder: 4,
  },

  // HW_ARCHITECTURES
  {
    category: 'HW_ARCHITECTURES',
    key: 'X86_64',
    label: 'x86_64',
    description: '64-bit x86 Architecture (Intel Xeon / AMD EPYC)',
    active: true,
    sortOrder: 1,
  },
  {
    category: 'HW_ARCHITECTURES',
    key: 'ARM64',
    label: 'ARM64',
    description: '64-bit ARM Architecture (Ampere Altra / AWS Graviton)',
    active: true,
    sortOrder: 2,
  },
  {
    category: 'HW_ARCHITECTURES',
    key: 'POWER10',
    label: 'POWER10',
    description: 'IBM POWER10 Enterprise Processor Architecture',
    active: true,
    sortOrder: 3,
  },

  // CLOUD_PROVIDERS
  {
    category: 'CLOUD_PROVIDERS',
    key: 'AWS',
    label: 'Amazon Web Services (AWS)',
    description: 'AWS Public & Outposts Cloud Regions',
    active: true,
    sortOrder: 1,
  },
  {
    category: 'CLOUD_PROVIDERS',
    key: 'AZURE',
    label: 'Microsoft Azure',
    description: 'Azure Public & Azure Stack HCI Cloud',
    active: true,
    sortOrder: 2,
  },
  {
    category: 'CLOUD_PROVIDERS',
    key: 'GCP',
    label: 'Google Cloud Platform (GCP)',
    description: 'Google Cloud & Distributed Cloud',
    active: true,
    sortOrder: 3,
  },
  {
    category: 'CLOUD_PROVIDERS',
    key: 'OPENSTACK',
    label: 'OpenStack Private Cloud',
    description: 'On-Premises OpenStack Nova/Neutron Cloud',
    active: true,
    sortOrder: 4,
  },
  {
    category: 'CLOUD_PROVIDERS',
    key: 'VMWARE',
    label: 'VMware vSphere / VCF',
    description: 'VMware Cloud Foundation & vCenter SDDC',
    active: true,
    sortOrder: 5,
  },
  {
    category: 'CLOUD_PROVIDERS',
    key: 'CUSTOM',
    label: 'Custom Cloud Provider',
    description: 'Custom or Sovereign Cloud Provider',
    active: true,
    sortOrder: 6,
  },

  // CLOUD_TYPES
  {
    category: 'CLOUD_TYPES',
    key: 'PUBLIC',
    label: 'Public Cloud',
    description: 'Multi-tenant public cloud infrastructure',
    active: true,
    sortOrder: 1,
  },
  {
    category: 'CLOUD_TYPES',
    key: 'PRIVATE',
    label: 'Private Cloud',
    description: 'Dedicated single-tenant or on-prem cloud infrastructure',
    active: true,
    sortOrder: 2,
  },
  {
    category: 'CLOUD_TYPES',
    key: 'HYBRID',
    label: 'Hybrid Cloud',
    description: 'Interconnected on-prem and public cloud deployment',
    active: true,
    sortOrder: 3,
  },

  // K8S_DISTROS
  {
    category: 'K8S_DISTROS',
    key: 'EKS',
    label: 'Amazon EKS',
    description: 'Elastic Kubernetes Service on AWS',
    active: true,
    sortOrder: 1,
  },
  {
    category: 'K8S_DISTROS',
    key: 'GKE',
    label: 'Google GKE',
    description: 'Google Kubernetes Engine',
    active: true,
    sortOrder: 2,
  },
  {
    category: 'K8S_DISTROS',
    key: 'AKS',
    label: 'Azure AKS',
    description: 'Azure Kubernetes Service',
    active: true,
    sortOrder: 3,
  },
  {
    category: 'K8S_DISTROS',
    key: 'OPENSHIFT',
    label: 'Red Hat OpenShift',
    description: 'Enterprise OpenShift Container Platform (OCP)',
    active: true,
    sortOrder: 4,
  },
  {
    category: 'K8S_DISTROS',
    key: 'RANCHER',
    label: 'SUSE Rancher (RKE2 / K3s)',
    description: 'Rancher-managed RKE2 or K3s Kubernetes clusters',
    active: true,
    sortOrder: 5,
  },
  {
    category: 'K8S_DISTROS',
    key: 'TALOS',
    label: 'Sidero Talos Linux K8s',
    description: 'Immutable API-driven Talos Kubernetes OS',
    active: true,
    sortOrder: 6,
  },
  {
    category: 'K8S_DISTROS',
    key: 'CUSTOM',
    label: 'Custom Upstream Kubernetes',
    description: 'kubeadm or custom CNCF Kubernetes distribution',
    active: true,
    sortOrder: 7,
  },

  // K8S_SCOPES
  {
    category: 'K8S_SCOPES',
    key: 'CLOUD_MANAGED',
    label: 'Cloud Managed Control Plane',
    description: 'Provider-managed control plane with worker node pools',
    active: true,
    sortOrder: 1,
  },
  {
    category: 'K8S_SCOPES',
    key: 'ON_PREM',
    label: 'On-Premises Self-Managed',
    description: 'Self-hosted control plane and worker nodes in datacenter',
    active: true,
    sortOrder: 2,
  },
  {
    category: 'K8S_SCOPES',
    key: 'EDGE',
    label: 'Single-Node / Far-Edge',
    description: 'Compact edge Kubernetes footprint',
    active: true,
    sortOrder: 3,
  },
  {
    category: 'K8S_SCOPES',
    key: 'HYBRID',
    label: 'Multi-Cloud / Hybrid Mesh',
    description: 'Federated cluster spanning cloud and on-prem sites',
    active: true,
    sortOrder: 4,
  },
];
