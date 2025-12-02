"use client"

import { Bell, User, Shield, CreditCard, Palette, Globe, Moon, Sun, Lock } from "lucide-react"
import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import Image from "next/image"

export default function SettingsPage({ user: userProp = null, onUserUpdate = null }) {
  const [user, setUser] = useState(null)
  const [name, setName] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState("")
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (userProp) {
      setUser(userProp)
      setName(userProp.name || "")
      setIsLoading(false)
    } else {
      fetchUserData()
    }
  }, [userProp])

  const fetchUserData = async () => {
    try {
      const response = await fetch("/api/user")
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setName(data.user.name || "")
      }
    } catch (error) {
      console.error("Error fetching user data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveName = async () => {
    if (!name.trim()) {
      setSaveMessage("Name cannot be empty")
      return
    }

    setIsSaving(true)
    setSaveMessage("")

    try {
      const response = await fetch("/api/user", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: name.trim() }),
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setSaveMessage("Name updated successfully!")
        setTimeout(() => setSaveMessage(""), 3000)
        if (onUserUpdate) {
          onUserUpdate()
        }
      } else {
        const error = await response.json()
        setSaveMessage(error.error || "Failed to update name")
      }
    } catch (error) {
      console.error("Error updating name:", error)
      setSaveMessage("Failed to update name")
    } finally {
      setIsSaving(false)
    }
  }

  if (!mounted || isLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-black">
        <div className="bg-white dark:bg-black border-b border-gray-200 dark:border-white px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500 dark:text-white">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-black">
      {/* Header */}
      <div className="bg-white dark:bg-black border-b border-gray-200 dark:border-white px-8 py-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-sm text-gray-500 dark:text-white mt-1">Manage your account settings and preferences</p>
      </div>

      {/* Settings Content */}
      <div className="flex-1 overflow-auto bg-gray-50 dark:bg-black">
        <div className="max-w-4xl mx-auto p-8">
          <div className="space-y-6">
            {/* Profile Settings */}
            <div className="bg-white dark:bg-black rounded-lg shadow-sm border border-gray-200 dark:border-white p-6">
              <div className="flex items-center gap-3 mb-4">
                <User size={20} className="text-gray-600 dark:text-white" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Profile</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">Display Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-black text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">Email</label>
                  <input
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 dark:border-white rounded-lg bg-gray-100 dark:bg-white text-gray-500 dark:text-black cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 dark:text-white mt-1">Email cannot be changed</p>
                </div>
                {saveMessage && (
                  <div className={`text-sm ${saveMessage.includes("success") ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                    {saveMessage}
                  </div>
                )}
                <button
                  onClick={handleSaveName}
                  disabled={isSaving || name === user?.name}
                  className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-white transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>

            {/* Preferences */}
            <div className="bg-white dark:bg-black rounded-lg shadow-sm border border-gray-200 dark:border-white p-6">
              <div className="flex items-center gap-3 mb-4">
                <Palette size={20} className="text-gray-600 dark:text-white" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Preferences</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">Language</label>
                  <select
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 dark:border-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 dark:bg-white text-gray-500 dark:text-black cursor-not-allowed"
                  >
                    <option>English</option>
                  </select>
                  <p className="text-xs text-gray-500 dark:text-white mt-1">Only English is available</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">Theme</label>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setTheme("light")}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition ${
                        theme === "light"
                          ? "bg-gray-900 dark:bg-white text-white dark:text-black border-gray-900 dark:border-white"
                          : "bg-white dark:bg-black text-gray-700 dark:text-white border-gray-300 dark:border-white hover:bg-gray-50 dark:hover:bg-white"
                      }`}
                    >
                      <Sun size={18} />
                      <span>Light</span>
                    </button>
                    <button
                      onClick={() => setTheme("dark")}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition ${
                        theme === "dark"
                          ? "bg-gray-900 dark:bg-white text-white dark:text-black border-gray-900 dark:border-white"
                          : "bg-white dark:bg-black text-gray-700 dark:text-white border-gray-300 dark:border-white hover:bg-gray-50 dark:hover:bg-white"
                      }`}
                    >
                      <Moon size={18} />
                      <span>Dark</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Notifications - Unavailable */}
            <div className="bg-white dark:bg-black rounded-lg shadow-sm border border-gray-200 dark:border-white p-6 opacity-60">
              <div className="flex items-center gap-3 mb-4">
                <Bell size={20} className="text-gray-600 dark:text-white" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h2>
                <span className="px-2 py-1 text-xs bg-gray-200 dark:bg-white text-gray-600 dark:text-black rounded">
                  Coming Soon
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-white">Notification settings will be available in a future update.</p>
            </div>

            {/* Security - Unavailable */}
            <div className="bg-white dark:bg-black rounded-lg shadow-sm border border-gray-200 dark:border-white p-6 opacity-60">
              <div className="flex items-center gap-3 mb-4">
                <Shield size={20} className="text-gray-600 dark:text-white" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Security</h2>
                <span className="px-2 py-1 text-xs bg-gray-200 dark:bg-white text-gray-600 dark:text-black rounded">
                  Coming Soon
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-white">Security settings will be available in a future update.</p>
            </div>

            {/* Billing - Unavailable */}
            <div className="bg-white dark:bg-black rounded-lg shadow-sm border border-gray-200 dark:border-white p-6 opacity-60">
              <div className="flex items-center gap-3 mb-4">
                <CreditCard size={20} className="text-gray-600 dark:text-white" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Billing</h2>
                <span className="px-2 py-1 text-xs bg-gray-200 dark:bg-white text-gray-600 dark:text-black rounded">
                  Coming Soon
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-white">Billing settings will be available in a future update.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

