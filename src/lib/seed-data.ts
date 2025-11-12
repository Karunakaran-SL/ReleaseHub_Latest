

import clientPromise from '@/lib/mongodb';
import { generateAndStoreAllProductTrees } from '@/lib/dependency-graph';
import type { Product, CmdbTenant, CmdbComponent, CmdbApplication, CmdbInterfaceType, CmdbInterface, OnboardingConfiguration } from './definitions';


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

const initialBaselineConfig: Omit<OnboardingConfiguration, '_id'> = {
  name: 'Baseline Onboarding',
  version: 1,
  phases: [
    {
      id: "phase-sanity-test",
      name: "Sanity Test",
      ownerName: "DevOps",
      ownerEmail: "devops@example.com",
      sendEmailOnComplete: true,
      statusOptions: ["Not Started", "In Progress", "Passed", "Failed"],
      fields: [
        { type: "Link", name: "ciJobUrl", label: "CI Job URL", proof: true },
        { type: "DropDown", name: "triggerMethod", label: "Trigger Method", options: ["manual", "auto"] },
        { type: "TextField", name: "status", label: "Status" },
        { type: "Link", name: "logsLink", label: "Logs Link", proof: true },
      ],
    },
    {
      id: "phase-static-analysis",
      name: "Static Code Analysis",
      ownerName: "Security Team",
      ownerEmail: "security@example.com",
      sendEmailOnComplete: true,
      statusOptions: ["Not Started", "In Progress", "Completed", "Failed"],
      fields: [
        { type: "TextField", name: "toolUsed", label: "Tool Used", helpText: "e.g., SonarQube, ESLint" },
        { type: "TextField", name: "score", label: "Score" },
        { type: "TextField", name: "issuesSummary", label: "Issues Summary" },
        { type: "Link", name: "reportUrl", label: "Report URL", proof: true },
      ],
    },
    {
        id: "phase-vulnerability-scan",
        name: "Vulnerability / Malware Scan",
        ownerName: "Security Team",
        ownerEmail: "security@example.com",
        sendEmailOnComplete: true,
        statusOptions: ["Not Started", "In Progress", "Completed", "Failed"],
        fields: [
            { type: "TextField", name: "scannerTool", label: "Scanner Tool", helpText: "e.g., Snyk, Trivy" },
            { type: "TextField", name: "cveList", label: "CVE List (comma-separated)"},
            { type: "TextField", name: "severityBreakdown", label: "Severity Breakdown" },
            { type: "Link", name: "reportUrl", label: "Report URL", proof: true },
        ]
    },
    {
        id: "phase-risk-scoping",
        name: "Risk Scoping",
        ownerName: "Risk Management",
        ownerEmail: "risk@example.com",
        sendEmailOnComplete: false,
        statusOptions: ["Not Started", "In Progress", "Completed"],
        fields: [
            { type: "TextField", name: "riskCategories", label: "Risk Categories" },
            { type: "DropDown", name: "impactLevel", label: "Impact Level", options: ["Low", "Medium", "High", "Critical"] },
            { type: "TextField", name: "mitigationPlan", label: "Mitigation Plan", proof: true },
            { type: "TextField", name: "owner", label: "Owner" },
        ]
    },
    {
        id: "phase-pen-testing",
        name: "Penetration Testing",
        ownerName: "External Security",
        ownerEmail: "pentest@example.com",
        sendEmailOnComplete: true,
        statusOptions: ["Not Started", "In Progress", "Completed", "Failed"],
        fields: [
            { type: "TextField", name: "testScope", label: "Test Scope" },
            { type: "RadioBox", name: "testType", label: "Test Type", options: ["External", "Internal"] },
            { type: "TextField", name: "findings", label: "Findings Summary", proof: true },
            { type: "DropDown", name: "remediationStatus", label: "Remediation Status", options: ["Pending", "In Progress", "Completed"] },
        ]
    },
    {
        id: "phase-functional-tests",
        name: "Functional Tests",
        ownerName: "QA Team",
        ownerEmail: "qa@example.com",
        sendEmailOnComplete: true,
        statusOptions: ["Not Started", "In Progress", "Passed", "Failed"],
        fields: [
            { type: "TextField", name: "testSuiteName", label: "Test Suite Name" },
            { type: "TextField", name: "coverage", label: "Coverage %" },
            { type: "TextField", name: "passFailSummary", label: "Pass/Fail Summary" },
            { type: "Link", name: "testResultsLink", label: "Link to Test Results", proof: true },
        ]
    },
    {
        id: "phase-non-functional-tests",
        name: "Non-Functional Tests",
        ownerName: "Performance Team",
        ownerEmail: "performance@example.com",
        sendEmailOnComplete: true,
        statusOptions: ["Not Started", "In Progress", "Passed", "Failed"],
        fields: [
            { type: "DropDown", name: "testType", label: "Type", options: ["Load", "Stress", "Scalability"] },
            { type: "TextField", name: "metrics", label: "Metrics (TPS, latency, etc.)" },
            { type: "TextField", name: "thresholds", label: "Thresholds" },
            { type: "TextField", name: "resultSummary", label: "Result Summary", proof: true },
        ]
    },
    {
        id: "phase-qa-report",
        name: "QA Report",
        ownerName: "QA Lead",
        ownerEmail: "qalead@example.com",
        sendEmailOnComplete: true,
        statusOptions: ["Not Started", "In Progress", "Approved", "Rejected"],
        fields: [
            { type: "TextField", name: "qaOwner", label: "QA Owner" },
            { type: "TextField", name: "summary", label: "Summary", proof: true },
            { type: "TextField", name: "issues", label: "Open Issues" },
            { type: "DropDown", name: "finalVerdict", label: "Final Verdict", options: ["GO", "NO-GO"] },
        ]
    },
    {
        id: "phase-approvals",
        name: "Approvals",
        ownerName: "Management",
        ownerEmail: "mgmt@example.com",
        sendEmailOnComplete: false,
        statusOptions: ["Pending", "Approved", "Rejected"],
        fields: [
            { type: "TextField", name: "approverList", label: "Approver List" },
            { type: "TextField", name: "approvalStatus", label: "Approval Status" },
            { type: "TextField", name: "comments", label: "Comments", proof: true },
            { type: "TextField", name: "timestamp", label: "Timestamp" },
        ]
    },
    {
        id: "phase-uat",
        name: "User Acceptance Test (UAT)",
        ownerName: "Business Owner",
        ownerEmail: "business@example.com",
        sendEmailOnComplete: true,
        statusOptions: ["Not Started", "In Progress", "Signed-off", "Rejected"],
        fields: [
            { type: "TextField", name: "testCases", label: "Test Cases" },
            { type: "TextField", name: "businessOwner", label: "Business Owner" },
            { type: "TextField", name: "feedback", label: "Feedback", proof: true },
            { type: "DropDown", name: "signOffStatus", label: "Sign-off Status", options: ["Pending", "Approved", "Rejected"] },
        ]
    },
    {
        id: "phase-ux-approval",
        name: "UX Approval",
        ownerName: "UX Team",
        ownerEmail: "ux@example.com",
        sendEmailOnComplete: false,
        statusOptions: ["Pending", "Approved", "Rejected"],
        fields: [
            { type: "TextField", name: "uxReviewer", label: "UX Reviewer" },
            { type: "Link", name: "designChecklist", label: "Design Checklist", proof: true },
            { type: "TextField", name: "accessibilityScore", label: "Accessibility Score" },
            { type: "DropDown", name: "approvalStatus", label: "Approval Status", options: ["Pending", "Approved", "Rejected"] },
        ]
    },
    {
        id: "phase-export-compliance",
        name: "Export Compliance",
        ownerName: "Legal Team",
        ownerEmail: "legal@example.com",
        sendEmailOnComplete: false,
        statusOptions: ["Pending", "Approved", "Rejected"],
        fields: [
            { type: "TextField", name: "region", label: "Region" },
            { type: "Link", name: "complianceChecklist", label: "Compliance Checklist", proof: true },
            { type: "DropDown", name: "legalReviewStatus", label: "Legal Review Status", options: ["Pending", "Approved", "Rejected"] },
        ]
    },
    {
        id: "phase-license-validations",
        name: "License Validations",
        ownerName: "Legal Team",
        ownerEmail: "legal@example.com",
        sendEmailOnComplete: false,
        statusOptions: ["Pending", "Completed", "Failed"],
        fields: [
            { type: "TextField", name: "licenseTypes", label: "License Types" },
            { type: "TextField", name: "compatibility", label: "Compatibility" },
            { type: "TextField", name: "violations", label: "Violations", proof: true },
            { type: "TextField", name: "legalNotes", label: "Legal Notes" },
        ]
    },
    {
        id: "phase-contract-testing",
        name: "Contract Testing",
        ownerName: "API Governance",
        ownerEmail: "governance@example.com",
        sendEmailOnComplete: true,
        statusOptions: ["Not Started", "In Progress", "Passed", "Failed"],
        fields: [
            { type: "TextField", name: "consumerProviderServices", label: "Consumer/Provider Services" },
            { type: "Link", name: "pactFileUrl", label: "Pact File URL", proof: true },
            { type: "TextField", name: "testResult", label: "Test Result" },
            { type: "TextField", name: "versionCompatibility", label: "Version Compatibility" },
        ]
    }
  ],
};


const initialProducts: Omit<Product, '_id' | 'created_at' | 'updated_at'>[] = [
  {
    "name": "OneStopShop Portal",
    "owner": "Platform Engineering", "owner_email": "platform@example.com",
    "product_image": "https://picsum.photos/seed/OneStopShopPortal/40/40",
    "approval_needed": true,
    "default_workflow": { "id": "StandardApproval", "name": "Standard Approval" },
    "custom_workflows": [],
    "compliance_checks": [{ "id": "SOC2", "name": "SOC2" }, { "id": "GDPR", "name": "GDPR" }],
    "deployment_type": { "id": "Cloud", "name": "Cloud" },
    "git_repo": "http://git.example.com/platform/oss-portal",
    "artifacts_repo": "http://artifacts.example.com/oss-portal",
    "pipeline": "http://cicd.example.com/oss-portal",
    "specifications": [{ "id": "ArgoCDSyncSpec", "name": "ArgoCD Sync Spec" }, { "id": "SingleSignOnSpec", "name": "Single Sign-On Spec" }],
    "version": "1.0.0",
  },
  {
    "name": "Unified Data Fabric",
    "owner": "Data Platform Team", "owner_email": "data-platform@example.com",
    "product_image": "https://picsum.photos/seed/UnifiedDataFabric/40/40",
    "approval_needed": true,
    "default_workflow": { "id": "DataGovernanceReview", "name": "Data Governance Review" },
    "custom_workflows": [],
    "compliance_checks": [{ "id": "HIPAA", "name": "HIPAA" }],
    "deployment_type": { "id": "Cloud", "name": "Cloud" },
    "git_repo": "http://git.example.com/platform/data-fabric",
    "artifacts_repo": "http://artifacts.example.com/data-fabric",
    "pipeline": "http://cicd.example.com/data-fabric",
    "specifications": [{ "id": "SparkProcessing", "name": "Spark Processing" }, { "id": "KafkaStreaming", "name": "Kafka Streaming" }],
    "version": "1.0.0",
  }
];

const initialServiceContracts = [
    { id: 'ServiceContract_ProSupport_Plus', name: 'ProSupport Plus', description: '24/7 premium hardware and software support.'},
    { id: 'ServiceContract_Foundation_Care', name: 'Foundation Care', description: 'Basic hardware support.'},
    { id: 'CommunitySupport', name: 'Community Support', description: 'Community-based support for open-source software.'}
];

const initialSpecifications = [
  { "name": "ArgoCD Sync Spec", "vendor": "CNCF", service_contract_type: { id: 'CommunitySupport', name: 'Community Support' } },
  { "name": "Single Sign-On Spec", "vendor": "OpenID", service_contract_type: { id: 'CommunitySupport', name: 'Community Support' } },
  { "name": "Spark Processing", "vendor": "Apache", service_contract_type: { id: 'CommunitySupport', name: 'Community Support' } },
  { "name": "Kafka Streaming", "vendor": "Apache", service_contract_type: { id: 'CommunitySupport', name: 'Community Support' } },
  { "name": "Kubeflow Pipelines", "vendor": "Google", service_contract_type: { id: 'ServiceContract_ProSupport_Plus', name: 'ProSupport Plus' } },
  { "name": "PyTorch Distribution", "vendor": "Facebook", service_contract_type: { id: 'CommunitySupport', name: 'Community Support' } },
  { "name": "KubeEdge Node Spec", "vendor": "CNCF", service_contract_type: { id: 'CommunitySupport', name: 'Community Support' } },
  { "name": "MQTT Broker Spec", "vendor": "OASIS", service_contract_type: { id: 'CommunitySupport', name: 'Community Support' } },
  { "name": "Istio Service Mesh", "vendor": "CNCF", service_contract_type: { id: 'CommunitySupport', name: 'Community Support' } },
  { "name": "SPIFFE Identity", "vendor": "CNCF", service_contract_type: { id: 'CommunitySupport', name: 'Community Support' } }
];

const fullSpecifications = initialSpecifications.map(spec => ({
    _id: spec.name.replace(/[^a-zA-Z0-9]/g, ''),
    id: spec.name.replace(/[^a-zA-Z0-9]/g, ''),
    ...spec,
    hw_type: { "id": "Virtual", "name": "Virtual" },
    total_cpu: 32, 
    memory_gb: 128, 
    storage_gb: 1024,
    hypervisor: { "id": "KVM", "name": "KVM" },
    image: `https://picsum.photos/seed/${spec.name.replace(/[^a-zA-Z0-9]/g, '')}/40/40`,
    contact_point_email: "community@cncf.io",
    contact_point_phone: "N/A",
    network_cards: [{ "id": "VirtualNIC10Gbps", "name": "Virtual NIC 10Gbps" }],
    plug_power_cords: [{ "id": "VirtualPower", "name": "Virtual Power" }],
    custom_fields: [{ "key": "ManagedBy", "value": "Platform Team" }],
    created_at: new Date().toISOString(), 
    updated_at: new Date().toISOString()
}));


const initialDeploymentTypes = [
    { "name": "Airgapped", "description": "Deployment in an isolated, offline environment." },
    { "name": "Cloud", "description": "Deployment to a public or private cloud." },
    { "name": "On-Prem", "description": "Deployment to on-premises servers." }
];

const initialWorkflows = [
    { "name": "Standard Approval", "description": "Standard linear workflow." },
    { "name": "Data Governance Review", "description": "Workflow with parallel approval steps." },
    { "name": "Hardware Compatibility Review", "description": "Security review for hardware." },
    { "name": "Peer Security Review", "description": "Mandatory security review for sensitive products." }
];

const initialComplianceChecks = [
    { "name": "SOC2", "description": "SOC 2 Type II Compliance" },
    { "name": "GDPR", "description": "General Data Protection Regulation" },
    { "name": "HIPAA", "description": "Health Insurance Portability and Accountability Act" },
    { "name": "PCI-DSS", "description": "Payment Card Industry Data Security Standard" },
];

const initialInterfaceTypes: Omit<CmdbInterfaceType, '_id'>[] = [
    { id: 'REST', name: 'REST API' },
    { id: 'GraphQL', name: 'GraphQL API' },
    { id: 'gRPC', name: 'gRPC Service' },
    { id: 'KafkaTopic', name: 'Kafka Topic' },
    { id: 'DatabaseConnection', name: 'Database Connection' },
];

function generatePhases(config: OnboardingConfiguration) {
    return config.phases.map(phaseConfig => {
        const statuses = phaseConfig.statusOptions;
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
        return {
            id: phaseConfig.id,
            name: phaseConfig.name,
            version: "1.0",
            status: randomStatus,
            fields: phaseConfig.fields.map(fieldConfig => ({
                name: fieldConfig.name,
                value: `Dummy value for ${fieldConfig.label}`,
                proof: { link: fieldConfig.proof ? `http://example.com/proof/${phaseConfig.id}/${fieldConfig.name}` : '' },
            })),
        };
    });
}

const initialTenants: Omit<CmdbTenant, '_id'| 'created_at' | 'updated_at'>[] = [
    { id: 'CorePlatformServices', name: 'Core Platform Services', description: 'Holds core infrastructure components.', version: '2.0.0', products: [{id: 'OneStopShopPortal', name: 'OneStopShop Portal'}, {id: 'UnifiedDataFabric', name: 'Unified Data Fabric'}], phases: generatePhases(initialTenantOnboarding as OnboardingConfiguration) },
    { id: 'CustomerAnalytics', name: 'Customer Analytics', description: 'Tenant for customer-facing analytics dashboards.', version: '1.5.0', products: [{id: 'UnifiedDataFabric', name: 'Unified Data Fabric'}], dependent_tenants: [{id: 'CorePlatformServices', name: 'Core Platform Services', version: '2.0.0'}], phases: generatePhases(initialTenantOnboarding as OnboardingConfiguration) },
    { id: 'RetailOperations', name: 'Retail Operations', description: 'Manages retail and e-commerce services.', version: '1.2.0', products: [{id: 'OneStopShopPortal', name: 'OneStopShop Portal'}], dependent_tenants: [{id: 'CorePlatformServices', name: 'Core Platform Services', version: '2.0.0'}], phases: generatePhases(initialTenantOnboarding as OnboardingConfiguration) },
    { id: 'SupplyChainLogistics', name: 'Supply Chain Logistics', description: 'Tenant for SCM and logistics.', version: '3.0.0', products: [{id: 'OneStopShopPortal', name: 'OneStopShop Portal'}], dependent_tenants: [{id: 'RetailOperations', name: 'Retail Operations', version: '1.2.0'}], phases: generatePhases(initialTenantOnboarding as OnboardingConfiguration) },
    { id: 'MarketingAutomation', name: 'Marketing Automation', description: 'Handles marketing campaigns and user outreach.', version: '1.0.0', products: [{id: 'OneStopShopPortal', name: 'OneStopShop Portal'}], dependent_tenants: [{id: 'CustomerAnalytics', name: 'Customer Analytics', version: '1.5.0'}], phases: generatePhases(initialTenantOnboarding as OnboardingConfiguration) },
    { id: 'FraudDetection', name: 'Fraud Detection', description: 'Real-time fraud detection services.', version: '2.1.0', products: [{id: 'UnifiedDataFabric', name: 'Unified Data Fabric'}], dependent_tenants: [{id: 'CorePlatformServices', name: 'Core Platform Services', version: '2.0.0'}], phases: generatePhases(initialTenantOnboarding as OnboardingConfiguration) },
    { id: 'BillingAndPayments', name: 'Billing and Payments', description: 'Handles all financial transactions.', version: '4.0.0', products: [{id: 'OneStopShopPortal', name: 'OneStopShop Portal'}], dependent_tenants: [{id: 'CorePlatformServices', name: 'Core Platform Services', version: '2.0.0'}], phases: generatePhases(initialTenantOnboarding as OnboardingConfiguration) },
    { id: 'HumanResources', name: 'Human Resources', description: 'Internal HR systems.', version: '1.8.0', products: [{id: 'OneStopShopPortal', name: 'OneStopShop Portal'}], phases: generatePhases(initialTenantOnboarding as OnboardingConfiguration) },
    { id: 'DataScienceWorkbench', name: 'Data Science Workbench', description: 'Environment for data scientists.', version: '1.3.0', products: [{id: 'UnifiedDataFabric', name: 'Unified Data Fabric'}], dependent_tenants: [{id: 'CustomerAnalytics', name: 'Customer Analytics', version: '1.5.0'}], phases: generatePhases(initialTenantOnboarding as OnboardingConfiguration) },
    { id: 'IoTPlatform', name: 'IoT Platform', description: 'Platform for managing IoT devices.', version: '2.5.0', products: [{id: 'UnifiedDataFabric', name: 'Unified Data Fabric'}], dependent_tenants: [{id: 'CorePlatformServices', name: 'Core Platform Services', version: '2.0.0'}], phases: generatePhases(initialTenantOnboarding as OnboardingConfiguration) },
];

const initialComponents: Omit<CmdbComponent, '_id' | 'created_at' | 'updated_at'>[] = [
    { id: 'AuthNService', name: 'AuthN Service', version: '3.1.0', tenants: [{id: 'CorePlatformServices', name: 'Core Platform Services'}], provided_interfaces: [{id: 'AuthNTokenAPI', name: 'AuthN Token API'}], phases: generatePhases(initialComponentOnboarding as OnboardingConfiguration) },
    { id: 'AuthZService', name: 'AuthZ Service', version: '2.5.0', tenants: [{id: 'CorePlatformServices', name: 'Core Platform Services'}], provided_interfaces: [{id: 'AuthZCheckAPI', name: 'AuthZ Check API'}], dependent_interfaces: [{id: 'AuthNTokenAPI', name: 'AuthN Token API'}], phases: generatePhases(initialComponentOnboarding as OnboardingConfiguration) },
    { id: 'DataIngestor', name: 'Data Ingestor', version: '1.8.0', tenants: [{id: 'CorePlatformServices', name: 'Core Platform Services'}], provided_interfaces: [{id: 'DataIngestTopic', name: 'Data Ingest Topic'}], phases: generatePhases(initialComponentOnboarding as OnboardingConfiguration) },
    { id: 'DataProcessor', name: 'Data Processor', version: '2.2.0', tenants: [{id: 'CustomerAnalytics', name: 'Customer Analytics'}], dependent_interfaces: [{id: 'DataIngestTopic', name: 'Data Ingest Topic'}], provided_interfaces: [{id: 'ProcessedAnalyticsTopic', name: 'Processed Analytics Topic'}], phases: generatePhases(initialComponentOnboarding as OnboardingConfiguration) },
    { id: 'ProductCatalog', name: 'Product Catalog', version: '4.0.0', tenants: [{id: 'RetailOperations', name: 'Retail Operations'}], provided_interfaces: [{id: 'ProductCatalogDB', name: 'Product Catalog DB'}], phases: generatePhases(initialComponentOnboarding as OnboardingConfiguration) },
    { id: 'InventoryService', name: 'Inventory Service', version: '3.5.0', tenants: [{id: 'RetailOperations', name: 'Retail Operations'}], dependent_interfaces: [{id: 'ProductCatalogDB', name: 'Product Catalog DB'}], provided_interfaces: [{id: 'InventoryCheckAPI', name: 'Inventory Check API'}], phases: generatePhases(initialComponentOnboarding as OnboardingConfiguration) },
    { id: 'ShippingCalculator', name: 'Shipping Calculator', version: '1.2.0', tenants: [{id: 'SupplyChainLogistics', name: 'Supply Chain Logistics'}], provided_interfaces: [{id: 'ShippingRateAPI', name: 'Shipping Rate API'}], phases: generatePhases(initialComponentOnboarding as OnboardingConfiguration) },
    { id: 'ShipmentTracker', name: 'Shipment Tracker', version: '2.0.0', tenants: [{id: 'SupplyChainLogistics', name: 'Supply Chain Logistics'}], provided_interfaces: [{id: 'ShipmentStatusAPI', name: 'Shipment Status API'}], phases: generatePhases(initialComponentOnboarding as OnboardingConfiguration) },
    { id: 'EmailService', name: 'Email Service', version: '5.1.0', tenants: [{id: 'MarketingAutomation', name: 'Marketing Automation'}], provided_interfaces: [{id: 'SendEmailAPI', name: 'Send Email API'}], phases: generatePhases(initialComponentOnboarding as OnboardingConfiguration) },
    { id: 'PushNotificationService', name: 'Push Notification Service', version: '2.3.0', tenants: [{id: 'MarketingAutomation', name: 'Marketing Automation'}], provided_interfaces: [{id: 'SendPushAPI', name: 'Send Push API'}], phases: generatePhases(initialComponentOnboarding as OnboardingConfiguration) },
    { id: 'RiskEngine', name: 'Risk Engine', version: '3.0.0', tenants: [{id: 'FraudDetection', name: 'Fraud Detection'}], dependent_interfaces: [{id: 'DataIngestTopic', name: 'Data Ingest Topic'}], provided_interfaces: [{id: 'FraudScoreAPI', name: 'Fraud Score API'}], phases: generatePhases(initialComponentOnboarding as OnboardingConfiguration) },
    { id: 'PaymentGateway', name: 'Payment Gateway', version: '6.2.0', tenants: [{id: 'BillingAndPayments', name: 'Billing and Payments'}], provided_interfaces: [{id: 'ProcessPaymentAPI', name: 'Process Payment API'}], phases: generatePhases(initialComponentOnboarding as OnboardingConfiguration) },
    { id: 'InvoiceGenerator', name: 'Invoice Generator', version: '2.8.0', tenants: [{id: 'BillingAndPayments', name: 'Billing and Payments'}], provided_interfaces: [{id: 'InvoiceAPI', name: 'Invoice API'}], phases: generatePhases(initialComponentOnboarding as OnboardingConfiguration) },
    { id: 'PayrollProcessor', name: 'Payroll Processor', version: '4.1.0', tenants: [{id: 'HumanResources', name: 'Human Resources'}], phases: generatePhases(initialComponentOnboarding as OnboardingConfiguration) },
    { id: 'BenefitsManager', name: 'Benefits Manager', version: '1.5.0', tenants: [{id: 'HumanResources', name: 'Human Resources'}], phases: generatePhases(initialComponentOnboarding as OnboardingConfiguration) },
    { id: 'JupyterHub', name: 'Jupyter Hub', version: '2.0.0', tenants: [{id: 'DataScienceWorkbench', name: 'Data Science Workbench'}], phases: generatePhases(initialComponentOnboarding as OnboardingConfiguration) },
    { id: 'MLModelServing', name: 'ML Model Serving', version: '1.7.0', tenants: [{id: 'DataScienceWorkbench', name: 'Data Science Workbench'}], dependent_interfaces: [{id: 'ProcessedAnalyticsTopic', name: 'Processed Analytics Topic'}], phases: generatePhases(initialComponentOnboarding as OnboardingConfiguration) },
    { id: 'DeviceRegistry', name: 'Device Registry', version: '3.2.0', tenants: [{id: 'IoTPlatform', name: 'IoT Platform'}], provided_interfaces: [{id: 'DeviceRegistryAPI', name: 'Device Registry API'}], phases: generatePhases(initialComponentOnboarding as OnboardingConfiguration) },
    { id: 'MQTTBroker', name: 'MQTT Broker', version: '5.0.0', tenants: [{id: 'IoTPlatform', name: 'IoT Platform'}], dependent_interfaces: [{id: 'DeviceRegistryAPI', name: 'Device Registry API'}], phases: generatePhases(initialComponentOnboarding as OnboardingConfiguration) },
    { id: 'TimeSeriesDB', name: 'Time Series DB', version: '2.9.0', tenants: [{id: 'IoTPlatform', name: 'IoT Platform'}], phases: generatePhases(initialComponentOnboarding as OnboardingConfiguration) },
];

const initialApplications: Omit<CmdbApplication, '_id' | 'created_at' | 'updated_at'>[] = [
    { id: 'UserProfileApp', name: 'User Profile App', version: '1.5.0', tenants: [{id: 'CorePlatformServices', name: 'Core Platform Services'}], dependent_interfaces: [{id: 'AuthNTokenAPI', name: 'AuthN Token API'}, {id: 'AuthZCheckAPI', name: 'AuthZ Check API'}], phases: generatePhases(initialApplicationOnboarding as OnboardingConfiguration) },
    { id: 'AnalyticsDashboard', name: 'Analytics Dashboard', version: '2.1.0', tenants: [{id: 'CustomerAnalytics', name: 'Customer Analytics'}], dependent_interfaces: [{id: 'ProcessedAnalyticsTopic', name: 'Processed Analytics Topic'}], phases: generatePhases(initialApplicationOnboarding as OnboardingConfiguration) },
    { id: 'RetailStorefront', name: 'Retail Storefront', version: '3.2.0', tenants: [{id: 'RetailOperations', name: 'Retail Operations'}], dependent_interfaces: [{id: 'ProductCatalogDB', name: 'Product Catalog DB'}, {id: 'InventoryCheckAPI', name: 'Inventory Check API'}, {id: 'ProcessPaymentAPI', name: 'Process Payment API'}], phases: generatePhases(initialApplicationOnboarding as OnboardingConfiguration) },
    { id: 'WarehouseManager', name: 'Warehouse Manager', version: '1.8.0', tenants: [{id: 'SupplyChainLogistics', name: 'Supply Chain Logistics'}], dependent_interfaces: [{id: 'InventoryCheckAPI', name: 'Inventory Check API'}, {id: 'ShipmentStatusAPI', name: 'Shipment Status API'}], phases: generatePhases(initialApplicationOnboarding as OnboardingConfiguration) },
    { id: 'MarketingCampaignDashboard', name: 'Marketing Campaign Dashboard', version: '1.1.0', tenants: [{id: 'MarketingAutomation', name: 'Marketing Automation'}], dependent_interfaces: [{id: 'SendEmailAPI', name: 'Send Email API'}, {id: 'SendPushAPI', name: 'Send Push API'}], phases: generatePhases(initialApplicationOnboarding as OnboardingConfiguration) },
    { id: 'FraudAnalystConsole', name: 'Fraud Analyst Console', version: '2.4.0', tenants: [{id: 'FraudDetection', name: 'Fraud Detection'}], dependent_interfaces: [{id: 'FraudScoreAPI', name: 'Fraud Score API'}], phases: generatePhases(initialApplicationOnboarding as OnboardingConfiguration) },
    { id: 'BillingDashboard', name: 'Billing Dashboard', version: '3.0.0', tenants: [{id: 'BillingAndPayments', name: 'Billing and Payments'}], dependent_interfaces: [{id: 'InvoiceAPI', name: 'Invoice API'}], phases: generatePhases(initialApplicationOnboarding as OnboardingConfiguration) },
    { id: 'EmployeePortal', name: 'Employee Portal', version: '2.5.0', tenants: [{id: 'HumanResources', name: 'Human Resources'}], dependent_interfaces: [], phases: generatePhases(initialApplicationOnboarding as OnboardingConfiguration) },
    { id: 'DSModelBuilder', name: 'DS Model Builder', version: '1.9.0', tenants: [{id: 'DataScienceWorkbench', name: 'Data Science Workbench'}], dependent_interfaces: [], phases: generatePhases(initialApplicationOnboarding as OnboardingConfiguration) },
    { id: 'DeviceProvisioner', name: 'Device Provisioner', version: '2.2.0', tenants: [{id: 'IoTPlatform', name: 'IoT Platform'}], dependent_interfaces: [{id: 'DeviceRegistryAPI', name: 'Device Registry API'}], phases: generatePhases(initialApplicationOnboarding as OnboardingConfiguration) },
    { id: 'AdminConsole', name: 'Admin Console', version: '1.0.0', tenants: [{id: 'CorePlatformServices', name: 'Core Platform Services'}], dependent_interfaces: [{id: 'AuthZCheckAPI', name: 'AuthZ Check API'}], phases: generatePhases(initialApplicationOnboarding as OnboardingConfiguration) },
    { id: 'ReportGeneratorApp', name: 'Report Generator App', version: '1.2.0', tenants: [{id: 'CustomerAnalytics', name: 'Customer Analytics'}], dependent_interfaces: [{id: 'ProcessedAnalyticsTopic', name: 'Processed Analytics Topic'}], phases: generatePhases(initialApplicationOnboarding as OnboardingConfiguration) },
    { id: 'ShoppingCartApp', name: 'Shopping Cart App', version: '2.5.0', tenants: [{id: 'RetailOperations', name: 'Retail Operations'}], dependent_interfaces: [{id: 'InventoryCheckAPI', name: 'Inventory Check API'}, {id: 'ProcessPaymentAPI', name: 'Process Payment API'}], phases: generatePhases(initialApplicationOnboarding as OnboardingConfiguration) },
    { id: 'FleetManagementApp', name: 'Fleet Management App', version: '1.4.0', tenants: [{id: 'SupplyChainLogistics', name: 'Supply Chain Logistics'}], dependent_interfaces: [{id: 'ShipmentStatusAPI', name: 'Shipment Status API'}], phases: generatePhases(initialApplicationOnboarding as OnboardingConfiguration) },
    { id: 'ABTestingApp', name: 'A/B Testing App', version: '1.0.0', tenants: [{id: 'MarketingAutomation', name: 'Marketing Automation'}], dependent_interfaces: [], phases: generatePhases(initialApplicationOnboarding as OnboardingConfiguration) },
    { id: 'TransactionMonitor', name: 'Transaction Monitor', version: '3.1.0', tenants: [{id: 'FraudDetection', name: 'Fraud Detection'}], dependent_interfaces: [{id: 'FraudScoreAPI', name: 'Fraud Score API'}], phases: generatePhases(initialApplicationOnboarding as OnboardingConfiguration) },
    { id: 'SubscriptionManager', name: 'Subscription Manager', version: '2.0.0', tenants: [{id: 'BillingAndPayments', name: 'Billing and Payments'}], dependent_interfaces: [{id: 'ProcessPaymentAPI', name: 'Process Payment API'}], phases: generatePhases(initialApplicationOnboarding as OnboardingConfiguration) },
    { id: 'TimeOffManager', name: 'Time Off Manager', version: '1.3.0', tenants: [{id: 'HumanResources', name: 'Human Resources'}], dependent_interfaces: [], phases: generatePhases(initialApplicationOnboarding as OnboardingConfiguration) },
    { id: 'FeatureStoreApp', name: 'Feature Store App', version: '1.1.0', tenants: [{id: 'DataScienceWorkbench', name: 'Data Science Workbench'}], dependent_interfaces: [], phases: generatePhases(initialApplicationOnboarding as OnboardingConfiguration) },
    { id: 'DeviceMonitorDashboard', name: 'Device Monitor Dashboard', version: '2.0.0', tenants: [{id: 'IoTPlatform', name: 'IoT Platform'}], dependent_interfaces: [], phases: generatePhases(initialApplicationOnboarding as OnboardingConfiguration) },
];

const initialInterfaces: Omit<CmdbInterface, '_id' | 'created_at' | 'updated_at'>[] = [
    { id: 'AuthNTokenAPI', name: 'AuthN Token API', type: { id: 'REST', name: 'REST API' }, version: 'v3', owner_name: 'Auth Team', owner_email: 'auth@example.com', source: { id: 'AuthNService', name: 'AuthN Service' }, security: { internal: { secure: true, authentication: false }, external: { secure: false, authentication: false } } },
    { id: 'AuthZCheckAPI', name: 'AuthZ Check API', type: { id: 'gRPC', name: 'gRPC Service' }, version: 'v2', owner_name: 'Auth Team', owner_email: 'auth@example.com', source: { id: 'AuthZService', name: 'AuthZ Service' }, security: { internal: { secure: true, authentication: true }, external: { secure: false, authentication: false } } },
    { id: 'DataIngestTopic', name: 'Data Ingest Topic', type: { id: 'KafkaTopic', name: 'Kafka Topic' }, version: 'v1', owner_name: 'Data Platform', owner_email: 'data-platform@example.com', source: { id: 'DataIngestor', name: 'Data Ingestor' }, security: { internal: { secure: true, authentication: true }, external: { secure: false, authentication: false } } },
    { id: 'ProcessedAnalyticsTopic', name: 'Processed Analytics Topic', type: { id: 'KafkaTopic', name: 'Kafka Topic' }, version: 'v1', owner_name: 'Analytics Team', owner_email: 'analytics@example.com', source: { id: 'DataProcessor', name: 'Data Processor' }, security: { internal: { secure: true, authentication: true }, external: { secure: false, authentication: false } } },
    { id: 'ProductCatalogDB', name: 'Product Catalog DB', type: { id: 'DatabaseConnection', name: 'Database Connection' }, version: 'v1', owner_name: 'Retail Team', owner_email: 'retail@example.com', source: { id: 'ProductCatalog', name: 'Product Catalog' }, security: { internal: { secure: true, authentication: true }, external: { secure: false, authentication: false } } },
    { id: 'InventoryCheckAPI', name: 'Inventory Check API', type: { id: 'REST', name: 'REST API' }, version: 'v2', owner_name: 'Retail Team', owner_email: 'retail@example.com', source: { id: 'InventoryService', name: 'Inventory Service' }, security: { internal: { secure: true, authentication: true }, external: { secure: false, authentication: false } } },
    { id: 'ShippingRateAPI', name: 'Shipping Rate API', type: { id: 'GraphQL', name: 'GraphQL API' }, version: 'v1', owner_name: 'Logistics Team', owner_email: 'logistics@example.com', source: { id: 'ShippingCalculator', name: 'Shipping Calculator' }, security: { internal: { secure: true, authentication: true }, external: { secure: true, authentication: true } } },
    { id: 'ShipmentStatusAPI', name: 'Shipment Status API', type: { id: 'REST', name: 'REST API' }, version: 'v3', owner_name: 'Logistics Team', owner_email: 'logistics@example.com', source: { id: 'ShipmentTracker', name: 'Shipment Tracker' }, security: { internal: { secure: true, authentication: true }, external: { secure: true, authentication: true } } },
    { id: 'SendEmailAPI', name: 'Send Email API', type: { id: 'REST', name: 'REST API' }, version: 'v4', owner_name: 'Marketing Team', owner_email: 'marketing@example.com', source: { id: 'EmailService', name: 'Email Service' }, security: { internal: { secure: true, authentication: true }, external: { secure: false, authentication: false } } },
    { id: 'SendPushAPI', name: 'Send Push API', type: { id: 'REST', name: 'REST API' }, version: 'v2', owner_name: 'Marketing Team', owner_email: 'marketing@example.com', source: { id: 'PushNotificationService', name: 'Push Notification Service' }, security: { internal: { secure: true, authentication: true }, external: { secure: false, authentication: false } } },
    { id: 'FraudScoreAPI', name: 'Fraud Score API', type: { id: 'gRPC', name: 'gRPC Service' }, version: 'v3', owner_name: 'Security Team', owner_email: 'security@example.com', source: { id: 'RiskEngine', name: 'Risk Engine' }, security: { internal: { secure: true, authentication: true }, external: { secure: false, authentication: false } } },
    { id: 'ProcessPaymentAPI', name: 'Process Payment API', type: { id: 'REST', name: 'REST API' }, version: 'v5', owner_name: 'Billing Team', owner_email: 'billing@example.com', source: { id: 'PaymentGateway', name: 'Payment Gateway' }, security: { internal: { secure: true, authentication: true }, external: { secure: true, authentication: true } } },
    { id: 'InvoiceAPI', name: 'Invoice API', type: { id: 'GraphQL', name: 'GraphQL API' }, version: 'v2', owner_name: 'Billing Team', owner_email: 'billing@example.com', source: { id: 'InvoiceGenerator', name: 'Invoice Generator' }, security: { internal: { secure: true, authentication: true }, external: { secure: false, authentication: false } } },
    { id: 'DeviceRegistryAPI', name: 'Device Registry API', type: { id: 'REST', name: 'REST API' }, version: 'v1', owner_name: 'IoT Team', owner_email: 'iot@example.com', source: { id: 'DeviceRegistry', name: 'Device Registry' }, security: { internal: { secure: true, authentication: true }, external: { secure: false, authentication: false } } },
    ...Array.from({ length: 36 }, (_, i) => ({
        id: `ExternalInterface${i + 1}`,
        name: `External Interface ${i + 1}`,
        type: { id: i % 2 === 0 ? 'GraphQL' : 'REST', name: i % 2 === 0 ? 'GraphQL API' : 'REST API' },
        version: `v1`,
        owner_name: `Partner Team ${i + 1}`,
        owner_email: `partner${i + 1}@example.com`,
        source: { id: `Application${(i % 20) + 1}`, name: `Application ${(i % 20) + 1}` },
        security: { internal: { secure: true, authentication: true }, external: { secure: true, authentication: true } },
    })),
];


export async function seedDatabase() {
    const client = await clientPromise;
    const db = client.db();

    const collectionsToSeed = [
        { name: 'products', data: initialProducts.map(p => ({...p, _id: p.name.replace(/[^a-zA-Z0-9]/g, ''), created_at: new Date().toISOString(), updated_at: new Date().toISOString()})) },
        { name: 'specifications', data: fullSpecifications },
        { name: 'deployment_types', data: initialDeploymentTypes.map(d => ({ ...d, _id: d.name.replace(/[^a-zA-Z0-9]/g, '') })) },
        { name: 'workflows', data: initialWorkflows.map(w => ({ ...w, _id: w.name.replace(/[^a-zA-Z0-9]/g, '') })) },
        { name: 'compliance_checks', data: initialComplianceChecks.map(c => ({...c, _id: c.name.replace(/[^a-zA-Z0-9]/g, '')})) },
        { name: 'cmdb_tenants', data: initialTenants.map(t => ({ ...t, _id: t.id, created_at: new Date().toISOString(), updated_at: new Date().toISOString() })) },
        { name: 'cmdb_components', data: initialComponents.map(c => ({ ...c, _id: c.id, created_at: new Date().toISOString(), updated_at: new Date().toISOString() })) },
        { name: 'cmdb_applications', data: initialApplications.map(a => ({ ...a, _id: a.id, created_at: new Date().toISOString(), updated_at: new Date().toISOString() })) },
        { name: 'cmdb_interface_types', data: initialInterfaceTypes.map(i => ({ ...i, _id: i.id })) },
        { name: 'cmdb_interfaces', data: initialInterfaces.map(i => ({ ...i, _id: i.id, created_at: new Date().toISOString(), updated_at: new Date().toISOString() })) },
        { name: 'settings_application_onboarding', data: [initialApplicationOnboarding] },
        { name: 'settings_component_onboarding', data: [initialComponentOnboarding] },
        { name: 'settings_tenant_onboarding', data: [initialTenantOnboarding] },
        { name: 'settings_baseline_onboarding', data: [initialBaselineConfig] },
        { name: 'service_contracts', data: initialServiceContracts.map(s => ({...s, _id: s.id})) },
    ];
    
    let seededCount = 0;
    let skippedCount = 0;

    for (const collection of collectionsToSeed) {
        const count = await db.collection(collection.name).countDocuments();
        if (count === 0) {
            await db.collection(collection.name).insertMany(collection.data as any[]);
            seededCount++;
        } else {
            skippedCount++;
        }
    }
    
    await generateAndStoreAllProductTrees();

    return { seededCount, skippedCount };
}

    
