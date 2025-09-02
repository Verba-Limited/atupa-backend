import mongoose, { Schema, Document } from 'mongoose';
import { Category as ICategory } from '../../../shared/types';

export interface CategoryDocument extends Omit<Document, 'id'>, Omit<ICategory, '_id'> {}

const categorySchema = new Schema<CategoryDocument>({
  id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  displayName: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  icon: {
    type: String,
    trim: true
  },
  totalLevels: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  order: {
    type: Number,
    required: true,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes
categorySchema.index({ isActive: 1, order: 1 });

export const Category = mongoose.model<CategoryDocument>('Category', categorySchema);
