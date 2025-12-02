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
import { Mail, X } from "lucide-react"

export default function InviteMemberModal({ open, onClose, pod }: {
  open: boolean
  onClose: () => void
  pod: any
}) {
  const [email, setEmail] = useState("")
  const [isInviting, setIsInviting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)

    if (!email.trim()) {
      setError("Email is required")
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address")
      return
    }

    setIsInviting(true)

    try {
      const response = await fetch(`/api/pods/${pod.id}/invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        setEmail("")
        setTimeout(() => {
          onClose()
          setSuccess(false)
        }, 2000)
      } else {
        // Check for specific error messages
        if (data.error?.includes("does not exist") || data.error?.includes("must sign up")) {
          setError("This user is not signed up in WACE. They must create an account first.")
        } else {
          setError(data.error || "Failed to send invitation")
        }
      }
    } catch (error) {
      console.error("Error inviting member:", error)
      setError("Failed to send invitation. Please try again.")
    } finally {
      setIsInviting(false)
    }
  }

  const handleClose = () => {
    setEmail("")
    setError("")
    setSuccess(false)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
                Invite Member
              </DialogTitle>
              <DialogDescription className="text-gray-600 dark:text-white mt-1">
                Invite a user to join <strong>{pod?.name}</strong>
              </DialogDescription>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 dark:text-white hover:text-gray-600 dark:hover:text-black transition"
            >
              <X size={20} />
            </button>
          </div>
        </DialogHeader>

        {success ? (
          <div className="py-8 text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail size={32} className="text-green-600 dark:text-green-400" />
            </div>
            <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Invitation Sent!
            </p>
            <p className="text-sm text-gray-600 dark:text-white">
              An invitation email has been sent to {email}
            </p>
          </div>
        ) : (
          <form onSubmit={handleInvite} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-white mb-2 block">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setError("")
                  }}
                  className="pl-10 bg-white dark:bg-black text-gray-900 dark:text-white border-gray-300 dark:border-white"
                  disabled={isInviting}
                  required
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-white mt-2">
                The user must be signed up in WACE to receive an invitation.
              </p>
            </div>

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
                disabled={isInviting}
                className="dark:bg-black dark:text-white dark:border-white"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isInviting || !email.trim()}
                className="bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-white"
              >
                {isInviting ? "Sending..." : "Send Invitation"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

