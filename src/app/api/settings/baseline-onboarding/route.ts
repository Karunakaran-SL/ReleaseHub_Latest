
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { z } from 'zod';
import { getUser } from '@/lib/auth';
import type { OnboardingConfiguration } from '@/lib/definitions';

const OnboardingFieldSchema = z.object({
  type: z.enum(['Checkbox', 'RadioBox', 'TextField', 'DropDown', 'Link']),
  name: z.string(),
  label: z.string(),
  options: z.array(z.string()).optional(),
  helpText: z.string().optional(),
  proof: z.boolean().optional(),
  proofLink: z.string().optional(),
});

const OnboardingPhaseSchema = z.object({
  id: z.string(),
  name: z.string(),
  ownerName: z.string(),
  ownerEmail: z.string().email(),
  sendEmailOnComplete: z.boolean(),
  statusOptions: z.array(z.string()),
  fields: z.array(OnboardingFieldSchema),
});

const OnboardingConfigurationSchema = z.object({
  name: z.string(),
  version: z.number().int().positive(),
  phases: z.array(OnboardingPhaseSchema),
});

const collectionName = 'settings_baseline_onboarding';

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


async function seedData() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection(collectionName);
    
    const count = await collection.countDocuments({ name: initialBaselineConfig.name });
    if (count === 0) {
      await collection.insertOne(initialBaselineConfig as any);
      console.log(`Seeded ${collectionName} collection.`);
    }

  } catch (error) {
    console.error(`Error seeding ${collectionName}:`, error);
  }
}

// GET all versions for the baseline onboarding type
export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection(collectionName);
    
    await seedData();

    const configs = await collection.find({}).sort({ version: -1 }).toArray();
    return NextResponse.json(configs, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

// POST a new version of the baseline onboarding config
export async function POST(req: NextRequest) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
        }

        const body = await req.json();
        const validatedData = OnboardingConfigurationSchema.safeParse(body);

        if (!validatedData.success) {
            return NextResponse.json({ message: 'Invalid configuration data.', errors: validatedData.error.flatten().fieldErrors }, { status: 400 });
        }
        
        const client = await clientPromise;
        const db = client.db();
        const collection = db.collection(collectionName);

        const existing = await collection.findOne({ name: validatedData.data.name, version: validatedData.data.version });
        if (existing) {
            return NextResponse.json({ message: `Version ${validatedData.data.version} of "${validatedData.data.name}" already exists.` }, { status: 409 });
        }
        
        const result = await collection.insertOne(validatedData.data as any);

        return NextResponse.json({ ...validatedData.data, _id: result.insertedId }, { status: 201 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}
