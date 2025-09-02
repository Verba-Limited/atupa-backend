import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
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

export interface UserDocument extends Document, Omit<IUser, '_id'> {
  password: string;
  refreshToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  verificationToken?: string;
  verificationExpires?: Date;
  loginAttempts: number;
  lockUntil?: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  incrementLoginAttempts(): Promise<void>;
  isLocked(): boolean;
}

const userSchema = new Schema<UserDocument>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
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
  },
  refreshToken: {
    type: String
  },
  passwordResetToken: {
    type: String
  },
  passwordResetExpires: {
    type: Date
  },
  verificationToken: {
    type: String
  },
  verificationExpires: {
    type: Date
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: {
    transform(doc: any, ret: any) {
      delete ret.password;
      delete ret.refreshToken;
      delete ret.passwordResetToken;
      delete ret.verificationToken;
      delete ret.loginAttempts;
      delete ret.lockUntil;
      return ret;
    }
  }
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ verificationToken: 1 });
userSchema.index({ passwordResetToken: 1 });

// Virtual for user's full name
userSchema.virtual('fullName').get(function() {
  if (this.firstName && this.lastName) {
    return `${this.firstName} ${this.lastName}`;
  }
  return this.name || this.email.split('@')[0];
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Account lockout methods
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME = 2 * 60 * 60 * 1000; // 2 hours

userSchema.methods.incrementLoginAttempts = async function(): Promise<void> {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    }).exec();
  }
  
  const updates: any = { $inc: { loginAttempts: 1 } };
  
  // If we hit max attempts and it's not locked yet, lock the account
  if (this.loginAttempts + 1 >= MAX_LOGIN_ATTEMPTS && !this.isLocked()) {
    updates.$set = { lockUntil: Date.now() + LOCK_TIME };
  }
  
  return this.updateOne(updates).exec();
};

userSchema.methods.isLocked = function(): boolean {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

// Static method to find by credentials
userSchema.statics.findByCredentials = async function(email: string, password: string) {
  const user = await this.findOne({ email });
  
  if (!user) {
    throw new Error('Invalid credentials');
  }
  
  if (user.isLocked()) {
    throw new Error('Account temporarily locked due to too many failed login attempts');
  }
  
  const isMatch = await user.comparePassword(password);
  
  if (!isMatch) {
    await user.incrementLoginAttempts();
    throw new Error('Invalid credentials');
  }
  
  // Reset login attempts on successful login
  if (user.loginAttempts > 0) {
    await user.updateOne({
      $unset: { loginAttempts: 1, lockUntil: 1 }
    });
  }
  
  return user;
};

export const User = mongoose.model<UserDocument>('User', userSchema);
