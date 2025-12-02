import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IMessageRead extends Document {
  userId: mongoose.Types.ObjectId
  blockId: mongoose.Types.ObjectId
  lastReadMessageId: mongoose.Types.ObjectId
  lastReadAt: Date
  createdAt: Date
  updatedAt: Date
}

const MessageReadSchema = new Schema<IMessageRead>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    blockId: {
      type: Schema.Types.ObjectId,
      ref: 'Block',
      required: true,
    },
    lastReadMessageId: {
      type: Schema.Types.ObjectId,
      ref: 'ChatMessage',
      required: true,
    },
    lastReadAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
)

// Compound index to ensure one read status per user per block
MessageReadSchema.index({ userId: 1, blockId: 1 }, { unique: true })

const MessageRead: Model<IMessageRead> = mongoose.models.MessageRead || mongoose.model<IMessageRead>('MessageRead', MessageReadSchema)

export default MessageRead

