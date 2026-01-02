"use client"

import { useEffect, useRef } from "react"
import { Users } from "lucide-react"

export default function MentionAutocomplete({
  members,
  query,
  onSelect,
  onClose,
  position,
}: {
  members: any[]
  query: string
  onSelect: (member: any) => void
  onClose: () => void
  position: { top: number; left: number }
}) {
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (listRef.current && !listRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [onClose])

  const filteredMembers = members.filter((member) =>
    member.name?.toLowerCase().includes(query.toLowerCase()) ||
    member.email?.toLowerCase().includes(query.toLowerCase())
  )

  if (filteredMembers.length === 0) {
    return null
  }

  return (
    <div
      ref={listRef}
      className="absolute bg-white dark:bg-black border border-gray-200 dark:border-white rounded-lg shadow-lg max-h-48 overflow-y-auto z-50 min-w-[200px]"
      style={{ top: position.top, left: position.left }}
    >
      {filteredMembers.map((member) => (
        <button
          key={member.id}
          onClick={() => onSelect(member)}
          className="w-full flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition text-left"
        >
          {member.profilePicture ? (
            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
              <img
                src={member.profilePicture}
                alt={member.name}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-8 h-8 bg-gray-300 dark:bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-gray-700 dark:text-gray-200 font-semibold text-xs">
                {member.name?.charAt(0).toUpperCase() || "U"}
              </span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {member.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-white truncate">
              {member.email}
            </p>
          </div>
        </button>
      ))}
    </div>
  )
}

