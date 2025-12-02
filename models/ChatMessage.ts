import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IChatMessage extends Document {
  blockId: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  message: string
  timestamp: Date
}

const ChatMessageSchema = new Schema<IChatMessage>(
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
    message: {
      type: String,
      required: true,
      trim: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
)

const ChatMessage: Model<IChatMessage> = mongoose.models.ChatMessage || mongoose.model<IChatMessage>('ChatMessage', ChatMessageSchema)

export default ChatMessage

