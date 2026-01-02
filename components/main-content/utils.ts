/**
 * Shared utility functions for main-content components
 * These are pure functions that don't depend on React state or browser APIs
 */

/**
 * Generate a deterministic avatar color based on user ID
 * Uses a hash function to ensure consistent colors across renders
 */
export function getAvatarColor(userId: string): string {
  const colors = [
    "bg-purple-500",
    "bg-blue-500",
    "bg-pink-500",
    "bg-green-500",
    "bg-orange-500",
    "bg-red-500",
    "bg-yellow-500",
    "bg-indigo-500",
    "bg-teal-500",
    "bg-cyan-500",
  ]

  let hash = 0
  if (userId) {
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
  }
  const colorIndex = Math.abs(hash) % colors.length
  return colors[colorIndex]
}

/**
 * Get initials from a name string
 */
export function getInitials(name: string): string {
  return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || "U"
}

/**
 * Format file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Calculate position for next block on canvas
 * This is a pure function that calculates grid layout
 */
export function calculateNextBlockPosition(existingBlocks: any[]): { x: number; y: number } {
  const blockWidth = 192 // w-48 = 192px
  const spacingX = 220 // Horizontal spacing between blocks
  const spacingY = 120 // Vertical spacing between rows
  const startX = 100
  const startY = 100

  if (!existingBlocks || existingBlocks.length === 0) {
    return { x: startX, y: startY }
  }

  // Group blocks by row (Y position) - allow some tolerance for alignment
  const rowTolerance = 50 // Blocks within 50px vertically are considered same row
  const rows: { y: number; blocks: any[] }[] = []

  existingBlocks.forEach((block: any) => {
    // Find existing row with similar Y position
    let foundRow = false
    for (let i = 0; i < rows.length; i++) {
      if (Math.abs(rows[i].y - block.y) < rowTolerance) {
        rows[i].blocks.push(block)
        foundRow = true
        break
      }
    }
    // If no matching row, create new one
    if (!foundRow) {
      rows.push({ y: block.y, blocks: [block] })
    }
  })

  // Sort rows by Y position
  rows.sort((a, b) => a.y - b.y)

  // Get the bottom row (last row)
  if (rows.length === 0) {
    return { x: startX, y: startY }
  }

  const bottomRow = rows[rows.length - 1]
  bottomRow.blocks.sort((a: any, b: any) => a.x - b.x)

  // Find rightmost block in bottom row
  const rightmostBlock = bottomRow.blocks[bottomRow.blocks.length - 1]
  const nextX = rightmostBlock.x + spacingX

  // Check if next block would fit (assuming max width of ~1200px viewport)
  // If not, start new row
  if (nextX + blockWidth > 1200) {
    return { x: startX, y: bottomRow.y + spacingY }
  }

  // Place to the right of rightmost block in current row
  return { x: nextX, y: bottomRow.y }
}

/**
 * Get file type color for document badges
 */
export function getFileTypeColor(fileType: string): string {
  if (fileType === 'application/pdf') {
    return "bg-red-900/30 text-red-200"
  }
  return "bg-gray-800 text-white"
}

/**
 * Get goal status color
 */
export function getStatusColor(status: string): string {
  switch (status) {
    case "done":
      return "bg-green-900/40 text-green-200"
    case "in_progress":
      return "bg-white/10 text-white"
    case "not_started":
      return "bg-white/5 text-white"
    default:
      return "bg-white/5 text-white"
  }
}

/**
 * Get goal status label
 */
export function getStatusLabel(status: string): string {
  switch (status) {
    case "done":
      return "Done"
    case "in_progress":
      return "Ongoing"
    case "not_started":
      return "Not Completed"
    default:
      return status
  }
}
