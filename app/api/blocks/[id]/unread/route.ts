import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import connectDB from '@/lib/mongodb'
import Block from '@/models/Block'
import ChatMessage from '@/models/ChatMessage'
import MessageRead from '@/models/MessageRead'
import PodMember from '@/models/PodMember'

// GET /api/blocks/:id/unread - Get unread message count for a block
export async function GET(
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

    // Check if block exists
    const block = await Block.findById(id)
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

    // Get the last read message for this user and block
    const messageRead = await MessageRead.findOne({
      userId: session.user.id,
      blockId: id,
    })

    // Get total message count (excluding messages sent by the current user)
    const totalMessages = await ChatMessage.countDocuments({ 
      blockId: id,
      userId: { $ne: session.user.id } // Exclude messages sent by current user
    })

    if (!messageRead) {
      // User hasn't read any messages, count only messages from other users
      return NextResponse.json({ unreadCount: totalMessages }, { status: 200 })
    }

    // Count messages after the last read message (excluding messages sent by current user)
    const unreadCount = await ChatMessage.countDocuments({
      blockId: id,
      _id: { $gt: messageRead.lastReadMessageId },
      userId: { $ne: session.user.id }, // Exclude messages sent by current user
    })

    return NextResponse.json({ unreadCount }, { status: 200 })
  } catch (error: any) {
    console.error('Get unread count error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/blocks/:id/unread - Mark messages as read
export async function POST(
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

    // Check if block exists
    const block = await Block.findById(id)
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

    // Get the latest message in this block
    const latestMessage = await ChatMessage.findOne({ blockId: id })
      .sort({ createdAt: -1 })

    if (!latestMessage) {
      // No messages, nothing to mark as read
      return NextResponse.json({ message: 'No messages to mark as read' }, { status: 200 })
    }

    // Update or create MessageRead record
    await MessageRead.findOneAndUpdate(
      {
        userId: session.user.id,
        blockId: id,
      },
      {
        userId: session.user.id,
        blockId: id,
        lastReadMessageId: latestMessage._id,
        lastReadAt: new Date(),
      },
      {
        upsert: true,
        new: true,
      }
    )

    return NextResponse.json({ message: 'Messages marked as read' }, { status: 200 })
  } catch (error: any) {
    console.error('Mark messages as read error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

