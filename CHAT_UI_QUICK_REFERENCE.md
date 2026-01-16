# Chat UI Redesign - Quick Reference Card

## Color Palette at a Glance

### Light Mode
```
Primary (Own Messages):     #2563EB (Blue-600)
Secondary (Others):         #E5E7EB (Gray-200)
Background:                 #FFFFFF (White)
Text Primary:               #111827 (Gray-900)
Text Secondary:             #6B7280 (Gray-500)
Border:                     #E5E7EB (Gray-200)
Input Background:           #F9FAFB (Gray-50)
Mention Background:         #DBEAFE (Blue-100)
Mention Text:               #1E40AF (Blue-900)
```

### Dark Mode
```
Primary (Own Messages):     #2563EB (Blue-600)
Secondary (Others):         #374151 (Gray-700)
Background:                 #111827 (Gray-900)
Text Primary:               #F3F4F6 (Gray-100)
Text Secondary:             #9CA3AF (Gray-400)
Border:                     #374151 (Gray-700)
Input Background:           #374151 (Gray-700)
Mention Background:         #1E3A8A (Blue-900)
Mention Text:               #BFDBFE (Blue-200)
```

## Component Quick Reference

### ChatBubble
```tsx
<ChatBubble
  message={msg}
  isOwn={true}
  showAvatar={true}
  avatar="https://..."
  initials="JD"
  onDelete={deleteHandler}
  renderWithMentions={renderFn}
/>
```

### ChatInput
```tsx
<ChatInput
  value={text}
  onChange={handleChange}
  onSubmit={handleSend}
  onEmojiClick={toggleEmoji}
  showEmojiPicker={false}
  inputRef={inputRef}
  sending={false}
  // ... mention props
/>
```

## CSS Classes Quick Lookup

### Message Styling
```tsx
// Own message bubble
"bg-blue-600 hover:bg-blue-700 text-white"

// Other message bubble
"bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100"

// Rounded corners + padding
"rounded-lg px-4 py-2"

// Message max width
"max-w-[70%]"
```

### Input Styling
```tsx
// Input field
"bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"

// Focus ring
"focus:ring-2 focus:ring-blue-500 focus:border-transparent"

// Send button
"p-2.5 bg-blue-600 hover:bg-blue-700 text-white"

// Emoji button
"p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
```

### Sidebar Styling
```tsx
// Sidebar container
"bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700"

// Member item hover
"hover:bg-gray-100 dark:hover:bg-gray-700"

// Text colors
"text-gray-900 dark:text-gray-100"
```

## Tailwind Classes Used

### Backgrounds
- `bg-white` - Light mode main background
- `bg-gray-50` - Light mode secondary (sidebar)
- `bg-gray-900` - Dark mode main background
- `bg-gray-800` - Dark mode secondary (sidebar)
- `bg-blue-600` - Primary brand color
- `bg-red-500` - Delete button (danger)

### Text
- `text-gray-900` - Light mode primary text
- `text-gray-100` - Dark mode primary text
- `text-gray-500` - Secondary text
- `text-white` - On blue backgrounds
- `text-red-500` - Danger text (delete)

### Borders
- `border-gray-200` - Light mode borders
- `border-gray-700` - Dark mode borders
- `border-t` - Top border (input separator)
- `border-r` - Right border (sidebar divider)

### Effects
- `rounded-lg` - Rounded corners on bubbles
- `ring-2 ring-blue-500` - Focus indicator
- `shadow-2xl` - Modal shadow
- `hover:` - Hover state prefixes
- `dark:` - Dark mode prefixes
- `transition` - Smooth transitions

### Layout
- `flex` - Flexbox container
- `flex-1` - Take remaining space
- `gap-3` - Spacing between elements
- `px-4 py-2` - Padding (messages)
- `p-4` - Padding (sections)
- `w-64` - Sidebar width (256px)
- `max-w-[70%]` - Message max width

### Responsive
- `flex-row-reverse` - Right-align own messages
- `overflow-y-auto` - Scrollable containers
- `scrollbar-thin` - Thin scrollbar

## State Management Pattern

```tsx
const [messages, setMessages] = useState<ChatMessage[]>([])
const [messageInput, setMessageInput] = useState("")
const [sending, setSending] = useState(false)
const [showEmojiPicker, setShowEmojiPicker] = useState(false)
const [showMentionAutocomplete, setShowMentionAutocomplete] = useState(false)

const messageGroups = groupMessagesBySender(messages)
```

## Event Handlers Quick Reference

| Handler | Purpose | Input | Output |
|---------|---------|-------|--------|
| `handleInputChange` | Update input, detect @mentions | `ChangeEvent` | State update |
| `handleSendMessage` | Send message to API | `FormEvent` | API call |
| `handleEmojiSelect` | Insert emoji at cursor | `emoji: string` | State update |
| `handleMentionSelect` | Insert mention at cursor | `member: Member` | State update |
| `handleDeleteMessage` | Delete message via API | `messageId: string` | API call |

## Testing Quick Checklist

- [ ] Own messages appear blue on right
- [ ] Others' messages appear gray on left
- [ ] Avatars show once per group
- [ ] Sender names show once per group
- [ ] Timestamps appear once below group
- [ ] Delete button appears on hover (own only)
- [ ] Mention text highlights in blue
- [ ] Emoji picker works
- [ ] Dark mode colors correct
- [ ] Focus ring visible on input
- [ ] Mobile responsive (70% max-width works)
- [ ] Scrollbar visible and thin

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Tab` | Navigate to next element |
| `Shift+Tab` | Navigate to previous element |
| `Enter` | Send message (in input) |
| `Escape` | Close emoji picker / mention list |
| `@` | Trigger mention autocomplete |
| `:` | Trigger emoji search (emoji picker) |

## Common Issues Quick Fix

| Issue | Solution |
|-------|----------|
| Messages not grouping | Check `userId` consistency |
| Mention not highlighting | Verify member name matches |
| Scrollbar invisible | Check browser supports `scrollbar-thin` |
| Dark mode not applying | Toggle theme, refresh page |
| Focus ring not visible | Check browser is not Firefox (needs `:focus-visible`) |
| Input losing focus | Verify `onBlur` handlers not interfering |

## Performance Tips

1. **Message Grouping**: O(n) algorithm, negligible cost
2. **Scrolling**: Smooth with current DOM size
3. **For 1000+ messages**: Consider virtual scrolling
4. **Avatar images**: Load from CDN, use lazy loading
5. **Emoji picker**: Lazy load component on demand

## Accessibility Guarantees

✅ 4.5:1 minimum contrast ratio (WCAG AA)
✅ Keyboard fully navigable
✅ Focus indicators visible
✅ Screen reader compatible
✅ Semantic HTML structure
✅ Icon buttons have titles
✅ Form properly structured

## Browser Support

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Layout | ✅ | ✅ | ✅ | ✅ |
| Colors | ✅ | ✅ | ✅ | ✅ |
| Dark Mode | ✅ | ✅ | ✅ | ✅ |
| Flexbox | ✅ | ✅ | ✅ | ✅ |
| Focus Ring | ✅ | ⚠️* | ✅ | ✅ |

*Firefox may need `:focus-visible` polyfill for full visibility

## Quick Deploy Checklist

```bash
# Before deployment
pnpm build              # ✅ No errors
pnpm lint              # ✅ No issues
npm test               # ✅ All passing (if applicable)

# During deployment
git tag v1.1.0         # Tag release
git push --tags        # Push to prod

# After deployment
# Monitor for 24 hours for issues
# Gather user feedback
# Plan next enhancement
```

## File Reference

| File | Purpose | Lines |
|------|---------|-------|
| `chat-modal.tsx` | Main component | 800 |
| `CHAT_UI_REDESIGN.md` | Design decisions | 300+ |
| `CHAT_REDESIGN_SUMMARY.md` | Visual overview | 250+ |
| `CHAT_UI_DEVELOPER_GUIDE.md` | Developer reference | 400+ |
| `CHAT_UI_COMPARISON.md` | Technical comparison | 350+ |
| `CHAT_UI_TESTING_GUIDE.md` | Testing procedures | 300+ |
| `CHAT_REDESIGN_COMPLETION.md` | Project summary | 400+ |

---

**Quick Reference Version**: 1.0
**Last Updated**: January 2024
**Maintainer**: Frontend Team
**Status**: Ready for Quick Lookup
