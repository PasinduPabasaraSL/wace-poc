"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition">
        <Sun size={20} className="text-gray-600 dark:text-gray-300 dark:hover:text-gray-100" />
      </button>
    )
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition group"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun size={20} className="text-gray-300 group-hover:text-gray-100 transition-colors" />
      ) : (
        <Moon size={20} className="text-gray-600" />
      )}
    </button>
  )
}

