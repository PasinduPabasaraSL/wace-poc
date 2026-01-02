"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertTriangle, Lock } from "lucide-react"

export default function DeletePodModal({ open, onClose, pod, onDelete }: {
  open: boolean
  onClose: () => void
  pod: any
  onDelete: () => void
}) {
  const [password, setPassword] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState("")

  const handleDelete = async () => {
    if (!password.trim()) {
      setError("Password is required")
      return
    }

    setIsDeleting(true)
    setError("")

    try {
      const response = await fetch(`/api/pods/${pod.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      })

      if (response.ok) {
        onDelete()
        onClose()
        setPassword("")
        setError("")
      } else {
        const data = await response.json()
        setError(data.error || "Failed to delete pod")
      }
    } catch (error) {
      console.error("Error deleting pod:", error)
      setError("Failed to delete pod. Please try again.")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleClose = () => {
    setPassword("")
    setError("")
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-100 dark:bg-red-900 rounded-full">
              <AlertTriangle className="text-red-600 dark:text-red-400" size={20} />
            </div>
            <DialogTitle className="text-red-600 dark:text-red-400">
              Delete Pod
            </DialogTitle>
          </div>
          <DialogDescription asChild>
            <div className="text-gray-600 dark:text-white text-sm">
              This action cannot be undone. This will permanently delete the pod <strong>"{pod?.name}"</strong> and all of its data including:
              <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                <li>All blocks (Chat, Docs, Meetings, Calendar, Goals)</li>
                <li>All messages and conversations</li>
                <li>All documents and files</li>
                <li>All calendar events</li>
                <li>All goals and tasks</li>
                <li>All members and invitations</li>
              </ul>
            </div>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-sm text-red-800 dark:text-red-200 font-medium mb-2">
              For security, please enter your account password to confirm deletion:
            </p>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm text-gray-700 dark:text-white">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setError("")
                  }}
                  className="pl-10 bg-white dark:bg-black text-gray-900 dark:text-white border-gray-300 dark:border-white"
                  disabled={isDeleting}
                />
              </div>
              {error && (
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              )}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isDeleting}
            className="dark:bg-black dark:text-white dark:border-white"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting || !password.trim()}
            className="bg-red-600 hover:bg-red-700 text-white dark:bg-red-600 dark:hover:bg-red-700"
          >
            {isDeleting ? "Deleting..." : "Delete Pod"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

