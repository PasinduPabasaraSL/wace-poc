import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import connectDB from '@/lib/mongodb'
import Pod from '@/models/Pod'
import PodMember from '@/models/PodMember'
import User from '@/models/User'

// GET /api/pods/:id/members - Get all members of a pod
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

    // Check if pod exists
    const pod = await Pod.findById(id)
    if (!pod) {
      return NextResponse.json({ error: 'Pod not found' }, { status: 404 })
    }

    // Check if user is a member of this pod
    const podMember = await PodMember.findOne({
      podId: id,
      userId: session.user.id,
    })

    if (!podMember) {
      return NextResponse.json(
        { error: 'You are not a member of this pod' },
        { status: 403 }
      )
    }

    // Get all pod members
    const podMembers = await PodMember.find({ podId: id })
      .populate('userId', 'name email profilePicture')
      .sort({ createdAt: 1 })

    const members = podMembers.map((pm: any) => ({
      id: pm.userId._id.toString(),
      name: pm.userId.name,
      email: pm.userId.email,
      profilePicture: pm.userId.profilePicture,
      role: pm.role,
      joinedAt: pm.joinedAt || pm.createdAt,
    }))

    return NextResponse.json({ members }, { status: 200 })
  } catch (error: any) {
    console.error('Get pod members error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/pods/:id/members - Add a member directly to a pod (no email required)
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
    const { userId, email } = await request.json()

    // Check if pod exists
    const pod = await Pod.findById(id)
    if (!pod) {
      return NextResponse.json({ error: 'Pod not found' }, { status: 404 })
    }

    // Check if user is the creator
    if (pod.creatorId.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'Only the creator can add members directly' },
        { status: 403 }
      )
    }

    // Find user by userId or email
    let user
    if (userId) {
      user = await User.findById(userId)
    } else if (email) {
      user = await User.findOne({ email: email.toLowerCase().trim() })
    } else {
      return NextResponse.json(
        { error: 'userId or email is required' },
        { status: 400 }
      )
    }

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if user is already a member
    const existingMember = await PodMember.findOne({
      podId: id,
      userId: user._id,
    })

    if (existingMember) {
      return NextResponse.json(
        { error: 'User is already a member of this pod' },
        { status: 400 }
      )
    }

    // Add user as pod member
    const podMember = await PodMember.create({
      podId: id,
      userId: user._id,
      role: 'member',
    })

    // Get user details
    const memberData = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      profilePicture: user.profilePicture,
      role: podMember.role,
      joinedAt: podMember.joinedAt || podMember.createdAt,
    }

    return NextResponse.json(
      {
        message: 'Member added successfully',
        member: memberData,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Add pod member error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

