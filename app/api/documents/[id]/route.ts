import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import connectDB from '@/lib/mongodb'
import DocumentModel from '@/models/Document'
import Block from '@/models/Block'
import BlockMember from '@/models/BlockMember'
import PodMember from '@/models/PodMember'
import mongoose from 'mongoose'
import { GridFSBucket } from 'mongodb'

// DELETE /api/documents/:id - Delete a document
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

    // Only the uploader or block creator can delete
    const isCreator = block.creatorId.toString() === session.user.id
    const isUploader = document.uploadedBy.toString() === session.user.id

    if (!isCreator && !isUploader) {
      return NextResponse.json(
        { error: 'You can only delete documents you uploaded' },
        { status: 403 }
      )
    }

    // Delete from GridFS using stored gridfsFileId
    try {
      const db = mongoose.connection.db
      if (db) {
        const bucket = new GridFSBucket(db, { bucketName: 'documents' })
        // Ensure gridfsFileId is a proper ObjectId
        const fileId = new mongoose.Types.ObjectId(document.gridfsFileId)
        await bucket.delete(fileId)
      }
    } catch (error) {
      console.error('Error deleting file from GridFS:', error)
      // Continue with document deletion even if GridFS deletion fails
    }

    // Delete document record
    await DocumentModel.findByIdAndDelete(id)

    return NextResponse.json(
      { message: 'Document deleted successfully' },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Delete document error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

