"use client"

import { useState, useEffect } from "react"
import { MoreVertical, Trash2 } from "lucide-react"
import DeletePodModal from "@/components/delete-pod-modal"
import PodDetailsModal from "@/components/pod-details-modal"
import type { Pod, User } from "./types"

interface PodCardProps {
  pod: Pod
  image: string
  name: string
  tagline: string
  onClick: () => void
  onDelete: () => void
  user: User | null
}

/**
 * PodCard Component
 * 
 * Client component because:
 * - Uses useState for modal visibility
 * - Uses useEffect to check creator status
 * - Has click handlers for interactive behavior
 */
export default function PodCard({
  pod,
  image,
  name,
  tagline,
  onClick,
  onDelete,
  user,
}: PodCardProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  
  // Derived state - no useEffect needed
  const isCreator = pod?.role === 'creator'

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowDeleteModal(true)
  }

  return (
    <>
      <div className="group bg-white dark:bg-black rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-white/20 relative">
        <div
          onClick={onClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick?.() }}
          className="w-full text-left cursor-pointer"
        >
          <div className="relative h-56 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
            <img
              src={image || "/placeholder.svg"}
              alt={name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            {/* 3-dot menu */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowDetailsModal(true)
              }}
              className="absolute top-3 right-3 p-2 bg-white/90 dark:bg-black/90 backdrop-blur-sm text-gray-600 dark:text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:bg-white dark:hover:bg-white hover:scale-110"
              title="Pod options"
            >
              <MoreVertical size={16} />
            </button>
            {isCreator && (
              <button
                onClick={handleDeleteClick}
                className="absolute top-3 right-14 p-2 bg-red-500/90 dark:bg-red-600/90 backdrop-blur-sm hover:bg-red-600 dark:hover:bg-red-700 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:scale-110"
                title="Delete pod"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
          <div className="p-5 bg-white dark:bg-black">
            <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1.5 truncate">{name}</h3>
            <p className="text-sm text-gray-600 dark:text-white line-clamp-2">{tagline || "No tagline"}</p>
          </div>
        </div>
      </div>
      {showDeleteModal && (
        <DeletePodModal
          open={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          pod={pod}
          onDelete={onDelete}
        />
      )}
      {showDetailsModal && (
        <PodDetailsModal
          open={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          pod={pod}
          user={user}
        />
      )}
    </>
  )
}
