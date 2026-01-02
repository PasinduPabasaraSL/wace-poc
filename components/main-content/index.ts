/**
 * Main Content Components - Barrel Export
 * 
 * This module exports all components related to the main content area
 * of the dashboard and pod canvas views.
 */

// Types
export * from "./types"

// Utilities
export * from "./utils"

// Hooks
export { 
  useWelcomeMessage, 
  useFormattedDate, 
  useFormattedTime, 
  useHasMounted,
  useFormattedDatesMap,
  useFormattedTimesMap,
} from "./hooks"

// Components
export { default as PodCard } from "./pod-card"
export { default as NavButton } from "./nav-button"

// Create Modals
export {
  CreateChatModal,
  CreateDocModal,
  CreateCalendarModal,
  CreateGoalModal,
} from "./create-modals"

// Content Modals
export { ChatModal } from "./chat-modal"
export { DocModal } from "./doc-modal"
export { CalendarModal, AddEventModal } from "./calendar-modal"
export { GoalModal, AddGoalModal } from "./goal-modal"
export { MeetingModal, FeatureUnderDevModal } from "./meeting-modal"
