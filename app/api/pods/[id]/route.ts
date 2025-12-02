import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import connectDB from '@/lib/mongodb'
import Pod from '@/models/Pod'
import PodMember from '@/models/PodMember'
import mongoose from 'mongoose'

// GET /api/pods/:id - Get a specific pod
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

    const pod = await Pod.findById(id)
    if (!pod) {
      return NextResponse.json({ error: 'Pod not found' }, { status: 404 })
    }

    // Get member count
    const memberCount = await PodMember.countDocuments({ podId: id })

    return NextResponse.json({
      pod: {
        id: pod._id.toString(),
        name: pod.name,
        tagline: pod.tagline,
        logoUrl: pod.logoUrl,
        creatorId: pod.creatorId.toString(),
        memberCount,
        createdAt: pod.createdAt,
      },
    }, { status: 200 })
  } catch (error: any) {
    console.error('Get pod error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/pods/:id - Update pod (logo, name, tagline)
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
    const pod = await Pod.findById(id)
    if (!pod) {
      return NextResponse.json({ error: 'Pod not found' }, { status: 404 })
    }

    // Check if user is the creator
    if (pod.creatorId.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'Only the creator can update the pod' },
        { status: 403 }
      )
    }

    const { name, tagline, logoUrl } = await request.json()

    if (name) pod.name = name
    if (tagline !== undefined) pod.tagline = tagline
    if (logoUrl !== undefined) pod.logoUrl = logoUrl

    await pod.save()

    return NextResponse.json(
      {
        message: 'Pod updated successfully',
        pod: {
          id: pod._id,
          name: pod.name,
          tagline: pod.tagline,
          logoUrl: pod.logoUrl,
        },
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Update pod error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/pods/:id - Delete pod (requires password confirmation)
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
    const { password } = await request.json()

    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Password is required for deletion' },
        { status: 400 }
      )
    }

    // Trim password to handle any accidental whitespace
    const trimmedPassword = password.trim()

    // Verify password - use same approach as auth.ts
    const User = (await import('@/models/User')).default
    const user = await User.findById(session.user.id)
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Verify password using the same method as login
    try {
      const isPasswordValid = await user.comparePassword(trimmedPassword)
      if (!isPasswordValid) {
        return NextResponse.json(
          { error: 'Invalid password. Please check your password and try again.' },
          { status: 401 }
        )
      }
    } catch (error: any) {
      console.error('Password verification error:', error)
      return NextResponse.json(
        { error: 'Password verification failed. Please try again.' },
        { status: 500 }
      )
    }


    const pod = await Pod.findById(id)
    if (!pod) {
      return NextResponse.json({ error: 'Pod not found' }, { status: 404 })
    }

    // Check if user is the creator
    if (pod.creatorId.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'Only the creator can delete the pod' },
        { status: 403 }
      )
    }

    // Import all related models
    const Block = (await import('@/models/Block')).default
    const BlockMember = (await import('@/models/BlockMember')).default
    const PodMember = (await import('@/models/PodMember')).default
    const ChatMessage = (await import('@/models/ChatMessage')).default
    const DocumentModel = (await import('@/models/Document')).default
    const CalendarEvent = (await import('@/models/CalendarEvent')).default
    const Goal = (await import('@/models/Goal')).default
    const Invitation = (await import('@/models/Invitation')).default

    // Get all blocks in this pod
    const blocks = await Block.find({ podId: id })
    const blockIds = blocks.map((block: any) => block._id)

    // Delete all related data
    await Promise.all([
      // Delete block members
      BlockMember.deleteMany({ blockId: { $in: blockIds } }),
      // Delete chat messages
      ChatMessage.deleteMany({ blockId: { $in: blockIds } }),
      // Delete documents
      DocumentModel.deleteMany({ blockId: { $in: blockIds } }),
      // Delete calendar events
      CalendarEvent.deleteMany({ blockId: { $in: blockIds } }),
      // Delete goals
      Goal.deleteMany({ blockId: { $in: blockIds } }),
      // Delete blocks
      Block.deleteMany({ podId: id }),
      // Delete pod members
      PodMember.deleteMany({ podId: id }),
      // Delete invitations
      Invitation.deleteMany({ podId: id }),
      // Delete the pod itself
      Pod.findByIdAndDelete(id),
    ])

    return NextResponse.json(
      { message: 'Pod and all associated data deleted successfully' },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Delete pod error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

