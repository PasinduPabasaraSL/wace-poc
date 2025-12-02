import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import connectDB from '@/lib/mongodb'
import ChatMessage from '@/models/ChatMessage'
import Block from '@/models/Block'
import BlockMember from '@/models/BlockMember'
import PodMember from '@/models/PodMember'
import User from '@/models/User'

// GET /api/chat/:blockId/messages - Get all messages for a chat block
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ blockId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const { blockId } = await params

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

    // Get all messages
    const messages = await ChatMessage.find({ blockId })
      .populate('userId', 'name email profilePicture')
      .sort({ timestamp: 1 })

    const messagesJson = messages.map((msg: any) => ({
      id: msg._id.toString(),
      userId: msg.userId._id.toString(),
      userName: msg.userId.name,
      userEmail: msg.userId.email,
      userProfilePicture: msg.userId.profilePicture,
      message: msg.message,
      timestamp: msg.timestamp,
      isOwn: msg.userId._id.toString() === session.user.id,
    }))

    return NextResponse.json({ messages: messagesJson }, { status: 200 })
  } catch (error: any) {
    console.error('Get chat messages error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/chat/:blockId/messages - Send a message
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ blockId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const { blockId } = await params
    const { message } = await request.json()

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: 'Message is required' },
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

    // Create message
    const chatMessage = await ChatMessage.create({
      blockId,
      userId: session.user.id,
      message: message.trim(),
      timestamp: new Date(),
    })

    // Get user details
    const user = await User.findById(session.user.id)

    return NextResponse.json(
      {
        message: 'Message sent successfully',
        chatMessage: {
          id: chatMessage._id.toString(),
          userId: session.user.id,
          userName: user?.name,
          userEmail: user?.email,
          userProfilePicture: user?.profilePicture,
          message: chatMessage.message,
          timestamp: chatMessage.timestamp,
          isOwn: true,
        },
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Send chat message error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

