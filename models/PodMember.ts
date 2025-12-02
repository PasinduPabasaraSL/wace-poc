import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IPodMember extends Document {
  podId: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  role: 'creator' | 'member'
  joinedAt: Date
}

const PodMemberSchema = new Schema<IPodMember>(
  {
    podId: {
      type: Schema.Types.ObjectId,
      ref: 'Pod',
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      enum: ['creator', 'member'],
      default: 'member',
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
)

// Compound index to ensure one user can only be in a pod once
PodMemberSchema.index({ podId: 1, userId: 1 }, { unique: true })

const PodMember: Model<IPodMember> = mongoose.models.PodMember || mongoose.model<IPodMember>('PodMember', PodMemberSchema)

export default PodMember

