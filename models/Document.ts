import mongoose, { Schema, Document as MongooseDocument, Model } from 'mongoose'

export interface IDocument extends MongooseDocument {
  blockId: mongoose.Types.ObjectId
  fileName: string
  fileUrl: string
  fileType: string
  fileSize: number
  gridfsFileId: mongoose.Types.ObjectId // Store GridFS file ID
  uploadedBy: mongoose.Types.ObjectId
  uploadedAt: Date
}

const DocumentSchema = new Schema<IDocument>(
  {
    blockId: {
      type: Schema.Types.ObjectId,
      ref: 'Block',
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    gridfsFileId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
)

const DocumentModel: Model<IDocument> = mongoose.models.Document || mongoose.model<IDocument>('Document', DocumentSchema)

export default DocumentModel
