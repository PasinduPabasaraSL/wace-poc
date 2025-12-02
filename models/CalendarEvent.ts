import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ICalendarEvent extends Document {
  blockId: mongoose.Types.ObjectId
  title: string
  date: Date
  time?: string
  description?: string
  createdBy: mongoose.Types.ObjectId
  createdAt: Date
}

const CalendarEventSchema = new Schema<ICalendarEvent>(
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
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
    },
    description: {
      type: String,
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

const CalendarEvent: Model<ICalendarEvent> = mongoose.models.CalendarEvent || mongoose.model<ICalendarEvent>('CalendarEvent', CalendarEventSchema)

export default CalendarEvent

