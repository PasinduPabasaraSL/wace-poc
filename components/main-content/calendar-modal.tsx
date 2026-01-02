"use client"

import { useState, useEffect } from "react"
import { Calendar, Plus, Users, Trash2, X, Minimize2, Maximize2 } from "lucide-react"
import AddMembersToBlockModal from "@/components/add-members-to-block-modal"
import type { CalendarEvent } from "./types"

interface CalendarModalProps {
  boxId: string
  calendarData: any
  podId?: string
  user?: any
  onClose: () => void
}

/**
 * CalendarModal Component
 * 
 * Client component because:
 * - Uses useState for events and modal state
 * - Uses useEffect for data fetching
 * - Event handlers for CRUD operations
 */
export function CalendarModal({
  boxId,
  calendarData,
  podId,
  user,
  onClose,
}: CalendarModalProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddEventModal, setShowAddEventModal] = useState(false)
  const [showAddMembersModal, setShowAddMembersModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  
  // Client-side formatted dates
  const [formattedDates, setFormattedDates] = useState<Record<string, string>>({})

  const calendarName = calendarData?.label || "Calendar"
  const isCreator = user && calendarData?.creatorId === user.id

  useEffect(() => {
    if (boxId) {
      fetchEvents()
    }
  }, [boxId])

  // Format dates on client only (avoid hydration mismatch)
  useEffect(() => {
    const dates: Record<string, string> = {}
    events.forEach((event) => {
      if (event.date) {
        const date = new Date(event.date)
        dates[event.id] = date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      }
    })
    setFormattedDates(dates)
  }, [events])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/calendar/events?blockId=${boxId}`)
      if (response.ok) {
        const data = await response.json()
        setEvents(data.events || [])
      } else if (response.status === 403) {
        const data = await response.json()
        console.error("Access denied:", data.error)
      }
    } catch (error) {
      console.error("Error fetching events:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return

    try {
      const response = await fetch(`/api/calendar/events/${eventId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchEvents()
      } else {
        const data = await response.json()
        alert(data.error || "Failed to delete event")
      }
    } catch (error) {
      console.error("Error deleting event:", error)
      alert("Failed to delete event. Please try again.")
    }
  }

  if (!calendarData) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose} />

      <div
        className={`fixed z-50 border border-white/15 shadow-2xl flex flex-col bg-black text-white ${
          isFullscreen
            ? "inset-0 w-screen h-screen rounded-none"
            : "left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[85vh] rounded-xl"
        }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/15 bg-black">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-white">{calendarName}</h3>
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
              <button
                onClick={() => {
                  setEditingEvent(null)
                  setShowAddEventModal(true)
                }}
                className="px-4 py-2 bg-white text-black text-sm rounded-lg hover:bg-gray-200 transition flex items-center gap-2"
              >
                <Plus size={16} />
                <span>Add Event</span>
              </button>
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
        </div>

        {/* Events List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-300">Loading events...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Calendar size={48} className="text-gray-500 mb-4" />
              <p className="text-gray-200 font-medium mb-1">No events yet</p>
              <p className="text-sm text-gray-400">Add your first event to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="p-4 rounded-lg border border-white/15 bg-black hover:bg-gray-900 transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <Calendar size={20} className="text-gray-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-white">{event.title}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <p className="text-xs text-gray-300">
                            {formattedDates[event.id] || ""}
                            {event.time && ` • ${event.time}`}
                          </p>
                          {event.createdBy && (
                            <p className="text-xs text-gray-400">by {event.createdBy.name}</p>
                          )}
                        </div>
                        {event.description && (
                          <p className="text-xs text-gray-300 mt-1">{event.description}</p>
                        )}
                      </div>
                    </div>
                    {user?.id === event.createdBy?.id && (
                      <button
                        onClick={() => handleDeleteEvent(event.id)}
                        className="p-1.5 hover:bg-red-900/50 rounded transition flex-shrink-0"
                        title="Delete"
                      >
                        <Trash2 size={16} className="text-red-400" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {showAddEventModal && (
          <AddEventModal
            open={showAddEventModal}
            onClose={() => {
              setShowAddEventModal(false)
              setEditingEvent(null)
            }}
            blockId={boxId}
            event={editingEvent}
            onEventAdded={fetchEvents}
          />
        )}

        {showAddMembersModal && podId && (
          <AddMembersToBlockModal
            open={showAddMembersModal}
            onClose={() => setShowAddMembersModal(false)}
            block={calendarData}
            podId={podId as string}
            creatorId={calendarData?.creatorId}
            onMemberAdded={() => {
              setShowAddMembersModal(false)
            }}
          />
        )}
      </div>
    </>
  )
}

interface AddEventModalProps {
  open: boolean
  onClose: () => void
  blockId: string
  event?: CalendarEvent | null
  onEventAdded: () => void
}

/**
 * AddEventModal Component
 */
export function AddEventModal({
  open,
  onClose,
  blockId,
  event,
  onEventAdded,
}: AddEventModalProps) {
  const [title, setTitle] = useState(event?.title || "")
  const [date, setDate] = useState(event?.date ? new Date(event.date).toISOString().split("T")[0] : "")
  const [time, setTime] = useState(event?.time || "")
  const [description, setDescription] = useState(event?.description || "")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (event) {
      setTitle(event.title || "")
      setDate(event.date ? new Date(event.date).toISOString().split("T")[0] : "")
      setTime(event.time || "")
      setDescription(event.description || "")
    } else {
      setTitle("")
      setDate("")
      setTime("")
      setDescription("")
    }
  }, [event, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!title.trim() || !date) {
      setError("Title and date are required")
      return
    }

    setIsSubmitting(true)

    try {
      const url = event ? `/api/calendar/events/${event.id}` : "/api/calendar/events"
      const method = event ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          blockId,
          title: title.trim(),
          date,
          time: time.trim() || undefined,
          description: description.trim() || undefined,
        }),
      })

      if (response.ok) {
        onEventAdded()
        onClose()
      } else {
        const data = await response.json()
        setError(data.error || `Failed to ${event ? "update" : "create"} event`)
      }
    } catch (error) {
      console.error(`Error ${event ? "updating" : "creating"} event:`, error)
      setError(`Failed to ${event ? "update" : "create"} event. Please try again.`)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 bg-black dark:bg-white bg-opacity-30 dark:bg-opacity-30 z-50" onClick={onClose} />

      <div className="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-black rounded-xl shadow-2xl z-[60] border border-gray-200 dark:border-white/20">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {event ? "Edit Event" : "Add Event"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 dark:text-white hover:text-gray-600 dark:hover:text-black transition"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                Event Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Team Meeting"
                className="w-full px-3 py-2 border border-gray-300 dark:border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-black text-gray-900 dark:text-white"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-black text-gray-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                  Time (Optional)
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-black text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add event description..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-black text-gray-900 dark:text-white resize-none"
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
                disabled={isSubmitting}
                className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-white transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (event ? "Updating..." : "Adding...") : event ? "Update Event" : "Add Event"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
