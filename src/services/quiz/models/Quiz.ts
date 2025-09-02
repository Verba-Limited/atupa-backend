import mongoose, { Schema, Document } from 'mongoose';
import { Quiz as IQuiz } from '../../../shared/types';

export interface QuizDocument extends Omit<Document, 'id'>, Omit<IQuiz, '_id'> {}

const quizSchema = new Schema<QuizDocument>({
  id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  categoryId: {
    type: String,
    required: true,
    index: true
  },
  categoryName: {
    type: String,
    required: true,
    index: true
  },
  levelNumber: {
    type: Number,
    required: true,
    min: 1,
    index: true
  },
  questionNumber: {
    type: Number,
    required: true,
    min: 1
  },
  question: {
    type: String,
    required: true,
    trim: true
  },
  questionSpeech: {
    type: String,
    trim: true
  },
  options: {
    option1: { type: String, required: true, trim: true },
    option2: { type: String, required: true, trim: true },
    option3: { type: String, required: true, trim: true },
    option4: { type: String, required: true, trim: true }
  },
  answer: {
    type: String,
    required: true,
    enum: ['option1', 'option2', 'option3', 'option4']
  },
  explanation: {
    type: String,
    required: true,
    trim: true
  },
  fullMeaning: {
    type: String,
    trim: true
  },
  picture: {
    type: String,
    trim: true
  },
  points: {
    type: Number,
    required: true,
    min: 1,
    default: 10
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'easy'
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
quizSchema.index({ categoryId: 1, levelNumber: 1 });
quizSchema.index({ categoryId: 1, questionNumber: 1 });
quizSchema.index({ difficulty: 1, categoryId: 1 });

export const Quiz = mongoose.model<QuizDocument>('Quiz', quizSchema);
