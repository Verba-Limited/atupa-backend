export interface User {
  _id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  profileImage?: string;
  emailVisibility?: boolean;
  isVerified: boolean;
  subscription?: UserSubscription;
  preferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSubscription {
  type: 'free' | 'monthly' | 'yearly';
  status: 'active' | 'inactive' | 'expired' | 'cancelled';
  startDate: Date;
  endDate?: Date;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

export interface UserPreferences {
  notifications: boolean;
  sound: boolean;
  vibration: boolean;
  language: string;
}

export interface Quiz {
  _id: string;
  id: string;
  categoryId: string;
  categoryName: string;
  levelNumber: number;
  questionNumber: number;
  question: string;
  questionSpeech?: string;
  options: {
    option1: string;
    option2: string;
    option3: string;
    option4: string;
  };
  answer: string;
  explanation: string;
  fullMeaning?: string;
  picture?: string;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  _id: string;
  id: string;
  name: string;
  displayName: string;
  description: string;
  icon?: string;
  totalLevels: number;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProgress {
  _id: string;
  userId: string;
  categoryId: string;
  levelNumber: number;
  totalPoints: number;
  completedQuestions: string[];
  highestLevelUnlocked: number;
  completedLevels: number[];
  achievements: string[];
  streakDays: number;
  lastActiveDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Achievement {
  _id: string;
  id: string;
  title: string;
  description: string;
  icon: string;
  criteria: {
    type: 'points' | 'streak' | 'levels' | 'quizzes';
    value: number;
    categoryId?: string;
  };
  points: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Leaderboard {
  _id: string;
  userId: string;
  user: Partial<User>;
  totalPoints: number;
  level: number;
  rank: number;
  period: 'daily' | 'weekly' | 'monthly' | 'allTime';
  categoryId?: string;
  lastUpdated: Date;
}

export interface Notification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: 'achievement' | 'subscription' | 'lesson' | 'quiz' | 'system';
  isRead: boolean;
  data?: any;
  createdAt: Date;
}

export interface Lesson {
  _id: string;
  id: string;
  categoryId: string;
  title: string;
  description: string;
  content: string;
  level: number;
  duration: number;
  isPopular: boolean;
  isActive: boolean;
  prerequisites: string[];
  mediaFiles: {
    type: 'audio' | 'video' | 'image';
    url: string;
    description?: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface QuizAttempt {
  _id: string;
  userId: string;
  quizId: string;
  categoryId: string;
  levelNumber: number;
  selectedAnswer: string;
  isCorrect: boolean;
  timeSpent: number;
  pointsEarned: number;
  attemptDate: Date;
}

export interface GameState {
  pageFrom: string;
  category: string;
  level: number;
  currentQuestion: number;
  score: number;
  answers: Record<string, string>;
  timeSpent: number;
  isCompleted: boolean;
}
