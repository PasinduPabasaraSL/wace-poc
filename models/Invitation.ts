import mongoose, { Schema, Document, Model } from 'mongoose'
import crypto from 'crypto'

export interface IInvitation extends Document {
  podId: mongoose.Types.ObjectId
  email: string
  token: string
  invitedBy: mongoose.Types.ObjectId
  status: 'pending' | 'accepted' | 'expired'
  expiresAt: Date
  createdAt: Date
}

const InvitationSchema = new Schema<IInvitation>(
  {
    podId: {
      type: Schema.Types.ObjectId,
      ref: 'Pod',
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    invitedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'expired'],
      default: 'pending',
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  },
  {
    timestamps: true,
  }
)

// Note: Token is generated in the API route before creating the invitation
// This avoids issues with Mongoose 9 and pre-save hooks

// Check if invitation is expired
InvitationSchema.methods.isExpired = function (): boolean {
  return this.expiresAt < new Date() || this.status !== 'pending'
}

const Invitation: Model<IInvitation> = mongoose.models.Invitation || mongoose.model<IInvitation>('Invitation', InvitationSchema)

export default Invitation

