"use client"

import { X, Video } from "lucide-react"

interface MeetingModalProps {
  boxId: string
  meetingData: any
  onClose: () => void
}

/**
 * MeetingModal Component
 * 
 * Client component because:
 * - Has onClick handler for closing
 * - Placeholder for future interactive meeting features
 */
export function MeetingModal({ boxId, meetingData, onClose }: MeetingModalProps) {
  const meetingName = meetingData?.label || "Meetings"

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose} />

      <div className="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-black text-white rounded-xl shadow-2xl flex flex-col z-50 border border-white/15">
        {/* Header */}
        <div className="p-6 border-b border-white/15 bg-black">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-white">{meetingName}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white hover:bg-white/10 p-2 rounded transition"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Coming Soon Content */}
        <div className="flex-1 flex items-center justify-center p-12">
          <div className="text-center">
            <Video size={64} className="text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Coming Soon</h2>
            <p className="text-gray-300">
              The meetings feature is currently under development. Stay tuned!
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

interface FeatureUnderDevModalProps {
  open: boolean
  onClose: () => void
  featureName: string
}

/**
 * FeatureUnderDevModal Component
 * 
 * Client component because:
 * - Has onClick handler for closing
 * - Conditionally rendered based on open prop
 */
export function FeatureUnderDevModal({ open, onClose, featureName }: FeatureUnderDevModalProps) {
  if (!open) return null

  return (
    <>
      <div
        className="fixed inset-0 bg-black dark:bg-white bg-opacity-20 dark:bg-opacity-20 z-40"
        onClick={onClose}
      />

      <div className="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-black rounded-xl shadow-2xl flex flex-col z-50 border border-gray-200 dark:border-white/20">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Feature Under Development</h2>
            <button
              onClick={onClose}
              className="text-gray-400 dark:text-white hover:text-gray-600 dark:hover:text-black transition"
            >
              <X size={20} />
            </button>
          </div>

          <div className="text-center py-8">
            <Video size={64} className="text-gray-300 dark:text-white mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{featureName} Feature</h3>
            <p className="text-gray-600 dark:text-white mb-6">
              This feature is currently under development. We're working hard to bring it to you soon!
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-900 dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-white transition"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
