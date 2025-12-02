import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import connectDB from '@/lib/mongodb'
import Block from '@/models/Block'
import PodMember from '@/models/PodMember'
import BlockMember from '@/models/BlockMember'

// GET /api/blocks?podId=:id - Get all blocks for a pod
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const { searchParams } = new URL(request.url)
    const podId = searchParams.get('podId')

    if (!podId) {
      return NextResponse.json(
        { error: 'podId is required' },
        { status: 400 }
      )
    }

    // Check if user is a member of this pod
    const podMember = await PodMember.findOne({
      podId,
      userId: session.user.id,
    })

    if (!podMember) {
      return NextResponse.json(
        { error: 'You are not a member of this pod' },
        { status: 403 }
      )
    }

    const blocks = await Block.find({ podId }).sort({ createdAt: -1 })

    // Convert blocks to JSON format with id field
    const blocksJson = blocks.map((block) => ({
      id: block._id.toString(),
      _id: block._id.toString(),
      podId: block.podId.toString(),
      type: block.type,
      label: block.label,
      description: block.description,
      x: block.x,
      y: block.y,
      creatorId: block.creatorId.toString(),
      createdAt: block.createdAt,
      updatedAt: block.updatedAt,
    }))

    return NextResponse.json({ blocks: blocksJson }, { status: 200 })
  } catch (error: any) {
    console.error('Get blocks error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/blocks - Create a new block
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const { podId, type, label, description, x, y } = await request.json()

    if (!podId || !type || !label) {
      return NextResponse.json(
        { error: 'podId, type, and label are required' },
        { status: 400 }
      )
    }

    // Check if user is a member of this pod
    const podMember = await PodMember.findOne({
      podId,
      userId: session.user.id,
    })

    if (!podMember) {
      return NextResponse.json(
        { error: 'You are not a member of this pod' },
        { status: 403 }
      )
    }

    const block = await Block.create({
      podId,
      type,
      label,
      description: description || undefined,
      x: x || 0,
      y: y || 0,
      creatorId: session.user.id,
    })

    // Automatically add the creator as a block member
    try {
      await BlockMember.create({
        blockId: block._id,
        userId: session.user.id,
      })
    } catch (error: any) {
      // If creator is already a member (shouldn't happen), continue
      console.log('Creator already a member or error adding creator:', error)
    }

    return NextResponse.json(
      {
        message: 'Block created successfully',
        block: {
          id: block._id,
          podId: block.podId,
          type: block.type,
          label: block.label,
          description: block.description,
          x: block.x,
          y: block.y,
          createdAt: block.createdAt,
        },
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Create block error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

