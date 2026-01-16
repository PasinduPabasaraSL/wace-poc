# Chat UI - Developer Quick Reference

## Component Overview

### ChatBubble Component
**Purpose**: Render a single message or message group bubble

**Props**:
```tsx
{
  message: ChatMessage           // Message data
  isOwn: boolean                // Is message from current user
  showAvatar: boolean           // Show avatar (first in group)
  avatar?: string               // Avatar image URL
  initials: string              // Avatar fallback initials
  onDelete: () => void          // Delete handler
  renderWithMentions: (text) => ReactNode  // Mention renderer
}
```

**Styling**:
- Own: `bg-blue-600 hover:bg-blue-700 text-white` (right-aligned)
- Others: `bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100` (left-aligned)
- Padding: `px-4 py-2`
- Border-radius: `rounded-lg`

**Features**:
- Delete button appears on hover (own messages only)
- Flexible max-width based on content

### ChatInput Component
**Purpose**: Render the sticky message input area

**Props**:
```tsx
{
  value: string                          // Current input value
  onChange: (e) => void                  // Input change handler
  onSubmit: (e) => void                  // Form submit handler
  onEmojiClick: () => void               // Emoji picker toggle
  showEmojiPicker: boolean               // Show emoji picker
  showMentionAutocomplete: boolean       // Show @ mentions
  mentionPosition: { top, left }         // Mention popup position
  members: Member[]                      // Available members
  onMentionSelect: (member) => void      // Mention select handler
  onMentionClose: () => void             // Close mentions
  inputRef: RefObject<HTMLInputElement>  // Input ref
  sending: boolean                       // Is sending
}
```

**Styling**:
- Background: `bg-white dark:bg-gray-800`
- Border: `border-t border-gray-200 dark:border-gray-700`
- Input: `bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500`
- Buttons: `p-2` and `p-2.5`

**Features**:
- Emoji picker button
- Mention autocomplete support
- Send button (icon-based)
- Disabled state during sending

## Key Functions

### groupMessagesBySender(messages: ChatMessage[])
Groups consecutive messages by sender

```tsx
// Input
messages = [
  { userId: 'u1', message: 'Hi', isOwn: true },
  { userId: 'u1', message: 'How are you?', isOwn: true },
  { userId: 'u2', message: 'Good!', isOwn: false }
]

// Output
groups = [
  {
    userId: 'u1',
    isOwn: true,
    messages: [msg1, msg2],
    userName: 'John'
  },
  {
    userId: 'u2',
    isOwn: false,
    messages: [msg3],
    userName: 'Sarah'
  }
]
```

**Algorithm**: O(n) single-pass grouping

### renderMessageWithMentions(message: string)
Renders mentions with blue highlighting

```tsx
// Input: "@Sarah Hello @John"
// Output: <span>@Sarah</span> Hello <span>@John</span>
// Styling: bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300
```

## Layout Structure

```
ChatModal
├── Backdrop (fixed inset-0 bg-black/30)
└── Modal Container (fixed, z-50)
    ├── Sidebar (w-64, bg-gray-50 dark:bg-gray-800)
    │   ├── Header (chat name, controls)
    │   ├── Members List (scrollable)
    │   └── Add Members Button
    └── Chat Area (flex-1)
        ├── Messages Container (flex-1, overflow-y-auto)
        │   ├── Message Groups
        │   │   ├── Sender Name (once per group)
        │   │   ├── ChatBubble components
        │   │   └── Timestamp (below group)
        │   └── Empty State (if no messages)
        └── ChatInput (sticky at bottom)
```

## Color Palette

### Light Mode
- Primary: `#2563EB` (blue-600) - own messages
- Secondary: `#E5E7EB` (gray-200) - others' messages
- Background: `#FFFFFF` (white)
- Text: `#111827` (gray-900)
- Border: `#E5E7EB` (gray-200)
- Input: `#F9FAFB` (gray-50)

### Dark Mode
- Primary: `#2563EB` (blue-600) - own messages
- Secondary: `#374151` (gray-700) - others' messages
- Background: `#111827` (gray-900)
- Text: `#F3F4F6` (gray-100)
- Border: `#374151` (gray-700)
- Input: `#374151` (gray-700)

## State Management

**Local State**:
```tsx
const [messages, setMessages] = useState<ChatMessage[]>([])
const [members, setMembers] = useState<Member[]>([])
const [messageInput, setMessageInput] = useState("")
const [sending, setSending] = useState(false)
const [showEmojiPicker, setShowEmojiPicker] = useState(false)
const [showMentionAutocomplete, setShowMentionAutocomplete] = useState(false)
const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 })
const [mentionQuery, setMentionQuery] = useState("")
// ... more state
```

**Computed**:
```tsx
const messageGroups = groupMessagesBySender(messages)
```

## Event Handlers

### handleSendMessage(e: React.FormEvent)
- Validates input not empty
- Prevents default form submission
- Sends message via API
- Clears input on success
- Refocuses input after sending

### handleInputChange(e: React.ChangeEvent<HTMLInputElement>)
- Updates input state
- Detects `@` for mention autocomplete
- Calculates mention position

### handleMentionSelect(member: Member)
- Inserts mention text at cursor
- Maintains cursor position
- Closes autocomplete

### handleEmojiSelect(emoji: string)
- Inserts emoji at cursor
- Maintains cursor position
- Closes emoji picker

### handleDeleteMessage(messageId: string)
- Confirms deletion
- Sends DELETE request
- Refreshes messages

## API Integration

### Fetch Messages
```tsx
GET /api/chat/{boxId}/messages
→ { messages: ChatMessage[] }
```

### Send Message
```tsx
POST /api/chat/{boxId}/messages
Body: { message: string }
→ { success: boolean }
```

### Delete Message
```tsx
DELETE /api/chat/{boxId}/messages/{messageId}
→ { success: boolean }
```

## TypeScript Interfaces

```tsx
interface ChatMessage {
  id: string
  userId: string
  userName: string
  message: string
  timestamp: string
  isOwn: boolean
}

interface Member {
  id: string
  name: string
  email: string
  profilePicture?: string
}

interface MessageGroup {
  userId: string
  isOwn: boolean
  messages: ChatMessage[]
  userName: string
}
```

## Customization Guide

### Change Own Message Color
```tsx
// In ChatBubble, change this line:
className={`... bg-blue-600 hover:bg-blue-700 ...`}
// To your color (e.g., bg-green-600, bg-purple-600)
```

### Change Mention Highlight
```tsx
// In renderMessageWithMentions, change this line:
className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
// To your colors
```

### Adjust Message Max Width
```tsx
// In ChatBubble, change this line:
<div className={`... max-w-[70%] ...`}>
// To different percentage (e.g., max-w-[60%] for narrower, max-w-[80%] for wider)
```

### Disable Message Grouping
```tsx
// Instead of groupMessagesBySender, use individual messages:
messages.map((msg) => <ChatBubble ... showAvatar={true} />)
```

## Performance Tips

1. **Message Grouping**: O(n) - runs once on messages change
2. **Scrolling**: Optimize with virtualization for 1000+ messages
3. **Avatars**: Load from CDN, use lazy loading
4. **Emoji Picker**: Lazy load the component

## Accessibility Checklist

- [x] Color contrast 4.5:1+
- [x] Focus states visible
- [x] Semantic HTML (form, button)
- [x] ARIA labels on icon buttons
- [x] Keyboard navigation (Tab, Enter, Escape)
- [x] Screen reader support

## Browser Compatibility

| Feature | Chrome | Firefox | Safari | Mobile |
|---------|--------|---------|--------|--------|
| Layout  | ✅     | ✅      | ✅     | ✅     |
| Colors  | ✅     | ✅      | ✅     | ✅     |
| Scrollbar | ✅   | ✅      | ✅     | ✅     |
| Dark Mode | ✅   | ✅      | ✅     | ✅     |

## Common Issues & Solutions

### Messages not grouping?
- Check `userId` is consistent in message data
- Verify `isOwn` flag is correctly set

### Mention highlighting not working?
- Ensure member names match mention text (case-insensitive)
- Check `renderMessageWithMentions` is being used

### Input losing focus?
- Verify `inputRef` is properly connected
- Check `onBlur` handlers aren't interfering

### Scrollbar not visible?
- Requires Tailwind scrollbar utilities
- Check `scrollbar-thin` class is applied
- Browser may not show if content fits

---

**Last Updated**: 2024
**Component Version**: 2.0
**Status**: Production Ready
