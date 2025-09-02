import mongoose, { Schema, Document } from 'mongoose';
import { Lesson as ILesson } from '../../../shared/types';

export interface LessonDocument extends Omit<Document, 'id'>, Omit<ILesson, '_id'> {}

const mediaFileSchema = new Schema({
  type: {
    type: String,
    enum: ['audio', 'video', 'image'],
    required: true
  },
  url: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  }
});

const lessonSchema = new Schema<LessonDocument>({
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
  title: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  level: {
    type: Number,
    required: true,
    min: 1,
    index: true
  },
  duration: {
    type: Number,
    required: true,
    min: 1 // Duration in minutes
  },
  isPopular: {
    type: Boolean,
    default: false,
    index: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  prerequisites: [{
    type: String,
    trim: true
  }],
  mediaFiles: [mediaFileSchema]
}, {
  timestamps: true
});

// Compound indexes for efficient queries
lessonSchema.index({ categoryId: 1, level: 1 });
lessonSchema.index({ isPopular: 1, isActive: 1 });
lessonSchema.index({ isActive: 1, level: 1 });

export const Lesson = mongoose.model<LessonDocument>('Lesson', lessonSchema);
