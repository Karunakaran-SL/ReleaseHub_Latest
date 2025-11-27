
import clientPromise from '@/lib/mongodb';
import { generateAndStoreAllProductTrees } from '@/lib/dependency-graph';
import type { Product, CmdbTenant, CmdbComponent, CmdbApplication, CmdbInterfaceType, CmdbInterface, OnboardingConfiguration, OnboardingPhase, License, ProductLicensing, Specification, Deployment, Simulator, Emulator, DevelopmentEnvironment, TestEnvironment, SdkApp, Baseline } from './definitions';

const appCatalogData = [
  {
    "category": "Provisioning",
    "subcategory": "Automation & Configuration",
    "name": "Airship",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/airship.svg",
    "website": "https://www.airshipit.org/",
    "description": ""
  },
  {
    "category": "Provisioning",
    "subcategory": "Automation & Configuration",
    "name": "Akri",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/akri.svg",
    "website": "https://docs.akri.sh",
    "description": ""
  },
  {
    "category": "Databases",
    "subcategory": "Automation & Configuration",
    "name": "Couler",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/couler.svg",
    "website": "https://couler-proj.github.io/couler/index.html",
    "description": ""
  },
  {
    "category": "Databases",
    "subcategory": "Automation & Configuration",
    "name": "DevStream",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/devstream.svg",
    "website": "https://www.devstream.io/",
    "description": ""
  },
  {
    "category": "Security",
    "subcategory": "Automation & Configuration",
    "name": "Foreman",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/foreman.svg",
    "website": "https://theforeman.org/",
    "description": ""
  },
  {
    "category": "Security",
    "subcategory": "Automation & Configuration",
    "name": "Goose",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/goose.svg",
    "website": "https://block.github.io/goose/",
    "description": ""
  },
  {
    "category": "Install",
    "subcategory": "Automation & Configuration",
    "name": "Gthulhu",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/gthulhu.svg",
    "website": "https://gthulhu.github.io/docs/",
    "description": "Gthulhu optimizes cloud-native workloads using the Linux Scheduler Extension for different application scenarios."
  },
  {
    "category": "Install",
    "subcategory": "Automation & Configuration",
    "name": "Idem Project",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/idem-project.svg",
    "website": "https://www.idemproject.io",
    "description": "Idem reduces your cloud configuration to data – for you! Instead of Infrastructure as Code, Idem delivers Infrastructure as Data. The cloud becomes simplified, easier to maintain, easier to discover, and easier to use."
  },
  {
    "category": "Pipeline",
    "subcategory": "Automation & Configuration",
    "name": "Juju",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/juju.svg",
    "website": "https://jaas.ai/",
    "description": ""
  },
  {
    "category": "Pipeline",
    "subcategory": "Automation & Configuration",
    "name": "kagent",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/kagent.svg",
    "website": "https://kagent.dev/",
    "description": "Kagent is an open source programming framework designed for DevOps and platform engineers to run AI agents in Kubernetes"
  },
  {
    "category": "Messaging",
    "subcategory": "Automation & Configuration",
    "name": "Kairos",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/kairos.svg",
    "website": "https://kairos.io",
    "description": ""
  },
  {
    "category": "Messaging",
    "subcategory": "Automation & Configuration",
    "name": "Kapitan",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/kapitan.svg",
    "website": "https://kapitan.dev/",
    "description": "A configuration management system for platform engineering and other things"
  },
  {
    "category": "Storage",
    "subcategory": "Automation & Configuration",
    "name": "KCL",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/kcl.svg",
    "website": "https://kcl-lang.io/",
    "description": "A constraint-based record & functional language mainly used in configuration and policy scenarios."
  },
  {
    "category": "Storage",
    "subcategory": "Automation & Configuration",
    "name": "KitOps",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/kitops.svg",
    "website": "https://kitops.org/",
    "description": "An open standard for packaging, managing, and deploying ML models and artifacts across different systems"
  },
  {
    "category": "Load Balancer",
    "subcategory": "Automation & Configuration",
    "name": "kiosk",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/kiosk.svg",
    "website": "https://github.com/loft-sh/kiosk",
    "description": ""
  },
  {
    "category": "Load Balancer",
    "subcategory": "Automation & Configuration",
    "name": "Kosko",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/kosko.svg",
    "website": "https://kosko.dev",
    "description": "Kosko can help you organize your Kubernetes manifests in TypeScript, manage multiple environments, ensure type safety using OpenAPI schema, and find issues in your manifests."
  },
  {
    "category": "API Gateway",
    "subcategory": "Automation & Configuration",
    "name": "kpt",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/kpt.svg",
    "website": "https://kpt.dev",
    "description": ""
  },
  {
    "category": "PI Gateway",
    "subcategory": "Automation & Configuration",
    "name": "Kratix",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/kratix.svg",
    "website": "https://www.kratix.io/",
    "description": ""
  },
  {
    "category": "Compliance",
    "subcategory": "Automation & Configuration",
    "name": "Kubean",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/kubean.svg",
    "website": "https://kubean-io.github.io/kubean/",
    "description": "Product ready cluster lifecycle management toolchains based on kubespray and other cluster LCM engine."
  },
  {
    "category": "Compliance",
    "subcategory": "Automation & Configuration",
    "name": "KubeDL",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/kubedl.svg",
    "website": "https://kubedl.io",
    "description": ""
  },
  {
    "category": "Scaling",
    "subcategory": "Automation & Configuration",
    "name": "KubeEdge",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/kube-edge.svg",
    "website": "https://kubeedge.io/en/",
    "description": ""
  },
  {
    "category": "Scaling",
    "subcategory": "Automation & Configuration",
    "name": "Kubefirst",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/kubefirst.svg",
    "website": "https://docs.kubefirst.com",
    "description": "Instant operational open source gitops platforms for platform engineering, infrastructure, and software teams"
  },
  {
    "category": "Observability",
    "subcategory": "Automation & Configuration",
    "name": "KubeZoo",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/kubezoo.svg",
    "website": "https://kubewharf.github.io",
    "description": ""
  },
  {
    "category": "Observability",
    "subcategory": "Automation & Configuration",
    "name": "KusionStack",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/kusionstack.svg",
    "website": "https://kusionstack.io/",
    "description": ""
  }
];

const initialApplicationOnboarding: Omit<OnboardingConfiguration, '_id'> = {
  name: 'Application Onboarding',
  version: 1,
  phases: [
    {
      id: "phase-1",
      name: "Initiate Onboarding",
      ownerName: "Sales Team",
      ownerEmail: "sales@example.com",
      sendEmailOnComplete: true,
      statusOptions: ["Not Started", "In Progress", "Done", "Cancelled", "Skipped"],
      fields: [
        { type: "Checkbox", name: "requestFormSubmitted", label: "Request Form Submitted", proof: true },
        { type: "Checkbox", name: "csApproved", label: "CS Approved", proof: true },
        { type: "Checkbox", name: "pmApproved", label: "PM Approved", proof: true },
        { type: "Checkbox", name: "productTeamAgreement", label: "Product Team Agreement", proof: true },
      ],
    },
    {
      id: "phase-2",
      name: "Product Definitions",
      ownerName: "Product Team",
      ownerEmail: "product@example.com",
      sendEmailOnComplete: true,
      statusOptions: ["Not Started", "In Progress", "Done", "Cancelled", "Skipped"],
      fields: [
        { type: "Checkbox", name: "architectAgreed", label: "Architect Agreed", proof: true },
        { type: "Checkbox", name: "specChanged", label: "System level Specification changed?", proof: true },
        { type: "Checkbox", name: "hlDesignApproved", label: "High Level Design approved", proof: true },
      ],
    },
    {
        id: "phase-3",
        name: "Detail Design",
        ownerName: "Engineering Team",
        ownerEmail: "eng@example.com",
        sendEmailOnComplete: true,
        statusOptions: ["Not Started", "In Progress", "Done", "Cancelled", "Skipped"],
        fields: [
          { type: "Checkbox", name: "detailDesignDone", label: "Detail design done", proof: true },
          { type: "Checkbox", name: "dependencyIdentified", label: "Dependency identified", proof: true },
          { type: "Checkbox", name: "pertReady", label: "PERT ready", proof: true },
          { type: "Checkbox", name: "testPlanReady", label: "Test Plan ready", proof: true },
        ],
    },
    {
        id: "phase-4",
        name: "Delivery",
        ownerName: "QA Team",
        ownerEmail: "qa@example.com",
        sendEmailOnComplete: true,
        statusOptions: ["Not Started", "In Progress", "Done", "Cancelled", "Skipped"],
        fields: [
            { type: "Checkbox", name: "implementationDone", label: "Implementation done", proof: true },
            { type: "Checkbox", name: "unitTestDone", label: "Unit test done", proof: true },
            { type: "Checkbox", name: "staticCodeDone", label: "Static Code done", proof: true },
            { type: "Checkbox", name: "systemIntegrationDone", label: "System Integration done", proof: true },
            { type: "Checkbox", name: "systemIntegrationTestingDone", label: "System Integration Testing done", proof: true },
            { type: "Checkbox", name: "allTestCasesAutomated", label: "All Test cases are automated", proof: true },
        ]
    },
     {
        id: "phase-5",
        name: "Alpha Qualification",
        ownerName: "Alpha Team",
        ownerEmail: "alpha@example.com",
        sendEmailOnComplete: true,
        statusOptions: ["Not Started", "In Progress", "Done", "Cancelled", "Skipped"],
        fields: [
            { type: "Checkbox", name: "uatTestDone", label: "UAT Test done", proof: true },
            { type: "Checkbox", name: "riskReported", label: "Risk reported", proof: true },
            { type: "Checkbox", name: "serviceMetricsDone", label: "Service Metrix are done", proof: true },
        ]
    },
    {
        id: "phase-6",
        name: "Prepare customer",
        ownerName: "Support Team",
        ownerEmail: "support@example.com",
        sendEmailOnComplete: true,
        statusOptions: ["Not Started", "In Progress", "Done", "Cancelled", "Skipped"],
        fields: [
            { type: "Checkbox", name: "communicatedChanges", label: "Communicated the changes", proof: true },
            { type: "Checkbox", name: "plannedMCWindow", label: "Planned M/C window", proof: true },
        ]
    },
    {
        id: "phase-7",
        name: "Beta Qualification",
        ownerName: "Beta Team",
        ownerEmail: "beta@example.com",
        sendEmailOnComplete: true,
        statusOptions: ["Not Started", "In Progress", "Done", "Cancelled", "Skipped"],
        fields: [
            { type: "Checkbox", name: "deploymentRunbookForBeta", label: "Deployment Runbook for Beta", proof: true },
            { type: "Checkbox", name: "deploymentDone", label: "Deployment done", proof: true },
            { type: "Checkbox", name: "betaTestsExecuted", label: "Beta Tests are executed and pass", proof: true },
        ]
    },
    {
        id: "phase-8",
        name: "Completed",
        ownerName: "Release Team",
        ownerEmail: "release@example.com",
        sendEmailOnComplete: true,
        statusOptions: ["Not Started", "In Progress", "Done", "Cancelled", "Skipped"],
        fields: [
            { type: "Checkbox", name: "onboardingCompleteClosure", label: "Onboarding complete closure", proof: true },
        ]
    }
  ],
};

const initialComponentOnboarding: Omit<OnboardingConfiguration, '_id'> = {
  name: 'Component Onboarding',
  version: 1,
  phases: [
    {
      id: "phase-1",
      name: "Initiate Onboarding",
      ownerName: "Sales Team",
      ownerEmail: "sales@example.com",
      sendEmailOnComplete: true,
      statusOptions: ["Not Started", "In Progress", "Done", "Cancelled", "Skipped"],
      fields: [
        { type: "Checkbox", name: "requestFormSubmitted", label: "Request Form Submitted", proof: true },
        { type: "Checkbox", name: "csApproved", label: "CS Approved", proof: true },
        { type: "Checkbox", name: "pmApproved", label: "PM Approved", proof: true },
        { type: "Checkbox", name: "productTeamAgreement", label: "Product Team Agreement", proof: true },
      ],
    },
    {
      id: "phase-2",
      name: "Product Definitions",
      ownerName: "Product Team",
      ownerEmail: "product@example.com",
      sendEmailOnComplete: true,
      statusOptions: ["Not Started", "In Progress", "Done", "Cancelled", "Skipped"],
      fields: [
        { type: "Checkbox", name: "architectAgreed", label: "Architect Agreed", proof: true },
        { type: "Checkbox", name: "specChanged", label: "System level Specification changed?", proof: true },
        { type: "Checkbox", name: "hlDesignApproved", label: "High Level Design approved", proof: true },
      ],
    },
    {
        id: "phase-3",
        name: "Detail Design",
        ownerName: "Engineering Team",
        ownerEmail: "eng@example.com",
        sendEmailOnComplete: true,
        statusOptions: ["Not Started", "In Progress", "Done", "Cancelled", "Skipped"],
        fields: [
          { type: "Checkbox", name: "detailDesignDone", label: "Detail design done", proof: true },
          { type: "Checkbox", name: "dependencyIdentified", label: "Dependency identified", proof: true },
          { type: "Checkbox", name: "pertReady", label: "PERT ready", proof: true },
          { type: "Checkbox", name: "testPlanReady", label: "Test Plan ready", proof: true },
        ],
    },
    {
        id: "phase-4",
        name: "Delivery",
        ownerName: "QA Team",
        ownerEmail: "qa@example.com",
        sendEmailOnComplete: true,
        statusOptions: ["Not Started", "In Progress", "Done", "Cancelled", "Skipped"],
        fields: [
            { type: "Checkbox", name: "implementationDone", label: "Implementation done", proof: true },
            { type: "Checkbox", name: "unitTestDone", label: "Unit test done", proof: true },
            { type: "Checkbox", name: "staticCodeDone", label: "Static Code done", proof: true },
            { type: "Checkbox", name: "systemIntegrationDone", label: "System Integration done", proof: true },
            { type: "Checkbox", name: "systemIntegrationTestingDone", label: "System Integration Testing done", proof: true },
            { type: "Checkbox", name: "allTestCasesAutomated", label: "All Test cases are automated", proof: true },
        ]
    },
     {
        id: "phase-5",
        name: "Alpha Qualification",
        ownerName: "Alpha Team",
        ownerEmail: "alpha@example.com",
        sendEmailOnComplete: true,
        statusOptions: ["Not Started", "In Progress", "Done", "Cancelled", "Skipped"],
        fields: [
            { type: "Checkbox", name: "uatTestDone", label: "UAT Test done", proof: true },
            { type: "Checkbox", name: "riskReported", label: "Risk reported", proof: true },
            { type: "Checkbox", name: "serviceMetricsDone", label: "Service Metrix are done", proof: true },
        ]
    },
    {
        id: "phase-6",
        name: "Prepare customer",
        ownerName: "Support Team",
        ownerEmail: "support@example.com",
        sendEmailOnComplete: true,
        statusOptions: ["Not Started", "In Progress", "Done", "Cancelled", "Skipped"],
        fields: [
            { type: "Checkbox", name: "communicatedChanges", label: "Communicated the changes", proof: true },
            { type: "Checkbox", name: "plannedMCWindow", label: "Planned M/C window", proof: true },
        ]
    },
    {
        id: "phase-7",
        name: "Beta Qualification",
        ownerName: "Beta Team",
        ownerEmail: "beta@example.com",
        sendEmailOnComplete: true,
        statusOptions: ["Not Started", "In Progress", "Done", "Cancelled", "Skipped"],
        fields: [
            { type: "Checkbox", name: "deploymentRunbookForBeta", label: "Deployment Runbook for Beta", proof: true },
            { type: "Checkbox", name: "deploymentDone", label: "Deployment done", proof: true },
            { type: "Checkbox", name: "betaTestsExecuted", label: "Beta Tests are executed and pass", proof: true },
        ]
    },
    {
        id: "phase-8",
        name: "Completed",
        ownerName: "Release Team",
        ownerEmail: "release@example.com",
        sendEmailOnComplete: true,
        statusOptions: ["Not Started", "In Progress", "Done", "Cancelled", "Skipped"],
        fields: [
            { type: "Checkbox", name: "onboardingCompleteClosure", label: "Onboarding complete closure", proof: true },
        ]
    }
  ],
};

const initialTenantOnboarding: Omit<OnboardingConfiguration, '_id'> = {
  name: 'Tenant Onboarding',
  version: 1,
  phases: [
    {
      id: "phase-1",
      name: "Initiate Onboarding",
      ownerName: "Sales Team",
      ownerEmail: "sales@example.com",
      sendEmailOnComplete: true,
      statusOptions: ["Not Started", "In Progress", "Done", "Cancelled", "Skipped"],
      fields: [
        { type: "Checkbox", name: "requestFormSubmitted", label: "Request Form Submitted", proof: true },
        { type: "Checkbox", name: "csApproved", label: "CS Approved", proof: true },
        { type: "Checkbox", name: "pmApproved", label: "PM Approved", proof: true },
        { type: "Checkbox", name: "productTeamAgreement", label: "Product Team Agreement", proof: true },
      ],
    },
    {
      id: "phase-2",
      name: "Product Definitions",
      ownerName: "Product Team",
      ownerEmail: "product@example.com",
      sendEmailOnComplete: true,
      statusOptions: ["Not Started", "In Progress", "Done", "Cancelled", "Skipped"],
      fields: [
        { type: "Checkbox", name: "architectAgreed", label: "Architect Agreed", proof: true },
        { type: "Checkbox", name: "specChanged", label: "System level Specification changed?", proof: true },
        { type: "Checkbox", name: "hlDesignApproved", label: "High Level Design approved", proof: true },
      ],
    },
    {
        id: "phase-3",
        name: "Detail Design",
        ownerName: "Engineering Team",
        ownerEmail: "eng@example.com",
        sendEmailOnComplete: true,
        statusOptions: ["Not Started", "In Progress", "Done", "Cancelled", "Skipped"],
        fields: [
          { type: "Checkbox", name: "detailDesignDone", label: "Detail design done", proof: true },
          { type: "Checkbox", name: "dependencyIdentified", label: "Dependency identified", proof: true },
          { type: "Checkbox", name: "pertReady", label: "PERT ready", proof: true },
          { type: "Checkbox", name: "testPlanReady", label: "Test Plan ready", proof: true },
        ],
    },
    {
        id: "phase-4",
        name: "Delivery",
        ownerName: "QA Team",
        ownerEmail: "qa@example.com",
        sendEmailOnComplete: true,
        statusOptions: ["Not Started", "In Progress", "Done", "Cancelled", "Skipped"],
        fields: [
            { type: "Checkbox", name: "implementationDone", label: "Implementation done", proof: true },
            { type: "Checkbox", name: "unitTestDone", label: "Unit test done", proof: true },
            { type: "Checkbox", name: "staticCodeDone", label: "Static Code done", proof: true },
            { type: "Checkbox", name: "systemIntegrationDone", label: "System Integration done", proof: true },
            { type: "Checkbox", name: "systemIntegrationTestingDone", label: "System Integration Testing done", proof: true },
            { type: "Checkbox", name: "allTestCasesAutomated", label: "All Test cases are automated", proof: true },
        ]
    },
     {
        id: "phase-5",
        name: "Alpha Qualification",
        ownerName: "Alpha Team",
        ownerEmail: "alpha@example.com",
        sendEmailOnComplete: true,
        statusOptions: ["Not Started", "In Progress", "Done", "Cancelled", "Skipped"],
        fields: [
            { type: "Checkbox", name: "uatTestDone", label: "UAT Test done", proof: true },
            { type: "Checkbox", name: "riskReported", label: "Risk reported", proof: true },
            { type: "Checkbox", name: "serviceMetricsDone", label: "Service Metrix are done", proof: true },
        ]
    },
    {
        id: "phase-6",
        name: "Prepare customer",
        ownerName: "Support Team",
        ownerEmail: "support@example.com",
        sendEmailOnComplete: true,
        statusOptions: ["Not Started", "In Progress", "Done", "Cancelled", "Skipped"],
        fields: [
            { type: "Checkbox", name: "communicatedChanges", label: "Communicated the changes", proof: true },
            { type: "Checkbox", name: "plannedMCWindow", label: "Planned M/C window", proof: true },
        ]
    },
    {
        id: "phase-7",
        name: "Beta Qualification",
        ownerName: "Beta Team",
        ownerEmail: "beta@example.com",
        sendEmailOnComplete: true,
        statusOptions: ["Not Started", "In Progress", "Done", "Cancelled", "Skipped"],
        fields: [
            { type: "Checkbox", name: "deploymentRunbookForBeta", label: "Deployment Runbook for Beta", proof: true },
            { type: "Checkbox", name: "deploymentDone", label: "Deployment done", proof: true },
            { type: "Checkbox", name: "betaTestsExecuted", label: "Beta Tests are executed and pass", proof: true },
        ]
    },
    {
        id: "phase-8",
        name: "Completed",
        ownerName: "Release Team",
        ownerEmail: "release@example.com",
        sendEmailOnComplete: true,
        statusOptions: ["Not Started", "In Progress", "Done", "Cancelled", "Skipped"],
        fields: [
            { type: "Checkbox", name: "onboardingCompleteClosure", label: "Onboarding complete closure", proof: true },
        ]
    }
  ],
};


const initialDefaultApprovalPhases: OnboardingPhase[] = [
    { id: 'product-owner', name: 'Product Owner', ownerName: '', ownerEmail: '', sendEmailOnComplete: false, statusOptions: ["Not Started", "In Progress", "Approved", "Rejected"], fields: [{ type: 'Checkbox', name: 'approved', label: 'Approved', proof: true }] },
    { id: 'product-manager', name: 'Product Manager', ownerName: '', ownerEmail: '', sendEmailOnComplete: false, statusOptions: ["Not Started", "In Progress", "Approved", "Rejected"], fields: [{ type: 'Checkbox', name: 'approved', label: 'Approved', proof: true }] },
    { id: 'quality-assurance', name: 'Quality Assurance', ownerName: '', ownerEmail: '', sendEmailOnComplete: false, statusOptions: ["Not Started", "In Progress", "Approved", "Rejected"], fields: [{ type: 'Checkbox', name: 'approved', label: 'Approved', proof: true }] },
    { id: 'release-owner', name: 'Release Owner', ownerName: '', ownerEmail: '', sendEmailOnComplete: false, statusOptions: ["Not Started", "In Progress", "Approved", "Rejected"], fields: [{ type: 'Checkbox', name: 'approved', label: 'Approved', proof: true }] },
    { id: 'export-control-board', name: 'Export Control Board', ownerName: '', ownerEmail: '', sendEmailOnComplete: false, statusOptions: ["Not Started", "In Progress", "Approved", "Rejected"], fields: [{ type: 'Checkbox', name: 'approved', label: 'Approved', proof: true }] },
    { id: 'license-compliance-board', name: 'License Compliance Board', ownerName: '', ownerEmail: '', sendEmailOnComplete: false, statusOptions: ["Not Started", "In Progress", "Approved", "Rejected"], fields: [{ type: 'Checkbox', name: 'approved', label: 'Approved', proof: true }] },
    { id: 'security-compliance', name: 'Security Compliance', ownerName: '', ownerEmail: '', sendEmailOnComplete: false, statusOptions: ["Not Started", "In Progress", "Approved", "Rejected"], fields: [{ type: 'Checkbox', name: 'approved', label: 'Approved', proof: true }] },
    { id: 'data-compliance', name: 'Data Compliance', ownerName: '', ownerEmail: '', sendEmailOnComplete: false, statusOptions: ["Not Started", "In Progress", "Approved", "Rejected"], fields: [{ type: 'Checkbox', name: 'approved', label: 'Approved', proof: true }] },
    { id: 'customer', name: 'Customer', ownerName: '', ownerEmail: '', sendEmailOnComplete: false, statusOptions: ["Not Started", "In Progress", "Approved", "Rejected"], fields: [{ type: 'Checkbox', name: 'approved', label: 'Approved', proof: true }] },
    { id: 'field-engineer', name: 'Field Engineer', ownerName: '', ownerEmail: '', sendEmailOnComplete: false, statusOptions: ["Not Started", "In Progress", "Approved", "Rejected"], fields: [{ type: 'Checkbox', name: 'approved', label: 'Approved', proof: true }] },
];

const initialApprovalConfigs = [
    { name: 'Product Onboarding Approval', key: 'product-onboarding' },
    { name: 'Tenant Approval', key: 'tenant-approval' },
    { name: 'Components Approval', key: 'components-approval' },
    { name: 'Application Approval', key: 'application-approval' },
    { name: 'Interface Approval', key: 'interface-approval' },
    { name: 'Baseline Approval', key: 'baseline-approval' },
    { name: 'Deployment Approval', key: 'deployment-approval' },
    { name: 'Upgrade Approval', key: 'upgrade-approval' },
    { name: 'Migration Approval', key: 'migration-approval' },
    { name: 'Decommission Approval', key: 'decommission-approval' },
    { name: 'License Approval', key: 'license-approval' },
    { name: 'Export Control Approval', key: 'export-control-approval' },
    { name: 'Security Approval', key: 'security-approval' },
].map(config => ({
    name: config.name,
    collectionName: `settings_approval_${config.key.replace(/-/g, '_')}`,
    data: [{
        _id: `default_${config.key.replace(/-/g, '_')}_v1`,
        name: config.name,
        version: 1,
        phases: initialDefaultApprovalPhases,
    }]
}));

const initialServiceContracts: any[] = [
    { _id: 'ServiceContract_ProSupport_Plus', id: 'ServiceContract_ProSupport_Plus', name: 'ProSupport Plus', description: '24/7 premium support with on-site service.' },
    { _id: 'ServiceContract_Standard_Warranty', id: 'ServiceContract_Standard_Warranty', name: 'Standard Warranty', description: 'Standard 3-year warranty.' },
];
const initialSpecVendors: any[] = [
    { _id: 'HPE', id: 'HPE', name: 'HPE', description: 'Hewlett Packard Enterprise' },
    { _id: 'Dell', id: 'Dell', name: 'Dell', description: 'Dell EMC' },
    { _id: 'Cisco', id: 'Cisco', name: 'Cisco', description: 'Cisco Systems' },
];
const initialSpecHwTypes: any[] = [
    { _id: 'Blade', id: 'Blade', name: 'Blade', description: 'Blade Server for chassis-based systems.' },
    { _id: 'Rack', id: 'Rack', name: 'Rack', description: 'Rack-mountable server.' },
    { _id: 'Virtual', id: 'Virtual', name: 'Virtual', description: 'Virtual Machine cluster specification.' },
];
const initialSpecNetworkCards: any[] = [
    { _id: 'Ethernet_10G_SFP', id: 'Ethernet_10G_SFP', name: 'Ethernet 10G SFP+', description: '10 Gigabit SFP+ NIC' },
    { _id: 'Ethernet_40G_QSFP+', id: 'Ethernet_40G_QSFP+', name: 'Ethernet 40G QSFP+', description: '40 Gigabit QSFP+ NIC' },
];
const initialSpecPlugPowerCords: any[] = [
    { _id: 'NEMA_5_15P', id: 'NEMA_5_15P', name: 'NEMA 5-15P', description: 'Standard North American 3-prong plug.' },
    { _id: 'IEC_C14', id: 'IEC_C14', name: 'IEC C14', description: 'Standard for most data center equipment.' },
];
const initialSpecCpuTypes: any[] = [
    { _id: 'Intel_Xeon_Scalable', id: 'Intel_Xeon_Scalable', name: 'Intel Xeon Scalable', description: 'Intel Xeon Scalable processor family.' },
    { _id: 'AMD_EPYC', id: 'AMD_EPYC', name: 'AMD EPYC', description: 'AMD EPYC server processor family.' },
];
const initialSpecGpuTypes: any[] = [
    { _id: 'NVIDIA_A100', id: 'NVIDIA_A100', name: 'NVIDIA A100', description: 'NVIDIA A100 Tensor Core GPU.' },
    { _id: 'AMD_Instinct_MI250X', id: 'AMD_Instinct_MI250X', name: 'AMD Instinct MI250X', description: 'AMD Instinct MI250X accelerator.' },
];
const initialSpecDiskTypes: any[] = [
    { _id: 'SSD_NVMe_U2_PCIeGen4', id: 'SSD_NVMe_U2_PCIeGen4', name: 'SSD NVMe U.2 PCIe Gen4', description: 'High-speed NVMe solid state drive.' },
    { _id: 'HDD_SAS_10K', id: 'HDD_SAS_10K', name: 'HDD SAS 10K', description: '10,000 RPM SAS hard disk drive.' },
];
const initialSpecHypervisors: any[] = [
    { _id: 'vmware-esxi', id: 'vmware-esxi', name: 'VMware ESXi', description: 'VMware ESXi hypervisor.' },
    { _id: 'kvm', id: 'kvm', name: 'KVM', description: 'Kernel-based Virtual Machine.' },
];
const initialLicenses: Omit<License, '_id'>[] = [
    { id: 'apache-2.0', name: 'Apache License 2.0', type: 'open-source', owner: 'Apache Foundation', components: ['auth-service'], status: 'active' },
    { id: 'oracle-java-se', name: 'Oracle Java SE', type: 'proprietary', owner: 'Oracle', apps: ['dashboard-ui'], status: 'active' },
];
const initialProductLicensing: Omit<ProductLicensing, '_id'>[] = [
    { id: 'pl-onestopshop', product_id: 'OneStopShopPortal', license_model: 'hybrid', entitlements: ['premium-support', 'analytics-module'], package_included: true, validity: 'Perpetual', compliance: 'Audited' },
];
const fullSpecifications: Omit<Specification, '_id'>[] = [
    { _id: 'StandardVirtual', name: 'Standard Virtual Server', hw_type: { id: 'Virtual', name: 'Virtual' }, vendor: 'Generic', clusterName: 'Standard K8s Cluster', nodeCount: { controlPlane: 3, worker: 5 }, nodes: [] },
    { _id: 'HPE-Blade-Gen11', name: 'HPE Blade Gen11', hw_type: { id: 'Blade', name: 'Blade' }, vendor: 'HPE', bladeCount: 8, symmetric: true, blades: [{ name: "Blade Template", hasGpu: true, cpuType: 'Intel_Xeon_Scalable', cpuCores: 32, memory: 256, diskType: 'SSD_NVMe_U2_PCIeGen4', diskCapacity: 4096 }] }
];
const initialPlatformFoundations: any[] = [
    { _id: 'pf-k8s-standard', id: 'pf-k8s-standard', name: 'Standard Kubernetes Foundation', specification: { _id: 'StandardVirtual', id: 'StandardVirtual', name: 'StandardVirtual' }, kubernetes: { distribution: 'k3s', controlPlaneNodes: [{id: 'cp-1', label: 'cp-1'}], workerNodes: [{id: 'w-1', label: 'w-1'}] } }
];
const initialDevEnvironments: Omit<DevelopmentEnvironment, '_id'>[] = [
    { name: 'OSS-Dev-Env', productId: 'OneStopShopPortal', productName: 'OneStopShop Portal', specificationId: 'StandardVirtual', specName: 'Standard Virtual Server', createdAt: new Date().toISOString(), createdBy: 'seeduser', status: 'READY' },
];
const initialTestEnvironments: Omit<TestEnvironment, '_id'>[] = [
    { name: 'OSS-Perf-Test-Env', productId: 'OneStopShopPortal', productName: 'OneStopShop Portal', specificationId: 'HPE-Blade-Gen11', specName: 'HPE Blade Gen11', createdAt: new Date().toISOString(), createdBy: 'seeduser', status: 'PROVISIONING' },
];
const initialSimulators: Omit<Simulator, '_id'>[] = [
    { _id: 'sim-network-latency', name: 'Network Latency Simulator', dockerImage: 'slowdown/net-latency:latest' },
];
const initialEmulators: Omit<Emulator, '_id'>[] = [
    { _id: 'emu-arm64-qemu', name: 'ARM64 QEMU Emulator', dockerImage: 'qemu/arm64:latest' },
];
const initialSdkApps: Omit<SdkApp, '_id'>[] = [
    { projectName: 'billing-service-sdk', group: 'com.acme.billing', dependencies: [{ id: 'sql-postgres', name: 'SQL Database (PostgreSQL)', description: 'Adds JDBC driver and configuration for PostgreSQL.', group: 'Databases' }], environmentType: 'development', environmentId: 'OSS-Dev-Env', status: 'READY', version: '1.0.0' }
];

const initialProducts: Omit<Product, '_id'>[] = [
    {
        name: 'OneStopShop Portal',
        owner: 'Alice',
        owner_email: 'alice@example.com',
        product_image: 'https://picsum.photos/seed/product1/400/400',
        approval_needed: true,
        default_workflow: { id: 'wf-standard', name: 'Standard Approval Workflow' },
        custom_workflows: [],
        cmdb: { id: 'cmdb-main', name: 'Main CMDB' },
        compliance_checks: [{ id: 'cc-pci', name: 'PCI DSS' }],
        deployment_type: { id: 'dt-cloud', name: 'Cloud' },
        git_repo: 'https://github.com/example/onestopshop',
        artifacts_repo: 'https://jfrog.example.com/artifactory/onestopshop',
        pipeline: 'https://jenkins.example.com/job/onestopshop',
        specifications: [{ id: 'StandardVirtual', name: 'Standard Virtual Server' }],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        version: '1.2.3',
    }
];

const initialTenants: Omit<CmdbTenant, '_id'>[] = [
    {
        id: 'acme-corp',
        name: 'ACME Corporation',
        description: 'Primary tenant for ACME Corporation.',
        version: '1.0.0',
        products: [{ id: 'OneStopShopPortal', name: 'OneStopShop Portal' }],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        phases: [],
    }
];

const initialComponents: Omit<CmdbComponent, '_id'>[] = [
    {
        id: 'auth-service',
        name: 'Authentication Service',
        version: '2.1.0',
        tenants: [{ id: 'acme-corp', name: 'ACME Corporation' }],
        phases: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        provided_interfaces: [{id: 'auth-api-v2', name: 'Authentication API v2'}]
    }
];

const initialApplications: Omit<CmdbApplication, '_id'>[] = [
    {
        id: 'dashboard-ui',
        name: 'Dashboard UI',
        version: '1.5.0',
        tenants: [{ id: 'acme-corp', name: 'ACME Corporation' }],
        dependent_components: [{ id: 'auth-service', name: 'Authentication Service' }],
        dependent_interfaces: [{ id: 'auth-api-v2', name: 'Authentication API v2' }],
        phases: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    }
];

const initialInterfaceTypes: Omit<CmdbInterfaceType, '_id'>[] = [
    { id: 'rest-api', name: 'REST API', description: 'A RESTful API endpoint' }
];

const initialInterfaces: Omit<CmdbInterface, '_id'>[] = [
    {
        id: 'auth-api-v2',
        name: 'Authentication API v2',
        type: { id: 'rest-api', name: 'REST API' },
        version: '2.1.0',
        owner_name: 'Auth Team',
        owner_email: 'auth-team@example.com',
        source: { id: 'auth-service', name: 'Authentication Service' },
        security: { internal: { secure: true, authentication: true }, external: { secure: true, authentication: true } },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    }
];

const initialWorkflows: any[] = [
  { _id: 'wf-standard', id: 'wf-standard', name: 'Standard Approval Workflow', description: 'Default workflow for approvals.'}
];

const initialComplianceChecks: any[] = [
  { _id: 'cc-pci', id: 'cc-pci', name: 'PCI DSS', description: 'Payment Card Industry Data Security Standard'}
];

const initialDeploymentTypes: any[] = [
  { _id: 'dt-cloud', id: 'dt-cloud', name: 'Cloud', description: 'Standard cloud deployment.'}
];

const initialBaselines: Omit<Baseline, '_id'>[] = [
    {
        _id: 'OneStopShopPortal_1.2.3_baseline',
        product: { id: 'OneStopShopPortal', name: 'OneStopShop Portal', version: '1.2.3' },
        specifications: [{ id: 'StandardVirtual', name: 'Standard Virtual Server', version: '1.0' }],
        tenants: [{
            id: 'acme-corp',
            name: 'ACME Corporation',
            version: '1.0.0',
            components: [{id: 'auth-service', name: 'Authentication Service', version: '2.1.0'}],
            applications: [{id: 'dashboard-ui', name: 'Dashboard UI', version: '1.5.0'}]
        }],
        status: 'RELEASED',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: 'seeduser',
        artifacts: [],
        package_properties: { location: '', checksum_md5: '', checksum_sha256: '' }
    }
];
const initialDeployments: Omit<Deployment, '_id'>[] = [
    {
        _id: 'DEP-US-001',
        productId: 'OneStopShopPortal',
        specificationId: 'StandardVirtual',
        hypervisorId: 'vmware-esxi',
        foundationComponentIds: ['auth-service'],
        security: {},
        details: {
            deploymentId: 'DEP-US-001',
            customer: 'ACME Corporation',
            country: 'United States',
            region: 'Americas'
        },
        createdBy: 'seeduser',
        createdAt: new Date().toISOString(),
        status: 'ACTIVE'
    }
];

export async function seedDatabase() {
  const client = await clientPromise;
  const db = client.db();
  
  let seededCount = 0;
  let skippedCount = 0;

  const seedCollection = async (collectionName: string, data: any[]) => {
    const collection = db.collection(collectionName);
    const count = await collection.countDocuments();
    if (count === 0 && data.length > 0) {
      if (collectionName === 'products') {
        const productsWithId = data.map(p => ({...p, _id: p.name.replace(/[^a-zA-Z0-9]/g, '')}));
        await collection.insertMany(productsWithId);
      } else if (collectionName.startsWith('cmdb_') || collectionName.startsWith('specification_') || ['workflows', 'compliance_checks', 'deployment_types', 'service_contracts', 'licenses', 'product_licensing', 'baselines', 'deployments', 'platform_foundations', 'simulators', 'emulators'].includes(collectionName)) {
         await collection.insertMany(data.map(d => ({ ...d, _id: d.id || d._id })));
      } else if (collectionName.startsWith('settings_approval_') || collectionName.startsWith('sdk_apps')) {
          await collection.insertMany(data);
      }
       else {
        await collection.insertMany(data);
      }
      seededCount++;
      console.log(`Seeded ${collectionName} with ${data.length} documents.`);
    } else {
      skippedCount++;
      console.log(`Skipped seeding ${collectionName}: collection is not empty or no data to seed.`);
    }
  };
  
  await seedCollection('app_catalog', appCatalogData);
  await seedCollection('products', initialProducts);
  await seedCollection('cmdb_tenants', initialTenants);
  await seedCollection('cmdb_components', initialComponents);
  await seedCollection('cmdb_applications', initialApplications);
  await seedCollection('cmdb_interface_types', initialInterfaceTypes);
  await seedCollection('cmdb_interfaces', initialInterfaces);
  await seedCollection('workflows', initialWorkflows);
  await seedCollection('compliance_checks', initialComplianceChecks);
  await seedCollection('deployment_types', initialDeploymentTypes);
  await seedCollection('service_contracts', initialServiceContracts);
  await seedCollection('specification_vendors', initialSpecVendors);
  await seedCollection('specification_hw_types', initialSpecHwTypes);
  await seedCollection('specification_network_cards', initialSpecNetworkCards);
  await seedCollection('specification_plug_power_cords', initialSpecPlugPowerCords);
  await seedCollection('specification_cpu_types', initialSpecCpuTypes);
  await seedCollection('specification_gpu_types', initialSpecGpuTypes);
  await seedCollection('specification_disk_types', initialSpecDiskTypes);
  await seedCollection('specification_hypervisors', initialSpecHypervisors);
  await seedCollection('licenses', initialLicenses);
  await seedCollection('product_licensing', initialProductLicensing);
  await seedCollection('specifications', fullSpecifications);
  await seedCollection('platform_foundations', initialPlatformFoundations);
  await seedCollection('development_environments', initialDevEnvironments);
  await seedCollection('test_environments', initialTestEnvironments);
  await seedCollection('simulators', initialSimulators);
  await seedCollection('emulators', initialEmulators);
  await seedCollection('sdk_apps', initialSdkApps);
  await seedCollection('baselines', initialBaselines);
  await seedCollection('deployments', initialDeployments);

  // Seed settings collections
  await seedCollection('settings_tenant_onboarding', [{ ...initialTenantOnboarding, _id: 'default_tenant_onboarding_v1' }]);
  await seedCollection('settings_component_onboarding', [{ ...initialComponentOnboarding, _id: 'default_component_onboarding_v1' }]);
  await seedCollection('settings_application_onboarding', [{ ...initialApplicationOnboarding, _id: 'default_application_onboarding_v1' }]);
  await seedCollection('settings_baseline_onboarding', [{ ...initialTenantOnboarding, _id: 'default_baseline_validation_v1', name: 'Baseline Validation'}]);
  
  for (const config of initialApprovalConfigs) {
    await seedCollection(config.collectionName, config.data);
  }

  // After seeding, generate dependency trees
  await generateAndStoreAllProductTrees();
  
  return { seededCount, skippedCount };
}


    