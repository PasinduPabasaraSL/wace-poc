import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import connectDB from '@/lib/mongodb'
import Invitation from '@/models/Invitation'
import PodMember from '@/models/PodMember'
import User from '@/models/User'

// GET /api/invitations/accept/:token - Accept an invitation
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.redirect(new URL(`/login?invitation=${token}`, request.url))
    }

    await connectDB()

    const invitation = await Invitation.findOne({ token })

    if (!invitation) {
      return NextResponse.redirect(new URL(`/invitation/accept?token=${token}&error=invalid_invitation`, request.url))
    }

    // Check if invitation is expired
    if (invitation.expiresAt < new Date() || invitation.status !== 'pending') {
      return NextResponse.redirect(new URL(`/invitation/accept?token=${token}&error=expired_invitation`, request.url))
    }

    // Check if user email matches invitation email
    const user = await User.findById(session.user.id)
    if (user?.email !== invitation.email) {
      return NextResponse.redirect(new URL(`/invitation/accept?token=${token}&error=email_mismatch`, request.url))
    }

    // Check if user is already a member
    const existingMember = await PodMember.findOne({
      podId: invitation.podId,
      userId: session.user.id,
    })

    if (existingMember) {
      // Mark invitation as accepted anyway
      invitation.status = 'accepted'
      await invitation.save()
      return NextResponse.redirect(new URL(`/invitation/accept?token=${token}&success=true&message=already_member`, request.url))
    }

    // Add user as pod member
    await PodMember.create({
      podId: invitation.podId,
      userId: session.user.id,
      role: 'member',
    })

    // Mark invitation as accepted
    invitation.status = 'accepted'
    await invitation.save()

    return NextResponse.redirect(new URL(`/invitation/accept?token=${token}&success=true`, request.url))
  } catch (error: any) {
    console.error('Accept invitation error:', error)
    return NextResponse.redirect(new URL('/dashboard?error=server_error', request.url))
  }
}

