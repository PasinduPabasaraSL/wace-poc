import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import connectDB from '@/lib/mongodb'
import Goal from '@/models/Goal'
import Block from '@/models/Block'
import BlockMember from '@/models/BlockMember'
import PodMember from '@/models/PodMember'

// PUT /api/goals/:id - Update a goal
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
    const { title, status, dueDate } = await request.json()

    // Find the goal
    const goal = await Goal.findById(id)
    if (!goal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 })
    }

    // Check if block exists
    const block = await Block.findById(goal.blockId)
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
      blockId: goal.blockId,
      userId: session.user.id,
    })

    if (!isCreator && !blockMember) {
      return NextResponse.json(
        { error: 'You do not have access to this block' },
        { status: 403 }
      )
    }

    // Update goal
    if (title !== undefined) goal.title = title.trim()
    if (status !== undefined) goal.status = status
    if (dueDate !== undefined) goal.dueDate = dueDate ? new Date(dueDate) : undefined

    await goal.save()

    return NextResponse.json(
      {
        message: 'Goal updated successfully',
        goal: {
          id: goal._id.toString(),
          title: goal.title,
          status: goal.status,
          dueDate: goal.dueDate,
        },
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Update goal error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/goals/:id - Delete a goal
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

    // Find the goal
    const goal = await Goal.findById(id)
    if (!goal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 })
    }

    // Check if block exists
    const block = await Block.findById(goal.blockId)
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
      blockId: goal.blockId,
      userId: session.user.id,
    })

    if (!isCreator && !blockMember) {
      return NextResponse.json(
        { error: 'You do not have access to this block' },
        { status: 403 }
      )
    }

    // Only the creator can delete
    if (goal.createdBy.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'You can only delete goals you created' },
        { status: 403 }
      )
    }

    await Goal.findByIdAndDelete(id)

    return NextResponse.json(
      { message: 'Goal deleted successfully' },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Delete goal error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

