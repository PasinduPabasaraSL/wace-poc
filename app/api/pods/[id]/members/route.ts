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

