import mongoose, { Schema, Document } from 'mongoose';
import { User as IUser, UserSubscription, UserPreferences } from '../../../shared/types';

const userPreferencesSchema = new Schema<UserPreferences>({
  notifications: { type: Boolean, default: true },
  sound: { type: Boolean, default: true },
  vibration: { type: Boolean, default: false },
  language: { type: String, default: 'yoruba' }
});

const userSubscriptionSchema = new Schema<UserSubscription>({
  type: { type: String, enum: ['free', 'monthly', 'yearly'], default: 'free' },
  status: { type: String, enum: ['active', 'inactive', 'expired', 'cancelled'], default: 'inactive' },
  startDate: { type: Date },
  endDate: { type: Date },
  stripeCustomerId: { type: String },
  stripeSubscriptionId: { type: String }
});

export interface UserProfileDocument extends Document, Omit<IUser, '_id'> {}

const userProfileSchema = new Schema<UserProfileDocument>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  firstName: {
    type: String,
    trim: true
  },
  lastName: {
    type: String,
    trim: true
  },
  name: {
    type: String,
    trim: true
  },
  profileImage: {
    type: String
  },
  emailVisibility: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  subscription: {
    type: userSubscriptionSchema,
    default: () => ({})
  },
  preferences: {
    type: userPreferencesSchema,
    default: () => ({})
  }
}, {
  timestamps: true
});

// Virtual for user's full name
userProfileSchema.virtual('fullName').get(function() {
  if (this.firstName && this.lastName) {
    return `${this.firstName} ${this.lastName}`;
  }
  return this.name || this.email.split('@')[0];
});

export const UserProfile = mongoose.model<UserProfileDocument>('UserProfile', userProfileSchema);
