// User Roles
export const USER_ROLES = {
  EMPLOYER: 'employer',
  CANDIDATE: 'candidate',
  ADMIN: 'admin',
};

// Job Status
export const JOB_STATUS = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  CLOSED: 'closed',
  ARCHIVED: 'archived',
};

// Application Status
export const APPLICATION_STATUS = {
  APPLIED: 'applied',
  REJECTED: 'rejected',
  SHORTLISTED: 'shortlisted',
  INTERVIEW: 'interview',
  OFFERED: 'offered',
  HIRED: 'hired',
};

// Interview Status
export const INTERVIEW_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

// Interview Types
export const INTERVIEW_TYPES = {
  TECHNICAL: 'technical',
  HR: 'hr',
  BEHAVIORAL: 'behavioral',
  FINAL: 'final',
};

// Recommendation
export const RECOMMENDATIONS = {
  STRONG_YES: 'strong_yes',
  YES: 'yes',
  MAYBE: 'maybe',
  NO: 'no',
  STRONG_NO: 'strong_no',
};

// Question Categories
export const QUESTION_CATEGORIES = {
  TECHNICAL: 'technical',
  BEHAVIORAL: 'behavioral',
  SITUATIONAL: 'situational',
  OTHER: 'other',
};

// Difficulty Levels
export const DIFFICULTY_LEVELS = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
};

// Toast Types
export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  INFO: 'info',
  WARNING: 'warning',
};

// API Routes
export const API_ROUTES = {
  AUTH: '/api/auth',
  USERS: '/api/users',
  EMPLOYERS: '/api/employers',
  JOBS: '/api/jobs',
  CANDIDATES: '/api/candidates',
  APPLICATIONS: '/api/applications',
  INTERVIEWS: '/api/interview-sessions',
  QUESTIONS: '/api/interview-questions',
  ANSWERS: '/api/interview-answers',
};
