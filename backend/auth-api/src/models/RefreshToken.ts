import mongoose, { Document, Schema } from 'mongoose';

export interface RefreshTokenDocument extends Document {
  token: string;
  userId: mongoose.Types.ObjectId;
  expiresAt: Date;
  isRevoked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const refreshTokenSchema = new Schema<RefreshTokenDocument>({
  token: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true
  },
  isRevoked: {
    type: Boolean,
    default: false,
    index: true
  }
}, {
  timestamps: true
});

// Index for cleanup of expired tokens
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Index for efficient queries
refreshTokenSchema.index({ token: 1, isRevoked: 1 });
refreshTokenSchema.index({ userId: 1, isRevoked: 1 });

export const RefreshTokenModel = mongoose.model<RefreshTokenDocument>('RefreshToken', refreshTokenSchema);