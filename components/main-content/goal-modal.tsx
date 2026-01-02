"use client"

import { useState, useEffect } from "react"
import { Target, Plus, Users, Trash2, CheckCircle2, Circle, X, Minimize2, Maximize2 } from "lucide-react"
import AddMembersToBlockModal from "@/components/add-members-to-block-modal"
import { getStatusColor } from "./utils"
import type { Goal } from "./types"

interface GoalModalProps {
  boxId: string
  goalData: any
  podId?: string
  user?: any
  onClose: () => void
}

/**
 * GoalModal Component
 * 
 * Client component because:
 * - Uses useState for goals and modal state
 * - Uses useEffect for data fetching
 * - Event handlers for status changes and CRUD operations
 */
export function GoalModal({
  boxId,
  goalData,
  podId,
  user,
  onClose,
}: GoalModalProps) {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddGoalModal, setShowAddGoalModal] = useState(false)
  const [showAddMembersModal, setShowAddMembersModal] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  
  // Client-side formatted dates
  const [formattedDates, setFormattedDates] = useState<Record<string, string>>({})

  const trackerName = goalData?.label || "Goal Tracker"
  const isCreator = user && goalData?.creatorId === user.id

  useEffect(() => {
    if (boxId) {
      fetchGoals()
    }
  }, [boxId])

  // Format dates on client only (avoid hydration mismatch)
  useEffect(() => {
    const dates: Record<string, string> = {}
    goals.forEach((goal) => {
      if (goal.dueDate) {
        const date = new Date(goal.dueDate)
        dates[goal.id] = date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      } else {
        dates[goal.id] = "No due date"
      }
    })
    setFormattedDates(dates)
  }, [goals])

  const fetchGoals = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/goals?blockId=${boxId}`)
      if (response.ok) {
        const data = await response.json()
        setGoals(data.goals || [])
      } else if (response.status === 403) {
        const data = await response.json()
        console.error("Access denied:", data.error)
      }
    } catch (error) {
      console.error("Error fetching goals:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (goalId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/goals/${goalId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        fetchGoals()
      } else {
        const data = await response.json()
        alert(data.error || "Failed to update goal status")
      }
    } catch (error) {
      console.error("Error updating goal status:", error)
      alert("Failed to update goal status. Please try again.")
    }
  }

  const handleDeleteGoal = async (goalId: string) => {
    if (!confirm("Are you sure you want to delete this goal?")) return

    try {
      const response = await fetch(`/api/goals/${goalId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchGoals()
      } else {
        const data = await response.json()
        alert(data.error || "Failed to delete goal")
      }
    } catch (error) {
      console.error("Error deleting goal:", error)
      alert("Failed to delete goal. Please try again.")
    }
  }

  if (!goalData) return null

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
            <h3 className="text-xl font-bold text-white">{trackerName}</h3>
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
                  setEditingGoal(null)
                  setShowAddGoalModal(true)
                }}
                className="px-4 py-2 bg-white text-black text-sm rounded-lg hover:bg-gray-200 transition flex items-center gap-2"
              >
                <Plus size={16} />
                <span>Add Goal</span>
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

        {/* Goals List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-300">Loading goals...</p>
            </div>
          ) : goals.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Target size={48} className="text-gray-500 mb-4" />
              <p className="text-gray-200 font-medium mb-1">No goals yet</p>
              <p className="text-sm text-gray-400">Add your first goal to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {goals.map((goal) => (
                <div
                  key={goal.id}
                  className="p-4 rounded-lg border border-white/15 bg-black hover:bg-gray-900 transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <button
                        onClick={() => {
                          const nextStatus =
                            goal.status === "not_started"
                              ? "in_progress"
                              : goal.status === "in_progress"
                              ? "done"
                              : "not_started"
                          handleStatusChange(goal.id, nextStatus)
                        }}
                        className="flex-shrink-0 mt-0.5"
                      >
                        {goal.status === "done" ? (
                          <CheckCircle2 size={20} className="text-green-400" />
                        ) : (
                          <Circle size={20} className="text-gray-400" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-white">{goal.title}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <p className="text-xs text-gray-300">Due: {formattedDates[goal.id] || "No due date"}</p>
                          {goal.createdBy && (
                            <p className="text-xs text-gray-400">by {goal.createdBy.name}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={goal.status}
                        onChange={(e) => handleStatusChange(goal.id, e.target.value)}
                        className={`text-xs font-medium px-2 py-1 rounded-full border-0 ${getStatusColor(
                          goal.status
                        )} cursor-pointer`}
                      >
                        <option value="not_started">Not Completed</option>
                        <option value="in_progress">Ongoing</option>
                        <option value="done">Done</option>
                      </select>
                      {user?.id === goal.createdBy?.id && (
                        <button
                          onClick={() => handleDeleteGoal(goal.id)}
                          className="p-1.5 hover:bg-red-900/50 rounded transition flex-shrink-0"
                          title="Delete"
                        >
                          <Trash2 size={16} className="text-red-400" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {showAddGoalModal && (
          <AddGoalModal
            open={showAddGoalModal}
            onClose={() => {
              setShowAddGoalModal(false)
              setEditingGoal(null)
            }}
            blockId={boxId}
            goal={editingGoal}
            onGoalAdded={fetchGoals}
          />
        )}

        {showAddMembersModal && podId && (
          <AddMembersToBlockModal
            open={showAddMembersModal}
            onClose={() => setShowAddMembersModal(false)}
            block={goalData}
            podId={podId as string}
            creatorId={goalData?.creatorId}
            onMemberAdded={() => {
              setShowAddMembersModal(false)
            }}
          />
        )}
      </div>
    </>
  )
}

interface AddGoalModalProps {
  open: boolean
  onClose: () => void
  blockId: string
  goal?: Goal | null
  onGoalAdded: () => void
}

/**
 * AddGoalModal Component
 */
export function AddGoalModal({
  open,
  onClose,
  blockId,
  goal,
  onGoalAdded,
}: AddGoalModalProps) {
  const [title, setTitle] = useState(goal?.title || "")
  const [dueDate, setDueDate] = useState(goal?.dueDate ? new Date(goal.dueDate).toISOString().split("T")[0] : "")
  const [status, setStatus] = useState(goal?.status || "not_started")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (goal) {
      setTitle(goal.title || "")
      setDueDate(goal.dueDate ? new Date(goal.dueDate).toISOString().split("T")[0] : "")
      setStatus(goal.status || "not_started")
    } else {
      setTitle("")
      setDueDate("")
      setStatus("not_started")
    }
  }, [goal, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!title.trim()) {
      setError("Goal title is required")
      return
    }

    setIsSubmitting(true)

    try {
      const url = goal ? `/api/goals/${goal.id}` : "/api/goals"
      const method = goal ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          blockId,
          title: title.trim(),
          dueDate: dueDate || undefined,
          status,
        }),
      })

      if (response.ok) {
        onGoalAdded()
        onClose()
      } else {
        const data = await response.json()
        setError(data.error || `Failed to ${goal ? "update" : "create"} goal`)
      }
    } catch (error) {
      console.error(`Error ${goal ? "updating" : "creating"} goal:`, error)
      setError(`Failed to ${goal ? "update" : "create"} goal. Please try again.`)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-50" onClick={onClose} />

      <div className="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-black text-white rounded-xl shadow-2xl z-[60] border border-white/15">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">{goal ? "Edit Goal" : "Add Goal"}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white hover:bg-gray-800 p-2 rounded transition"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1">
                Task Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Complete project documentation"
                className="w-full px-3 py-2 border border-white/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-black text-white placeholder:text-gray-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1">Due Date (Optional)</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-white/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-black text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Goal["status"])}
                className="w-full px-3 py-2 border border-white/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-black text-white"
              >
                <option value="not_started">Not Completed</option>
                <option value="in_progress">Ongoing</option>
                <option value="done">Done</option>
              </select>
            </div>

            {error && <div className="text-sm text-red-400 bg-red-900/30 p-3 rounded-lg">{error}</div>}

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-white bg-white/10 rounded-lg hover:bg-white/20 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (goal ? "Updating..." : "Adding...") : goal ? "Update Goal" : "Add Goal"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
