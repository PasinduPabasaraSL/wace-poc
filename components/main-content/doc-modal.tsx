"use client"

import { useState, useEffect, useRef } from "react"
import { File, Search, Users, Upload, Download, Trash2, X, Minimize2, Maximize2 } from "lucide-react"
import AddMembersToBlockModal from "@/components/add-members-to-block-modal"
import { getAvatarColor, getInitials, formatFileSize, getFileTypeColor } from "./utils"
import { useFormattedDatesMap } from "./hooks"
import type { Document } from "./types"

interface DocModalProps {
  boxId: string
  docData: any
  podId?: string
  user?: any
  onClose: () => void
}

/**
 * DocModal Component
 * 
 * Client component because:
 * - Uses useState for documents, search, upload state
 * - Uses useEffect for data fetching
 * - File upload and download handlers
 * - Complex user interactions
 */
export function DocModal({
  boxId,
  docData,
  podId,
  user,
  onClose,
}: DocModalProps) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [showAddMembersModal, setShowAddMembersModal] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const isMountedRef = useRef(true)
  
  // Use shared hook for date formatting (hydration-safe)
  const formattedDates = useFormattedDatesMap(documents, 'uploadedAt')

  const docName = docData?.label || "Documents"
  const isCreator = user && docData?.creatorId === user.id

  useEffect(() => {
    isMountedRef.current = true
    if (boxId && podId) {
      fetchDocuments()
    }
    return () => { isMountedRef.current = false }
  }, [boxId, podId])

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/documents?blockId=${boxId}`)
      if (response.ok) {
        const data = await response.json()
        setDocuments(data.documents || [])
      } else if (response.status === 403) {
        const data = await response.json()
        console.error("Access denied:", data.error)
      }
    } catch (error) {
      console.error("Error fetching documents:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type !== "application/pdf") {
      alert("Only PDF files are allowed")
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("File size too large. Maximum size is 10MB.")
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("blockId", boxId)

      const response = await fetch("/api/documents", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        fetchDocuments()
        e.target.value = ""
      } else {
        const data = await response.json()
        alert(data.error || "Failed to upload document")
      }
    } catch (error) {
      console.error("Error uploading document:", error)
      alert("Failed to upload document. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  const handleDownload = async (documentId: string, fileName: string) => {
    try {
      const response = await fetch(`/api/documents/${documentId}/download`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = fileName
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        const data = await response.json()
        alert(data.error || "Failed to download document")
      }
    } catch (error) {
      console.error("Error downloading document:", error)
      alert("Failed to download document. Please try again.")
    }
  }

  const handleDeleteDocument = async (documentId: string, fileName: string) => {
    if (!confirm(`Are you sure you want to delete "${fileName}"?`)) return

    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchDocuments()
      } else {
        const data = await response.json()
        alert(data.error || "Failed to delete document")
      }
    } catch (error) {
      console.error("Error deleting document:", error)
      alert("Failed to delete document. Please try again.")
    }
  }

  const filteredDocuments = documents.filter((doc) =>
    doc.fileName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (!docData) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />

      <div
        onClick={(e) => e.stopPropagation()}
        className={`fixed z-50 border border-white/15 shadow-2xl flex flex-col bg-black text-white ${
          isFullscreen
            ? "inset-0 w-screen h-screen rounded-none"
            : "left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[85vh] rounded-xl"
        }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/15 bg-black">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-white">{docName}</h3>
            <div className="flex items-center gap-2">
              {isCreator && podId && (
                <button
                  onClick={() => setShowAddMembersModal(true)}
                  className="px-4 py-2 bg-white text-black text-sm rounded-lg hover:bg-gray-200 transition flex items-center gap-2"
                >
                  <Users size={16} />
                  <span>Add Members</span>
                </button>
              )}
              <label className="px-4 py-2 bg-white text-black text-sm rounded-lg hover:bg-gray-200 transition flex items-center gap-2 cursor-pointer">
                <Upload size={16} />
                <span>{uploading ? "Uploading..." : "Upload"}</span>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
              <button
                onClick={() => setIsFullscreen((prev) => !prev)}
                className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition"
                title={isFullscreen ? "Exit full screen" : "Full screen"}
              >
                {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-white/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-black text-white placeholder:text-gray-500"
            />
          </div>
        </div>

        {/* Document List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-300">Loading documents...</p>
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <File size={48} className="text-gray-600 mb-4" />
              <p className="text-gray-200 font-medium mb-1">No documents yet</p>
              <p className="text-sm text-gray-400">Upload your first PDF document</p>
            </div>
          ) : (
            <div className="border border-white/15 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-900 border-b border-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      File Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Uploaded By
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Size
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-black divide-y divide-gray-800">
                  {filteredDocuments.map((doc, i) => (
                    <tr key={doc.id || i} className="hover:bg-gray-900 transition">
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getFileTypeColor(
                            doc.fileType
                          )}`}
                        >
                          PDF
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-white">{doc.fileName}</td>
                      <td className="px-4 py-3 text-sm text-gray-300">
                        {doc.uploadedBy?.name || "Unknown"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300">{formatFileSize(doc.fileSize)}</td>
                      <td className="px-4 py-3 text-sm text-gray-300">{formattedDates[doc.id] || ""}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleDownload(doc.id, doc.fileName)}
                            className="p-1.5 hover:bg-white/10 rounded transition"
                            title="Download"
                          >
                            <Download size={16} className="text-gray-300" />
                          </button>
                          {(user?.id === doc.uploadedBy?.id || isCreator) && (
                            <button
                              onClick={() => handleDeleteDocument(doc.id, doc.fileName)}
                              className="p-1.5 hover:bg-red-900/50 rounded transition"
                              title="Delete"
                            >
                              <Trash2 size={16} className="text-red-600 dark:text-red-400" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {showAddMembersModal && podId && (
          <AddMembersToBlockModal
            open={showAddMembersModal}
            onClose={() => setShowAddMembersModal(false)}
            block={docData}
            podId={podId as string}
            creatorId={docData?.creatorId}
            onMemberAdded={() => {
              setShowAddMembersModal(false)
            }}
          />
        )}
      </div>
    </>
  )
}
