import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import connectDB from '@/lib/mongodb'
import CalendarEvent from '@/models/CalendarEvent'
import Block from '@/models/Block'
import BlockMember from '@/models/BlockMember'
import PodMember from '@/models/PodMember'

// PUT /api/calendar/events/:id - Update an event
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const { id } = await params
    const { title, date, time, description } = await request.json()

    // Find the event
    const event = await CalendarEvent.findById(id)
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Check if block exists
    const block = await Block.findById(event.blockId)
    if (!block) {
      return NextResponse.json({ error: 'Block not found' }, { status: 404 })
    }

    // Check if user is a member of the pod
    const podMember = await PodMember.findOne({
      podId: block.podId,
      userId: session.user.id,
    })

    if (!podMember) {
      return NextResponse.json(
        { error: 'You are not a member of this pod' },
        { status: 403 }
      )
    }

    // Only the creator can update
    if (event.createdBy.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'You can only update events you created' },
        { status: 403 }
      )
    }

    // Update event
    if (title !== undefined) event.title = title.trim()
    if (date !== undefined) event.date = new Date(date)
    if (time !== undefined) event.time = time || undefined
    if (description !== undefined) event.description = description?.trim() || undefined

    await event.save()

    return NextResponse.json(
      {
        message: 'Event updated successfully',
        event: {
          id: event._id.toString(),
          title: event.title,
          date: event.date,
          time: event.time,
          description: event.description,
        },
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Update calendar event error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/calendar/events/:id - Delete an event
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const { id } = await params

    // Find the event
    const event = await CalendarEvent.findById(id)
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Check if block exists
    const block = await Block.findById(event.blockId)
    if (!block) {
      return NextResponse.json({ error: 'Block not found' }, { status: 404 })
    }

    // Check if user is a member of the pod
    const podMember = await PodMember.findOne({
      podId: block.podId,
      userId: session.user.id,
    })

    if (!podMember) {
      return NextResponse.json(
        { error: 'You are not a member of this pod' },
        { status: 403 }
      )
    }

    // Only the creator can delete
    if (event.createdBy.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'You can only delete events you created' },
        { status: 403 }
      )
    }

    await CalendarEvent.findByIdAndDelete(id)

    return NextResponse.json(
      { message: 'Event deleted successfully' },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Delete calendar event error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

