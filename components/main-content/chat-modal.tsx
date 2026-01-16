"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { MessageCircle, Users, X, Smile, Trash2, Minimize2, Maximize2, Send } from "lucide-react"
import EmojiPicker from "@/components/emoji-picker"
import MentionAutocomplete from "@/components/mention-autocomplete"
import AddMembersToBlockModal from "@/components/add-members-to-block-modal"
import { getAvatarColor, getInitials } from "./utils"
import { useFormattedTimesMap } from "./hooks"
import type { Member, ChatMessage } from "./types"

/**
 * ChatBubble Component - Reusable message bubble with modern styling
 */
function ChatBubble({
  message,
  isOwn,
  showAvatar,
  avatar,
  initials,
  onDelete,
  renderWithMentions,
}: {
  message: ChatMessage
  isOwn: boolean
  showAvatar: boolean
  avatar?: string
  initials: string
  onDelete: () => void
  renderWithMentions: (text: string) => React.ReactNode
}) {
  return (
    <div className={`flex gap-3 ${isOwn ? "flex-row-reverse" : ""}`}>
      {/* Avatar - shows only for first message in group */}
      {showAvatar ? (
        <>
          {avatar ? (
            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
              <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div
              className={`w-8 h-8 ${getAvatarColor(initials)} rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0`}
            >
              {initials}
            </div>
          )}
        </>
      ) : (
        <div className="w-8 flex-shrink-0" />
      )}

      {/* Message bubble */}
      <div className={`flex flex-col ${isOwn ? "items-end" : ""} max-w-[70%]`}>
        <div
          className={`rounded-lg px-4 py-2 group relative transition-all ${
            isOwn
              ? "bg-blue-600 hover:bg-blue-700 text-white"
              : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          }`}
        >
          <p className="text-sm whitespace-pre-wrap break-words">{renderWithMentions(message.message)}</p>

          {/* Delete button - visible on hover for own messages */}
          {isOwn && (
            <button
              onClick={onDelete}
              className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              title="Delete message"
            >
              <Trash2 size={12} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * ChatInput Component - Sticky message input with modern styling
 */
function ChatInput({
  value,
  onChange,
  onSubmit,
  onEmojiClick,
  showEmojiPicker,
  showMentionAutocomplete,
  mentionPosition,
  members,
  onMentionSelect,
  onMentionClose,
  inputRef,
  sending,
  onEmojiSelect,
  onCloseEmojiPicker,
}: {
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onSubmit: (e: React.FormEvent) => void
  onEmojiClick: () => void
  showEmojiPicker: boolean
  showMentionAutocomplete: boolean
  mentionPosition: { top: number; left: number }
  members: Member[]
  onMentionSelect: (member: Member) => void
  onMentionClose: () => void
  inputRef: React.RefObject<HTMLInputElement | null>
  sending: boolean
  onEmojiSelect?: (emoji: string) => void
  onCloseEmojiPicker?: () => void
}) {
  const emojiPickerRef = useRef<HTMLDivElement>(null)

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        onCloseEmojiPicker?.()
      }
    }

    if (showEmojiPicker) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => {
        document.removeEventListener("mousedown", handleClickOutside)
      }
    }
  }, [showEmojiPicker, onCloseEmojiPicker])

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
      <form onSubmit={onSubmit} className="flex items-end gap-3">
        {/* Emoji picker button */}
        <div className="relative" ref={emojiPickerRef}>
          <button
            type="button"
            onClick={onEmojiClick}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
            title="Add emoji"
          >
            <Smile size={20} />
          </button>
          {showEmojiPicker && (
            <EmojiPicker
              onEmojiSelect={(emoji: any) => {
                onEmojiSelect?.(emoji.emoji || emoji)
                onCloseEmojiPicker?.()
              }}
              onClose={() => onCloseEmojiPicker?.()}
            />
          )}
        </div>

        {/* Input field */}
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            placeholder="Message... (@ to mention)"
            value={value}
            onChange={onChange}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                onMentionClose()
              }
            }}
            disabled={sending}
            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:opacity-50"
          />
          {showMentionAutocomplete && members.length > 0 && (
            <MentionAutocomplete
              members={members}
              query=""
              onSelect={onMentionSelect}
              onClose={onMentionClose}
              position={mentionPosition}
            />
          )}
        </div>

        {/* Send button */}
        <button
          type="submit"
          disabled={sending || !value.trim()}
          className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          title="Send message"
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  )
}

interface ChatModalProps {
  boxId: string
  chatData: any
  podId?: string
  user?: any
  onClose: () => void
  onUnreadUpdate?: () => void
}

/**
 * Helper function to group consecutive messages by sender
 */
function groupMessagesBySender(messages: ChatMessage[]): Array<{
  userId: string
  isOwn: boolean
  messages: ChatMessage[]
  userName: string
}> {
  if (!messages.length) return []

  const groups: Array<{
    userId: string
    isOwn: boolean
    messages: ChatMessage[]
    userName: string
  }> = []

  let currentGroup = {
    userId: messages[0].userId,
    isOwn: messages[0].isOwn ?? false,
    messages: [messages[0]],
    userName: messages[0].userName || "",
  }

  for (let i = 1; i < messages.length; i++) {
    const msg = messages[i]
    if (msg.userId === currentGroup.userId) {
      currentGroup.messages.push(msg)
    } else {
      groups.push(currentGroup)
      currentGroup = {
        userId: msg.userId,
        isOwn: msg.isOwn ?? false,
        messages: [msg],
        userName: msg.userName || "",
      }
    }
  }

  groups.push(currentGroup)
  return groups
}

/**
 * ChatModal Component
 * 
 * Client component because:
 * - Heavy use of useState for messages, members, input state
 * - useEffect for data fetching and polling
 * - Complex user interactions (emoji picker, mentions, send messages)
 * - Real-time message updates
 */
export function ChatModal({
  boxId,
  chatData,
  podId,
  user,
  onClose,
  onUnreadUpdate,
}: ChatModalProps) {
  const [members, setMembers] = useState<Member[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [messageInput, setMessageInput] = useState("")
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showAddMembersModal, setShowAddMembersModal] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showMentionAutocomplete, setShowMentionAutocomplete] = useState(false)
  const [mentionQuery, setMentionQuery] = useState("")
  const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 })
  const inputRef = useRef<HTMLInputElement>(null)
  const isMountedRef = useRef(true)
  const messagesRef = useRef<HTMLDivElement | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [podOwnerId, setPodOwnerId] = useState<string | null>(null)
  
  // Use shared hook for timestamp formatting (hydration-safe)
  const formattedTimes = useFormattedTimesMap(messages, 'timestamp')

  const chatName = chatData?.label || "Chat"
  const chatDescription = chatData?.description || ""
  const isCreator = user && chatData?.creatorId === user.id

  // Fetch members and messages
  useEffect(() => {
    isMountedRef.current = true
    if (boxId && podId) {
      fetchMembers()
      fetchMessages()
      fetchPodOwner()
      markMessagesAsRead()
      const interval = setInterval(fetchMessages, 2000)
      return () => {
        isMountedRef.current = false
        clearInterval(interval)
      }
    }
    return () => { isMountedRef.current = false }
  }, [boxId, podId])

  const markMessagesAsRead = async () => {
    try {
      await fetch(`/api/blocks/${boxId}/unread`, { method: "POST" })
    } catch (error) {
      console.error("Error marking messages as read:", error)
    }
  }

  const fetchPodOwner = async () => {
    try {
      if (podId) {
        const response = await fetch(`/api/pods/${podId}`)
        if (response.ok) {
          const data = await response.json()
          setPodOwnerId(data.pod?.creatorId || null)
        }
      }
    } catch (error) {
      console.error("Error fetching pod owner:", error)
    }
  }

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm("Are you sure you want to delete this message?")) return

    try {
      const response = await fetch(`/api/chat/${boxId}/messages/${messageId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchMessages()
      } else {
        const data = await response.json()
        alert(data.error || "Failed to delete message")
      }
    } catch (error) {
      console.error("Error deleting message:", error)
      alert("Failed to delete message. Please try again.")
    }
  }

  const fetchMembers = async () => {
    try {
      const response = await fetch(`/api/blocks/${boxId}/members`)
      if (response.ok) {
        const data = await response.json()
        setMembers(data.members || [])
      }
    } catch (error) {
      console.error("Error fetching members:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/chat/${boxId}/messages`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])
      } else if (response.status === 403) {
        const data = await response.json()
        console.error("Access denied:", data.error)
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageInput.trim() || sending) return

    setSending(true)
    try {
      const response = await fetch(`/api/chat/${boxId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageInput.trim() }),
      })

      if (response.ok) {
        setMessageInput("")
        // mark sending as false so UI updates; focusing handled in effect
        setSending(false)
        fetchMessages()
        if (onUnreadUpdate) onUnreadUpdate()
      } else {
        const data = await response.json()
        alert(data.error || "Failed to send message")
      }
    } catch (error) {
      console.error("Error sending message:", error)
      alert("Failed to send message. Please try again.")
    } finally {
      setSending(false)
    }
  }

  // Focus input after sending completes (true -> false)
  const prevSendingRef = useRef(sending)
  useEffect(() => {
    if (prevSendingRef.current && !sending) {
      // ensure DOM has updated, then focus
      requestAnimationFrame(() => {
        inputRef.current?.focus()
        try {
          const len = inputRef.current?.value.length || 0
          inputRef.current?.setSelectionRange(len, len)
        } catch (err) {
          // ignore
        }
      })
    }
    prevSendingRef.current = sending
  }, [sending])

  // Block Ctrl+wheel / pinch zoom at the document/window level while this modal is mounted.
  // Register non-passive, capturing listeners so we can intercept zoom gestures
  // and keyboard shortcuts while the modal is open. Cleanup restores normal behavior.
  useEffect(() => {
    const wheelHandler = (ev: WheelEvent) => {
      try {
        if (ev.ctrlKey) {
          console.log("chat modal wheel handler", { ctrl: ev.ctrlKey, deltaY: ev.deltaY })
          ev.preventDefault()
          ev.stopPropagation()
        }
      } catch (err) {
        // ignore
      }
    }

    const keyHandler = (ev: KeyboardEvent) => {
      try {
        const k = ev.key
        if ((ev.ctrlKey || ev.metaKey) && (k === "+" || k === "-" || k === "0" || k === "=")) {
          console.log("chat modal key handler", { key: k })
          ev.preventDefault()
          ev.stopPropagation()
        }
      } catch (err) {
        // ignore
      }
    }

    // Optional: iOS Safari gesture events (prevent pinch-to-zoom there)
    const gestureHandler = (ev: any) => {
      try {
        console.log("chat modal gesture handler")
        ev.preventDefault()
        ev.stopPropagation()
      } catch (err) {
        // ignore
      }
    }

    // Attach to both document and window to ensure we intercept in all browsers
    document.addEventListener("wheel", wheelHandler as EventListener, {
      passive: false,
      capture: true,
    })
    window.addEventListener("wheel", wheelHandler as EventListener, {
      passive: false,
      capture: true,
    })

    window.addEventListener("keydown", keyHandler as EventListener, { capture: true })

    document.addEventListener("gesturestart", gestureHandler as EventListener, {
      passive: false,
      capture: true,
    })
    document.addEventListener("gesturechange", gestureHandler as EventListener, {
      passive: false,
      capture: true,
    })
    document.addEventListener("gestureend", gestureHandler as EventListener, {
      passive: false,
      capture: true,
    })

    return () => {
      document.removeEventListener("wheel", wheelHandler as EventListener, {
        capture: true,
      } as AddEventListenerOptions)
      window.removeEventListener("wheel", wheelHandler as EventListener, {
        capture: true,
      } as AddEventListenerOptions)

      window.removeEventListener("keydown", keyHandler as EventListener, {
        capture: true,
      } as AddEventListenerOptions)

      document.removeEventListener("gesturestart", gestureHandler as EventListener, {
        capture: true,
      } as AddEventListenerOptions)
      document.removeEventListener("gesturechange", gestureHandler as EventListener, {
        capture: true,
      } as AddEventListenerOptions)
      document.removeEventListener("gestureend", gestureHandler as EventListener, {
        capture: true,
      } as AddEventListenerOptions)
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setMessageInput(value)

    const cursorPosition = e.target.selectionStart || 0
    const textBeforeCursor = value.substring(0, cursorPosition)
    const lastAtIndex = textBeforeCursor.lastIndexOf("@")

    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1)
      if (!textAfterAt.includes(" ") && !textAfterAt.includes("\n")) {
        const query = textAfterAt.toLowerCase()
        setMentionQuery(query)

        if (inputRef.current) {
          const rect = inputRef.current.getBoundingClientRect()
          setMentionPosition({ top: rect.top - 200, left: rect.left })
        }

        setShowMentionAutocomplete(true)
      } else {
        setShowMentionAutocomplete(false)
      }
    } else {
      setShowMentionAutocomplete(false)
    }
  }

  const handleMentionSelect = (member: any) => {
    const cursorPosition = inputRef.current?.selectionStart || 0
    const textBeforeCursor = messageInput.substring(0, cursorPosition)
    const lastAtIndex = textBeforeCursor.lastIndexOf("@")

    if (lastAtIndex !== -1) {
      const newText =
        messageInput.substring(0, lastAtIndex) +
        `@${member.name} ` +
        messageInput.substring(cursorPosition)

      setMessageInput(newText)
      setShowMentionAutocomplete(false)

      setTimeout(() => {
        inputRef.current?.focus()
        const newCursorPos = lastAtIndex + member.name.length + 2
        inputRef.current?.setSelectionRange(newCursorPos, newCursorPos)
      }, 0)
    }
  }

  const handleEmojiSelect = (emoji: string) => {
    const cursorPosition = inputRef.current?.selectionStart || 0
    const newText =
      messageInput.substring(0, cursorPosition) +
      emoji +
      messageInput.substring(cursorPosition)
    setMessageInput(newText)
    setShowEmojiPicker(false)

    setTimeout(() => {
      inputRef.current?.focus()
      const newCursorPos = cursorPosition + emoji.length
      inputRef.current?.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }

  const renderMessageWithMentions = (message: string) => {
    const parts = message.split(/(@\w+)/g)

    return parts.map((part, index) => {
      if (part.startsWith("@")) {
        const mentionName = part.substring(1)
        const member = members.find(
          (m) =>
            m.name?.toLowerCase() === mentionName.toLowerCase() ||
            m.name?.toLowerCase().includes(mentionName.toLowerCase())
        )

        if (member) {
          return (
            <span
              key={index}
              className="font-semibold bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-1 rounded"
            >
              {part}
            </span>
          )
        }
      }
      return <span key={index}>{part}</span>
    })
  }

  if (!chatData) return null

  const messageGroups = groupMessagesBySender(messages)

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />

      <div
        onClick={(e) => e.stopPropagation()}
        className={`chat-modal-wrapper fixed z-50 border border-gray-200 dark:border-gray-700 shadow-2xl flex bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 ${
          isFullscreen
            ? "inset-0 w-screen h-screen rounded-none"
            : "left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[85vh] rounded-xl"
        }`}
        onWheelCapture={(e) => {
          try {
            e.stopPropagation()
            ;(e.nativeEvent as WheelEvent).stopImmediatePropagation()
          } catch (err) {
            // ignore
          }
        }}
      >
        {/* Left Panel - Members Sidebar (visually secondary) */}
        <div className="w-64 border-r border-gray-200 dark:border-gray-700 flex flex-col bg-gray-50 dark:bg-gray-800">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">{chatName}</h3>
                {chatDescription && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{chatDescription}</p>
                )}
              </div>
              <div className="flex items-center gap-2 ml-2">
                <button
                  onClick={() => setIsFullscreen((prev) => !prev)}
                  className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                  title={isFullscreen ? "Exit full screen" : "Full screen"}
                >
                  {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                </button>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition flex-shrink-0"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Users size={14} className="text-gray-500 dark:text-gray-400" />
              <h4 className="font-semibold text-gray-700 dark:text-gray-300 text-xs">{members.length} Members</h4>
            </div>
          </div>

          {/* Members list - thin scrollbar */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
              </div>
            ) : members.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Users size={32} className="text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-1">No members yet</p>
                <p className="text-xs text-gray-500 dark:text-gray-500">Add members to start chatting</p>
              </div>
            ) : (
              members.map((member, i) => (
                <div key={member.id || i} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                  {member.profilePicture ? (
                    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                      <img
                        src={member.profilePicture}
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div
                      className={`w-8 h-8 ${getAvatarColor(
                        member.id || i.toString()
                      )} rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0`}
                    >
                      {getInitials(member.name)}
                    </div>
                  )}
                  <div className="text-left flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-200 truncate">{member.name}</p>
                      {member.id === chatData?.creatorId && (
                        <span className="px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded text-xs font-medium flex-shrink-0">
                          Creator
                        </span>
                      )}
                      {podOwnerId && member.id === podOwnerId && member.id !== chatData?.creatorId && (
                        <span className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs font-medium flex-shrink-0">
                          Owner
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-500 truncate">{member.email}</p>
                  </div>
                </div>
              ))
            )}
            {isCreator && podId && (
              <button
                onClick={() => setShowAddMembersModal(true)}
                className="w-full mt-4 flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 font-medium px-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
              >
                <Users size={16} />
                <span>Add Members</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Panel - Chat (main content) */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-gray-900">
          {/* Messages area */}
          <div
            ref={messagesRef}
            className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600"
          >
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500 dark:text-gray-400">Loading messages...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <MessageCircle size={48} className="text-gray-300 dark:text-gray-600 mb-4" />
                <p className="text-gray-700 dark:text-gray-300 font-medium mb-1">No messages yet</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Start the conversation by sending a message</p>
              </div>
            ) : (
              messageGroups.map((group, groupIndex) => {
                const member = members.find((m) => m.id === group.userId)
                const showSenderInfo = groupIndex === 0 || messageGroups[groupIndex - 1]?.userId !== group.userId

                return (
                  <div key={`group-${group.userId}-${groupIndex}`} className="space-y-1">
                    {/* Sender name - shows only once per group */}
                    {showSenderInfo && (
                      <div className={`flex gap-3 px-1 ${group.isOwn ? "flex-row-reverse" : ""}`}>
                        <div className="w-8 flex-shrink-0" />
                        <div className={`text-xs font-semibold text-gray-600 dark:text-gray-400 ${group.isOwn ? "text-right" : ""}`}>
                          {group.userName || member?.name || "User"}
                        </div>
                      </div>
                    )}

                    {/* Message group */}
                    {group.messages.map((msg, msgIndex) => (
                      <ChatBubble
                        key={msg.id || `${group.userId}-${msgIndex}`}
                        message={msg}
                        isOwn={group.isOwn}
                        showAvatar={msgIndex === 0}
                        avatar={member?.profilePicture}
                        initials={getInitials(msg.userName || member?.name || "U")}
                        onDelete={() => handleDeleteMessage(msg.id)}
                        renderWithMentions={renderMessageWithMentions}
                      />
                    ))}

                    {/* Timestamp for group - subtle, below last message */}
                    {group.messages.length > 0 && (
                      <div className={`flex gap-3 px-1 text-xs text-gray-400 dark:text-gray-500 ${group.isOwn ? "flex-row-reverse" : ""}`}>
                        <div className="w-8 flex-shrink-0" />
                        <div>{formattedTimes[group.messages[group.messages.length - 1].id] || ""}</div>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>

          {/* Message Input - sticky at bottom */}
          <ChatInput
            value={messageInput}
            onChange={handleInputChange}
            onSubmit={handleSendMessage}
            onEmojiClick={() => setShowEmojiPicker(!showEmojiPicker)}
            showEmojiPicker={showEmojiPicker}
            showMentionAutocomplete={showMentionAutocomplete}
            mentionPosition={mentionPosition}
            members={members}
            onMentionSelect={handleMentionSelect}
            onMentionClose={() => setShowMentionAutocomplete(false)}
            inputRef={inputRef}
            sending={sending}
            onEmojiSelect={handleEmojiSelect}
            onCloseEmojiPicker={() => setShowEmojiPicker(false)}
          />
        </div>
      </div>

      {showAddMembersModal && podId && (
        <AddMembersToBlockModal
          open={showAddMembersModal}
          onClose={() => setShowAddMembersModal(false)}
          block={chatData}
          podId={podId as string}
          creatorId={chatData?.creatorId}
          onMemberAdded={() => {
            fetchMembers()
            setShowAddMembersModal(false)
          }}
        />
      )}
    </>
  )
}
