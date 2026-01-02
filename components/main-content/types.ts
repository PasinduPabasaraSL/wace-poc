// Type definitions shared across main-content components

export interface User {
  id: string
  name: string
  email?: string
  profilePicture?: string
}

export interface Pod {
  id: string
  name: string
  tagline?: string
  logoUrl?: string
  role?: string
  creatorId?: string
}

export interface Block {
  id: string
  label: string
  type: 'chat' | 'docs' | 'meetings' | 'calendar' | 'goals'
  description?: string
  x: number
  y: number
  creatorId?: string
  meetingData?: any
}

export interface Blocks {
  chat: Block[]
  docs: Block[]
  meetings: Block[]
  calendar: Block[]
  goals: Block[]
}

export interface Notification {
  id: string
  title: string
  message: string
  time: string
  unread: boolean
  blockId: string
  podId: string
}

export interface ChatMessage {
  id: string
  userId: string
  userName?: string
  message: string
  timestamp: string
  isOwn?: boolean
}

export interface Member {
  id: string
  name: string
  email?: string
  profilePicture?: string
}

export interface Document {
  id: string
  fileName: string
  fileType: string
  fileSize: number
  uploadedAt: string
  uploadedBy?: {
    id: string
    name: string
  }
}

export interface CalendarEvent {
  id: string
  title: string
  date: string
  time?: string
  description?: string
  createdBy?: {
    id: string
    name: string
  }
}

export interface Goal {
  id: string
  title: string
  status: 'not_started' | 'in_progress' | 'done'
  dueDate?: string
  createdBy?: {
    id: string
    name: string
  }
}

// Props interfaces for components
export interface MainContentProps {
  activeView: string
  activePod: Pod | null
  onPodClick: (pod: Pod) => void
  onBackToDashboard: () => void
  onNavigate: (view: string, pod?: Pod) => void
  isLoading?: boolean
  pods?: Pod[]
  user?: User | null
  onPodsUpdate?: () => void
}

export interface PodCardProps {
  pod: Pod
  image: string
  name: string
  tagline: string
  onClick: () => void
  onDelete: () => void
  user: User | null
}

export interface PodCanvasProps {
  podName?: string
  pod?: Pod
  onBack: () => void
  isLoading: boolean
  user?: User | null
}
