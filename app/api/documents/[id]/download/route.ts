import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import connectDB from '@/lib/mongodb'
import DocumentModel from '@/models/Document'
import Block from '@/models/Block'
import BlockMember from '@/models/BlockMember'
import PodMember from '@/models/PodMember'
import mongoose from 'mongoose'
import { GridFSBucket } from 'mongodb'

// GET /api/documents/:id/download - Download a document
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

    // Find the document
    const document = await DocumentModel.findById(id)
    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Check if block exists
    const block = await Block.findById(document.blockId)
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
      blockId: document.blockId,
      userId: session.user.id,
    })

    if (!isCreator && !blockMember) {
      return NextResponse.json(
        { error: 'You do not have access to this block' },
        { status: 403 }
      )
    }

    // Get file from GridFS using stored gridfsFileId
    const db = mongoose.connection.db
    if (!db) {
      return NextResponse.json(
        { error: 'Database connection error' },
        { status: 500 }
      )
    }

    const bucket = new GridFSBucket(db, { bucketName: 'documents' })
    // Ensure gridfsFileId is a proper ObjectId
    const fileId = new mongoose.Types.ObjectId(document.gridfsFileId)
    const downloadStream = bucket.openDownloadStream(fileId)

    // Convert stream to buffer
    const chunks: Buffer[] = []
    for await (const chunk of downloadStream) {
      chunks.push(chunk)
    }
    const buffer = Buffer.concat(chunks)

    // Return file as response
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${document.fileName}"`,
        'Content-Length': buffer.length.toString(),
      },
    })
  } catch (error: any) {
    console.error('Download document error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

