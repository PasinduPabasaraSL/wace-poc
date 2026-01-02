"use client"

/**
 * NavButton Component
 * 
 * Client component because:
 * - Has onClick handler for navigation
 * - Receives reactive props that change based on state
 * 
 * Kept minimal for performance - just a styled button
 */

interface NavButtonProps {
  icon: React.ReactNode
  title: string
  active: boolean
  onClick: () => void
}

export default function NavButton({ icon, title, active, onClick }: NavButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`w-9 h-9 flex items-center justify-center rounded-lg transition ${
        active
          ? "bg-black dark:bg-white text-white dark:text-black shadow-sm"
          : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100"
      }`}
      title={title}
    >
      {icon}
    </button>
  )
}
