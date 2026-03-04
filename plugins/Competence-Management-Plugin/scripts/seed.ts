/**
 * Competence Management Suite — MongoDB Seed Script
 * Run: npx ts-node --project tsconfig.json plugins/Competence-Management-Plugin/scripts/seed.ts
 * Idempotent: safe to run multiple times
 */

import clientPromise from '../../../src/lib/mongodb';

const CATEGORIES = [
    { id: 'CAT-01', name: 'Engineering', color: '#6366f1', icon: 'Code' },
    { id: 'CAT-02', name: 'Architecture', color: '#8b5cf6', icon: 'Layers' },
    { id: 'CAT-03', name: 'Cloud & DevOps', color: '#06b6d4', icon: 'Cloud' },
    { id: 'CAT-04', name: 'Data & Analytics', color: '#f59e0b', icon: 'BarChart' },
    { id: 'CAT-05', name: 'Security', color: '#ef4444', icon: 'Shield' },
    { id: 'CAT-06', name: 'Leadership', color: '#10b981', icon: 'Star' },
    { id: 'CAT-07', name: 'Product Management', color: '#f97316', icon: 'Package' },
    { id: 'CAT-08', name: 'UX & Design', color: '#ec4899', icon: 'Palette' },
    { id: 'CAT-09', name: 'Agile & Process', color: '#14b8a6', icon: 'RefreshCw' },
    { id: 'CAT-10', name: 'Communication', color: '#64748b', icon: 'MessageCircle' },
];

const COMPETENCIES = [
    { id: 'COMP-001', name: 'Python Programming', categoryId: 'CAT-01', description: 'Writing production-quality Python code.', levels: [{ level: 1, label: 'Beginner' }, { level: 2, label: 'Elementary' }, { level: 3, label: 'Intermediate' }, { level: 4, label: 'Advanced' }, { level: 5, label: 'Expert' }], sfia: 'PROG', version: 1, status: 'active', tags: ['backend', 'scripting'] },
    { id: 'COMP-002', name: 'TypeScript / JavaScript', categoryId: 'CAT-01', description: 'Frontend and fullstack development with TS/JS.', levels: [{ level: 1, label: 'Beginner' }, { level: 2, label: 'Elementary' }, { level: 3, label: 'Intermediate' }, { level: 4, label: 'Advanced' }, { level: 5, label: 'Expert' }], sfia: 'PROG', version: 1, status: 'active', tags: ['frontend', 'fullstack'] },
    { id: 'COMP-003', name: 'Java / Spring Boot', categoryId: 'CAT-01', description: 'Enterprise Java development.', levels: [{ level: 1, label: 'Beginner' }, { level: 2, label: 'Elementary' }, { level: 3, label: 'Intermediate' }, { level: 4, label: 'Advanced' }, { level: 5, label: 'Expert' }], sfia: 'PROG', version: 1, status: 'active', tags: ['backend', 'enterprise'] },
    { id: 'COMP-004', name: 'System Architecture', categoryId: 'CAT-02', description: 'Designing scalable distributed systems.', levels: [{ level: 1, label: 'Beginner' }, { level: 2, label: 'Elementary' }, { level: 3, label: 'Intermediate' }, { level: 4, label: 'Advanced' }, { level: 5, label: 'Expert' }], sfia: 'ARCH', version: 1, status: 'active', tags: ['design', 'scalability'] },
    { id: 'COMP-005', name: 'Microservices Design', categoryId: 'CAT-02', description: 'Decomposing systems into microservices.', levels: [{ level: 1, label: 'Beginner' }, { level: 2, label: 'Elementary' }, { level: 3, label: 'Intermediate' }, { level: 4, label: 'Advanced' }, { level: 5, label: 'Expert' }], sfia: 'ARCH', version: 1, status: 'active', tags: ['architecture', 'cloud'] },
    { id: 'COMP-006', name: 'AWS Cloud Services', categoryId: 'CAT-03', description: 'Using AWS cloud platform services.', levels: [{ level: 1, label: 'Beginner' }, { level: 2, label: 'Elementary' }, { level: 3, label: 'Intermediate' }, { level: 4, label: 'Advanced' }, { level: 5, label: 'Expert' }], sfia: 'CLDP', version: 1, status: 'active', tags: ['aws', 'cloud'] },
    { id: 'COMP-007', name: 'Kubernetes & Docker', categoryId: 'CAT-03', description: 'Container orchestration and management.', levels: [{ level: 1, label: 'Beginner' }, { level: 2, label: 'Elementary' }, { level: 3, label: 'Intermediate' }, { level: 4, label: 'Advanced' }, { level: 5, label: 'Expert' }], sfia: 'CLDP', version: 1, status: 'active', tags: ['containers', 'devops'] },
    { id: 'COMP-008', name: 'CI/CD Pipelines', categoryId: 'CAT-03', description: 'Building and maintaining delivery pipelines.', levels: [{ level: 1, label: 'Beginner' }, { level: 2, label: 'Elementary' }, { level: 3, label: 'Intermediate' }, { level: 4, label: 'Advanced' }, { level: 5, label: 'Expert' }], sfia: 'CDSP', version: 1, status: 'active', tags: ['devops', 'automation'] },
    { id: 'COMP-009', name: 'Data Engineering', categoryId: 'CAT-04', description: 'Building data pipelines and warehouses.', levels: [{ level: 1, label: 'Beginner' }, { level: 2, label: 'Elementary' }, { level: 3, label: 'Intermediate' }, { level: 4, label: 'Advanced' }, { level: 5, label: 'Expert' }], sfia: 'DATA', version: 1, status: 'active', tags: ['data', 'etl'] },
    { id: 'COMP-010', name: 'Machine Learning', categoryId: 'CAT-04', description: 'Developing and deploying ML models.', levels: [{ level: 1, label: 'Beginner' }, { level: 2, label: 'Elementary' }, { level: 3, label: 'Intermediate' }, { level: 4, label: 'Advanced' }, { level: 5, label: 'Expert' }], sfia: 'MLNG', version: 1, status: 'active', tags: ['ai', 'data'] },
    { id: 'COMP-011', name: 'Application Security', categoryId: 'CAT-05', description: 'Implementing secure coding and SAST/DAST.', levels: [{ level: 1, label: 'Beginner' }, { level: 2, label: 'Elementary' }, { level: 3, label: 'Intermediate' }, { level: 4, label: 'Advanced' }, { level: 5, label: 'Expert' }], sfia: 'SCTY', version: 1, status: 'active', tags: ['security', 'devsecops'] },
    { id: 'COMP-012', name: 'Team Leadership', categoryId: 'CAT-06', description: 'Leading and coaching engineering teams.', levels: [{ level: 1, label: 'Beginner' }, { level: 2, label: 'Elementary' }, { level: 3, label: 'Intermediate' }, { level: 4, label: 'Advanced' }, { level: 5, label: 'Expert' }], sfia: 'MANA', version: 1, status: 'active', tags: ['leadership', 'people'] },
    { id: 'COMP-013', name: 'Agile / Scrum', categoryId: 'CAT-09', description: 'Agile methodologies and scrum ceremonies.', levels: [{ level: 1, label: 'Beginner' }, { level: 2, label: 'Elementary' }, { level: 3, label: 'Intermediate' }, { level: 4, label: 'Advanced' }, { level: 5, label: 'Expert' }], sfia: 'METL', version: 1, status: 'active', tags: ['agile', 'scrum'] },
    { id: 'COMP-014', name: 'Technical Communication', categoryId: 'CAT-10', description: 'Writing clear technical documentation and presenting.', levels: [{ level: 1, label: 'Beginner' }, { level: 2, label: 'Elementary' }, { level: 3, label: 'Intermediate' }, { level: 4, label: 'Advanced' }, { level: 5, label: 'Expert' }], sfia: 'CMSK', version: 1, status: 'active', tags: ['communication', 'docs'] },
    { id: 'COMP-015', name: 'Product Roadmapping', categoryId: 'CAT-07', description: 'Defining and managing product strategy and roadmap.', levels: [{ level: 1, label: 'Beginner' }, { level: 2, label: 'Elementary' }, { level: 3, label: 'Intermediate' }, { level: 4, label: 'Advanced' }, { level: 5, label: 'Expert' }], sfia: 'PROD', version: 1, status: 'active', tags: ['product', 'strategy'] },
    { id: 'COMP-016', name: 'React / Next.js', categoryId: 'CAT-01', description: 'Modern React development with Next.js framework.', levels: [{ level: 1, label: 'Beginner' }, { level: 2, label: 'Elementary' }, { level: 3, label: 'Intermediate' }, { level: 4, label: 'Advanced' }, { level: 5, label: 'Expert' }], sfia: 'PROG', version: 1, status: 'active', tags: ['frontend', 'react'] },
    { id: 'COMP-017', name: 'MongoDB / NoSQL', categoryId: 'CAT-04', description: 'Document database design and query optimization.', levels: [{ level: 1, label: 'Beginner' }, { level: 2, label: 'Elementary' }, { level: 3, label: 'Intermediate' }, { level: 4, label: 'Advanced' }, { level: 5, label: 'Expert' }], sfia: 'DBAM', version: 1, status: 'active', tags: ['database', 'nosql'] },
    { id: 'COMP-018', name: 'UX Research', categoryId: 'CAT-08', description: 'User research, usability testing, and design thinking.', levels: [{ level: 1, label: 'Beginner' }, { level: 2, label: 'Elementary' }, { level: 3, label: 'Intermediate' }, { level: 4, label: 'Advanced' }, { level: 5, label: 'Expert' }], sfia: 'HCEV', version: 1, status: 'active', tags: ['ux', 'design'] },
    { id: 'COMP-019', name: 'Infrastructure as Code', categoryId: 'CAT-03', description: 'Terraform, CloudFormation, Pulumi.', levels: [{ level: 1, label: 'Beginner' }, { level: 2, label: 'Elementary' }, { level: 3, label: 'Intermediate' }, { level: 4, label: 'Advanced' }, { level: 5, label: 'Expert' }], sfia: 'CLDP', version: 1, status: 'active', tags: ['iac', 'devops'] },
    { id: 'COMP-020', name: 'Stakeholder Management', categoryId: 'CAT-06', description: 'Managing stakeholder expectations and communication.', levels: [{ level: 1, label: 'Beginner' }, { level: 2, label: 'Elementary' }, { level: 3, label: 'Intermediate' }, { level: 4, label: 'Advanced' }, { level: 5, label: 'Expert' }], sfia: 'RLMT', version: 1, status: 'active', tags: ['leadership', 'communication'] },
];

const EMPLOYEES = [
    { id: 'EMP-001', name: 'Alex Thornton', email: 'alex.thornton@corp.com', department: 'Engineering', roleId: 'ROLE-001', manager: 'Sarah Mitchell', joinDate: '2021-03-15', status: 'active' },
    { id: 'EMP-002', name: 'Priya Sharma', email: 'priya.sharma@corp.com', department: 'Engineering', roleId: 'ROLE-002', manager: 'Sarah Mitchell', joinDate: '2019-07-01', status: 'active' },
    { id: 'EMP-003', name: 'Marcus Chen', email: 'marcus.chen@corp.com', department: 'Engineering', roleId: 'ROLE-003', manager: 'David Park', joinDate: '2022-01-10', status: 'active' },
    { id: 'EMP-004', name: 'Sofia Reyes', email: 'sofia.reyes@corp.com', department: 'Product', roleId: 'ROLE-004', manager: 'James Liu', joinDate: '2020-09-20', status: 'active' },
    { id: 'EMP-005', name: 'James Liu', email: 'james.liu@corp.com', department: 'Product', roleId: 'ROLE-005', manager: 'CEO', joinDate: '2018-04-05', status: 'active' },
    { id: 'EMP-006', name: 'Aisha Kowalski', email: 'aisha.kowalski@corp.com', department: 'Engineering', roleId: 'ROLE-001', manager: 'Sarah Mitchell', joinDate: '2023-02-14', status: 'active' },
    { id: 'EMP-007', name: 'Tom Eriksson', email: 'tom.eriksson@corp.com', department: 'DevOps', roleId: 'ROLE-006', manager: 'David Park', joinDate: '2021-11-01', status: 'active' },
    { id: 'EMP-008', name: 'Clara Bieber', email: 'clara.bieber@corp.com', department: 'Design', roleId: 'ROLE-007', manager: 'James Liu', joinDate: '2022-06-15', status: 'active' },
    { id: 'EMP-009', name: 'David Park', email: 'david.park@corp.com', department: 'Engineering', roleId: 'ROLE-008', manager: 'CEO', joinDate: '2017-09-01', status: 'active' },
    { id: 'EMP-010', name: 'Yuki Tanaka', email: 'yuki.tanaka@corp.com', department: 'Data', roleId: 'ROLE-009', manager: 'David Park', joinDate: '2022-03-28', status: 'active' },
];

const ROLES = [
    { id: 'ROLE-001', name: 'Senior Backend Engineer', department: 'Engineering', level: 'Senior', competencies: [{ competencyId: 'COMP-001', requiredLevel: 4, mandatory: true, weight: 25 }, { competencyId: 'COMP-003', requiredLevel: 3, mandatory: true, weight: 20 }, { competencyId: 'COMP-007', requiredLevel: 3, mandatory: false, weight: 15 }, { competencyId: 'COMP-008', requiredLevel: 3, mandatory: false, weight: 15 }, { competencyId: 'COMP-013', requiredLevel: 2, mandatory: false, weight: 10 }, { competencyId: 'COMP-014', requiredLevel: 2, mandatory: false, weight: 15 }] },
    { id: 'ROLE-002', name: 'Principal Engineer', department: 'Engineering', level: 'Principal', competencies: [{ competencyId: 'COMP-004', requiredLevel: 5, mandatory: true, weight: 30 }, { competencyId: 'COMP-005', requiredLevel: 4, mandatory: true, weight: 25 }, { competencyId: 'COMP-001', requiredLevel: 5, mandatory: true, weight: 20 }, { competencyId: 'COMP-012', requiredLevel: 3, mandatory: false, weight: 15 }, { competencyId: 'COMP-020', requiredLevel: 3, mandatory: false, weight: 10 }] },
    { id: 'ROLE-003', name: 'Junior Software Engineer', department: 'Engineering', level: 'Junior', competencies: [{ competencyId: 'COMP-001', requiredLevel: 2, mandatory: true, weight: 35 }, { competencyId: 'COMP-002', requiredLevel: 2, mandatory: true, weight: 30 }, { competencyId: 'COMP-013', requiredLevel: 1, mandatory: false, weight: 20 }, { competencyId: 'COMP-014', requiredLevel: 1, mandatory: false, weight: 15 }] },
    { id: 'ROLE-004', name: 'Product Manager', department: 'Product', level: 'Mid', competencies: [{ competencyId: 'COMP-015', requiredLevel: 4, mandatory: true, weight: 35 }, { competencyId: 'COMP-020', requiredLevel: 4, mandatory: true, weight: 30 }, { competencyId: 'COMP-013', requiredLevel: 3, mandatory: false, weight: 20 }, { competencyId: 'COMP-014', requiredLevel: 4, mandatory: false, weight: 15 }] },
    { id: 'ROLE-005', name: 'Head of Product', department: 'Product', level: 'Head', competencies: [{ competencyId: 'COMP-015', requiredLevel: 5, mandatory: true, weight: 30 }, { competencyId: 'COMP-012', requiredLevel: 5, mandatory: true, weight: 30 }, { competencyId: 'COMP-020', requiredLevel: 5, mandatory: true, weight: 25 }, { competencyId: 'COMP-014', requiredLevel: 4, mandatory: false, weight: 15 }] },
    { id: 'ROLE-006', name: 'DevOps Engineer', department: 'DevOps', level: 'Mid', competencies: [{ competencyId: 'COMP-006', requiredLevel: 4, mandatory: true, weight: 25 }, { competencyId: 'COMP-007', requiredLevel: 4, mandatory: true, weight: 25 }, { competencyId: 'COMP-008', requiredLevel: 4, mandatory: true, weight: 25 }, { competencyId: 'COMP-019', requiredLevel: 3, mandatory: false, weight: 15 }, { competencyId: 'COMP-011', requiredLevel: 2, mandatory: false, weight: 10 }] },
    { id: 'ROLE-007', name: 'UX Designer', department: 'Design', level: 'Mid', competencies: [{ competencyId: 'COMP-018', requiredLevel: 4, mandatory: true, weight: 50 }, { competencyId: 'COMP-014', requiredLevel: 3, mandatory: false, weight: 30 }, { competencyId: 'COMP-013', requiredLevel: 2, mandatory: false, weight: 20 }] },
    { id: 'ROLE-008', name: 'Engineering Manager', department: 'Engineering', level: 'Manager', competencies: [{ competencyId: 'COMP-012', requiredLevel: 5, mandatory: true, weight: 35 }, { competencyId: 'COMP-020', requiredLevel: 4, mandatory: true, weight: 25 }, { competencyId: 'COMP-004', requiredLevel: 3, mandatory: false, weight: 20 }, { competencyId: 'COMP-013', requiredLevel: 4, mandatory: false, weight: 20 }] },
    { id: 'ROLE-009', name: 'Data Engineer', department: 'Data', level: 'Mid', competencies: [{ competencyId: 'COMP-009', requiredLevel: 4, mandatory: true, weight: 35 }, { competencyId: 'COMP-010', requiredLevel: 3, mandatory: true, weight: 25 }, { competencyId: 'COMP-017', requiredLevel: 3, mandatory: false, weight: 25 }, { competencyId: 'COMP-001', requiredLevel: 3, mandatory: false, weight: 15 }] },
];

const EMPLOYEE_SKILLS = [
    { id: 'ES-001', employeeId: 'EMP-001', competencyId: 'COMP-001', currentLevel: 4, selfAssessedLevel: 4, managerValidated: true, validatedBy: 'EMP-009', lastReviewed: new Date('2025-11-01'), endorsements: ['EMP-002', 'EMP-006'] },
    { id: 'ES-002', employeeId: 'EMP-001', competencyId: 'COMP-002', currentLevel: 3, selfAssessedLevel: 3, managerValidated: true, validatedBy: 'EMP-009', lastReviewed: new Date('2025-11-01'), endorsements: [] },
    { id: 'ES-003', employeeId: 'EMP-001', competencyId: 'COMP-008', currentLevel: 2, selfAssessedLevel: 3, managerValidated: false, validatedBy: null, lastReviewed: new Date('2025-10-15'), endorsements: [] },
    { id: 'ES-004', employeeId: 'EMP-002', competencyId: 'COMP-001', currentLevel: 5, selfAssessedLevel: 5, managerValidated: true, validatedBy: 'EMP-009', lastReviewed: new Date('2025-12-01'), endorsements: ['EMP-001', 'EMP-003'] },
    { id: 'ES-005', employeeId: 'EMP-002', competencyId: 'COMP-004', currentLevel: 4, selfAssessedLevel: 5, managerValidated: true, validatedBy: 'EMP-009', lastReviewed: new Date('2025-12-01'), endorsements: ['EMP-001'] },
    { id: 'ES-006', employeeId: 'EMP-002', competencyId: 'COMP-005', currentLevel: 4, selfAssessedLevel: 4, managerValidated: true, validatedBy: 'EMP-009', lastReviewed: new Date('2025-12-01'), endorsements: [] },
    { id: 'ES-007', employeeId: 'EMP-003', competencyId: 'COMP-001', currentLevel: 2, selfAssessedLevel: 3, managerValidated: false, validatedBy: null, lastReviewed: new Date('2025-10-01'), endorsements: [] },
    { id: 'ES-008', employeeId: 'EMP-003', competencyId: 'COMP-002', currentLevel: 2, selfAssessedLevel: 2, managerValidated: true, validatedBy: 'EMP-009', lastReviewed: new Date('2025-10-01'), endorsements: [] },
    { id: 'ES-009', employeeId: 'EMP-004', competencyId: 'COMP-015', currentLevel: 4, selfAssessedLevel: 4, managerValidated: true, validatedBy: 'EMP-005', lastReviewed: new Date('2025-11-15'), endorsements: ['EMP-005'] },
    { id: 'ES-010', employeeId: 'EMP-004', competencyId: 'COMP-013', currentLevel: 3, selfAssessedLevel: 3, managerValidated: true, validatedBy: 'EMP-005', lastReviewed: new Date('2025-11-15'), endorsements: [] },
    { id: 'ES-011', employeeId: 'EMP-007', competencyId: 'COMP-006', currentLevel: 4, selfAssessedLevel: 4, managerValidated: true, validatedBy: 'EMP-009', lastReviewed: new Date('2025-09-01'), endorsements: [] },
    { id: 'ES-012', employeeId: 'EMP-007', competencyId: 'COMP-007', currentLevel: 4, selfAssessedLevel: 5, managerValidated: true, validatedBy: 'EMP-009', lastReviewed: new Date('2025-09-01'), endorsements: ['EMP-001'] },
    { id: 'ES-013', employeeId: 'EMP-007', competencyId: 'COMP-019', currentLevel: 3, selfAssessedLevel: 3, managerValidated: false, validatedBy: null, lastReviewed: new Date('2025-09-01'), endorsements: [] },
    { id: 'ES-014', employeeId: 'EMP-010', competencyId: 'COMP-009', currentLevel: 3, selfAssessedLevel: 4, managerValidated: false, validatedBy: null, lastReviewed: new Date('2025-08-01'), endorsements: [] },
    { id: 'ES-015', employeeId: 'EMP-010', competencyId: 'COMP-010', currentLevel: 2, selfAssessedLevel: 3, managerValidated: false, validatedBy: null, lastReviewed: new Date('2025-08-01'), endorsements: [] },
];

const CERTIFICATIONS = [
    { id: 'CERT-001', employeeId: 'EMP-002', name: 'AWS Solutions Architect Professional', issuedBy: 'Amazon Web Services', issuedDate: new Date('2023-06-15'), validUntil: new Date('2026-06-15'), status: 'valid', linkedCompetencyId: 'COMP-006', verificationUrl: 'https://aws.amazon.com/verify' },
    { id: 'CERT-002', employeeId: 'EMP-001', name: 'Certified Kubernetes Administrator (CKA)', issuedBy: 'CNCF', issuedDate: new Date('2024-02-10'), validUntil: new Date('2027-02-10'), status: 'valid', linkedCompetencyId: 'COMP-007', verificationUrl: 'https://training.linuxfoundation.org' },
    { id: 'CERT-003', employeeId: 'EMP-007', name: 'HashiCorp Terraform Associate', issuedBy: 'HashiCorp', issuedDate: new Date('2023-09-20'), validUntil: new Date('2025-09-20'), status: 'expiring_soon', linkedCompetencyId: 'COMP-019', verificationUrl: '' },
    { id: 'CERT-004', employeeId: 'EMP-010', name: 'Google Professional Data Engineer', issuedBy: 'Google Cloud', issuedDate: new Date('2022-11-01'), validUntil: new Date('2024-11-01'), status: 'expired', linkedCompetencyId: 'COMP-009', verificationUrl: '' },
    { id: 'CERT-005', employeeId: 'EMP-009', name: 'PMP - Project Management Professional', issuedBy: 'PMI', issuedDate: new Date('2020-05-15'), validUntil: new Date('2026-05-15'), status: 'valid', linkedCompetencyId: 'COMP-012', verificationUrl: '' },
];

const COURSES = [
    { id: 'CRS-001', title: 'Advanced Python for Engineers', linkedCompetencies: ['COMP-001'], provider: 'Pluralsight', durationHours: 14, difficulty: 'Intermediate', format: 'Video', active: true, url: 'https://pluralsight.com', targetLevel: 4 },
    { id: 'CRS-002', title: 'System Design Interview Masterclass', linkedCompetencies: ['COMP-004', 'COMP-005'], provider: 'ByteByteGo', durationHours: 20, difficulty: 'Advanced', format: 'Video', active: true, url: 'https://bytebytego.com', targetLevel: 5 },
    { id: 'CRS-003', title: 'AWS Solutions Architect Prep', linkedCompetencies: ['COMP-006'], provider: 'A Cloud Guru', durationHours: 30, difficulty: 'Intermediate', format: 'Video + Labs', active: true, url: 'https://acloudguru.com', targetLevel: 4 },
    { id: 'CRS-004', title: 'Kubernetes: Zero to Hero', linkedCompetencies: ['COMP-007'], provider: 'Udemy', durationHours: 22, difficulty: 'Intermediate', format: 'Video', active: true, url: 'https://udemy.com', targetLevel: 4 },
    { id: 'CRS-005', title: 'Machine Learning Engineering', linkedCompetencies: ['COMP-010'], provider: 'Coursera', durationHours: 40, difficulty: 'Advanced', format: 'University Course', active: true, url: 'https://coursera.org', targetLevel: 4 },
    { id: 'CRS-006', title: 'Terraform & IaC Fundamentals', linkedCompetencies: ['COMP-019'], provider: 'HashiCorp Learn', durationHours: 10, difficulty: 'Beginner', format: 'Interactive', active: true, url: 'https://learn.hashicorp.com', targetLevel: 2 },
    { id: 'CRS-007', title: 'Leadership for Technical Leads', linkedCompetencies: ['COMP-012', 'COMP-020'], provider: 'LinkedIn Learning', durationHours: 8, difficulty: 'Beginner', format: 'Video', active: true, url: 'https://linkedin.com/learning', targetLevel: 3 },
    { id: 'CRS-008', title: 'Product Management Fundamentals', linkedCompetencies: ['COMP-015'], provider: 'Product School', durationHours: 16, difficulty: 'Beginner', format: 'Live', active: true, url: 'https://productschool.com', targetLevel: 3 },
];

const CAREER_PATHS = [
    { id: 'CP-001', fromRoleId: 'ROLE-003', toRoleId: 'ROLE-001', fromRole: 'Junior Software Engineer', toRole: 'Senior Backend Engineer', estimatedMonths: 24, requiredCompetencies: ['COMP-001', 'COMP-003', 'COMP-007'], milestones: ['Complete system design course', 'Lead one significant feature', 'Mentor a junior'] },
    { id: 'CP-002', fromRoleId: 'ROLE-001', toRoleId: 'ROLE-002', fromRole: 'Senior Backend Engineer', toRole: 'Principal Engineer', estimatedMonths: 36, requiredCompetencies: ['COMP-004', 'COMP-005', 'COMP-012'], milestones: ['Design a major system', 'Present to CTO', 'Lead a team for 6+ months'] },
    { id: 'CP-003', fromRoleId: 'ROLE-001', toRoleId: 'ROLE-008', fromRole: 'Senior Backend Engineer', toRole: 'Engineering Manager', estimatedMonths: 18, requiredCompetencies: ['COMP-012', 'COMP-020', 'COMP-013'], milestones: ['Manage a project delivery', 'Conduct performance reviews', 'Hire 2+ engineers'] },
    { id: 'CP-004', fromRoleId: 'ROLE-003', toRoleId: 'ROLE-006', fromRole: 'Junior Software Engineer', toRole: 'DevOps Engineer', estimatedMonths: 18, requiredCompetencies: ['COMP-006', 'COMP-007', 'COMP-008'], milestones: ['Get AWS certified', 'Own a pipeline', 'Get CKA certified'] },
];

const OPPORTUNITIES = [
    { id: 'OPP-001', title: 'AI Platform Team - Python Lead', description: 'Lead development of our internal AI platform using Python and FastAPI.', requiredCompetencies: [{ competencyId: 'COMP-001', minLevel: 4 }, { competencyId: 'COMP-010', minLevel: 3 }], commitment: '6 months', department: 'Engineering', status: 'open', createdAt: new Date('2026-01-15') },
    { id: 'OPP-002', title: 'Cloud Migration - Architecture Lead', description: 'Architect and lead the migration of legacy services to AWS.', requiredCompetencies: [{ competencyId: 'COMP-006', minLevel: 4 }, { competencyId: 'COMP-004', minLevel: 4 }], commitment: '12 months', department: 'Engineering', status: 'open', createdAt: new Date('2026-02-01') },
    { id: 'OPP-003', title: 'Design System Contributor', description: 'Build and document the company-wide design system components.', requiredCompetencies: [{ competencyId: 'COMP-018', minLevel: 3 }, { competencyId: 'COMP-002', minLevel: 2 }], commitment: '3 months', department: 'Design', status: 'open', createdAt: new Date('2026-02-10') },
];

const COMP_RISKS = [
    { id: 'CRSK-001', title: 'Single point of expertise: Cloud Architecture', description: 'Only one engineer (EMP-002) holds deep expertise in cloud architecture. Departure would create critical capability risk.', criticalCompetencyId: 'COMP-004', riskScore: 85, riskLevel: 'Critical', expertCount: 1, mitigationPlan: 'Enroll EMP-001 and EMP-009 in architecture upskilling program', status: 'open', createdAt: new Date() },
    { id: 'CRSK-002', title: 'Machine Learning skills deficit', description: 'Team lacks ML expertise for upcoming AI initiatives. Only 1 engineer at level 2.', criticalCompetencyId: 'COMP-010', riskScore: 72, riskLevel: 'High', expertCount: 1, mitigationPlan: 'Partner with external ML consultants, begin 3-month training program', status: 'open', createdAt: new Date() },
    { id: 'CRSK-003', title: 'Security skills aging out', description: 'Application security certifications for 2 team members expire in Q2 2026.', criticalCompetencyId: 'COMP-011', riskScore: 55, riskLevel: 'Medium', expertCount: 3, mitigationPlan: 'Schedule renewal training Q1 2026', status: 'monitoring', createdAt: new Date() },
];

const FORUMS = [
    { id: 'FOR-001', title: 'Best Practices: Microservices vs Monolith', linkedCompetencyId: 'COMP-005', postsCount: 12, author: 'EMP-002', tags: ['architecture', 'debate'], createdAt: new Date('2026-01-10'), lastActivity: new Date('2026-02-28') },
    { id: 'FOR-002', title: 'Terraform tips and gotchas', linkedCompetencyId: 'COMP-019', postsCount: 8, author: 'EMP-007', tags: ['iac', 'terraform'], createdAt: new Date('2026-01-20'), lastActivity: new Date('2026-03-01') },
    { id: 'FOR-003', title: 'How I passed the CKA exam', linkedCompetencyId: 'COMP-007', postsCount: 22, author: 'EMP-001', tags: ['kubernetes', 'certification'], createdAt: new Date('2025-12-15'), lastActivity: new Date('2026-02-25') },
];

const ASSESSMENTS = [
    { id: 'ASS-001', employeeId: 'EMP-003', assessorId: 'EMP-009', competencyId: 'COMP-001', assessedLevel: 2, type: 'manager', comments: 'Good fundamentals, needs to work on production code quality.', date: new Date('2025-10-15'), status: 'completed' },
    { id: 'ASS-002', employeeId: 'EMP-001', assessorId: 'EMP-001', competencyId: 'COMP-008', assessedLevel: 3, type: 'self', comments: 'I feel confident with basic CI/CD but need more complex pipeline experience.', date: new Date('2025-11-01'), status: 'completed' },
    { id: 'ASS-003', employeeId: 'EMP-010', assessorId: 'EMP-009', competencyId: 'COMP-009', assessedLevel: 3, type: 'manager', comments: 'Solid foundational skills. Ready for more complex ETL work.', date: new Date('2025-09-20'), status: 'completed' },
    { id: 'ASS-004', employeeId: 'EMP-006', assessorId: null, competencyId: 'COMP-001', assessedLevel: null, type: 'self', comments: '', date: new Date('2026-03-04'), status: 'pending' },
];

const PERFORMANCE = [
    { id: 'PERF-001', employeeId: 'EMP-001', performanceScore: 4.2, linkedCompetencies: ['COMP-001', 'COMP-002', 'COMP-008'], year: 2025, quarter: 'Q4', reviewerName: 'David Park', strengths: 'Strong code quality and reliability', improvements: 'Needs to expand cloud skills' },
    { id: 'PERF-002', employeeId: 'EMP-002', performanceScore: 4.8, linkedCompetencies: ['COMP-001', 'COMP-004', 'COMP-005'], year: 2025, quarter: 'Q4', reviewerName: 'David Park', strengths: 'Exceptional architecture design, mentors others effectively', improvements: 'Could improve stakeholder communication' },
    { id: 'PERF-003', employeeId: 'EMP-007', performanceScore: 4.0, linkedCompetencies: ['COMP-006', 'COMP-007'], year: 2025, quarter: 'Q4', reviewerName: 'David Park', strengths: 'Reliable infrastructure delivery, owns the full CI/CD stack', improvements: 'Document processes better' },
];

const SKILL_GAPS = [
    { id: 'GAP-001', employeeId: 'EMP-001', roleId: 'ROLE-001', totalGap: 3, gaps: [{ competencyId: 'COMP-003', required: 3, current: 1, gap: 2 }, { competencyId: 'COMP-007', required: 3, current: 2, gap: 1 }], calculatedAt: new Date() },
    { id: 'GAP-002', employeeId: 'EMP-003', roleId: 'ROLE-003', totalGap: 4, gaps: [{ competencyId: 'COMP-001', required: 2, current: 1, gap: 1 }, { competencyId: 'COMP-013', required: 1, current: 0, gap: 1 }, { competencyId: 'COMP-014', required: 1, current: 0, gap: 1 }, { competencyId: 'COMP-002', required: 2, current: 1, gap: 1 }], calculatedAt: new Date() },
    { id: 'GAP-003', employeeId: 'EMP-010', roleId: 'ROLE-009', totalGap: 5, gaps: [{ competencyId: 'COMP-009', required: 4, current: 3, gap: 1 }, { competencyId: 'COMP-010', required: 3, current: 2, gap: 1 }, { competencyId: 'COMP-017', required: 3, current: 1, gap: 2 }, { competencyId: 'COMP-001', required: 3, current: 2, gap: 1 }], calculatedAt: new Date() },
];

const SKILL_PLANS = [
    { id: 'SP-001', title: 'AI & ML Upskilling Initiative 2026', description: 'Build internal ML capability to support AI platform roadmap.', targetYear: 2026, targetCompetencies: ['COMP-010', 'COMP-009'], currentGap: 'High', budget: 50000, status: 'active', owner: 'David Park' },
    { id: 'SP-002', title: 'Cloud Architecture Centre of Excellence', description: 'Develop a team of 5 certified AWS architects by Q3 2026.', targetYear: 2026, targetCompetencies: ['COMP-006', 'COMP-004'], currentGap: 'Critical', budget: 80000, status: 'active', owner: 'Priya Sharma' },
];

const INTEGRATIONS = [
    { id: 'INT-001', name: 'Workday HRIS', type: 'HRIS', status: 'connected', lastSync: new Date('2026-03-01'), syncFrequency: 'Daily', endpoint: 'https://api.workday.com/v1' },
    { id: 'INT-002', name: 'Cornerstone LMS', type: 'LMS', status: 'disconnected', lastSync: null, syncFrequency: 'Weekly', endpoint: 'https://api.cornerstoneondemand.com' },
    { id: 'INT-003', name: 'Jira / Atlassian', type: 'DevTools', status: 'connected', lastSync: new Date('2026-03-04'), syncFrequency: 'Realtime', endpoint: 'https://your-org.atlassian.net/rest/api' },
];

async function seed() {
    console.log('🌱 Seeding Competence Management database...');
    const client = await clientPromise;
    const db = client.db();

    const seedCollection = async (name: string, docs: any[]) => {
        const col = db.collection(name);
        for (const doc of docs) {
            await col.updateOne({ id: doc.id }, { $setOnInsert: { ...doc, createdAt: new Date() } }, { upsert: true });
        }
        console.log(`  ✅ ${name}: ${docs.length} records ensured`);
    };

    await seedCollection('cm_categories', CATEGORIES);
    await seedCollection('cm_competencies', COMPETENCIES);
    await seedCollection('cm_employees', EMPLOYEES);
    await seedCollection('cm_roles', ROLES);
    await seedCollection('cm_employee_skills', EMPLOYEE_SKILLS);
    await seedCollection('cm_certifications', CERTIFICATIONS);
    await seedCollection('cm_courses', COURSES);
    await seedCollection('cm_career_paths', CAREER_PATHS);
    await seedCollection('cm_opportunities', OPPORTUNITIES);
    await seedCollection('cm_comp_risks', COMP_RISKS);
    await seedCollection('cm_forums', FORUMS);
    await seedCollection('cm_assessments', ASSESSMENTS);
    await seedCollection('cm_performance', PERFORMANCE);
    await seedCollection('cm_skill_gaps', SKILL_GAPS);
    await seedCollection('cm_skill_plans', SKILL_PLANS);
    await seedCollection('cm_integrations', INTEGRATIONS);

    // MongoDB Indexes
    await db.collection('cm_competencies').createIndex({ status: 1 });
    await db.collection('cm_employee_skills').createIndex({ employeeId: 1 });
    await db.collection('cm_skill_gaps').createIndex({ employeeId: 1, roleId: 1 });
    await db.collection('cm_assessments').createIndex({ employeeId: 1, date: -1 });
    await db.collection('cm_certifications').createIndex({ employeeId: 1, validUntil: 1 });
    await db.collection('cm_audit_logs').createIndex({ timestamp: -1 });

    console.log('\n🎉 Seed complete! All collections ready.');
    process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });
