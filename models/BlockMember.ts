import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IBlockMember extends Document {
  blockId: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  addedAt: Date
}

const BlockMemberSchema = new Schema<IBlockMember>(
  {
    blockId: {
      type: Schema.Types.ObjectId,
      ref: 'Block',
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
)

// Compound index to ensure one user can only be added to a block once
BlockMemberSchema.index({ blockId: 1, userId: 1 }, { unique: true })

const BlockMember: Model<IBlockMember> = mongoose.models.BlockMember || mongoose.model<IBlockMember>('BlockMember', BlockMemberSchema)

export default BlockMember

