"use client"

import { useState, useEffect } from "react"

/**
 * Client-only hook for generating welcome messages
 * Uses useEffect to avoid hydration mismatch from Date/Math.random during SSR
 * Returns a stable initial value during SSR, then updates on client
 */
export function useWelcomeMessage(userName?: string): string {
  // Stable initial value for SSR - must match what server renders
  const [message, setMessage] = useState("Welcome back!")

  useEffect(() => {
    // Only run on client after hydration
    const hour = new Date().getHours()
    const timeGreeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"
    const name = userName || ""
    
    const greetings = name
      ? [
          `${timeGreeting}, ${name}! 🌟`,
          `Hey ${name}, ready to create? 🚀`,
          `${timeGreeting} ${name}! Let's build something amazing ✨`,
          `Welcome back, ${name}! Time to make magic happen 🎯`,
        ]
      : [
          `${timeGreeting}! Ready to dive in? 🚀`,
          `Welcome back! Let's get things done 💪`,
          `${timeGreeting}! Time to create something awesome ✨`,
          `Hey there! Ready to build? 🎯`,
        ]

    // Select a greeting based on current time to add some variety
    // Using time-based index instead of pure random for consistency
    const index = Math.floor(Date.now() / 60000) % greetings.length
    setMessage(greetings[index])
  }, [userName])

  return message
}

/**
 * Client-only hook for formatting dates
 * Avoids hydration mismatch from locale-dependent toLocaleString methods
 */
export function useFormattedDate(
  dateString: string | Date | undefined,
  options?: Intl.DateTimeFormatOptions
): string {
  const [formatted, setFormatted] = useState("")

  useEffect(() => {
    if (!dateString) {
      setFormatted("")
      return
    }

    const date = new Date(dateString)
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...options,
    }
    
    setFormatted(date.toLocaleDateString('en-US', defaultOptions))
  }, [dateString, options])

  return formatted
}

/**
 * Client-only hook for formatting time
 * Avoids hydration mismatch from locale-dependent toLocaleTimeString methods
 */
export function useFormattedTime(dateString: string | Date | undefined): string {
  const [formatted, setFormatted] = useState("")

  useEffect(() => {
    if (!dateString) {
      setFormatted("")
      return
    }

    const date = new Date(dateString)
    setFormatted(date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
  }, [dateString])

  return formatted
}

/**
 * Hook to check if component has mounted (client-side)
 * Useful for conditional rendering of client-only content
 */
export function useHasMounted(): boolean {
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  return hasMounted
}

/**
 * Hook to format dates for a collection of items
 * Avoids hydration mismatch by computing on client only
 * @param items - Array of items with a date field
 * @param dateField - The field name containing the date
 * @param options - Intl.DateTimeFormatOptions for formatting
 */
export function useFormattedDatesMap<T extends { id: string }>(
  items: T[],
  dateField: keyof T,
  options?: Intl.DateTimeFormatOptions
): Record<string, string> {
  const [formatted, setFormatted] = useState<Record<string, string>>({})

  useEffect(() => {
    const dates: Record<string, string> = {}
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...options,
    }
    
    items.forEach((item) => {
      const dateValue = item[dateField]
      if (dateValue) {
        const date = new Date(dateValue as string)
        dates[item.id] = date.toLocaleDateString('en-US', defaultOptions)
      }
    })
    setFormatted(dates)
  }, [items, dateField])

  return formatted
}

/**
 * Hook to format timestamps for messages
 * Returns a map of id -> formatted time string
 */
export function useFormattedTimesMap<T extends { id: string }>(
  items: T[],
  timestampField: keyof T
): Record<string, string> {
  const [formatted, setFormatted] = useState<Record<string, string>>({})

  useEffect(() => {
    const times: Record<string, string> = {}
    items.forEach((item) => {
      const timestamp = item[timestampField]
      if (timestamp) {
        times[item.id] = new Date(timestamp as string).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })
      }
    })
    setFormatted(times)
  }, [items, timestampField])

  return formatted
}
