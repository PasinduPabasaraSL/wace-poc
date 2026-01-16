"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { MessageCircle, Users, X, Smile, Trash2, Minimize2, Maximize2 } from "lucide-react"
import EmojiPicker from "@/components/emoji-picker"
import MentionAutocomplete from "@/components/mention-autocomplete"
import AddMembersToBlockModal from "@/components/add-members-to-block-modal"
import { getAvatarColor, getInitials } from "./utils"
import { useFormattedTimesMap } from "./hooks"
import type { Member, ChatMessage } from "./types"

interface ChatModalProps {
  boxId: string
  chatData: any
  podId?: string
  user?: any
  onClose: () => void
  onUnreadUpdate?: () => void
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
              className="font-semibold text-white bg-white/10 px-1 rounded"
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

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose} />

      <div
        className={`fixed z-50 border border-white/15 shadow-2xl flex bg-black text-white ${
          isFullscreen
            ? "inset-0 w-screen h-screen rounded-none"
            : "left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[85vh] rounded-xl"
        }`}
      >
        {/* Left Panel - Members Sidebar */}
        <div className="w-64 border-r border-white/15 flex flex-col bg-black">
          <div className="p-4 border-b border-white/15">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-white truncate">{chatName}</h3>
                {chatDescription && (
                  <p className="text-xs text-gray-300 mt-1 line-clamp-2">{chatDescription}</p>
                )}
              </div>
              <div className="flex items-center gap-2 ml-2">
                <button
                  onClick={() => setIsFullscreen((prev) => !prev)}
                  className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition"
                  title={isFullscreen ? "Exit full screen" : "Full screen"}
                >
                  {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                </button>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition flex-shrink-0"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Users size={14} className="text-gray-300" />
              <h4 className="font-semibold text-white text-xs">{members.length} Members</h4>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-sm text-gray-300">Loading...</p>
              </div>
            ) : members.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Users size={32} className="text-gray-400 mb-3" />
                <p className="text-sm text-gray-300 font-medium mb-1">No members yet</p>
                <p className="text-xs text-gray-400">Add members to start chatting</p>
              </div>
            ) : (
              members.map((member, i) => (
                <div key={member.id || i} className="flex items-center gap-3">
                  {member.profilePicture ? (
                    <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                      <img
                        src={member.profilePicture}
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div
                      className={`w-10 h-10 ${getAvatarColor(
                        member.id || i.toString()
                      )} rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0`}
                    >
                      {getInitials(member.name)}
                    </div>
                  )}
                  <div className="text-left flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-white truncate">{member.name}</p>
                      {member.id === chatData?.creatorId && (
                        <span className="px-1.5 py-0.5 bg-yellow-900/60 text-yellow-200 rounded text-xs font-medium flex-shrink-0">
                          Creator
                        </span>
                      )}
                      {podOwnerId && member.id === podOwnerId && member.id !== chatData?.creatorId && (
                        <span className="px-1.5 py-0.5 bg-gray-100/10 text-white rounded text-xs font-medium flex-shrink-0">
                          Owner
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 truncate">{member.email}</p>
                  </div>
                </div>
              ))
            )}
            {isCreator && podId && (
              <button
                onClick={() => setShowAddMembersModal(true)}
                className="w-full mt-4 flex items-center gap-2 text-sm text-gray-200 hover:text-white font-medium px-2 py-2 hover:bg-white/10 rounded-lg transition"
              >
                <Users size={16} />
                <span>Add Members</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Panel - Chat */}
        <div className="flex-1 flex flex-col overflow-hidden bg-black">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-300">Loading messages...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <MessageCircle size={48} className="text-gray-600 mb-4" />
                <p className="text-gray-200 font-medium mb-1">No messages yet</p>
                <p className="text-sm text-gray-400">Start the conversation by sending a message</p>
              </div>
            ) : (
              messages.map((msg, i) => {
                const isOwn = msg.isOwn
                const member = members.find((m) => m.id === msg.userId)

                return (
                  <div key={msg.id || i} className={`flex gap-3 ${isOwn ? "flex-row-reverse" : ""}`}>
                    {member?.profilePicture ? (
                      <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 ring-1 ring-white/10">
                        <img
                          src={member.profilePicture}
                          alt={member.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div
                        className={`w-8 h-8 ${getAvatarColor(
                          msg.userId || i.toString()
                        )} rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0`}
                      >
                        {getInitials(msg.userName || member?.name || "U")}
                      </div>
                    )}
                    <div className={`flex-1 ${isOwn ? "flex flex-col items-end" : ""}`}>
                      <div className={`flex items-center gap-2 mb-1 ${isOwn ? "flex-row-reverse" : ""}`}>
                        <p className="text-xs text-gray-300">
                          {msg.userName || member?.name || "User"}
                        </p>
                        {msg.userId === chatData?.creatorId && (
                          <span className="px-1.5 py-0.5 bg-yellow-900/60 text-yellow-200 rounded text-xs font-medium">
                            Creator
                          </span>
                        )}
                        {podOwnerId && msg.userId === podOwnerId && msg.userId !== chatData?.creatorId && (
                          <span className="px-1.5 py-0.5 bg-gray-100/10 text-white rounded text-xs font-medium">
                            Owner
                          </span>
                        )}
                        <p className="text-xs text-gray-400">• {formattedTimes[msg.id] || ""}</p>
                      </div>
                      <div
                        className={`rounded-lg p-3 max-w-[80%] relative group ${
                          isOwn ? "bg-gray-800 text-white" : "bg-gray-900 text-white"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {renderMessageWithMentions(msg.message)}
                        </p>
                        {isOwn && (
                          <button
                            onClick={() => handleDeleteMessage(msg.id)}
                            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 z-10"
                            title="Delete message"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          <div className="p-4 border-t border-white/15 bg-black relative">
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-2 hover:bg-white/10 rounded-lg transition"
                >
                  <Smile size={20} className="text-gray-300" />
                </button>
                {showEmojiPicker && (
                  <EmojiPicker
                    onEmojiSelect={handleEmojiSelect}
                    onClose={() => setShowEmojiPicker(false)}
                  />
                )}
              </div>
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Message... (use @ to mention)"
                  value={messageInput}
                  onChange={handleInputChange}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      setShowMentionAutocomplete(false)
                      setShowEmojiPicker(false)
                    }
                  }}
                  // keep input enabled while sending so it can be focused
                  className="w-full px-4 py-2 bg-gray-900 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-gray-900 transition text-white placeholder:text-gray-500 border border-white/10"
                />
                {showMentionAutocomplete && members.length > 0 && (
                  <MentionAutocomplete
                    members={members}
                    query={mentionQuery}
                    onSelect={handleMentionSelect}
                    onClose={() => setShowMentionAutocomplete(false)}
                    position={mentionPosition}
                  />
                )}
              </div>
              <button
                type="submit"
                onMouseDown={(e) => e.preventDefault()}
                disabled={sending || !messageInput.trim()}
                className="px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                {sending ? "Sending..." : "Send"}
              </button>
            </form>
          </div>
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
