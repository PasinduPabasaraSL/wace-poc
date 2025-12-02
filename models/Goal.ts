import mongoose, { Schema, Document, Model } from 'mongoose'

export type GoalStatus = 'not_started' | 'in_progress' | 'done'

export interface IGoal extends Document {
  blockId: mongoose.Types.ObjectId
  title: string
  status: GoalStatus
  dueDate?: Date
  createdBy: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const GoalSchema = new Schema<IGoal>(
  {
    blockId: {
      type: Schema.Types.ObjectId,
      ref: 'Block',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['not_started', 'in_progress', 'done'],
      default: 'not_started',
    },
    dueDate: {
      type: Date,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

const Goal: Model<IGoal> = mongoose.models.Goal || mongoose.model<IGoal>('Goal', GoalSchema)

export default Goal

