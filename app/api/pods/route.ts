import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import connectDB from '@/lib/mongodb'
import Pod from '@/models/Pod'
import PodMember from '@/models/PodMember'

// GET /api/pods - Get all pods for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    // Get all pods where user is a member
    const podMembers = await PodMember.find({ userId: session.user.id })
      .populate('podId')
      .sort({ createdAt: -1 })

    const pods = podMembers.map((pm: any) => ({
      id: pm.podId._id,
      name: pm.podId.name,
      tagline: pm.podId.tagline,
      logoUrl: pm.podId.logoUrl,
      role: pm.role,
      createdAt: pm.podId.createdAt,
    }))

    return NextResponse.json({ pods }, { status: 200 })
  } catch (error: any) {
    console.error('Get pods error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/pods - Create a new pod
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const { name, tagline, logoUrl } = await request.json()

    if (!name) {
      return NextResponse.json(
        { error: 'Pod name is required' },
        { status: 400 }
      )
    }

    // Create pod
    const pod = await Pod.create({
      name,
      tagline,
      logoUrl,
      creatorId: session.user.id,
    })

    // Add creator as pod member
    await PodMember.create({
      podId: pod._id,
      userId: session.user.id,
      role: 'creator',
    })

    return NextResponse.json(
      {
        message: 'Pod created successfully',
        pod: {
          id: pod._id,
          name: pod.name,
          tagline: pod.tagline,
          logoUrl: pod.logoUrl,
          createdAt: pod.createdAt,
        },
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Create pod error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

