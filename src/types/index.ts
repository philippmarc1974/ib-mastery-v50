export interface User {
  uid: string;
  email: string;
  displayName: string;
  createdAt: Date;
}

export interface Subject {
  id: string;
  name: string;
  level: "SL" | "HL";
  group: number; // IB subject group 1-6
  icon?: string;
}

export interface Question {
  id: string;
  subject: string;
  topic: string;
  subtopic?: string;
  difficulty: 1 | 2 | 3; // easy, medium, hard
  type: "mcq" | "short-answer" | "extended-response" | "data-based";
  prompt: string;
  markScheme?: string;
  maxMarks: number;
  year?: number; // past paper year
  paperNumber?: number;
}

export interface Attempt {
  id: string;
  userId: string;
  questionId: string;
  subject: string;
  answer: string;
  score?: number;
  maxMarks: number;
  feedback?: string;
  createdAt: Date;
}

export interface ProgressStats {
  subject: string;
  totalAttempts: number;
  averageScore: number;
  topicBreakdown: Record<string, { attempts: number; avgScore: number }>;
  recentTrend: number[]; // last N scores
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}
