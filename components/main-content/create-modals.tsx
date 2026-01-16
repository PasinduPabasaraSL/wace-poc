"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { calculateNextBlockPosition } from "./utils"

interface CreateChatModalProps {
  open: boolean
  onClose: () => void
  podId: string
  existingBlocks?: any[]
  onCreated: () => void
}

/**
 * CreateChatModal Component
 * 
 * Client component because:
 * - Uses useState for form state
 * - Has form submission with async API call
 * - User interaction handlers
 */
export function CreateChatModal({
  open,
  onClose,
  podId,
  existingBlocks,
  onCreated,
}: CreateChatModalProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!name.trim()) {
      setError("Chat name is required")
      return
    }

    setIsCreating(true)

    try {
      const position = calculateNextBlockPosition(existingBlocks || [])
      const response = await fetch("/api/blocks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          podId,
          type: "chat",
          label: name.trim(),
          description: description.trim() || undefined,
          x: position.x,
          y: position.y,
        }),
      })

      if (response.ok) {
        setName("")
        setDescription("")
        onCreated()
        onClose()
      } else {
        const data = await response.json()
        setError(data.error || "Failed to create chat")
      }
    } catch (error) {
      console.error("Error creating chat:", error)
      setError("Failed to create chat. Please try again.")
    } finally {
      setIsCreating(false)
    }
  }

  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/30 dark:bg-black/30 backdrop-blur-sm z-40" onClick={onClose} />
      <div onClick={(e) => e.stopPropagation()} className="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-white rounded-xl shadow-2xl z-50 border border-gray-200 dark:border-white/20">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-black">Create Chat</h3>
            <button
              onClick={onClose}
              className="text-gray-400 dark:text-black hover:text-gray-600 dark:hover:text-gray-600 transition"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="chat-name" className="block text-sm font-medium text-gray-700 dark:text-black mb-2">
                Chat Name *
              </label>
              <input
                id="chat-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter chat name"
                className="w-full px-4 py-2 border border-gray-300 dark:border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-white text-gray-900 dark:text-black"
                disabled={isCreating}
                required
              />
            </div>

            <div>
              <label htmlFor="chat-description" className="block text-sm font-medium text-gray-700 dark:text-black mb-2">
                Description
              </label>
              <textarea
                id="chat-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter chat description (optional)"
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-white text-gray-900 dark:text-black resize-none"
                disabled={isCreating}
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 dark:text-red-400">{error}</div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isCreating}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-white bg-gray-100 dark:bg-white hover:bg-gray-200 dark:hover:bg-white rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreating || !name.trim()}
                className="px-4 py-2 text-sm font-medium text-white dark:text-black bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? "Creating..." : "Create Chat"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

interface CreateDocModalProps {
  open: boolean
  onClose: () => void
  podId: string
  existingBlocks?: any[]
  onCreated: () => void
}

/**
 * CreateDocModal Component
 */
export function CreateDocModal({
  open,
  onClose,
  podId,
  existingBlocks,
  onCreated,
}: CreateDocModalProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!name.trim()) {
      setError("Document folder name is required")
      return
    }

    setIsCreating(true)

    try {
      const position = calculateNextBlockPosition(existingBlocks || [])
      const response = await fetch("/api/blocks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          podId,
          type: "docs",
          label: name.trim(),
          description: description.trim() || undefined,
          x: position.x,
          y: position.y,
        }),
      })

      if (response.ok) {
        setName("")
        setDescription("")
        onCreated()
        onClose()
      } else {
        const data = await response.json()
        setError(data.error || "Failed to create document folder")
      }
    } catch (error) {
      console.error("Error creating document folder:", error)
      setError("Failed to create document folder. Please try again.")
    } finally {
      setIsCreating(false)
    }
  }

  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/30 dark:bg-black/30 backdrop-blur-sm z-40" onClick={onClose} />

      <div onClick={(e) => e.stopPropagation()} className="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-white rounded-xl shadow-2xl z-50 border border-gray-200 dark:border-white/20">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-black">Create Document Folder</h2>
            <button onClick={onClose} className="text-gray-400 dark:text-black hover:text-gray-600 dark:hover:text-gray-600 transition">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-black mb-1">
                Folder Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Project Documents"
                className="w-full px-3 py-2 border border-gray-300 dark:border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-white text-gray-900 dark:text-black"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-black mb-1">
                Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a description for this folder..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-white text-gray-900 dark:text-black resize-none"
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 dark:text-white bg-gray-100 dark:bg-white rounded-lg hover:bg-gray-200 dark:hover:bg-white transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreating}
                className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-white transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? "Creating..." : "Create Folder"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

interface CreateCalendarModalProps {
  open: boolean
  onClose: () => void
  podId: string
  existingBlocks?: any[]
  onCreated: () => void
}

/**
 * CreateCalendarModal Component
 */
export function CreateCalendarModal({
  open,
  onClose,
  podId,
  existingBlocks,
  onCreated,
}: CreateCalendarModalProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!name.trim()) {
      setError("Calendar name is required")
      return
    }

    setIsCreating(true)

    try {
      const position = calculateNextBlockPosition(existingBlocks || [])
      const response = await fetch("/api/blocks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          podId,
          type: "calendar",
          label: name.trim(),
          description: description.trim() || undefined,
          x: position.x,
          y: position.y,
        }),
      })

      if (response.ok) {
        setName("")
        setDescription("")
        onCreated()
        onClose()
      } else {
        const data = await response.json()
        setError(data.error || "Failed to create calendar")
      }
    } catch (error) {
      console.error("Error creating calendar:", error)
      setError("Failed to create calendar. Please try again.")
    } finally {
      setIsCreating(false)
    }
  }

  if (!open) return null

  return (
    <>
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      <div
        onClick={(e) => e.stopPropagation()}
        className="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-white rounded-xl shadow-2xl z-50 border border-gray-200 dark:border-white/20"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-black">Create Calendar</h2>
            <button onClick={onClose} className="text-gray-400 dark:text-black hover:text-gray-600 dark:hover:text-gray-600 transition">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-black mb-1">
                Calendar Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Team Calendar"
                className="w-full px-3 py-2 border border-gray-300 dark:border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-white text-gray-900 dark:text-black"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-black mb-1">
                Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a description for this calendar..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-white text-gray-900 dark:text-black resize-none"
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 dark:text-white bg-gray-100 dark:bg-white rounded-lg hover:bg-gray-200 dark:hover:bg-white transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreating}
                className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-white transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? "Creating..." : "Create Calendar"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

interface CreateGoalModalProps {
  open: boolean
  onClose: () => void
  podId: string
  existingBlocks?: any[]
  onCreated: () => void
}

/**
 * CreateGoalModal Component
 */
export function CreateGoalModal({
  open,
  onClose,
  podId,
  existingBlocks,
  onCreated,
}: CreateGoalModalProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState("")
  const [isFullscreen, setIsFullscreen] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!name.trim()) {
      setError("Goal tracker name is required")
      return
    }

    setIsCreating(true)

    try {
      const position = calculateNextBlockPosition(existingBlocks || [])
      const response = await fetch("/api/blocks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          podId,
          type: "goals",
          label: name.trim(),
          description: description.trim() || undefined,
          x: position.x,
          y: position.y,
        }),
      })

      if (response.ok) {
        setName("")
        setDescription("")
        onCreated()
        onClose()
      } else {
        const data = await response.json()
        setError(data.error || "Failed to create goal tracker")
      }
    } catch (error) {
      console.error("Error creating goal tracker:", error)
      setError("Failed to create goal tracker. Please try again.")
    } finally {
      setIsCreating(false)
    }
  }

  if (!open) return null

  // Import icons inline to avoid circular dependency
  const Minimize2Icon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 14 10 14 10 20" />
      <polyline points="20 10 14 10 14 4" />
      <line x1="14" y1="10" x2="21" y2="3" />
      <line x1="3" y1="21" x2="10" y2="14" />
    </svg>
  )

  const Maximize2Icon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 3 21 3 21 9" />
      <polyline points="9 21 3 21 3 15" />
      <line x1="21" y1="3" x2="14" y2="10" />
      <line x1="3" y1="21" x2="10" y2="14" />
    </svg>
  )

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />

      <div onClick={(e) => e.stopPropagation()} className={`fixed z-50 border border-gray-200 shadow-2xl bg-white dark:bg-white text-gray-900 dark:text-black ${isFullscreen ? "inset-0 w-screen h-screen rounded-none" : "left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md rounded-xl"}`}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-black">Create Goal Tracker</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsFullscreen((prev) => !prev)}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:text-gray-600 dark:hover:text-gray-600 transition"
                title={isFullscreen ? "Exit full screen" : "Full screen"}
              >
                {isFullscreen ? <Minimize2Icon /> : <Maximize2Icon />}
              </button>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:text-gray-600 dark:hover:text-gray-600 p-2 rounded transition">
                <X size={20} />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-black mb-1">
                Tracker Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Project Goals"
                className="w-full px-3 py-2 border border-gray-300 dark:border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-white text-gray-900 dark:text-black"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-black mb-1">
                Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a description for this goal tracker..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-white text-gray-900 dark:text-black resize-none"
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 dark:text-white bg-gray-100 dark:bg-white rounded-lg hover:bg-gray-200 dark:hover:bg-white transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreating}
                className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-white transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? "Creating..." : "Create Tracker"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
