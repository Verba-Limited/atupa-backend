import mongoose, { Schema, Document } from 'mongoose';
import { UserProgress as IUserProgress, QuizAttempt as IQuizAttempt } from '../../../shared/types';

export interface UserProgressDocument extends Document, Omit<IUserProgress, '_id'> {}
export interface QuizAttemptDocument extends Document, Omit<IQuizAttempt, '_id'> {}

const userProgressSchema = new Schema<UserProgressDocument>({
  userId: {
    type: String,
    required: true,
    index: true
  },
  categoryId: {
    type: String,
    required: true,
    index: true
  },
  levelNumber: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  totalPoints: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  completedQuestions: [{
    type: String
  }],
  highestLevelUnlocked: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  completedLevels: [{
    type: Number,
    min: 1
  }],
  achievements: [{
    type: String
  }],
  streakDays: {
    type: Number,
    min: 0,
    default: 0
  },
  lastActiveDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const quizAttemptSchema = new Schema<QuizAttemptDocument>({
  userId: {
    type: String,
    required: true,
    index: true
  },
  quizId: {
    type: String,
    required: true,
    index: true
  },
  categoryId: {
    type: String,
    required: true,
    index: true
  },
  levelNumber: {
    type: Number,
    required: true,
    min: 1
  },
  selectedAnswer: {
    type: String,
    required: true,
    enum: ['option1', 'option2', 'option3', 'option4']
  },
  isCorrect: {
    type: Boolean,
    required: true
  },
  timeSpent: {
    type: Number,
    min: 0,
    default: 0
  },
  pointsEarned: {
    type: Number,
    min: 0,
    default: 0
  },
  attemptDate: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
userProgressSchema.index({ userId: 1, categoryId: 1 }, { unique: true });
userProgressSchema.index({ userId: 1, totalPoints: -1 });
userProgressSchema.index({ lastActiveDate: -1 });

quizAttemptSchema.index({ userId: 1, attemptDate: -1 });
quizAttemptSchema.index({ categoryId: 1, isCorrect: 1 });
quizAttemptSchema.index({ userId: 1, quizId: 1, attemptDate: -1 });

export const UserProgress = mongoose.model<UserProgressDocument>('UserProgress', userProgressSchema);
export const QuizAttempt = mongoose.model<QuizAttemptDocument>('QuizAttempt', quizAttemptSchema);
