import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'

// GET /api/user/search?q=searchterm - Search for users by email or name
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')?.trim()

    if (!query || query.length < 2) {
      return NextResponse.json({ users: [] }, { status: 200 })
    }

    // Search users by email or name (case-insensitive)
    const users = await User.find({
      $and: [
        { _id: { $ne: session.user.id } }, // Exclude current user
        {
          $or: [
            { email: { $regex: query, $options: 'i' } },
            { name: { $regex: query, $options: 'i' } },
          ],
        },
      ],
    })
      .select('name email profilePicture')
      .limit(10)

    const userList = users.map((user: any) => ({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      profilePicture: user.profilePicture,
    }))

    return NextResponse.json({ users: userList }, { status: 200 })
  } catch (error: any) {
    console.error('Search users error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

