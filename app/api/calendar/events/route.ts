import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import connectDB from '@/lib/mongodb'
import CalendarEvent from '@/models/CalendarEvent'
import Block from '@/models/Block'
import BlockMember from '@/models/BlockMember'
import PodMember from '@/models/PodMember'

// GET /api/calendar/events?blockId=:id - Get all events for a calendar block
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const { searchParams } = new URL(request.url)
    const blockId = searchParams.get('blockId')

    if (!blockId) {
      return NextResponse.json(
        { error: 'blockId is required' },
        { status: 400 }
      )
    }

    // Check if block exists
    const block = await Block.findById(blockId)
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

    // Check if user has access to this block (creator or block member)
    const isCreator = block.creatorId.toString() === session.user.id
    const blockMember = await BlockMember.findOne({
      blockId,
      userId: session.user.id,
    })

    if (!isCreator && !blockMember) {
      return NextResponse.json(
        { error: 'You do not have access to this block' },
        { status: 403 }
      )
    }

    // Get all events
    const events = await CalendarEvent.find({ blockId })
      .populate('createdBy', 'name email')
      .sort({ date: 1 })

    const eventsJson = events.map((event: any) => ({
      id: event._id.toString(),
      title: event.title,
      date: event.date,
      time: event.time,
      description: event.description,
      createdBy: {
        id: event.createdBy._id.toString(),
        name: event.createdBy.name,
        email: event.createdBy.email,
      },
      createdAt: event.createdAt,
    }))

    return NextResponse.json({ events: eventsJson }, { status: 200 })
  } catch (error: any) {
    console.error('Get calendar events error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/calendar/events - Create a new event
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const { blockId, title, date, time, description } = await request.json()

    if (!blockId || !title || !date) {
      return NextResponse.json(
        { error: 'blockId, title, and date are required' },
        { status: 400 }
      )
    }

    // Check if block exists
    const block = await Block.findById(blockId)
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

    // Check if user has access to this block (creator or block member)
    const isCreator = block.creatorId.toString() === session.user.id
    const blockMember = await BlockMember.findOne({
      blockId,
      userId: session.user.id,
    })

    if (!isCreator && !blockMember) {
      return NextResponse.json(
        { error: 'You do not have access to this block' },
        { status: 403 }
      )
    }

    // Create event
    const event = await CalendarEvent.create({
      blockId,
      title: title.trim(),
      date: new Date(date),
      time: time || undefined,
      description: description?.trim() || undefined,
      createdBy: session.user.id,
    })

    return NextResponse.json(
      {
        message: 'Event created successfully',
        event: {
          id: event._id.toString(),
          title: event.title,
          date: event.date,
          time: event.time,
          description: event.description,
          createdAt: event.createdAt,
        },
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Create calendar event error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

