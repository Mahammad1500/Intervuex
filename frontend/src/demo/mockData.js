const now = new Date();
const daysAgo = (n) => new Date(now.getTime() - n * 86400000).toISOString();
const daysAhead = (n) => new Date(now.getTime() + n * 86400000).toISOString();

export const DEMO_COMPANY_ID = 'demo-company-1';
export const DEMO_COMPANY_2 = 'demo-company-2';

export const DEMO_USERS = {
  admin: {
    _id: 'demo-user-admin',
    firstName: 'Demo',
    lastName: 'Admin',
    email: 'admin@intervuex.com',
    role: 'admin',
    companyId: null,
    department: 'Platform',
    jobTitle: 'Platform Admin',
    isActive: true,
    isEmailVerified: true,
    preferences: { timezone: 'Asia/Kolkata', notifications: { email: true } },
  },
  hr: {
    _id: 'demo-user-hr',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'hr@intervuex.com',
    role: 'hr',
    companyId: DEMO_COMPANY_ID,
    department: 'Human Resources',
    jobTitle: 'HR Manager',
    isActive: true,
    isEmailVerified: true,
    preferences: { timezone: 'Asia/Kolkata', notifications: { email: true } },
  },
};

export const demoCompanies = [
  {
    _id: DEMO_COMPANY_ID,
    name: 'Acme Technologies',
    spaceCode: 'ACME2026',
    allowedEmailDomains: ['acme.com'],
    hrCount: 3,
    createdAt: daysAgo(45),
  },
  {
    _id: DEMO_COMPANY_2,
    name: 'Nova Hiring Ltd',
    spaceCode: 'NOVA8X2K',
    allowedEmailDomains: [],
    hrCount: 2,
    createdAt: daysAgo(12),
  },
  {
    _id: 'demo-company-3',
    name: 'BrightPath Recruiting',
    spaceCode: 'BRIGHT42',
    allowedEmailDomains: ['brightpath.io'],
    hrCount: 1,
    createdAt: daysAgo(5),
  },
];

export const demoUsers = [
  { _id: 'demo-user-hr', firstName: 'Sarah', lastName: 'Johnson', email: 'hr@intervuex.com', role: 'hr', companyId: DEMO_COMPANY_ID, isActive: true, department: 'HR', jobTitle: 'HR Manager', createdAt: daysAgo(40) },
  { _id: 'demo-user-hr2', firstName: 'Mike', lastName: 'Chen', email: 'mike.chen@acme.com', role: 'hr', companyId: DEMO_COMPANY_ID, isActive: true, department: 'HR', jobTitle: 'Recruiter', createdAt: daysAgo(20) },
  { _id: 'demo-user-hr3', firstName: 'Priya', lastName: 'Sharma', email: 'priya@acme.com', role: 'hr', companyId: DEMO_COMPANY_ID, isActive: true, department: 'HR', jobTitle: 'Talent Lead', createdAt: daysAgo(8) },
  { _id: 'demo-user-hr4', firstName: 'James', lastName: 'Wilson', email: 'james@nova.com', role: 'hr', companyId: DEMO_COMPANY_2, isActive: true, department: 'HR', jobTitle: 'HR Partner', createdAt: daysAgo(10) },
];

export const demoInterviews = [
  {
    _id: 'demo-int-1',
    candidateName: 'Alex Rivera',
    candidateEmail: 'alex.rivera@email.com',
    interviewerEmail: 'lead.dev@acme.com',
    panelInterviewers: ['senior.dev@acme.com'],
    role: 'Senior Frontend Engineer',
    interviewType: 'technical',
    status: 'scheduled',
    scheduledAt: daysAhead(2),
    duration: 60,
    timezone: 'Asia/Kolkata',
    meetingLink: 'https://meet.google.com/demo-link-1',
    meetingPlatform: 'google-meet',
    companyId: DEMO_COMPANY_ID,
    createdAt: daysAgo(1),
  },
  {
    _id: 'demo-int-2',
    candidateName: 'Jordan Lee',
    candidateEmail: 'jordan.lee@email.com',
    interviewerEmail: 'hr.lead@acme.com',
    panelInterviewers: [],
    role: 'Product Manager',
    interviewType: 'behavioral',
    status: 'confirmed',
    scheduledAt: daysAhead(1),
    duration: 45,
    timezone: 'Asia/Kolkata',
    meetingLink: 'https://zoom.us/j/demo123456',
    meetingPlatform: 'zoom',
    companyId: DEMO_COMPANY_ID,
    createdAt: daysAgo(3),
  },
  {
    _id: 'demo-int-3',
    candidateName: 'Sam Taylor',
    candidateEmail: 'sam.t@email.com',
    interviewerEmail: 'eng.manager@acme.com',
    panelInterviewers: ['architect@acme.com', 'pm@acme.com'],
    role: 'Backend Engineer',
    interviewType: 'system-design',
    status: 'completed',
    scheduledAt: daysAgo(2),
    duration: 90,
    timezone: 'Asia/Kolkata',
    meetingLink: 'https://teams.microsoft.com/demo',
    meetingPlatform: 'teams',
    companyId: DEMO_COMPANY_ID,
    createdAt: daysAgo(10),
  },
  {
    _id: 'demo-int-4',
    candidateName: 'Casey Morgan',
    candidateEmail: 'casey.m@email.com',
    interviewerEmail: 'recruiter@nova.com',
    panelInterviewers: [],
    role: 'UX Designer',
    interviewType: 'screening',
    status: 'cancelled',
    scheduledAt: daysAgo(1),
    duration: 30,
    timezone: 'Asia/Kolkata',
    meetingLink: '',
    meetingPlatform: 'other',
    companyId: DEMO_COMPANY_2,
    createdAt: daysAgo(5),
  },
];

export const demoAuditLogs = [
  { _id: 'demo-audit-1', action: 'workspace_created', actorEmail: 'admin@intervuex.com', targetLabel: 'Acme Technologies', createdAt: daysAgo(45) },
  { _id: 'demo-audit-2', action: 'user_created', actorEmail: 'admin@intervuex.com', targetLabel: 'hr@intervuex.com', createdAt: daysAgo(40) },
  { _id: 'demo-audit-3', action: 'workspace_created', actorEmail: 'admin@intervuex.com', targetLabel: 'Nova Hiring Ltd', createdAt: daysAgo(12) },
  { _id: 'demo-audit-4', action: 'welcome_email_resent', actorEmail: 'admin@intervuex.com', targetLabel: 'mike.chen@acme.com', createdAt: daysAgo(2) },
];

export const demoTrends = Array.from({ length: 14 }, (_, i) => {
  const d = new Date(now);
  d.setDate(d.getDate() - (13 - i));
  return {
    date: d.toISOString().slice(0, 10),
    scheduled: Math.floor(Math.random() * 4) + 1,
    completed: Math.floor(Math.random() * 3),
    cancelled: Math.floor(Math.random() * 2),
  };
});

export const demoDashboardStats = {
  interviews: { total: 24, scheduled: 8, confirmed: 5, completed: 9, cancelled: 2, upcoming: 6 },
  users: { totalHR: 6, activeHR: 5, totalAdmin: 1 },
  companies: { total: 3 },
  recentInterviews: demoInterviews.slice(0, 3),
  completionRate: 78,
};

export const demoNotifications = [
  { _id: 'demo-notif-1', title: 'Interview scheduled', message: 'Alex Rivera — Senior Frontend Engineer', read: false, createdAt: daysAgo(1) },
  { _id: 'demo-notif-2', title: 'Interview confirmed', message: 'Jordan Lee confirmed attendance', read: false, createdAt: daysAgo(2) },
  { _id: 'demo-notif-3', title: 'Reminder sent', message: 'Sam Taylor interview completed', read: true, createdAt: daysAgo(3) },
];

export const demoFunnel = [
  { stage: 'Scheduled', count: 8 },
  { stage: 'Confirmed', count: 5 },
  { stage: 'Completed', count: 9 },
  { stage: 'Cancelled', count: 2 },
];

export const demoFeedbackStats = { averageRating: 4.2, totalReviews: 12, distribution: { 5: 6, 4: 4, 3: 2, 2: 0, 1: 0 } };

export const demoInterviewerPerformance = [
  { email: 'lead.dev@acme.com', name: 'Lead Dev', total: 8, completed: 6, avgRating: 4.5 },
  { email: 'hr.lead@acme.com', name: 'HR Lead', total: 5, completed: 4, avgRating: 4.1 },
];

export const demoWorkspace = {
  hasWorkspace: true,
  company: demoCompanies[0],
  stats: { activeHRCount: 3, interviewCount: 12 },
};
