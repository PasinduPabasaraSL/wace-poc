import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import connectDB from '@/lib/mongodb'
import ChatMessage from '@/models/ChatMessage'
import Block from '@/models/Block'
import PodMember from '@/models/PodMember'

// DELETE /api/chat/:blockId/messages/:messageId - Delete a message
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ blockId: string; messageId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const { blockId, messageId } = await params

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

    // Find the message
    const message = await ChatMessage.findById(messageId)
    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }

    // Check if message belongs to this block
    if (message.blockId.toString() !== blockId) {
      return NextResponse.json(
        { error: 'Message does not belong to this block' },
        { status: 400 }
      )
    }

    // Only the message sender can delete their own message
    if (message.userId.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'You can only delete your own messages' },
        { status: 403 }
      )
    }

    // Delete the message
    await ChatMessage.findByIdAndDelete(messageId)

    return NextResponse.json(
      { message: 'Message deleted successfully' },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Delete message error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

