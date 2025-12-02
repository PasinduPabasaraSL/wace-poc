import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import connectDB from '@/lib/mongodb'
import ExploreProfile from '@/models/ExploreProfile'
import Pod from '@/models/Pod'
import User from '@/models/User'

// GET /api/explore - Get all published profiles (public)
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') as 'startup' | 'agency' | null
    const featured = searchParams.get('featured') === 'true'

    // Build query
    const query: any = { isPublished: true }
    if (type) query.type = type
    if (featured) {
      query.isFeatured = true
      query.$or = [
        { featuredUntil: { $exists: false } },
        { featuredUntil: null },
        { featuredUntil: { $gte: new Date() } },
      ]
    }

    // Get profiles
    const profiles = await ExploreProfile.find(query)
      .populate('userId', 'name email')
      .sort(featured ? { createdAt: -1 } : { likes: -1, createdAt: -1 })
      .limit(100)

    const profilesJson = profiles.map((profile: any) => ({
      id: profile._id.toString(),
      userId: profile.userId._id.toString(),
      userName: profile.userId.name,
      podId: profile.podId?.toString(),
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
      isFeatured: profile.isFeatured,
      likesCount: profile.likes.length,
      viewCount: profile.viewCount,
      createdAt: profile.createdAt,
    }))

    return NextResponse.json({ profiles: profilesJson }, { status: 200 })
  } catch (error: any) {
    console.error('Get explore profiles error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/explore - Create a new profile (authenticated)
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const body = await request.json()
    const {
      podId,
      type,
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

    if (!type || !name) {
      return NextResponse.json(
        { error: 'Type and name are required' },
        { status: 400 }
      )
    }

    // If podId is provided, verify user owns the pod
    if (podId) {
      const pod = await Pod.findById(podId)
      if (!pod) {
        return NextResponse.json({ error: 'Pod not found' }, { status: 404 })
      }
      if (pod.creatorId.toString() !== session.user.id) {
        return NextResponse.json(
          { error: 'You can only showcase pods you created' },
          { status: 403 }
        )
      }
    }

    // Create profile
    const profile = await ExploreProfile.create({
      userId: session.user.id,
      podId: podId || undefined,
      type,
      name,
      logoUrl: logoUrl || undefined,
      tagline: tagline || undefined,
      description: description || undefined,
      dateStarted: dateStarted ? new Date(dateStarted) : undefined,
      location: location || undefined,
      fundingStage: fundingStage || undefined,
      website: website || undefined,
      services: services || [],
      clients: clients || [],
      yearsOfExperience: yearsOfExperience || undefined,
      founders: founders || [],
      teamMembers: teamMembers || [],
      contactEmail: contactEmail || undefined,
      contactPhone: contactPhone || undefined,
      socialLinks: socialLinks || {},
      isPublished: isPublished || false,
    })

    return NextResponse.json(
      {
        message: 'Profile created successfully',
        profile: {
          id: profile._id.toString(),
          type: profile.type,
          name: profile.name,
          isPublished: profile.isPublished,
        },
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Create explore profile error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

