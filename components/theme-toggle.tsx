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
      <button className="p-2 hover:bg-gray-100 dark:hover:bg-white rounded-lg transition">
        <Sun size={20} className="text-gray-600 dark:text-white" />
      </button>
    )
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2 hover:bg-gray-100 dark:hover:bg-white rounded-lg transition"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun size={20} className="text-white" />
      ) : (
        <Moon size={20} className="text-gray-600" />
      )}
    </button>
  )
}

