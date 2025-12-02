import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import connectDB from '@/lib/mongodb'
import ExploreProfile from '@/models/ExploreProfile'

// GET /api/explore/:id - Get a specific profile (public, increments view count)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()

    const { id } = await params

    const profile = await ExploreProfile.findById(id)
      .populate('userId', 'name email')
      .populate('podId', 'name tagline logoUrl')

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Only show published profiles to non-owners
    const session = await auth()
    const isOwner = session?.user?.id && profile.userId._id.toString() === session.user.id

    if (!profile.isPublished && !isOwner) {
      return NextResponse.json(
        { error: 'Profile not found or not published' },
        { status: 404 }
      )
    }

    // Increment view count (only for published profiles)
    if (profile.isPublished && !isOwner) {
      profile.viewCount += 1
      await profile.save()
    }

    const profileJson = {
      id: profile._id.toString(),
      userId: profile.userId._id.toString(),
      userName: profile.userId.name,
      userEmail: profile.userId.email,
      podId: profile.podId?._id.toString(),
      podName: profile.podId?.name,
      type: profile.type,
      name: profile.name,
      logoUrl: profile.logoUrl,
      tagline: profile.tagline,
      description: profile.description,
      dateStarted: profile.dateStarted,
      location: profile.location,
      fundingStage: profile.fundingStage,
      website: profile.website,
      services: profile.services,
      clients: profile.clients,
      yearsOfExperience: profile.yearsOfExperience,
      founders: profile.founders,
      teamMembers: profile.teamMembers,
      contactEmail: profile.contactEmail,
      contactPhone: profile.contactPhone,
      socialLinks: profile.socialLinks,
      isPublished: profile.isPublished,
      isFeatured: profile.isFeatured,
      likesCount: profile.likes.length,
      viewCount: profile.viewCount,
      isLiked: session?.user?.id
        ? profile.likes.some((likeId: any) => likeId.toString() === session.user.id)
        : false,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    }

    return NextResponse.json({ profile: profileJson }, { status: 200 })
  } catch (error: any) {
    console.error('Get explore profile error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/explore/:id - Update a profile (authenticated, owner only)
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
    const profile = await ExploreProfile.findById(id)

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Check if user is the owner
    if (profile.userId.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'You can only update your own profile' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      name,
      logoUrl,
      tagline,
      description,
      dateStarted,
      location,
      fundingStage,
      website,
      services,
      clients,
      yearsOfExperience,
      founders,
      teamMembers,
      contactEmail,
      contactPhone,
      socialLinks,
      isPublished,
    } = body

    // Update fields
    if (name !== undefined) profile.name = name
    if (logoUrl !== undefined) profile.logoUrl = logoUrl
    if (tagline !== undefined) profile.tagline = tagline
    if (description !== undefined) profile.description = description
    if (dateStarted !== undefined) profile.dateStarted = dateStarted ? new Date(dateStarted) : undefined
    if (location !== undefined) profile.location = location
    if (fundingStage !== undefined) profile.fundingStage = fundingStage
    if (website !== undefined) profile.website = website
    if (services !== undefined) profile.services = services
    if (clients !== undefined) profile.clients = clients
    if (yearsOfExperience !== undefined) profile.yearsOfExperience = yearsOfExperience
    if (founders !== undefined) profile.founders = founders
    if (teamMembers !== undefined) profile.teamMembers = teamMembers
    if (contactEmail !== undefined) profile.contactEmail = contactEmail
    if (contactPhone !== undefined) profile.contactPhone = contactPhone
    if (socialLinks !== undefined) profile.socialLinks = socialLinks
    if (isPublished !== undefined) profile.isPublished = isPublished

    await profile.save()

    return NextResponse.json(
      {
        message: 'Profile updated successfully',
        profile: {
          id: profile._id.toString(),
          name: profile.name,
          isPublished: profile.isPublished,
        },
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Update explore profile error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/explore/:id - Delete a profile (authenticated, owner only)
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
    const profile = await ExploreProfile.findById(id)

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Check if user is the owner
    if (profile.userId.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'You can only delete your own profile' },
        { status: 403 }
      )
    }

    await ExploreProfile.findByIdAndDelete(id)

    return NextResponse.json(
      { message: 'Profile deleted successfully' },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Delete explore profile error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

