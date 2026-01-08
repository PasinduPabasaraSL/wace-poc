"use client"

import { Bell, ChevronDown, Plus, MessageCircle, File, Video, Calendar, Target, ArrowLeft, Trash2, ZoomIn, ZoomOut, Maximize2, LogOut, Menu } from "lucide-react"
import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Spinner } from "@/components/ui/spinner"
import { ThemeToggle } from "@/components/theme-toggle"
import { useRouter } from "next/navigation"
import DeleteBlockModal from "@/components/delete-block-modal"

// Import extracted components
import PodCard from "./main-content/pod-card"
import NavButton from "./main-content/nav-button"
import { useWelcomeMessage } from "./main-content/hooks"
import {
  CreateChatModal,
  CreateDocModal,
  CreateCalendarModal,
  CreateGoalModal,
} from "./main-content/create-modals"
import { ChatModal } from "./main-content/chat-modal"
import { DocModal } from "./main-content/doc-modal"
import { CalendarModal } from "./main-content/calendar-modal"
import { GoalModal } from "./main-content/goal-modal"
import { MeetingModal, FeatureUnderDevModal } from "./main-content/meeting-modal"

import type { Pod, User, Blocks, Notification } from "./main-content/types"

interface MainContentProps {
  activeView: string
  activePod: Pod | null
  onPodClick: (pod: Pod) => void
  onBackToDashboard: () => void
  onNavigate: (view: string, pod?: Pod) => void
  // Mobile: function to open the mobile sidebar menu
  onOpenMobileMenu?: () => void
  isLoading?: boolean
  pods?: Pod[]
  user?: User | null
  onPodsUpdate?: () => void
}

/**
 * MainContent Component
 * 
 * This is the main entry point that orchestrates between:
 * - Dashboard view (pod grid)
 * - Canvas view (pod workspace)
 * 
 * Client component because:
 * - Manages complex state for notifications, views
 * - Has user interactions and event handlers
 * - Coordinates between multiple child components
 */
export default function MainContent({
  activeView,
  activePod,
  onPodClick,
  onBackToDashboard,
  onNavigate,
  onOpenMobileMenu,
  isLoading = false,
  pods = [],
  user = null,
  onPodsUpdate,
}: MainContentProps) {
  const router = useRouter()

  const handleLogout = async () => {
    await fetch("/api/auth/signout", { method: "POST" })
    router.push("/login")
    router.refresh()
  }

  // Render canvas view when selected
  if (activeView === "canvas") {
    return (
      <PodCanvas
        podName={activePod?.name || (activePod as any)}
        pod={activePod}
        onBack={onBackToDashboard}
        isLoading={isLoading}
        user={user}
        onOpenMobileMenu={onOpenMobileMenu}
      />
    )
  }

  // Dashboard view
  return (
    <DashboardView
      pods={pods}
      user={user}
      onPodClick={onPodClick}
      onNavigate={onNavigate}
      onPodsUpdate={onPodsUpdate}
      handleLogout={handleLogout}
      onOpenMobileMenu={onOpenMobileMenu}
    />
  )
}

interface DashboardViewProps {
  pods: Pod[]
  user: User | null
  onPodClick: (pod: Pod) => void
  onNavigate: (view: string, pod?: Pod) => void
  onPodsUpdate?: () => void
  handleLogout: () => void
  onOpenMobileMenu?: () => void
}

/**
 * DashboardView Component
 * 
 * Client component for the main dashboard with pod grid
 * Handles notifications and welcome message with proper hydration
 */
function DashboardView({
  pods,
  user,
  onPodClick,
  onNavigate,
  onPodsUpdate,
  handleLogout,
  onOpenMobileMenu,
}: DashboardViewProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [notificationsLoading, setNotificationsLoading] = useState(true)
  const isMountedRef = useRef(true)
  
  // Use client-side hook for welcome message (avoids hydration mismatch)
  const welcomeMessage = useWelcomeMessage(user?.name)

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await fetch("/api/notifications/unread")
      if (response.ok && isMountedRef.current) {
        const data = await response.json()
        const formattedNotifications = data.notifications.map((notif: any) => ({
          id: notif.blockId,
          title: `New messages in ${notif.podName}`,
          message: `${notif.unreadCount} unread message${notif.unreadCount > 1 ? "s" : ""} in ${notif.blockName}`,
          time: "Just now",
          unread: true,
          blockId: notif.blockId,
          podId: notif.podId,
        }))
        setNotifications(formattedNotifications)
      }
    } catch (error) {
      console.error("Error fetching notifications:", error)
    } finally {
      if (isMountedRef.current) {
        setNotificationsLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    isMountedRef.current = true
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return () => {
      isMountedRef.current = false
      clearInterval(interval)
    }
  }, [fetchNotifications])

  const unreadCount = notifications.filter((n) => n.unread).length

  const markNotificationRead = useCallback(async (notification: Notification) => {
    try {
      await fetch(`/api/blocks/${notification.blockId}/unread`, { method: "POST" })
      setNotifications((prev) => prev.filter((n) => n.id !== notification.id))
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }, [])

  const markAllNotificationsRead = useCallback(async () => {
    // Parallel requests instead of sequential
    const promises = notifications.map((notification) =>
      fetch(`/api/blocks/${notification.blockId}/unread`, { method: "POST" }).catch((error) =>
        console.error("Error marking notification as read:", error)
      )
    )
    await Promise.all(promises)
    setNotifications([])
  }, [notifications])

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-black">
      {/* Top Navigation */}
      {/* Mobile-specific: tighten padding on small screens to prevent overflow */}
      {/* Mobile-first: reduced left padding and mobile hamburger placed here */}
      <div className="bg-white dark:bg-black border-b border-gray-200 dark:border-white/20 pl-3 md:pl-14 pr-4 md:px-8 py-4 md:py-6 flex items-center justify-between shadow-sm">
        {/* Mobile hamburger - visible only on small screens */}
        <button
          aria-label="Open navigation menu"
          className="md:hidden inline-flex items-center justify-center w-10 h-10 mr-2 rounded-lg bg-white dark:bg-black border border-gray-200 dark:border-white/20 shadow pointer-events-auto"
          onClick={() => onOpenMobileMenu?.()}
        >
          <Menu size={18} className="text-gray-800 dark:text-white" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        {/* Desktop actions: hidden on mobile */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          <Popover>
            <PopoverTrigger asChild>
              <button
                className="relative p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200 group"
                suppressHydrationWarning
              >
                <Bell size={20} className="text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 dark:bg-red-400 rounded-full ring-2 ring-white dark:ring-black animate-pulse"></span>
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent
              className="w-80 p-0 bg-white dark:bg-black border-gray-200 dark:border-white/20 shadow-xl"
              align="end"
            >
              <div className="p-4 border-b border-gray-200 dark:border-white/20">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="text-xs font-medium text-black dark:text-white bg-gray-100 dark:bg-white px-2 py-1 rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notificationsLoading ? (
                  <div className="p-8 text-center">
                    <Spinner className="w-5 h-5 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500 dark:text-white">Loading notifications...</p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <Bell size={32} className="mx-auto text-gray-300 dark:text-white mb-2" />
                    <p className="text-sm text-gray-500 dark:text-white">No notifications</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200 dark:divide-gray-800">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        onClick={() => markNotificationRead(notification)}
                        className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all cursor-pointer ${
                          notification.unread ? "bg-gray-100/50 dark:bg-gray-900" : ""
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {notification.unread && (
                            <div className="w-2 h-2 bg-black dark:bg-white rounded-full mt-2 flex-shrink-0"></div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {notification.title}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-white mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 dark:text-white mt-1">
                              {notification.time}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {notifications.length > 0 && (
                <div className="p-3 border-t border-gray-200 dark:border-white/20 bg-gray-50 dark:bg-white">
                  <button
                    onClick={markAllNotificationsRead}
                    className="w-full text-sm text-black dark:text-white hover:text-gray-700 dark:hover:text-white font-medium transition-colors"
                  >
                    Mark all as read
                  </button>
                </div>
              )}
            </PopoverContent>
          </Popover>
          <button
            onClick={() => onNavigate("marketplace")}
            className="px-4 py-2 text-sm font-medium text-white dark:text-black bg-gray-900 dark:bg-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-all shadow-sm hover:shadow"
          >
            Upgrade
          </button>
          <button
            onClick={() => onNavigate("settings")}
            className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all p-1.5 group"
          >
            {user?.profilePicture ? (
              <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-gray-200 dark:ring-white/20">
                <img
                  src={user.profilePicture}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 rounded-full flex items-center justify-center text-gray-700 dark:text-gray-200 font-semibold ring-2 ring-gray-200 dark:ring-white/20">
                {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
            )}
            <ChevronDown size={16} className="text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors" />
          </button>
          {/* Mobile-specific: hide label on very small screens to avoid overflow */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 md:px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 rounded-lg transition-all group"
            title="Log out"
          >
            <LogOut size={16} className="group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors" />
            <span className="hidden sm:inline">Log out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-gray-50 dark:bg-black">
        {/* Mobile-specific: reduce padding to avoid horizontal pressure */}
        <div className="p-4 md:p-8">
          {/* Welcome Text */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{welcomeMessage}</h2>
            <p className="text-gray-600 dark:text-white">
              {pods.length === 0
                ? "Create your first pod and start collaborating with your team!"
                : `You have ${pods.length} ${pods.length === 1 ? "pod" : "pods"} ready to go. Let's make things happen!`}
            </p>
          </div>

          {/* Pod Cards Grid */}
          {pods.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="text-center max-w-md">
                <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Plus size={48} className="text-gray-400 dark:text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  You don't have any pods yet
                </h3>
                <p className="text-gray-500 dark:text-white mb-8">
                  Create your first pod to start collaborating with your team!
                </p>
                <button
                  onClick={() => onNavigate("create-pod")}
                  className="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-all shadow-sm hover:shadow-md font-medium"
                >
                  Create Your First Pod
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pods.map((pod) => (
                <PodCard
                  key={pod.id}
                  pod={pod}
                  image={pod.logoUrl || "/placeholder.svg"}
                  name={pod.name}
                  tagline={pod.tagline || ""}
                  onClick={() => onPodClick(pod)}
                  onDelete={onPodsUpdate || (() => {})}
                  user={user}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

interface PodCanvasProps {
  podName?: string
  pod?: Pod | null
  onBack: () => void
  isLoading: boolean
  user?: User | null
  onOpenMobileMenu?: () => void
}

/**
 * PodCanvas Component
 * 
 * The workspace canvas for a pod with blocks (chat, docs, calendar, goals, meetings)
 * 
 * Client component because:
 * - Heavy state management for canvas panning, zooming, drag and drop
 * - Event handlers for mouse/touch interactions
 * - Fetches and manages block data
 */
function PodCanvas({ podName, pod, onBack, isLoading, user }: PodCanvasProps) {
  const podData = pod || { name: podName, tagline: "", id: null, logoUrl: undefined }

  const [activeSection, setActiveSection] = useState("chat")
  const [blocks, setBlocks] = useState<Blocks>({
    chat: [],
    docs: [],
    meetings: [],
    calendar: [],
    goals: [],
  })
  const [blocksLoading, setBlocksLoading] = useState(true)
  const [showCreateChatModal, setShowCreateChatModal] = useState(false)
  const [showCreateDocModal, setShowCreateDocModal] = useState(false)
  const [showCreateCalendarModal, setShowCreateCalendarModal] = useState(false)
  const [showCreateGoalModal, setShowCreateGoalModal] = useState(false)
  const [showMeetingDevModal, setShowMeetingDevModal] = useState(false)
  const [showDeleteBlockModal, setShowDeleteBlockModal] = useState(false)
  const [blockToDelete, setBlockToDelete] = useState<any>(null)
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({})

  const [selectedBox, setSelectedBox] = useState<string | null>(null)
  const [openingBox, setOpeningBox] = useState<string | null>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dragStart, setDragStart] = useState({ mouseX: 0, mouseY: 0, blockX: 0, blockY: 0 })
  const [pendingDrag, setPendingDrag] = useState<{
    boxId: string | null
    initialPos: { x: number; y: number } | null
    delay: NodeJS.Timeout | null
  }>({ boxId: null, initialPos: null, delay: null })

  // Canvas panning and zoom state
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [isSpacePressed, setIsSpacePressed] = useState(false)
  const canvasRef = useRef<HTMLDivElement>(null)

  // Touch pinch-to-zoom state
  const [touchStartDistance, setTouchStartDistance] = useState<number | null>(null)
  const [touchStartZoom, setTouchStartZoom] = useState<number | null>(null)
  const [touchStartOffset, setTouchStartOffset] = useState<{ x: number; y: number } | null>(null)
  const [touchCenter, setTouchCenter] = useState<{ x: number; y: number } | null>(null)

  // Grid background calculations
  const gridSize = 40 * zoom
  const gridOffsetX = ((canvasOffset.x % gridSize) + gridSize) % gridSize
  const gridOffsetY = ((canvasOffset.y % gridSize) + gridSize) % gridSize

  // Fetch blocks on mount
  useEffect(() => {
    if (podData?.id) {
      fetchBlocks()
    } else {
      setBlocksLoading(false)
    }
  }, [podData?.id])

  // Fetch unread counts when blocks load
  useEffect(() => {
    if (blocks.chat && blocks.chat.length > 0) {
      fetchUnreadCounts()
      const interval = setInterval(fetchUnreadCounts, 30000)
      return () => clearInterval(interval)
    }
  }, [blocks.chat])

  // Spacebar for panning
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !e.repeat) {
        e.preventDefault()
        setIsSpacePressed(true)
        if (canvasRef.current) {
          canvasRef.current.style.cursor = "grab"
        }
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        setIsSpacePressed(false)
        if (canvasRef.current && !isPanning) {
          canvasRef.current.style.cursor = "default"
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [isPanning])

  const fetchBlocks = async () => {
    try {
      setBlocksLoading(true)
      const response = await fetch(`/api/blocks?podId=${podData.id}`, {
        cache: "no-store",
      })
      if (response.ok) {
        const data = await response.json()
        const organizedBlocks: Blocks = {
          chat: [],
          docs: [],
          meetings: [],
          calendar: [],
          goals: [],
        }
        data.blocks.forEach((block: any) => {
          if (organizedBlocks[block.type as keyof Blocks]) {
            organizedBlocks[block.type as keyof Blocks].push({
              ...block,
              id: block._id || block.id,
            })
          }
        })
        setBlocks(organizedBlocks)
      }
    } catch (error) {
      console.error("Error fetching blocks:", error)
    } finally {
      setBlocksLoading(false)
    }
  }

  const fetchUnreadCounts = async () => {
    try {
      const chatBlocks = blocks.chat || []
      if (chatBlocks.length === 0) return

      const counts: Record<string, number> = {}

      const promises = chatBlocks.map(async (block) => {
        try {
          const response = await fetch(`/api/blocks/${block.id}/unread`)
          if (response.ok) {
            const data = await response.json()
            return { blockId: block.id, count: data.unreadCount || 0 }
          }
        } catch (error) {
          console.error(`Error fetching unread count for block ${block.id}:`, error)
        }
        return { blockId: block.id, count: 0 }
      })

      const results = await Promise.all(promises)
      results.forEach(({ blockId, count }) => {
        counts[blockId] = count
      })

      setUnreadCounts(counts)
    } catch (error) {
      console.error("Error fetching unread counts:", error)
    }
  }

  // Memoize current blocks to prevent recalculation on every render
  const currentBlocks = useMemo(
    () => blocks[activeSection as keyof Blocks] || [],
    [blocks, activeSection]
  )

  const handleDoubleClick = async (e: any, boxId: string) => {
    e.stopPropagation()
    e.preventDefault()

    if (openingBox || selectedBox === boxId) return

    setOpeningBox(boxId)

    if (pendingDrag.delay) {
      clearTimeout(pendingDrag.delay)
      setPendingDrag({ boxId: null, initialPos: null, delay: null })
    }

    setDraggingId(null)

    const box = currentBlocks.find((b) => b.id === boxId)
    if (!box) {
      setOpeningBox(null)
      return
    }

    const isCreator = user && box.creatorId === user.id

    if (isCreator) {
      setSelectedBox(boxId)
      setOpeningBox(null)
      return
    }

    if (box.type === "chat" || box.type === "docs" || box.type === "calendar" || box.type === "goals") {
      setSelectedBox(boxId)
      setOpeningBox(null)

      fetch(`/api/blocks/${boxId}/members`)
        .then((response) => {
          if (response.ok) return response.json()
          throw new Error("Access check failed")
        })
        .then((data) => {
          const hasAccess = data.members.some((m: any) => m.id === user?.id)
          if (!hasAccess) {
            setSelectedBox(null)
            alert("You don't have access to this block. Ask the creator to add you.")
          }
        })
        .catch((error) => {
          console.error("Error checking block access:", error)
        })
    } else {
      setSelectedBox(boxId)
      setOpeningBox(null)
    }
  }

  const handleMouseDown = (e: any, boxId: string) => {
    e.stopPropagation()
    const box = currentBlocks.find((b) => b.id === boxId)
    if (!box) return

    const initialMouseX = e.clientX
    const initialMouseY = e.clientY

    setPendingDrag({
      boxId,
      initialPos: { x: initialMouseX, y: initialMouseY },
      delay: null,
    })
  }

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    const isBlock = target.closest("[data-block-id]")
    const isMiddleClick = e.button === 1
    const canPan = isSpacePressed || e.shiftKey || e.ctrlKey || e.metaKey || isMiddleClick

    if (
      (target === e.currentTarget ||
        target.classList.contains("canvas-background") ||
        target.classList.contains("canvas-grid") ||
        canPan) &&
      !isBlock
    ) {
      setIsPanning(true)
      setPanStart({
        x: e.clientX - canvasOffset.x,
        y: e.clientY - canvasOffset.y,
      })
      e.preventDefault()
      e.stopPropagation()
    }
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const isPinch = e.ctrlKey || e.metaKey
    let delta: number
    if (isPinch) {
      delta = e.deltaY * -0.01
    } else {
      delta = e.deltaY * -0.001
    }

    const newZoom = Math.min(Math.max(0.25, zoom + delta), 3)

    const rect = canvasRef.current?.getBoundingClientRect()
    if (rect) {
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top

      const zoomPointX = (mouseX - canvasOffset.x) / zoom
      const zoomPointY = (mouseY - canvasOffset.y) / zoom

      setCanvasOffset({
        x: mouseX - zoomPointX * newZoom,
        y: mouseY - zoomPointY * newZoom,
      })
    }

    setZoom(newZoom)
  }

  const handleZoomIn = () => setZoom(Math.min(zoom + 0.25, 3))
  const handleZoomOut = () => setZoom(Math.max(zoom - 0.25, 0.25))
  const handleResetZoom = () => {
    setZoom(1)
    setCanvasOffset({ x: 0, y: 0 })
  }

  const getTouchDistance = (touch1: React.Touch, touch2: React.Touch): number => {
    const dx = touch2.clientX - touch1.clientX
    const dy = touch2.clientY - touch1.clientY
    return Math.sqrt(dx * dx + dy * dy)
  }

  const getTouchCenter = (touch1: React.Touch, touch2: React.Touch): { x: number; y: number } => {
    return {
      x: (touch1.clientX + touch2.clientX) / 2,
      y: (touch1.clientY + touch2.clientY) / 2,
    }
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault()
      const distance = getTouchDistance(e.touches[0], e.touches[1])
      const center = getTouchCenter(e.touches[0], e.touches[1])
      const rect = canvasRef.current?.getBoundingClientRect()

      if (rect) {
        setTouchStartDistance(distance)
        setTouchStartZoom(zoom)
        setTouchStartOffset({ ...canvasOffset })
        setTouchCenter({
          x: center.x - rect.left,
          y: center.y - rect.top,
        })
      }
    } else if (e.touches.length === 1 && !isPanning) {
      const touch = e.touches[0]
      const target = e.target as HTMLElement
      const isBlock = target.closest("[data-block-id]")

      if (
        !isBlock &&
        (target === e.currentTarget ||
          target.classList.contains("canvas-background") ||
          target.classList.contains("canvas-grid"))
      ) {
        setIsPanning(true)
        setPanStart({
          x: touch.clientX - canvasOffset.x,
          y: touch.clientY - canvasOffset.y,
        })
      }
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (
      e.touches.length === 2 &&
      touchStartDistance !== null &&
      touchStartZoom !== null &&
      touchStartOffset !== null &&
      touchCenter !== null
    ) {
      e.preventDefault()
      const distance = getTouchDistance(e.touches[0], e.touches[1])
      const scale = distance / touchStartDistance
      const newZoom = Math.min(Math.max(0.25, touchStartZoom * scale), 3)

      const rect = canvasRef.current?.getBoundingClientRect()
      if (rect) {
        const zoomPointX = (touchCenter.x - touchStartOffset.x) / touchStartZoom
        const zoomPointY = (touchCenter.y - touchStartOffset.y) / touchStartZoom

        setCanvasOffset({
          x: touchCenter.x - zoomPointX * newZoom,
          y: touchCenter.y - zoomPointY * newZoom,
        })
      }

      setZoom(newZoom)
    } else if (e.touches.length === 1 && isPanning) {
      e.preventDefault()
      const touch = e.touches[0]
      setCanvasOffset({
        x: touch.clientX - panStart.x,
        y: touch.clientY - panStart.y,
      })
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length < 2) {
      setTouchStartDistance(null)
      setTouchStartZoom(null)
      setTouchStartOffset(null)
      setTouchCenter(null)
    }
    if (e.touches.length === 0) {
      setIsPanning(false)
    }
  }

  const handleMouseMove = (e: any) => {
    if (pendingDrag.boxId && pendingDrag.initialPos && !draggingId && !isPanning) {
      const mouseMoved =
        Math.abs(e.clientX - pendingDrag.initialPos.x) > 5 ||
        Math.abs(e.clientY - pendingDrag.initialPos.y) > 5
      if (mouseMoved) {
        const box = currentBlocks.find((b) => b.id === pendingDrag.boxId)
        if (box) {
          setDraggingId(pendingDrag.boxId)
          setDragStart({
            mouseX: e.clientX,
            mouseY: e.clientY,
            blockX: box.x,
            blockY: box.y,
          })
          setPendingDrag({ boxId: null, initialPos: null, delay: null })
        }
      }
    }

    if (isPanning) {
      setCanvasOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      })
      e.preventDefault()
    } else if (draggingId !== null) {
      const deltaX = (e.clientX - dragStart.mouseX) / zoom
      const deltaY = (e.clientY - dragStart.mouseY) / zoom

      setBlocks((prev) => ({
        ...prev,
        [activeSection]: prev[activeSection as keyof Blocks].map((box) =>
          box.id === draggingId
            ? {
                ...box,
                x: dragStart.blockX + deltaX,
                y: dragStart.blockY + deltaY,
              }
            : box
        ),
      }))
    }
  }

  const handleMouseUp = () => {
    if (pendingDrag.boxId && !draggingId) {
      setPendingDrag({ boxId: null, initialPos: null, delay: null })
    }
    setDraggingId(null)
    setIsPanning(false)
  }

  return (
    <div
      className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-black relative"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Top Header */}
      {/* Mobile-first: reduced left padding and mobile hamburger placed here */}
      <div className="absolute top-0 left-0 right-0 z-10 pl-3 md:pl-14 pr-4 md:px-8 py-3 md:py-4 flex items-center justify-between pointer-events-none">
        {/* Left: Pod Info */}
        <div className="flex items-center gap-4 pointer-events-auto">
          {/* Mobile hamburger - visible only on small screens */}
          <button
            aria-label="Open navigation menu"
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg bg-white dark:bg-black border border-gray-200 dark:border-white/20 shadow mr-2 pointer-events-auto"
            onClick={() => onOpenMobileMenu?.()}
          >
            <Menu size={18} className="text-gray-800 dark:text-white" />
          </button>
          <button
            onClick={onBack}
            className="p-1.5 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition group"
            title="Back to Dashboard"
          >
            <ArrowLeft size={18} className="group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors" />
          </button>
          <div className="flex items-center gap-3">
            {podData.logoUrl ? (
              <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-200 dark:bg-white">
                <img src={podData.logoUrl} alt={podData.name} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-white flex items-center justify-center">
                <span className="text-gray-700 dark:text-black font-bold text-sm">
                  {podData.name ? podData.name.charAt(0).toUpperCase() : "P"}
                </span>
              </div>
            )}
            <div>
              <h2 className="font-bold text-gray-900 dark:text-white text-sm uppercase tracking-wide">
                {podData.name}
              </h2>
              <p className="text-xs text-gray-500 dark:text-white">
                {podData.tagline || "Build. Connect. Dominate"}
              </p>
            </div>
          </div>
        </div>

        {/* Middle: Floating Nav Bar */}
        {/* Mobile-specific: allow horizontal scroll to avoid page overflow */}
        <div className="absolute left-1/2 transform -translate-x-1/2 pointer-events-auto max-w-[90vw] md:max-w-none overflow-x-auto">
          <div className="bg-white dark:bg-white rounded-lg px-3 py-2 flex items-center gap-3 shadow-sm whitespace-nowrap">
            <NavButton
              icon={<MessageCircle size={18} />}
              title="Chat"
              active={activeSection === "chat"}
              onClick={() => {
                setActiveSection("chat")
                setSelectedBox(null)
              }}
            />
            <NavButton
              icon={<File size={18} />}
              title="Docs"
              active={activeSection === "docs"}
              onClick={() => {
                setActiveSection("docs")
                setSelectedBox(null)
              }}
            />
            <NavButton
              icon={<Video size={18} />}
              title="Meetings"
              active={activeSection === "meetings"}
              onClick={() => {
                setActiveSection("meetings")
                setSelectedBox(null)
              }}
            />
            <NavButton
              icon={<Calendar size={18} />}
              title="Calendar"
              active={activeSection === "calendar"}
              onClick={() => {
                setActiveSection("calendar")
                setSelectedBox(null)
              }}
            />
            <NavButton
              icon={<Target size={18} />}
              title="Goals"
              active={activeSection === "goals"}
              onClick={() => {
                setActiveSection("goals")
                setSelectedBox(null)
              }}
            />
          </div>
        </div>

        {/* Right: Create Button */}
        <div className="pointer-events-auto">
          <button
            onClick={() => {
              if (activeSection === "chat") setShowCreateChatModal(true)
              else if (activeSection === "docs") setShowCreateDocModal(true)
              else if (activeSection === "calendar") setShowCreateCalendarModal(true)
              else if (activeSection === "goals") setShowCreateGoalModal(true)
              else if (activeSection === "meetings") setShowMeetingDevModal(true)
            }}
            className="flex items-center gap-2 px-3 md:px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-black text-sm rounded-lg hover:bg-gray-800 dark:hover:bg-white transition"
          >
            <Plus size={16} />
            <span>
              {activeSection === "chat" && "Create Chat"}
              {activeSection === "docs" && "Create Doc"}
              {activeSection === "meetings" && "Schedule Meeting"}
              {activeSection === "calendar" && "Add Event"}
              {activeSection === "goals" && "Create Goal"}
            </span>
          </button>
        </div>
      </div>

      {isLoading || blocksLoading ? (
        <div className="flex-1 flex items-center justify-center bg-white dark:bg-black">
          <div className="flex flex-col items-center gap-4">
            <Spinner className="w-8 h-8 text-gray-600 dark:text-white" />
            <p className="text-gray-600 dark:text-white font-medium">Loading pod...</p>
          </div>
        </div>
      ) : (
        <div
          ref={canvasRef}
          className="flex-1 bg-white dark:bg-black relative overflow-hidden canvas-background"
          onMouseDown={handleCanvasMouseDown}
          onWheel={handleWheel}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            cursor: isPanning ? "grabbing" : isSpacePressed ? "grab" : draggingId ? "grabbing" : "default",
            touchAction: "none",
            backgroundImage:
              "linear-gradient(0deg, rgba(255, 255, 255, 0.1) 0.5px, transparent 0.5px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 0.5px, transparent 0.5px)",
            backgroundSize: `${gridSize}px ${gridSize}px`,
            backgroundPosition: `${gridOffsetX}px ${gridOffsetY}px`,
            backgroundRepeat: "repeat",
          }}
        >
          {/* Zoom Controls */}
          <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-2 bg-white dark:bg-black border border-gray-200 dark:border-white/20 rounded-lg p-2 shadow-lg">
            <button
              onClick={handleZoomIn}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors group"
              title="Zoom In"
            >
              <ZoomIn size={18} className="text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors group"
              title="Zoom Out"
            >
              <ZoomOut size={18} className="text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors" />
            </button>
            <button
              onClick={handleResetZoom}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors group"
              title="Reset Zoom"
            >
              <Maximize2 size={18} className="text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors" />
            </button>
            <div className="px-2 py-1 text-xs text-center text-gray-600 dark:text-white border-t border-gray-200 dark:border-white/20 mt-1">
              {Math.round(zoom * 100)}%
            </div>
          </div>

          {/* Canvas Container */}
          <div
            className="canvas-grid"
            style={{
              position: "absolute",
              transform: `translate(${canvasOffset.x}px, ${canvasOffset.y}px) scale(${zoom})`,
              transformOrigin: "0 0",
              width: "100%",
              height: "100%",
              // Mobile-specific: avoid 100vw/100vh which can cause horizontal scroll
              minWidth: "100%",
              minHeight: "100%",
            }}
          >
            {/* Blocks */}
            {currentBlocks.map((box) => {
              const isCreator = user && box.creatorId === user.id
              return (
                <div
                  key={box.id}
                  data-block-id={box.id}
                  onMouseDown={(e) => handleMouseDown(e, box.id)}
                  onDoubleClick={(e) => handleDoubleClick(e, box.id)}
                  style={{
                    position: "absolute",
                    left: `${box.x}px`,
                    top: `${box.y}px`,
                    cursor: draggingId === box.id ? "grabbing" : "grab",
                  }}
                  className="select-none z-10 group"
                >
                  <div className="bg-black dark:bg-white rounded-2xl px-6 py-8 w-48 h-24 flex items-center justify-center hover:shadow-xl transition-shadow cursor-pointer relative">
                    <p className="text-white dark:text-black font-semibold text-center text-sm">{box.label}</p>
                    {box.type === "chat" && unreadCounts[box.id] && unreadCounts[box.id] > 0 && (
                      <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5 text-xs font-bold z-20">
                        {unreadCounts[box.id] > 9 ? "9+" : unreadCounts[box.id]}
                      </div>
                    )}
                    {isCreator && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setBlockToDelete(box)
                          setShowDeleteBlockModal(true)
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-red-600"
                        title="Delete Block"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Modals */}
          {selectedBox && activeSection === "chat" && (
            <ChatModal
              boxId={selectedBox}
              chatData={currentBlocks.find((b) => b.id === selectedBox)}
              podId={podData?.id || undefined}
              user={user}
              onClose={() => {
                setSelectedBox(null)
                fetchUnreadCounts()
              }}
              onUnreadUpdate={fetchUnreadCounts}
            />
          )}
          {selectedBox && activeSection === "docs" && (
            <DocModal
              boxId={selectedBox}
              docData={currentBlocks.find((b) => b.id === selectedBox)}
              podId={podData?.id || undefined}
              user={user}
              onClose={() => setSelectedBox(null)}
            />
          )}
          {selectedBox && activeSection === "meetings" && (
            <MeetingModal
              boxId={selectedBox}
              meetingData={currentBlocks.find((b) => b.id === selectedBox)}
              onClose={() => setSelectedBox(null)}
            />
          )}
          {selectedBox && activeSection === "calendar" && (
            <CalendarModal
              boxId={selectedBox}
              calendarData={currentBlocks.find((b) => b.id === selectedBox)}
              podId={podData?.id || undefined}
              user={user}
              onClose={() => setSelectedBox(null)}
            />
          )}
          {selectedBox && activeSection === "goals" && (
            <GoalModal
              boxId={selectedBox}
              goalData={currentBlocks.find((b) => b.id === selectedBox)}
              podId={podData?.id || undefined}
              user={user}
              onClose={() => setSelectedBox(null)}
            />
          )}
        </div>
      )}

      {/* Create Modals */}
      {podData?.id && (
        <>
          <CreateChatModal
            open={showCreateChatModal}
            onClose={() => setShowCreateChatModal(false)}
            podId={podData.id}
            existingBlocks={blocks.chat || []}
            onCreated={fetchBlocks}
          />
          <CreateDocModal
            open={showCreateDocModal}
            onClose={() => setShowCreateDocModal(false)}
            podId={podData.id}
            existingBlocks={blocks.docs || []}
            onCreated={fetchBlocks}
          />
          <CreateCalendarModal
            open={showCreateCalendarModal}
            onClose={() => setShowCreateCalendarModal(false)}
            podId={podData.id}
            existingBlocks={blocks.calendar || []}
            onCreated={fetchBlocks}
          />
          <CreateGoalModal
            open={showCreateGoalModal}
            onClose={() => setShowCreateGoalModal(false)}
            podId={podData.id}
            existingBlocks={blocks.goals || []}
            onCreated={fetchBlocks}
          />
        </>
      )}

      <FeatureUnderDevModal
        open={showMeetingDevModal}
        onClose={() => setShowMeetingDevModal(false)}
        featureName="Meetings"
      />

      {blockToDelete && (
        <DeleteBlockModal
          open={showDeleteBlockModal}
          onClose={() => {
            setShowDeleteBlockModal(false)
            setBlockToDelete(null)
          }}
          block={blockToDelete}
          onDelete={() => {
            fetchBlocks()
            setBlockToDelete(null)
          }}
        />
      )}
    </div>
  )
}
