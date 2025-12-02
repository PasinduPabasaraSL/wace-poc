import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IPod extends Document {
  name: string
  tagline?: string
  logoUrl?: string
  creatorId: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const PodSchema = new Schema<IPod>(
  {
    name: {
      type: String,
      required: [true, 'Pod name is required'],
      trim: true,
    },
    tagline: {
      type: String,
      trim: true,
    },
    logoUrl: {
      type: String,
    },
    creatorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

const Pod: Model<IPod> = mongoose.models.Pod || mongoose.model<IPod>('Pod', PodSchema)

export default Pod

