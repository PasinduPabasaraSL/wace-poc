"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

function InvitationAcceptContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const success = searchParams.get("success")
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    const error = searchParams.get("error")
    const messageParam = searchParams.get("message")
    
    if (success === "true") {
      setStatus("success")
      if (messageParam === "already_member") {
        setMessage("You are already a member of this pod.")
      } else {
        setMessage("Invitation accepted! You've been added to the pod.")
      }
    } else if (error) {
      setStatus("error")
      if (error === "invalid_invitation") {
        setMessage("This invitation is invalid or has expired.")
      } else if (error === "expired_invitation") {
        setMessage("This invitation has expired.")
      } else if (error === "email_mismatch") {
        setMessage("This invitation was sent to a different email address.")
      } else {
        setMessage("Failed to accept invitation. Please try again.")
      }
    } else if (token) {
      // If there's a token but no success/error, try to accept it
      handleAcceptInvitation()
    } else {
      setStatus("error")
      setMessage("Invalid invitation link")
    }
  }, [token, success, searchParams])

  const handleAcceptInvitation = async () => {
    if (!token) {
      setStatus("error")
      setMessage("Invalid invitation link")
      return
    }

    try {
      // The API route will redirect, so we need to follow redirects
      const response = await fetch(`/api/invitations/accept/${token}`, {
        redirect: 'follow'
      })
      
      // Since it's a redirect, we'll check the final URL
      if (response.url) {
        const url = new URL(response.url)
        const success = url.searchParams.get("success")
        const error = url.searchParams.get("error")
        const messageParam = url.searchParams.get("message")
        
        if (success === "true") {
          setStatus("success")
          if (messageParam === "already_member") {
            setMessage("You are already a member of this pod.")
          } else {
            setMessage("Invitation accepted! You've been added to the pod.")
          }
        } else if (error) {
          setStatus("error")
          if (error === "invalid_invitation") {
            setMessage("This invitation is invalid or has expired.")
          } else if (error === "expired_invitation") {
            setMessage("This invitation has expired.")
          } else if (error === "email_mismatch") {
            setMessage("This invitation was sent to a different email address.")
          } else {
            setMessage("Failed to accept invitation. Please try again.")
          }
        }
      }
    } catch (error) {
      console.error("Error accepting invitation:", error)
      setStatus("error")
      setMessage("Failed to accept invitation. Please try again.")
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-black border border-gray-200 dark:border-white rounded-xl shadow-lg p-8 text-center">
        {status === "loading" && (
          <>
            <Loader2 className="w-16 h-16 text-gray-600 dark:text-white mx-auto mb-4 animate-spin" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Processing Invitation
            </h2>
            <p className="text-gray-600 dark:text-white">
              Please wait while we add you to the pod...
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} className="text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Invitation Accepted!
            </h2>
            <p className="text-gray-600 dark:text-white mb-6">
              {message}
            </p>
            <Button
              onClick={() => router.push("/dashboard")}
              className="w-full bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-white"
            >
              Go to Dashboard
            </Button>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle size={32} className="text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Unable to Accept
            </h2>
            <p className="text-gray-600 dark:text-white mb-6">
              {message}
            </p>
            <Button
              onClick={() => router.push("/dashboard")}
              className="w-full bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-white"
            >
              Go to Dashboard
            </Button>
          </>
        )}
      </div>
    </div>
  )
}

export default function InvitationAcceptPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-black border border-gray-200 dark:border-white rounded-xl shadow-lg p-8 text-center">
            <Loader2 className="w-16 h-16 text-gray-600 dark:text-white mx-auto mb-4 animate-spin" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Loading...
            </h2>
          </div>
        </div>
      }
    >
      <InvitationAcceptContent />
    </Suspense>
  )
}
