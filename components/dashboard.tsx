"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import Sidebar from "./sidebar"
import MainContent from "./main-content-refactored"
import ExplorePage from "./explore-page"
import CreatePodModal from "./create-pod-modal"
import PersonalAssistantPage from "./personal-assistant-page"
import SettingsPage from "./settings-page"
import MarketplacePage from "./marketplace-page"

export default function Dashboard() {
  const [activeView, setActiveView] = useState("dashboard") // "dashboard", "canvas", "explore", "create-pod", "personal-assistant", "settings", "marketplace"
  const [activePod, setActivePod] = useState(null)
  const [showCreatePodModal, setShowCreatePodModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState(null)
  const [pods, setPods] = useState([])
  // Mobile-only: hamburger menu toggle state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Fetch user data and pods on mount
  useEffect(() => {
    fetchUserData()
    fetchPods()
  }, [])

  const fetchUserData = async () => {
    try {
      const response = await fetch("/api/user")
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      }
    } catch (error) {
      console.error("Error fetching user data:", error)
    }
  }

  const fetchPods = async () => {
    try {
      const response = await fetch("/api/pods")
      if (response.ok) {
        const data = await response.json()
        setPods(data.pods || [])
      }
    } catch (error) {
      console.error("Error fetching pods:", error)
    }
  }

  const [isNavigating, setIsNavigating] = useState(false)

  const handlePodClick = (pod: any) => {
    if (isNavigating || isLoading) return // Prevent multiple clicks
    
    setIsNavigating(true)
    setActivePod(pod)
    setActiveView("canvas")
    setIsLoading(true)
    
    // Clear loading state quickly - blocks will load and show their own loading state
    // This makes navigation feel instant
    setTimeout(() => {
      setIsLoading(false)
      setIsNavigating(false)
    }, 50)
  }

  const handleBackToDashboard = () => {
    setActiveView("dashboard")
    setActivePod(null)
  }

  const handleNavigate = (view: string, podName: any = null) => {
    if (view === "create-pod") {
      setShowCreatePodModal(true)
    } else if (view === "pod" && podName) {
      handlePodClick(podName)
    } else {
      setActiveView(view)
    }
    // Mobile-only: close menu after navigating
    setMobileMenuOpen(false)
  }

  const handleCreatePod = async (podData: any) => {
    try {
      const response = await fetch("/api/pods", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: podData.name,
          tagline: podData.tagline,
          logoUrl: podData.logoUrl,
        }),
      })

      if (response.ok) {
        // Refresh pods list
        await fetchPods()
        setShowCreatePodModal(false)
      } else {
        const error = await response.json()
        alert(error.error || "Failed to create pod")
      }
    } catch (error) {
      console.error("Error creating pod:", error)
      alert("Failed to create pod")
    }
  }

  const shouldShowSidebar = !["explore", "canvas"].includes(activeView)

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-black relative">
      {/* Desktop sidebar remains unchanged; hidden on < md */}
      {shouldShowSidebar && (
        <div className="hidden md:block">
          <Sidebar
            activeView={activeView}
            onNavigate={handleNavigate}
            pods={pods}
            user={user}
          />
        </div>
      )}

      {/* Mobile menu is opened from the top navbar (in `MainContent`). */}

      {/* Mobile slide-over menu using existing Sidebar content */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="md:hidden fixed inset-0 z-40 bg-black/50"
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* Panel */}
          <div className="md:hidden fixed inset-y-0 left-0 z-50 w-64 max-w-[80%] bg-white dark:bg-black shadow-xl transform transition-transform">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-white/20">
              <span className="text-sm font-semibold text-gray-800 dark:text-white">Menu</span>
              <button
                aria-label="Close navigation menu"
                className="inline-flex items-center justify-center w-8 h-8 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X size={18} className="text-gray-800 dark:text-white" />
              </button>
            </div>
            {/* Reuse Sidebar for consistency; closes on link click */}
            <div className="h-[calc(100vh-52px)] overflow-y-auto">
              <Sidebar
                activeView={activeView}
                onNavigate={handleNavigate}
                pods={pods}
                user={user}
              />
            </div>
          </div>
        </>
      )}
      {activeView === "dashboard" && (
        <MainContent
          activeView={activeView}
          activePod={activePod}
          onPodClick={handlePodClick}
          onBackToDashboard={handleBackToDashboard}
          onNavigate={handleNavigate}
          pods={pods}
          user={user}
          onPodsUpdate={fetchPods}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
        />
      )}
      {activeView === "explore" && (
        <ExplorePage onBack={() => handleNavigate("dashboard")} />
      )}
      {activeView === "personal-assistant" && <PersonalAssistantPage />}
      {activeView === "settings" && (
        <SettingsPage user={user} onUserUpdate={fetchUserData} />
      )}
      {activeView === "marketplace" && <MarketplacePage />}
      {activeView === "canvas" && (
        <MainContent
          activeView={activeView}
          activePod={activePod}
          onPodClick={handlePodClick}
          onBackToDashboard={handleBackToDashboard}
          onNavigate={handleNavigate}
          isLoading={isLoading}
          pods={pods}
          user={user}
          onPodsUpdate={fetchPods}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
        />
      )}
      <CreatePodModal
        open={showCreatePodModal}
        onClose={() => setShowCreatePodModal(false)}
        onCreate={handleCreatePod}
      />
    </div>
  )
}
