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
import { AlertTriangle } from "lucide-react"

export default function DeleteBlockModal({ open, onClose, block, onDelete }: {
  open: boolean
  onClose: () => void
  block: any
  onDelete: () => void
}) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState("")

  const handleDelete = async () => {
    setIsDeleting(true)
    setError("")

    try {
      const response = await fetch(`/api/blocks/${block.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        onDelete()
        onClose()
      } else {
        const data = await response.json()
        setError(data.error || "Failed to delete block")
      }
    } catch (error) {
      console.error("Error deleting block:", error)
      setError("Failed to delete block. Please try again.")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleClose = () => {
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
              Delete Block
            </DialogTitle>
          </div>
          <DialogDescription className="text-gray-600 dark:text-white">
            Are you sure you want to delete the block <strong>"{block?.label}"</strong>? This action cannot be undone. This will permanently delete:
          </DialogDescription>
          <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-gray-600 dark:text-white ml-4">
            <li>All messages and conversations (if chat block)</li>
            <li>All documents and files (if docs block)</li>
            <li>All calendar events (if calendar block)</li>
            <li>All goals and tasks (if goals block)</li>
            <li>All member access settings</li>
          </ul>
        </DialogHeader>
        {error && (
          <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
            {error}
          </div>
        )}
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
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white dark:bg-red-600 dark:hover:bg-red-700"
          >
            {isDeleting ? "Deleting..." : "Delete Block"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

