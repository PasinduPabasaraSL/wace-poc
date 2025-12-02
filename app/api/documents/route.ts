import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import connectDB from '@/lib/mongodb'
import DocumentModel from '@/models/Document'
import Block from '@/models/Block'
import BlockMember from '@/models/BlockMember'
import PodMember from '@/models/PodMember'
import mongoose from 'mongoose'
import { GridFSBucket } from 'mongodb'

// GET /api/documents?blockId=:id - Get all documents for a block
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const { searchParams } = new URL(request.url)
    const blockId = searchParams.get('blockId')

    if (!blockId) {
      return NextResponse.json(
        { error: 'blockId is required' },
        { status: 400 }
      )
    }

    // Check if block exists
    const block = await Block.findById(blockId)
    if (!block) {
      return NextResponse.json({ error: 'Block not found' }, { status: 404 })
    }

    // Check if user is a member of the pod
    const podMember = await PodMember.findOne({
      podId: block.podId,
      userId: session.user.id,
    })

    if (!podMember) {
      return NextResponse.json(
        { error: 'You are not a member of this pod' },
        { status: 403 }
      )
    }

    // Check if user has access to this block (creator or block member)
    const isCreator = block.creatorId.toString() === session.user.id
    const blockMember = await BlockMember.findOne({
      blockId,
      userId: session.user.id,
    })

    if (!isCreator && !blockMember) {
      return NextResponse.json(
        { error: 'You do not have access to this block' },
        { status: 403 }
      )
    }

    // Get all documents
    const documents = await DocumentModel.find({ blockId })
      .populate('uploadedBy', 'name email')
      .sort({ uploadedAt: -1 })

    const documentsJson = documents.map((doc: any) => ({
      id: doc._id.toString(),
      fileName: doc.fileName,
      fileType: doc.fileType,
      fileSize: doc.fileSize,
      uploadedBy: {
        id: doc.uploadedBy._id.toString(),
        name: doc.uploadedBy.name,
        email: doc.uploadedBy.email,
      },
      uploadedAt: doc.uploadedAt,
      fileUrl: doc.fileUrl,
    }))

    return NextResponse.json({ documents: documentsJson }, { status: 200 })
  } catch (error: any) {
    console.error('Get documents error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/documents - Upload a document
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const formData = await request.formData()
    const file = formData.get('file') as File
    const blockId = formData.get('blockId') as string

    if (!file || !blockId) {
      return NextResponse.json(
        { error: 'File and blockId are required' },
        { status: 400 }
      )
    }

    // Validate file type (only PDF)
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Only PDF files are allowed' },
        { status: 400 }
      )
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 10MB.' },
        { status: 400 }
      )
    }

    // Check if block exists
    const block = await Block.findById(blockId)
    if (!block) {
      return NextResponse.json({ error: 'Block not found' }, { status: 404 })
    }

    // Check if user is a member of the pod
    const podMember = await PodMember.findOne({
      podId: block.podId,
      userId: session.user.id,
    })

    if (!podMember) {
      return NextResponse.json(
        { error: 'You are not a member of this pod' },
        { status: 403 }
      )
    }

    // Check if user has access to this block (creator or block member)
    const isCreator = block.creatorId.toString() === session.user.id
    const blockMember = await BlockMember.findOne({
      blockId,
      userId: session.user.id,
    })

    if (!isCreator && !blockMember) {
      return NextResponse.json(
        { error: 'You do not have access to this block' },
        { status: 403 }
      )
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Store file in GridFS
    const db = mongoose.connection.db
    if (!db) {
      return NextResponse.json(
        { error: 'Database connection error' },
        { status: 500 }
      )
    }

    const bucket = new GridFSBucket(db, { bucketName: 'documents' })
    const fileName = `${Date.now()}-${file.name}`
    
    // Create a new ObjectId for the file
    const fileId = new mongoose.Types.ObjectId()
    
    const uploadStream = bucket.openUploadStreamWithId(fileId, fileName, {
      contentType: file.type,
    })

    // Write buffer to GridFS
    await new Promise<void>((resolve, reject) => {
      uploadStream.on('finish', resolve)
      uploadStream.on('error', reject)
      uploadStream.end(buffer)
    })

    // Create document record
    const document = await DocumentModel.create({
      blockId,
      fileName: file.name,
      fileUrl: `/api/documents/${fileId}/download`,
      fileType: file.type,
      fileSize: file.size,
      gridfsFileId: fileId,
      uploadedBy: session.user.id,
    })

    // Update fileUrl with document ID
    document.fileUrl = `/api/documents/${document._id}/download`
    await document.save()

    return NextResponse.json(
      {
        message: 'Document uploaded successfully',
        document: {
          id: document._id.toString(),
          fileName: document.fileName,
          fileType: document.fileType,
          fileSize: document.fileSize,
          uploadedAt: document.uploadedAt,
        },
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Upload document error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

