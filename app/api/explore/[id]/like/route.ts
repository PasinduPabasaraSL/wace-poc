import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import connectDB from '@/lib/mongodb'
import ExploreProfile from '@/models/ExploreProfile'

// POST /api/explore/:id/like - Like/unlike a profile (authenticated)
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
    const profile = await ExploreProfile.findById(id)

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Check if already liked
    const userId = new (await import('mongoose')).Types.ObjectId(session.user.id)
    const isLiked = profile.likes.some((likeId: any) => likeId.toString() === session.user.id)

    if (isLiked) {
      // Unlike: remove from likes array
      profile.likes = profile.likes.filter(
        (likeId: any) => likeId.toString() !== session.user.id
      )
    } else {
      // Like: add to likes array
      profile.likes.push(userId)
    }

    await profile.save()

    return NextResponse.json(
      {
        message: isLiked ? 'Profile unliked' : 'Profile liked',
        isLiked: !isLiked,
        likesCount: profile.likes.length,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Like/unlike profile error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

