import mongoose, { Schema, Document, Model } from 'mongoose'

export type BlockType = 'chat' | 'docs' | 'meetings' | 'calendar' | 'goals'

export interface IBlock extends Document {
  podId: mongoose.Types.ObjectId
  type: BlockType
  label: string
  description?: string
  x: number
  y: number
  creatorId: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const BlockSchema = new Schema<IBlock>(
  {
    podId: {
      type: Schema.Types.ObjectId,
      ref: 'Pod',
      required: true,
    },
    type: {
      type: String,
      enum: ['chat', 'docs', 'meetings', 'calendar', 'goals'],
      required: true,
    },
    label: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    x: {
      type: Number,
      default: 0,
    },
    y: {
      type: Number,
      default: 0,
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

const Block: Model<IBlock> = mongoose.models.Block || mongoose.model<IBlock>('Block', BlockSchema)

export default Block

