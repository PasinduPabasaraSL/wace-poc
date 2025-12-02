import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import connectDB from '@/lib/mongodb'
import Goal from '@/models/Goal'
import Block from '@/models/Block'
import BlockMember from '@/models/BlockMember'
import PodMember from '@/models/PodMember'

// GET /api/goals?blockId=:id - Get all goals for a goals block
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

    // Get all goals
    const goals = await Goal.find({ blockId })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })

    const goalsJson = goals.map((goal: any) => ({
      id: goal._id.toString(),
      title: goal.title,
      status: goal.status,
      dueDate: goal.dueDate,
      createdBy: {
        id: goal.createdBy._id.toString(),
        name: goal.createdBy.name,
        email: goal.createdBy.email,
      },
      createdAt: goal.createdAt,
      updatedAt: goal.updatedAt,
    }))

    return NextResponse.json({ goals: goalsJson }, { status: 200 })
  } catch (error: any) {
    console.error('Get goals error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/goals - Create a new goal
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const { blockId, title, dueDate, status } = await request.json()

    if (!blockId || !title) {
      return NextResponse.json(
        { error: 'blockId and title are required' },
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

    // Create goal
    const goal = await Goal.create({
      blockId,
      title: title.trim(),
      status: status || 'not_started',
      dueDate: dueDate ? new Date(dueDate) : undefined,
      createdBy: session.user.id,
    })

    return NextResponse.json(
      {
        message: 'Goal created successfully',
        goal: {
          id: goal._id.toString(),
          title: goal.title,
          status: goal.status,
          dueDate: goal.dueDate,
          createdAt: goal.createdAt,
        },
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Create goal error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

