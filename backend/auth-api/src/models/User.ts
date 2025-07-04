import mongoose, { Schema, Document, CallbackError } from 'mongoose';
import bcrypt from 'bcrypt';
import { User as UserInterface } from '../types/auth.js';

export interface UserDocument extends Omit<UserInterface, 'id'>, Document {
  comparePassword(candidatePassword: string): Promise<boolean>;
  toProfile(): Omit<UserInterface, 'passwordHash'>;
}

const userSchema = new Schema<UserDocument>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
  },
  passwordHash: {
    type: String,
    required: true,
    minlength: 6,
  },
  firstName: {
    type: String,
    trim: true,
    maxlength: 50,
  },
  lastName: {
    type: String,
    trim: true,
    maxlength: 50,
  },
  roles: {
    type: [String],
    default: ['user'],
    enum: ['user', 'admin', 'manufacturer', 'retailer'],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  lastLoginAt: {
    type: Date,
  },
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      delete ret.passwordHash;
      return ret;
    },
  },
});

// Index for performance
userSchema.index({ email: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ roles: 1 });

// Instance method to compare password
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Instance method to get user profile (without sensitive data)
userSchema.methods.toProfile = function() {
  const userObject = this.toObject();
  const { passwordHash, ...profile } = userObject;
  return {
    ...profile,
    id: userObject._id.toString(),
  };
};

// Static method to hash password
userSchema.statics.hashPassword = async function(password: string): Promise<string> {
  const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12', 10);
  return bcrypt.hash(password, saltRounds);
};

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('passwordHash')) {
    return next();
  }
  
  try {
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12', 10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, saltRounds);
    next();
  } catch (error) {
    next(error as Error);
  }
});

export const UserModel = mongoose.model<UserDocument>('User', userSchema);