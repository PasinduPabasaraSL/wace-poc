import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import connectDB from '@/lib/mongodb'
import Block from '@/models/Block'
import BlockMember from '@/models/BlockMember'
import ChatMessage from '@/models/ChatMessage'
import DocumentModel from '@/models/Document'
import CalendarEvent from '@/models/CalendarEvent'
import Goal from '@/models/Goal'
import PodMember from '@/models/PodMember'

// DELETE /api/blocks/:id - Delete a block
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

    // Only the creator can delete the block
    if (block.creatorId.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'Only the creator can delete this block' },
        { status: 403 }
      )
    }

    // Delete all related data
    await Promise.all([
      BlockMember.deleteMany({ blockId: id }),
      ChatMessage.deleteMany({ blockId: id }),
      DocumentModel.deleteMany({ blockId: id }),
      CalendarEvent.deleteMany({ blockId: id }),
      Goal.deleteMany({ blockId: id }),
    ])

    // Delete the block
    await Block.findByIdAndDelete(id)

    return NextResponse.json(
      { message: 'Block deleted successfully' },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Delete block error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

