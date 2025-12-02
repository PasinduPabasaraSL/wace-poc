import mongoose, { Schema, Document, Model } from 'mongoose'

export type ProfileType = 'startup' | 'agency'
export type FundingStage = 'pre-seeded' | 'seeded' | 'series-a' | 'series-b' | 'series-c' | 'bootstrapped' | 'other'

export interface IExploreProfile extends Document {
  userId: mongoose.Types.ObjectId
  podId?: mongoose.Types.ObjectId // Optional: if created from existing pod
  type: ProfileType
  name: string
  logoUrl?: string
  tagline?: string
  description?: string
  
  // Startup specific fields
  dateStarted?: Date
  location?: string
  fundingStage?: FundingStage
  website?: string
  founders?: Array<{
    name: string
    role?: string
    linkedin?: string
  }>
  
  // Agency specific fields
  services?: string[]
  clients?: string[]
  yearsOfExperience?: number
  
  // Common fields for both
  teamMembers?: Array<{
    name: string
    role?: string
    linkedin?: string
  }>
  
  // Common fields
  contactEmail?: string
  contactPhone?: string
  socialLinks?: {
    linkedin?: string
    twitter?: string
    github?: string
    website?: string
  }
  
  // Display settings
  isPublished: boolean
  isFeatured: boolean
  featuredUntil?: Date
  
  // Engagement
  likes: mongoose.Types.ObjectId[] // Array of user IDs who liked
  viewCount: number
  
  createdAt: Date
  updatedAt: Date
}

const ExploreProfileSchema = new Schema<IExploreProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    podId: {
      type: Schema.Types.ObjectId,
      ref: 'Pod',
    },
    type: {
      type: String,
      enum: ['startup', 'agency'],
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    logoUrl: {
      type: String,
    },
    tagline: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    dateStarted: {
      type: Date,
    },
    location: {
      type: String,
      trim: true,
    },
    fundingStage: {
      type: String,
      enum: ['pre-seeded', 'seeded', 'series-a', 'series-b', 'series-c', 'bootstrapped', 'other'],
    },
    website: {
      type: String,
      trim: true,
    },
    services: {
      type: [String],
      default: [],
    },
    clients: {
      type: [String],
      default: [],
    },
    yearsOfExperience: {
      type: Number,
    },
    founders: {
      type: [{
        name: String,
        role: String,
        linkedin: String,
      }],
      default: [],
    },
    teamMembers: {
      type: [{
        name: String,
        role: String,
        linkedin: String,
      }],
      default: [],
    },
    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    contactPhone: {
      type: String,
      trim: true,
    },
    socialLinks: {
      linkedin: String,
      twitter: String,
      github: String,
      website: String,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    featuredUntil: {
      type: Date,
    },
    likes: {
      type: [Schema.Types.ObjectId],
      ref: 'User',
      default: [],
    },
    viewCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
)

// Index for efficient queries
ExploreProfileSchema.index({ isPublished: 1, isFeatured: 1, createdAt: -1 })
ExploreProfileSchema.index({ likes: 1 })

const ExploreProfile: Model<IExploreProfile> =
  mongoose.models.ExploreProfile || mongoose.model<IExploreProfile>('ExploreProfile', ExploreProfileSchema)

export default ExploreProfile

