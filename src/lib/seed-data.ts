

import clientPromise from '@/lib/mongodb';
import { generateAndStoreAllProductTrees } from '@/lib/dependency-graph';
import type { Product, CmdbTenant, CmdbComponent, CmdbApplication, CmdbInterfaceType, CmdbInterface, OnboardingConfiguration, License, ProductLicensing, Specification, Deployment, Simulator, Emulator, DevelopmentEnvironment, TestEnvironment, SdkApp } from './definitions';


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
        name: config.name,
        version: 1,
        phases: initialDefaultApprovalPhases,
    }]
}));

const initialSpecVendors = [{ name: 'Dell EMC' }, { name: 'HPE' }, { name: 'Cisco' }, { name: 'Lenovo' }, { name: 'CNCF' }, { name: 'OpenID' }, { name: 'Apache' }, { name: 'Facebook' }, { name: 'Google' }, { name: 'OASIS' }];
const initialSpecHwTypes = [{ name: 'Rack' }, { name: 'Blade' }, { name: 'Virtual' }];
const initialSpecHypervisors = [{ name: 'VMWare ESXi' }, { name: 'Microsoft Hyper-V' }, { name: 'KVM' }, { name: 'Harvester' }];

const initialSpecNetworkCards = [
    { "name": "Ethernet_1G_RJ45", "type": "Ethernet", "classification": { "speed": "1Gbps", "connector": "RJ-45" } },
    { "name": "Ethernet_10G_RJ45", "type": "Ethernet", "classification": { "speed": "10Gbps", "connector": "RJ-45" } },
    { "name": "Ethernet_10G_SFP+", "type": "Ethernet", "classification": { "speed": "10Gbps", "connector": "SFP+" } },
    { "name": "Ethernet_25G_SFP28", "type": "Ethernet", "classification": { "speed": "25Gbps", "connector": "SFP28" } },
    { "name": "Ethernet_40G_QSFP+", "type": "Ethernet", "classification": { "speed": "40Gbps", "connector": "QSFP+" } },
    { "name": "Ethernet_100G_QSFP28", "type": "Ethernet", "classification": { "speed": "100Gbps", "connector": "QSFP28" } },
    { "name": "FibreChannel_8Gb", "type": "Fibre Channel", "classification": { "speed": "8Gbps" } },
    { "name": "FibreChannel_16Gb", "type": "Fibre Channel", "classification": { "speed": "16Gbps" } },
    { "name": "FibreChannel_32Gb", "type": "Fibre Channel", "classification": { "speed": "32Gbps" } },
    { "name": "InfiniBand_SDR_10Gb", "type": "InfiniBand", "classification": { "speed": "10Gbps", "mode": "SDR" } },
    { "name": "InfiniBand_DDR_20Gb", "type": "InfiniBand", "classification": { "speed": "20Gbps", "mode": "DDR" } },
    { "name": "InfiniBand_QDR_40Gb", "type": "InfiniBand", "classification": { "speed": "40Gbps", "mode": "QDR" } },
    { "name": "InfiniBand_FDR_56Gb", "type": "InfiniBand", "classification": { "speed": "56Gbps", "mode": "FDR" } },
    { "name": "InfiniBand_EDR_100Gb", "type": "InfiniBand", "classification": { "speed": "100Gbps", "mode": "EDR" } },
    { "name": "Wireless_WiFi5_802.11ac", "type": "Wireless", "classification": { "standard": "802.11ac", "generation": "Wi-Fi 5" } },
    { "name": "Wireless_WiFi6_802.11ax", "type": "Wireless", "classification": { "standard": "802.11ax", "generation": "Wi-Fi 6" } },
    { "name": "Wireless_WiFi7_802.11be", "type": "Wireless", "classification": { "standard": "802.11be", "generation": "Wi-Fi 7" } },
    { "name": "Virtual_VLAN_802.1Q", "type": "Virtual", "classification": { "protocol": "802.1Q", "description": "VLAN" } },
    { "name": "Virtual_VXLAN", "type": "Virtual", "classification": { "protocol": "VXLAN" } },
    { "name": "Virtual_GRE_Tunnel", "type": "Virtual", "classification": { "protocol": "GRE" } },
    { "name": "Virtual_IPsec_Tunnel", "type": "Virtual", "classification": { "protocol": "IPsec" } },
    { "name": "Virtual_SDN_OpenvSwitch", "type": "Virtual", "classification": { "platform": "Open vSwitch" } },
    { "name": "Virtual_SDN_VMwareNSX", "type": "Virtual", "classification": { "platform": "VMware NSX" } },
    { "name": "Specialized_RoCE", "type": "Specialized", "classification": { "protocol": "RDMA over Converged Ethernet" } },
    { "name": "Specialized_iSCSI", "type": "Specialized", "classification": { "protocol": "iSCSI" } },
    { "name": "Specialized_NVMeoF", "type": "Specialized", "classification": { "protocol": "NVMe over Fabrics" } },
    { "name": "Management_IPMI", "type": "Management", "classification": { "protocol": "IPMI" } },
    { "name": "Management_Redfish", "type": "Management", "classification": { "protocol": "Redfish" } },
    { "name": "Management_SerialConsole", "type": "Management", "classification": { "protocol": "Serial" } }
];

const initialSpecPlugPowerCords = [{ name: 'Virtual Power' }, { name: 'NEMA 5-15P' }, { name: 'C13/C14' }];

const initialSpecCpuTypes = [
  { name: 'Intel Xeon Scalable'}, { name: 'Intel Xeon E-series'},
  { name: 'AMD EPYC 7002'}, { name: 'AMD EPYC 9004 series'},
  { name: 'IBM POWER9'}, { name: 'IBM POWER10'},
  { name: 'Oracle SPARC'}, { name: 'Ampere Altra'}, { name: 'AWS Graviton'},
  { name: 'Intel Core i3'}, { name: 'Intel Core i5'}, { name: 'Intel Core i7'}, { name: 'Intel Core i9'},
  { name: 'AMD Ryzen 3'}, { name: 'AMD Ryzen 5'}, { name: 'AMD Ryzen 7'}, { name: 'AMD Ryzen 9'},
  { name: 'Apple M1'}, { name: 'Apple M2'}, { name: 'Apple M3'},
  { name: 'Intel Atom'}, { name: 'ARM Cortex'}
];

const initialSpecGpuTypes = [
  { name: 'NVIDIA A100'}, { name: 'NVIDIA H100'},
  { name: 'NVIDIA Tesla V100'}, { name: 'NVIDIA Tesla P100'},
  { name: 'AMD Instinct MI100'}, { name: 'AMD Instinct MI250'},
  { name: 'Intel Data Center GPU Flex Series'},
  { name: 'NVIDIA RTX A6000'}, { name: 'NVIDIA RTX A5000'},
  { name: 'AMD Radeon Pro Series'},
  { name: 'NVIDIA GeForce RTX 4090'}, { name: 'NVIDIA GeForce RTX 4080'}, { name: 'NVIDIA GeForce RTX 4070'},
  { name: 'AMD Radeon RX 7900'}, { name: 'AMD Radeon RX 6800'},
  { name: 'Intel Iris Xe'}, { name: 'AMD Radeon Vega'}, { name: 'Apple GPU (in M-series chips)'}
];

const initialSpecDiskTypes = [
    { "name": "HDD_3.5inch_SATA_5400RPM", "type": "HDD", "classification": { "form_factor": "3.5-inch", "interface": "SATA", "speed": "5400 RPM" } },
    { "name": "HDD_3.5inch_SATA_7200RPM", "type": "HDD", "classification": { "form_factor": "3.5-inch", "interface": "SATA", "speed": "7200 RPM" } },
    { "name": "HDD_3.5inch_SAS_10KRPM", "type": "HDD", "classification": { "form_factor": "3.5-inch", "interface": "SAS", "speed": "10K RPM" } },
    { "name": "HDD_3.5inch_SAS_15KRPM", "type": "HDD", "classification": { "form_factor": "3.5-inch", "interface": "SAS", "speed": "15K RPM" } },
    { "name": "SSD_SATA_2.5inch", "type": "SSD", "classification": { "interface": "SATA", "form_factor": "2.5-inch" } },
    { "name": "SSD_NVMe_M2_PCIeGen3", "type": "SSD", "classification": { "interface": "NVMe", "form_factor": "M.2", "generation": "PCIe Gen3" } },
    { "name": "SSD_NVMe_M2_PCIeGen4", "type": "SSD", "classification": { "interface": "NVMe", "form_factor": "M.2", "generation": "PCIe Gen4" } },
    { "name": "SSD_NVMe_U2_PCIeGen3", "type": "SSD", "classification": { "interface": "NVMe", "form_factor": "U.2", "generation": "PCIe Gen3" } },
    { "name": "SSD_NVMe_U2_PCIeGen4", "type": "SSD", "classification": { "interface": "NVMe", "form_factor": "U.2", "generation": "PCIe Gen4" } },
    { "name": "Hybrid_2.5inch_SATA", "type": "Hybrid", "classification": { "form_factor": "2.5-inch", "interface": "SATA" } },
    { "name": "Hybrid_3.5inch_SATA", "type": "Hybrid", "classification": { "form_factor": "3.5-inch", "interface": "SATA" } },
    { "name": "Enterprise_SAS_10KRPM", "type": "Enterprise", "classification": { "interface": "SAS", "speed": "10K RPM" } },
    { "name": "Enterprise_SAS_15KRPM", "type": "Enterprise", "classification": { "interface": "SAS", "speed": "15K RPM" } },
    { "name": "Enterprise_FibreChannel_HighSpeed", "type": "Enterprise", "classification": { "interface": "Fibre Channel", "speed": "High-Speed" } },
    { "name": "Specialized_NVMeoF", "type": "Specialized", "classification": { "interface": "NVMe-oF", "description": "Network NVMe" } },
    { "name": "Specialized_PersistentMemory_Optane", "type": "Specialized", "classification": { "interface": "Persistent Memory", "description": "Intel Optane" } },
    { "name": "Virtual_VMDK_VMware", "type": "Virtual", "classification": { "format": "VMDK", "platform": "VMware" } },
    { "name": "Virtual_VHDX_HyperV", "type": "Virtual", "classification": { "format": "VHD/VHDX", "platform": "Hyper-V" } },
    { "name": "Virtual_QCOW2_KVM", "type": "Virtual", "classification": { "format": "QCOW2", "platform": "KVM" } },
    { "name": "Cloud_Object_S3Compatible", "type": "Cloud", "classification": { "storage_type": "Object", "protocol": "S3-Compatible" } },
    { "name": "Cloud_Block_EBS", "type": "Cloud", "classification": { "storage_type": "Block", "example": "EBS-Type" } }
];

const initialSimulators: Omit<Simulator, '_id'>[] = [
    { name: 'High-Latency WAN Simulator', dockerImage: 'slow-network/wan-sim:latest', helmChartUrl: 'charts/wan-simulator' },
    { name: 'Packet-Loss Network Simulator (5%)', dockerImage: 'fault-injector/packet-loss:5.0' },
    { name: 'CPU Stress Test Simulator', dockerImage: 'stress-ng/cpu-burner:latest' },
    { name: 'Disk I/O Bottleneck Simulator', dockerImage: 'fio/io-simulator:latest' },
];

const initialEmulators: Omit<Emulator, '_id'>[] = [
    { name: 'Raspberry Pi 4 (QEMU)', dockerImage: 'qemu/raspi4-emulator:latest', registryUrl: 'docker.io', helmChartUrl: '' },
    { name: 'HPE ProLiant DL380 Gen11', dockerImage: 'hpe-sim/dl380-g11:latest', registryUrl: 'registry.hpe.com' },
    { name: 'Cisco Nexus 9000v Switch', dockerImage: 'cisco/nexus9000v:latest', registryUrl: 'registry.cisco.com' },
    { name: 'Android 14 Emulator', dockerImage: 'google/android-emulator:14.0', registryUrl: 'gcr.io' },
];


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

const fullSpecifications: Omit<Specification, '_id'>[] = [
    {
        name: 'ArgoCD Sync Spec', vendor: 'CNCF', hw_type: { id: 'Virtual', name: 'Virtual' }, hypervisor: { id: 'KVM', name: 'KVM'}, service_contract_type: { id: 'CommunitySupport', name: 'Community Support' },
        clusterName: 'ArgoCD Management Cluster',
        nodeCount: { controlPlane: 3, worker: 5 },
        nodes: [
            ...Array.from({ length: 3 }, (_, i) => ({
                vmName: `argo-cp-${i+1}`,
                role: 'Control Plane' as const,
                cpuCores: 8, memory: 32, diskSize: 200, osType: 'Ubuntu 22.04 LTS',
                networkInterface: 'Virtual_VLAN_802.1Q', connectivity: 'Private' as const, dns: 'internal.corp',
                ssh: { username: 'admin', sshKey: 'ssh-rsa AAAAB3Nza... controlplane-key' }
            })),
            ...Array.from({ length: 5 }, (_, i) => ({
                vmName: `argo-worker-${i+1}`,
                role: 'Worker' as const,
                cpuCores: 16, memory: 64, diskSize: 500, osType: 'Ubuntu 22.04 LTS',
                networkInterface: 'Virtual_VXLAN', connectivity: 'Private' as const, dns: 'internal.corp',
                ssh: { username: 'admin', sshKey: 'ssh-rsa AAAAB3NzaC... worker-key' }
            }))
        ],
    },
    {
        name: 'Single Sign-On Spec', vendor: 'OpenID', hw_type: { id: 'Virtual', name: 'Virtual' }, hypervisor: { id: 'VMWare ESXi', name: 'VMWare ESXi' }, service_contract_type: { id: 'CommunitySupport', name: 'Community Support' },
        clusterName: 'SSO Authentication Service',
        nodeCount: { controlPlane: 2, worker: 3 },
        nodes: [
            ...Array.from({ length: 2 }, (_, i) => ({
                vmName: `sso-cp-${i+1}`, role: 'Control Plane' as const, cpuCores: 4, memory: 16, diskSize: 100, osType: 'RHEL 9',
                networkInterface: 'Virtual_VLAN_802.1Q', connectivity: 'Private' as const, dns: 'auth.corp',
                ssh: { username: 'sso_admin', sshKey: 'ssh-rsa AAAAB3NzaC... sso-cp-key' }
            })),
            ...Array.from({ length: 3 }, (_, i) => ({
                vmName: `sso-worker-${i+1}`, role: 'Worker' as const, cpuCores: 8, memory: 32, diskSize: 250, osType: 'RHEL 9',
                networkInterface: 'Virtual_VLAN_802.1Q', connectivity: 'Private' as const, dns: 'auth.corp',
                ssh: { username: 'sso_admin', sshKey: 'ssh-rsa AAAAB3NzaC... sso-worker-key' }
            }))
        ],
    },
    {
        name: 'Dell PowerEdge R760', vendor: 'Dell EMC', hw_type: { id: 'Rack', name: 'Rack' }, service_contract_type: {id: 'ServiceContract_ProSupport_Plus', name: 'ProSupport Plus'},
        total_cpu: 64, memory_gb: 256, storage_gb: 4096,
        network_cards: [{id: 'Ethernet_10G_SFP+', name: 'Ethernet_10G_SFP+'}], plug_power_cords: [{id: 'C13/C14', name: 'C13/C14'}],
        hypervisor: { id: 'VMWare ESXi', name: 'VMWare ESXi' }, biosVersion: "2.10.1", firmwareVersion: "7.00.10.00 (iDRAC 9)", cpuArchitecture: "x86_64", virtualizationSupport: true,
        iloCredentials: { username: 'root', password: 'password123' }, timeSync: 'ntp.dell.com', raidConfiguration: 'RAID 1 (OS), RAID 5 (Data)',
        diskLayout: { osDisk: '2x 480GB SSD', dataDisk: '8x 2TB SAS HDD' }, sshKeys: 'ssh-rsa AAAAB3NzaC... r760-admin-key'
    },
    {
        name: 'HPE ProLiant DL380 Gen11', vendor: 'HPE', hw_type: { id: 'Rack', name: 'Rack' }, service_contract_type: {id: 'ServiceContract_Foundation_Care', name: 'Foundation Care'},
        total_cpu: 48, memory_gb: 192, storage_gb: 2048, biosVersion: "U52 v1.50", firmwareVersion: "3.01 (iLO 6)", cpuArchitecture: "x86_64", virtualizationSupport: true,
        iloCredentials: { username: 'admin', password: 'password' }, timeSync: 'time.nist.gov', raidConfiguration: 'RAID 1 (OS), RAID 6 (Data)',
        diskLayout: { osDisk: '2x 480GB SSD', dataDisk: '6x 1.2TB SAS HDD' }
    },
    {
        name: 'Cisco UCS B200 M7 Blade', vendor: 'Cisco', hw_type: { id: 'Blade', name: 'Blade'}, service_contract_type: {id: 'ServiceContract_ProSupport_Plus', name: 'ProSupport Plus'},
        symmetric: true, bladeCount: 8,
        blades: [{
            name: 'Blade Template', cpuType: 'Intel Xeon Scalable', cpuCores: 24, memory: 128, diskType: 'SSD_NVMe_U2_PCIeGen4', diskCapacity: 1024, hasGpu: true, gpuType: 'NVIDIA A100', gpuCores: 108,
            networkInterfaces: [{name: 'vic1520', type: 'Ethernet_40G_QSFP+', speed: '40Gbps'}]
        }],
        biosVersion: "S52.4.1.0.1", firmwareVersion: "5.0(2)", virtualizationSupport: true
    },
    {
        name: 'Asymmetric Blade Server', vendor: 'Lenovo', hw_type: { id: 'Blade', name: 'Blade'}, service_contract_type: {id: 'ServiceContract_ProSupport_Plus', name: 'ProSupport Plus'},
        symmetric: false, bladeCount: 4,
        blades: [
            { name: 'Compute-Blade-1', cpuType: 'AMD EPYC 7002', cpuCores: 32, memory: 256, diskType: 'SSD_NVMe_U2_PCIeGen4', diskCapacity: 2048, hasGpu: false },
            { name: 'Compute-Blade-2', cpuType: 'AMD EPYC 7002', cpuCores: 32, memory: 256, diskType: 'SSD_NVMe_U2_PCIeGen4', diskCapacity: 2048, hasGpu: false },
            { name: 'Storage-Blade-1', cpuType: 'Intel Xeon Scalable', cpuCores: 16, memory: 128, diskType: 'HDD_3.5inch_SAS_15KRPM', diskCapacity: 16384, hasGpu: false },
            { name: 'GPU-Blade-1', cpuType: 'Intel Xeon Scalable', cpuCores: 52, memory: 512, diskType: 'SSD_NVMe_U2_PCIeGen4', diskCapacity: 4096, hasGpu: true, gpuType: 'NVIDIA H100', gpuCores: 108 }
        ]
    },
    {
      "name": "Spec-hardware-Blade-1763392192219",
      "hw_type": { "id": "Blade", "name": "Blade"},
      "symmetric": false,
      "bladeCount": 1,
      "blades": [
        {
          "name": "Blade 1", "cpuType": "AMD Ryzen 9", "cpuCores": 12, "memory": 64, "diskType": "SSD_SATA_2.5inch", "diskCapacity": 2048,
          "hasGpu": true, "gpuType": 'NVIDIA GeForce RTX 4080', "gpuCores": 9728
        }
      ]
    }
];

const initialDeploymentTypes = [
    { _id: 'Airgapped', "name": "Airgapped", "description": "Deployment in an isolated, offline environment." },
    { _id: 'Cloud', "name": "Cloud", "description": "Deployment to a public or private cloud." },
    { _id: 'On-Prem', "name": "On-Prem", "description": "Deployment to on-premises servers." }
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

const generateInitialLicenses = (): Omit<License, '_id'>[] => {
    const licenseTemplates = [
        { name: 'MIT', type: 'open-source', owner: 'MIT' },
        { name: 'Apache 2.0', type: 'open-source', owner: 'Apache Foundation' },
        { name: 'GPLv3', type: 'open-source', owner: 'FSF' },
        { name: 'BSD-3-Clause', type: 'open-source', owner: 'Various' },
        { name: 'React', type: 'open-source', owner: 'Facebook' },
        { name: 'Angular', type: 'open-source', owner: 'Google' },
        { name: 'Vue', type: 'open-source', owner: 'Evan You' },
        { name: 'MongoDB SSPL', type: 'proprietary', owner: 'MongoDB Inc.' },
        { name: 'Elastic License 2.0', type: 'proprietary', owner: 'Elastic' },
        { name: 'Confluent Community License', type: 'proprietary', owner: 'Confluent' },
        { name: 'Oracle Java SE', type: 'proprietary', owner: 'Oracle' },
        { name: 'Microsoft EULA', type: 'proprietary', owner: 'Microsoft' },
        { name: 'Datadog Subscription', type: 'subscription', owner: 'Datadog' },
        { name: 'Okta Identity', type: 'subscription', owner: 'Okta' },
        { name: 'JetBrains All-Products', type: 'subscription', owner: 'JetBrains' },
        { name: 'Windows Server 2022', type: 'perpetual', owner: 'Microsoft' },
        { name: 'VMware vSphere', type: 'perpetual', owner: 'VMware' },
    ];

    const allEntities = [...initialComponents, ...initialApplications];
    const licenses: Omit<License, '_id'>[] = [];
    let licenseCount = 0;

    licenseTemplates.forEach(template => {
        const licenseId = template.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
        licenses.push({
            id: licenseId,
            name: template.name,
            type: template.type as any,
            owner: template.owner,
            status: 'active'
        });
        licenseCount++;
    });

    allEntities.forEach(entity => {
        const numLicenses = Math.floor(Math.random() * 3) + 1; // 1 to 3 licenses per entity
        for (let i = 0; i < numLicenses; i++) {
            const template = licenseTemplates[Math.floor(Math.random() * licenseTemplates.length)];
            const status = ['active', 'active', 'active', 'expired', 'deprecated'][Math.floor(Math.random() * 5)];
            const licenseId = `${template.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${entity.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
            
            const existing = licenses.find(l => l.id === licenseId);
            if (existing) continue;

            const newLicense: Omit<License, '_id'> = {
                id: licenseId,
                name: `${template.name} for ${entity.name}`,
                type: template.type as any,
                owner: template.owner,
                status: status as any,
                versions: [entity.version], // Link to a specific version
            };
            
            if ('tenants' in entity && entity.tenants) {
                newLicense.tenants = entity.tenants.map(t => t.id);
            }

            if ('dependent_components' in entity) { // It's a component or app
                 newLicense.components = [entity.id];
            } else {
                 newLicense.apps = [entity.id];
            }

            licenses.push(newLicense);
            licenseCount++;
        }
    });

    // Add some more generic ones to reach 100+
    while (licenseCount < 100) {
        const template = licenseTemplates[Math.floor(Math.random() * licenseTemplates.length)];
        const status = ['active', 'expired', 'deprecated'][Math.floor(Math.random() * 3)];
        const id = `${template.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-gen-${licenseCount}`;
         licenses.push({
            id: id,
            name: `${template.name} - General Purpose`,
            type: template.type as any,
            owner: template.owner,
            status: status as any
        });
        licenseCount++;
    }

    return licenses;
}

const initialLicenses = generateInitialLicenses();


const initialProductLicensing: Omit<ProductLicensing, '_id'>[] = [
    { id: 'pl-oss-portal', product_id: 'OneStopShopPortal', license_model: 'hybrid', entitlements: ['feature-sso', 'feature-dashboard'], package_included: true, validity: 'perpetual', compliance: 'ISO 27001' },
    { id: 'pl-data-fabric', product_id: 'UnifiedDataFabric', license_model: 'online', entitlements: ['feature-streaming', 'feature-batch'], package_included: false, validity: '2025-12-31', compliance: 'SOC 2 Type II' }
];

const initialPlatformFoundations: any[] = [
    ...initialSpecHypervisors.map(hypervisor => ({
        _id: `DellR760-${hypervisor.name.replace(/[^a-zA-Z0-9]/g, '')}`,
        name: `Dell R760 with ${hypervisor.name}`,
        createdAt: new Date().toISOString(),
        createdBy: 'seed',
        specification: fullSpecifications.find(s => s.name === 'Dell PowerEdge R760'),
        hypervisor: { id: hypervisor._id, name: hypervisor.name },
        virtual_machines: [
            ...Array.from({ length: 3 }, (_, i) => ({ vmName: `dell-cp-${i+1}`, role: 'Control Plane', cpuCores: 8, memory: 32, diskSize: 200, osType: 'Ubuntu 22.04 LTS', networkInterface: 'Ethernet_10G_SFP+', connectivity: 'Private', dns: 'dell.internal', ssh: { username: 'ubuntu', sshKey: 'ssh-rsa...' }})),
            ...Array.from({ length: 10 }, (_, i) => ({ vmName: `dell-w-${i+1}`, role: 'Worker', cpuCores: 16, memory: 64, diskSize: 500, osType: 'Ubuntu 22.04 LTS', networkInterface: 'Ethernet_10G_SFP+', connectivity: 'Private', dns: 'dell.internal', ssh: { username: 'ubuntu', sshKey: 'ssh-rsa...' }})),
        ],
        kubernetes: {
            distribution: 'rke2',
            cniPlugin: 'cilium',
            controlPlaneNodes: Array.from({ length: 3 }, (_, i) => ({ id: `dell-cp-${i+1}`, label: `dell-cp-${i+1}` })),
            workerNodes: Array.from({ length: 10 }, (_, i) => ({ id: `dell-w-${i+1}`, label: `dell-w-${i+1}` })),
        }
    })),
    ...initialSpecHypervisors.map(hypervisor => ({
        _id: `CiscoBlade-${hypervisor.name.replace(/[^a-zA-Z0-9]/g, '')}`,
        name: `Cisco Blade Cluster on ${hypervisor.name}`,
        createdAt: new Date().toISOString(),
        createdBy: 'seed',
        specification: fullSpecifications.find(s => s.name === 'Cisco UCS B200 M7 Blade'),
        hypervisor: { id: hypervisor._id, name: hypervisor.name },
        virtual_machines: [
            ...Array.from({ length: 3 }, (_, i) => ({ vmName: `cisco-cp-${i+1}`, role: 'Control Plane', cpuCores: 4, memory: 16, diskSize: 100, osType: 'RHEL 9', networkInterface: 'Ethernet_40G_QSFP+', connectivity: 'Private', dns: 'cisco.internal', ssh: { username: 'ec2-user', sshKey: 'ssh-rsa...' }})),
            ...Array.from({ length: 5 }, (_, i) => ({ vmName: `cisco-w-${i+1}`, role: 'Worker', cpuCores: 8, memory: 32, diskSize: 200, osType: 'RHEL 9', networkInterface: 'Ethernet_40G_QSFP+', connectivity: 'Private', dns: 'cisco.internal', ssh: { username: 'ec2-user', sshKey: 'ssh-rsa...' }})),
        ],
        kubernetes: {
            distribution: 'k3s',
            cniPlugin: 'calico',
            controlPlaneNodes: Array.from({ length: 3 }, (_, i) => ({ id: `cisco-cp-${i+1}`, label: `cisco-cp-${i+1}` })),
            workerNodes: Array.from({ length: 5 }, (_, i) => ({ id: `cisco-w-${i+1}`, label: `cisco-w-${i+1}` })),
        }
    })),
    {
        _id: `ArgoCD-VirtualFoundation`,
        name: `ArgoCD Virtual Foundation`,
        createdAt: new Date().toISOString(),
        createdBy: 'seed',
        specification: fullSpecifications.find(s => s.name === 'ArgoCD Sync Spec'),
        hypervisor: { id: 'KVM', name: 'KVM' },
        virtual_machines: fullSpecifications.find(s => s.name === 'ArgoCD Sync Spec')?.nodes,
        kubernetes: {
            distribution: 'rke2',
            clusterCidr: '10.42.0.0/16',
            serviceCidr: '10.43.0.0/16',
            dnsDomain: 'argo.cluster.local',
            cniPlugin: 'canal',
            useCustomCerts: false,
            controlPlaneNodes: fullSpecifications.find(s => s.name === 'ArgoCD Sync Spec')?.nodes?.filter(n => n.role === 'Control Plane').map(n => ({ id: n.vmName, label: n.vmName })),
            workerNodes: fullSpecifications.find(s => s.name === 'ArgoCD Sync Spec')?.nodes?.filter(n => n.role === 'Worker').map(n => ({ id: n.vmName, label: n.vmName })),
        }
    },
    {
        _id: `SSO-VirtualFoundation`,
        name: `SSO Virtual Foundation`,
        createdAt: new Date().toISOString(),
        createdBy: 'seed',
        specification: fullSpecifications.find(s => s.name === 'Single Sign-On Spec'),
        hypervisor: { id: 'VMWare ESXi', name: 'VMWare ESXi' },
        virtual_machines: fullSpecifications.find(s => s.name === 'Single Sign-On Spec')?.nodes,
        kubernetes: {
            distribution: 'k3s',
            clusterCidr: '10.62.0.0/16',
            serviceCidr: '10.63.0.0/16',
            dnsDomain: 'sso.cluster.local',
            cniPlugin: 'calico',
            useCustomCerts: true,
            controlPlaneNodes: fullSpecifications.find(s => s.name === 'Single Sign-On Spec')?.nodes?.filter(n => n.role === 'Control Plane').map(n => ({ id: n.vmName, label: n.vmName })),
            workerNodes: fullSpecifications.find(s => s.name === 'Single Sign-On Spec')?.nodes?.filter(n => n.role === 'Worker').map(n => ({ id: n.vmName, label: n.vmName })),
        }
    }
];

const initialDevEnvironments: Omit<DevelopmentEnvironment, '_id'>[] = [
    { name: 'Feature Branch - SSO', productId: 'OneStopShopPortal', productName: 'OneStopShop Portal', specificationId: 'ArgoCDSyncSpec', specName: 'ArgoCD Sync Spec', baselineId: 'OneStopShopPortal_1.0.0', tenantIds: [], createdAt: '2024-06-01T10:00:00.000Z', createdBy: 'dev-user-1', status: 'READY', estimatedCost: 15.50, resourceUsage: { cpu: '8 vCPU', memory: '32 GB', storage: '200 GB' } },
    { name: 'Analytics Hotfix', productId: 'UnifiedDataFabric', productName: 'Unified Data Fabric', specificationId: 'DellPowerEdgeR760', specName: 'Dell PowerEdge R760', baselineId: undefined, tenantIds: ['CustomerAnalytics'], createdAt: '2024-06-05T14:30:00.000Z', createdBy: 'dev-user-2', status: 'PROVISIONING', estimatedCost: 25.00, resourceUsage: { cpu: '16 vCPU', memory: '64 GB', storage: '500 GB' } },
];

const initialTestEnvironments: Omit<TestEnvironment, '_id'>[] = [
    { name: 'Q3 Performance Run', productId: 'UnifiedDataFabric', productName: 'Unified Data Fabric', specificationId: 'CiscoUCSB200M7Blade', specName: 'Cisco UCS B200 M7 Blade', baselineId: 'UnifiedDataFabric_1.1.0', createdAt: '2024-05-20T10:00:00.000Z', createdBy: 'qa-user-1', status: 'READY', estimatedCost: 50.00, resourceUsage: { cpu: '32 vCPU', memory: '128 GB', storage: '1TB' } },
    { name: 'Retail E2E Testbed', productId: 'OneStopShopPortal', productName: 'OneStopShop Portal', specificationId: 'HPEProLiantDL380Gen11', specName: 'HPE ProLiant DL380 Gen11', baselineId: undefined, tenantIds: ['RetailOperations', 'SupplyChainLogistics'], createdAt: '2024-06-10T11:00:00.000Z', createdBy: 'qa-user-2', status: 'ERROR', estimatedCost: 50.00, resourceUsage: { cpu: '32 vCPU', memory: '128 GB', storage: '1TB' } },
];

const initialSdkApps: Omit<SdkApp, '_id'| 'createdAt'>[] = [
    {
        projectName: 'supply-chain-logistics-app',
        group: 'com.example.supplychain',
        dependencies: [
            { id: 'sql-postgres', name: 'SQL Database (PostgreSQL)', description: 'Adds JDBC driver and configuration for PostgreSQL.', group: 'Databases' },
            { id: 'messaging-kafka', name: 'Messaging (Kafka)', description: 'Adds Spring for Kafka for producing/consuming messages.', group: 'Messaging' },
            { id: 'web-react', name: 'Web Portal (React)', description: 'Generates a React frontend structure.', group: 'Web' },
        ],
        repoUrl: 'https://github.com/example/supply-chain-app.git',
        pipelineType: 'gitlab',
        environmentType: 'development',
        environmentId: initialDevEnvironments.find(e => e.name === 'Feature Branch - SSO')?._id, // This will be assigned dynamically later if needed
        tenantId: 'SupplyChainLogistics',
        status: 'READY',
        version: '1.0.0',
        simulators: [
            {
                id: initialSimulators.find(s => s.name === 'High-Latency WAN Simulator')!._id,
                name: 'High-Latency WAN Simulator',
                instanceCount: 2,
                instances: [
                    { name: 'wan-sim-us', ip: '10.1.1.5', user: 'admin', pass: 'pass' },
                    { name: 'wan-sim-eu', ip: '10.2.1.5', user: 'admin', pass: 'pass' },
                ]
            }
        ],
        emulators: [
             {
                id: initialEmulators.find(s => s.name === 'Raspberry Pi 4 (QEMU)')!._id,
                name: 'Raspberry Pi 4 (QEMU)',
                instanceCount: 1,
                instances: [
                    { name: 'rpi-sensor-1', ip: '192.168.1.101', user: 'pi', pass: 'raspberry' }
                ]
            }
        ]
    },
    {
        projectName: 'analytics-dashboard-v2',
        group: 'com.example.analytics',
        dependencies: [
            { id: 'nosql-mongodb', name: 'NoSQL Database (MongoDB)', description: 'Adds MongoDB driver and Spring Data MongoDB.', group: 'Databases' },
            { id: 'web-angular', name: 'Web Portal (Angular)', description: 'Generates an Angular frontend structure.', group: 'Web' },
            { id: 'monitoring-prometheus', name: 'Monitoring (Prometheus)', description: 'Exposes application metrics for Prometheus scraping.', group: 'Observability' },
        ],
        repoUrl: 'https://github.com/example/analytics-dashboard.git',
        pipelineType: 'github',
        environmentType: 'test',
        environmentId: initialTestEnvironments.find(e => e.name === 'Q3 Performance Run')?._id,
        tenantId: 'CustomerAnalytics',
        status: 'PROVISIONING',
        version: '2.0.0',
        simulators: [
            {
                id: initialSimulators.find(s => s.name === 'CPU Stress Test Simulator')!._id,
                name: 'CPU Stress Test Simulator',
                instanceCount: 3,
                instances: [
                    { name: 'cpu-stress-1', ip: '10.3.1.1', user: 'root', pass: '' },
                    { name: 'cpu-stress-2', ip: '10.3.1.2', user: 'root', pass: '' },
                    { name: 'cpu-stress-3', ip: '10.3.1.3', user: 'root', pass: '' },
                ]
            }
        ],
        emulators: []
    }
];


export async function seedDatabase() {
    const client = await clientPromise;
    const db = client.db();

    const collectionsToSeed = [
        { name: 'products', data: initialProducts.map(p => ({...p, _id: p.name.replace(/[^a-zA-Z0-9]/g, ''), created_at: new Date().toISOString(), updated_at: new Date().toISOString()})) },
        { name: 'specifications', data: fullSpecifications.map(s => ({...s, _id: s.name.replace(/[^a-zA-Z0-9]/g, '') })) },
        { name: 'deployment_types', data: initialDeploymentTypes },
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
        { name: 'specification_vendors', data: initialSpecVendors },
        { name: 'specification_hw_types', data: initialSpecHwTypes },
        { name: 'specification_hypervisors', data: initialSpecHypervisors },
        { name: 'specification_network_cards', data: initialSpecNetworkCards },
        { name: 'specification_plug_power_cords', data: initialSpecPlugPowerCords },
        { name: 'specification_cpu_types', data: initialSpecCpuTypes },
        { name: 'specification_gpu_types', data: initialSpecGpuTypes },
        { name: 'specification_disk_types', data: initialSpecDiskTypes },
        ...initialApprovalConfigs,
        { name: 'licenses', data: initialLicenses.map(l => ({ ...l, _id: l.id })) },
        { name: 'product_licensing', data: initialProductLicensing.map(pl => ({ ...pl, _id: pl.id })) },
        { name: 'platform_foundations', data: initialPlatformFoundations },
        { name: 'development_environments', data: initialDevEnvironments },
        { name: 'test_environments', data: initialTestEnvironments },
        { name: 'simulators', data: initialSimulators },
        { name: 'emulators', data: initialEmulators },
        { name: 'sdk_apps', data: initialSdkApps.map(app => ({ ...app, createdAt: new Date().toISOString() })) }
    ];
    
    let seededCount = 0;
    let skippedCount = 0;

    for (const collection of collectionsToSeed) {
        const collectionName = 'collectionName' in collection ? collection.collectionName : collection.name;
        const count = await db.collection(collectionName).countDocuments();
        if (count === 0) {
            await db.collection(collectionName).insertMany(collection.data as any[]);
            seededCount++;
        } else {
            skippedCount++;
        }
    }
    
    await generateAndStoreAllProductTrees();

    return { seededCount, skippedCount };
}
