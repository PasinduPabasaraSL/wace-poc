import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import connectDB from '@/lib/mongodb'
import Block from '@/models/Block'
import BlockMember from '@/models/BlockMember'
import PodMember from '@/models/PodMember'
import User from '@/models/User'

// GET /api/blocks/:id/members - Get all members with access to a block
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

    // Get all block members
    const blockMembers = await BlockMember.find({ blockId: id }).populate('userId', 'name email profilePicture')

    const members = blockMembers.map((bm: any) => ({
      id: bm.userId._id.toString(),
      name: bm.userId.name,
      email: bm.userId.email,
      profilePicture: bm.userId.profilePicture,
      addedAt: bm.addedAt,
    }))

    return NextResponse.json({ members }, { status: 200 })
  } catch (error: any) {
    console.error('Get block members error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/blocks/:id/members - Add a member to a block
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
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    // Check if block exists
    const block = await Block.findById(id)
    if (!block) {
      return NextResponse.json({ error: 'Block not found' }, { status: 404 })
    }

    // Only the creator can add members to a block
    if (block.creatorId.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'Only the creator can add members to this block' },
        { status: 403 }
      )
    }

    // Check if user is a member of the pod
    const podMember = await PodMember.findOne({
      podId: block.podId,
      userId,
    })

    if (!podMember) {
      return NextResponse.json(
        { error: 'User is not a member of this pod' },
        { status: 400 }
      )
    }

    // Check if user is already a block member
    const existingBlockMember = await BlockMember.findOne({
      blockId: id,
      userId,
    })

    if (existingBlockMember) {
      return NextResponse.json(
        { error: 'User is already a member of this block' },
        { status: 400 }
      )
    }

    // Add user as block member
    const blockMember = await BlockMember.create({
      blockId: id,
      userId,
    })

    // Get user details
    const user = await User.findById(userId)

    return NextResponse.json(
      {
        message: 'Member added successfully',
        member: {
          id: user?._id.toString(),
          name: user?.name,
          email: user?.email,
          profilePicture: user?.profilePicture,
        },
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Add block member error:', error)
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'User is already a member of this block' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

