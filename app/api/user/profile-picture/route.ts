import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'

// POST /api/user/profile-picture - Upload profile picture
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const profilePictureUrl = formData.get('profilePicture') as string

    if (!profilePictureUrl) {
      return NextResponse.json(
        { error: 'Profile picture URL is required' },
        { status: 400 }
      )
    }

    await connectDB()

    const user = await User.findById(session.user.id)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    user.profilePicture = profilePictureUrl
    await user.save()

    return NextResponse.json({
      message: 'Profile picture updated successfully',
      profilePicture: user.profilePicture,
    })
  } catch (error: any) {
    console.error('Update profile picture error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

