import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import connectDB from '@/lib/mongodb'
import Pod from '@/models/Pod'
import PodMember from '@/models/PodMember'
import Invitation from '@/models/Invitation'
import User from '@/models/User'
import { sendInvitationEmail } from '@/lib/email'
import crypto from 'crypto'

// POST /api/pods/:id/invite - Invite a user to a pod
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
    const pod = await Pod.findById(id)
    if (!pod) {
      return NextResponse.json({ error: 'Pod not found' }, { status: 404 })
    }

    // Check if user is the creator
    if (pod.creatorId.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'Only the creator can invite members' },
        { status: 403 }
      )
    }

    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = await User.findOne({ email })
    if (!user) {
      return NextResponse.json(
        { error: 'User with this email does not exist. They must sign up first.' },
        { status: 400 }
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

    // Check if there's a pending invitation
    const existingInvitation = await Invitation.findOne({
      podId: id,
      email,
      status: 'pending',
    })

    if (existingInvitation) {
      return NextResponse.json(
        { error: 'Invitation already sent to this email' },
        { status: 400 }
      )
    }

    // Generate token
    const token = crypto.randomBytes(32).toString('hex')

    // Create invitation
    const invitation = await Invitation.create({
      podId: id,
      email,
      token,
      invitedBy: session.user.id,
    })

    // Send email
    const invitationLink = `${process.env.NEXTAUTH_URL}/api/invitations/accept/${invitation.token}`
    await sendInvitationEmail({
      to: email,
      podName: pod.name,
      invitationLink,
    })

    return NextResponse.json(
      {
        message: 'Invitation sent successfully',
        invitation: {
          id: invitation._id,
          email: invitation.email,
          status: invitation.status,
        },
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Invite error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

