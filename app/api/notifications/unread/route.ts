import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import connectDB from '@/lib/mongodb'
import PodMember from '@/models/PodMember'
import Pod from '@/models/Pod'
import Block from '@/models/Block'
import ChatMessage from '@/models/ChatMessage'
import MessageRead from '@/models/MessageRead'

// GET /api/notifications/unread - Get all unread message notifications
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    // Get all pods where user is a member
    const podMemberships = await PodMember.find({ userId: session.user.id })
    const podIds = podMemberships.map((pm) => pm.podId)

    // Get all chat blocks in these pods
    const chatBlocks = await Block.find({
      podId: { $in: podIds },
      type: 'chat',
    })

    const notifications = []

    for (const block of chatBlocks) {
      // Get unread count for this block
      const messageRead = await MessageRead.findOne({
        userId: session.user.id,
        blockId: block._id,
      })

      let unreadCount = 0
      if (!messageRead) {
        // User hasn't read any messages, count only messages from other users
        unreadCount = await ChatMessage.countDocuments({ 
          blockId: block._id,
          userId: { $ne: session.user.id } // Exclude messages sent by current user
        })
      } else {
        // Count messages after last read (excluding messages sent by current user)
        unreadCount = await ChatMessage.countDocuments({
          blockId: block._id,
          _id: { $gt: messageRead.lastReadMessageId },
          userId: { $ne: session.user.id }, // Exclude messages sent by current user
        })
      }

      if (unreadCount > 0) {
        // Get pod name
        const pod = await Pod.findById(block.podId)
        
        notifications.push({
          blockId: block._id.toString(),
          blockName: block.label,
          podId: block.podId.toString(),
          podName: pod?.name || 'Unknown Pod',
          unreadCount,
        })
      }
    }

    return NextResponse.json({ notifications }, { status: 200 })
  } catch (error: any) {
    console.error('Get notifications error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

