"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Users, X, Check } from "lucide-react"

export default function AddMembersToBlockModal({ open, onClose, block, podId, onMemberAdded, creatorId }: {
  open: boolean
  onClose: () => void
  block: any
  podId: string
  onMemberAdded: () => void
  creatorId?: string
}) {
  const [podMembers, setPodMembers] = useState<any[]>([])
  const [blockMembers, setBlockMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState<string | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    if (open && block?.id && podId) {
      fetchData()
    }
  }, [open, block?.id, podId])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError("")
      
      const [podMembersRes, blockMembersRes] = await Promise.all([
        fetch(`/api/pods/${podId}/members`),
        fetch(`/api/blocks/${block.id}/members`),
      ])

      if (podMembersRes.ok) {
        const podData = await podMembersRes.json()
        setPodMembers(podData.members || [])
      }

      if (blockMembersRes.ok) {
        const blockData = await blockMembersRes.json()
        setBlockMembers(blockData.members || [])
      }
    } catch (error) {
      console.error("Error fetching members:", error)
      setError("Failed to load members")
    } finally {
      setLoading(false)
    }
  }

  const handleAddMember = async (userId: string) => {
    try {
      setAdding(userId)
      setError("")

      const response = await fetch(`/api/blocks/${block.id}/members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      })

      if (response.ok) {
        await fetchData() // Refresh the lists
        onMemberAdded()
      } else {
        const data = await response.json()
        setError(data.error || "Failed to add member")
      }
    } catch (error) {
      console.error("Error adding member:", error)
      setError("Failed to add member. Please try again.")
    } finally {
      setAdding(null)
    }
  }

  // Get members who are in the pod but not in the block
  // Also exclude the creator since they're automatically a member
  const availableMembers = podMembers.filter(
    (pm) => {
      // Exclude if already a block member
      if (blockMembers.some((bm) => bm.id === pm.id)) {
        return false
      }
      // Exclude the creator (they're automatically a member)
      if (creatorId && pm.id === creatorId) {
        return false
      }
      return true
    }
  )

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
                Add Members to Block
              </DialogTitle>
              <DialogDescription className="text-gray-600 dark:text-white mt-1">
                Select pod members to give access to <strong>{block?.label}</strong>
              </DialogDescription>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 dark:text-white hover:text-gray-600 dark:hover:text-black transition"
            >
              <X size={20} />
            </button>
          </div>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-gray-600 dark:text-white">Loading members...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {error && (
              <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                {error}
              </div>
            )}

            {availableMembers.length === 0 ? (
              <div className="text-center py-8">
                <Users size={32} className="text-gray-400 dark:text-white mx-auto mb-3" />
                <p className="text-gray-600 dark:text-white font-medium">All pod members have access</p>
                <p className="text-sm text-gray-500 dark:text-white mt-1">
                  All members of this pod already have access to this block.
                </p>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto space-y-2">
                {availableMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white rounded-lg hover:bg-gray-100 dark:hover:bg-white transition"
                  >
                    <div className="flex items-center gap-3">
                      {member.profilePicture ? (
                        <div className="w-10 h-10 rounded-full overflow-hidden">
                          <img
                            src={member.profilePicture}
                            alt={member.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 bg-gray-300 dark:bg-black rounded-full flex items-center justify-center">
                          <span className="text-gray-700 dark:text-white font-semibold text-sm">
                            {member.name?.charAt(0).toUpperCase() || "U"}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-black">
                          {member.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-black">{member.email}</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleAddMember(member.id)}
                      disabled={adding === member.id}
                      size="sm"
                      className="bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-white"
                    >
                      {adding === member.id ? (
                        "Adding..."
                      ) : (
                        <>
                          <Users size={14} className="mr-1" />
                          Add
                        </>
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {blockMembers.length > 0 && (
              <div className="pt-4 border-t border-gray-200 dark:border-white">
                <p className="text-xs font-medium text-gray-600 dark:text-white mb-2">
                  Members with access ({blockMembers.length})
                </p>
                <div className="space-y-1">
                  {blockMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded"
                    >
                      <Check size={14} className="text-green-600 dark:text-green-400" />
                      <span className="text-xs text-gray-700 dark:text-white">
                        {member.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="dark:bg-black dark:text-white dark:border-white"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

