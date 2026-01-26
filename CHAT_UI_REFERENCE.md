# Chat System UI Reference Guide

## Layout Overview

```
┌────────────────────────────────────────────────────────────────┐
│                        Inbox - Chat System                      │
├─────────────────────────────┬──────────────────────────────────┤
│                             │                                  │
│ SIDEBAR                     │     MAIN CHAT AREA               │
│ (w-80)                      │     (flex-1)                     │
│                             │                                  │
│ ┌────────────────────────┐  │ ┌──────────────────────────────┐ │
│ │ Inbox          [+]     │  │ │ Conversation Name    [...]   │ │
│ ├────────────────────────┤  │ ├──────────────────────────────┤ │
│ │ 🔍 Search...           │  │ │                              │ │
│ ├────────────────────────┤  │ │                              │ │
│ │ [All] [Unread] [Arch]  │  │ │   MESSAGE AREA               │ │
│ ├────────────────────────┤  │ │   (scrollable)               │ │
│ │                        │  │ │                              │ │
│ │ [👤] Chat Name         │  │ │ [Avatar] User Name           │ │
│ │      "Last message.."  │  │ │ "Your message"               │ │
│ │      2 min ago    [2]  │  │ │                              │ │
│ │                        │  │ │ [Avatar] Other User          │ │
│ │ [👥] Project Team      │  │ │ "Their reply"                │ │
│ │      "Sarah: Hi all.." │  │ │ 👍 😂 ❤️                      │ │
│ │      5 min ago         │  │ │                              │ │
│ │                        │  │ ├──────────────────────────────┤ │
│ │ [👤] Design Collab     │  │ │ [📎] [💬] Type message... [😊][→] │
│ │      "Got it thanks"   │  │ │                              │ │
│ │      1 hour ago    [5] │  │ │                              │ │
│ │                        │  │ │                              │ │
│ └────────────────────────┘  │ │                              │ │
│                             │ └──────────────────────────────┘ │
└─────────────────────────────┴──────────────────────────────────┘
```

## Color Palette

### Light Mode
```
Primary Background:   #FFFFFF (white)
Secondary Background: #F5F5F5 (gray-100)
Text Primary:         #37352F (dark gray)
Text Secondary:       #9B9A97 (medium gray)
Hover Background:     #E8E8E6 (gray-200)
Border:               #E0DDD9 (gray-200)
Accent:               #0066FF (blue-600)
Success:              #34A853 (green)
Danger:               #D33B27 (red-600)
```

### Dark Mode
```
Primary Background:   #191919 (almost black)
Secondary Background: #202020 (slightly lighter)
Tertiary Background:  #2F2F2F (light gray-dark)
Hover Background:     #3F3F3F (lighter gray-dark)
Text Primary:         #E3E3E3 (very light gray)
Text Secondary:       #A0A0A0 (medium gray)
Border:               #2F2F2F
Accent:               #4A90FF (lighter blue)
```

## Component States

### Conversation Item (Sidebar)

#### Default
```
┌─────────────────────────────┐
│ [👤] Chat Name              │
│      Last message preview   │
│      2 minutes ago          │
└─────────────────────────────┘
```

#### Selected
```
┌─────────────────────────────┐
│ [👤] Chat Name              │ ← Blue background
│      Last message preview   │
│      2 minutes ago          │
└─────────────────────────────┘
```

#### With Unread Count
```
┌─────────────────────────────┐
│ [👤] Chat Name          [2] │ ← Red badge
│      Last message preview   │
│      2 minutes ago          │
└─────────────────────────────┘
```

#### Hover (Shows Menu)
```
┌─────────────────────────────┐
│ [👤] Chat Name         [...] │ ← Menu button appears
│      Last message preview   │
│      2 minutes ago          │
└─────────────────────────────┘
```

### Message Bubble

#### Own Message
```
                            ┌──────────────────────┐
                            │ Your message content │ ← Light background
                            │ 2:30 PM              │
                            └──────────────────────┘
                            👍 😂 ❤️  [...]
```

#### Other's Message
```
┌────────────────────────────┐
│ User Name    2:30 PM       │
│ Their message content      │ ← Light gray background
└────────────────────────────┘
👍 😂 ❤️
```

### Message Input Area

```
┌──────────────────────────────────────────────────┐
│ [📎] [💬 Your message...] [😊] [→]              │
└──────────────────────────────────────────────────┘
```

- 📎 (Paperclip): Attachment button
- 💬 (Input): Message text field
- 😊 (Emoji): Emoji picker (prepared)
- → (Send): Send button (disabled if empty)

## Typography

### Font Sizes
- **Title/Header**: 20px (text-2xl), font-bold
- **Section Header**: 16px (text-lg), font-semibold
- **Normal Text**: 14px (text-sm), font-medium
- **Small Text**: 12px (text-xs), font-normal
- **Caption**: 10px (text-xs), opacity-60

### Font Weights
- Headings: 700 (bold)
- Labels: 600 (semibold)
- Body: 400 (normal)

## Spacing Grid

```
1px    - borders
2px    - small gaps
4px    - p-1 (tight spacing)
8px    - p-2 (standard spacing)
12px   - p-3 (comfortable spacing)
16px   - p-4 (generous spacing)
24px   - p-6 (section spacing)
32px   - p-8 (major section spacing)
```

## Icon System

All icons from Lucide React:
- Search: 🔍
- Plus: ➕
- Inbox: 📥
- Send: ➡️
- MoreVertical: ⋮
- Archive: 📦
- Trash: 🗑️
- Pin: 📌
- Bell: 🔔
- X: ❌
- MessageCircle: 💬
- Users: 👥
- Settings: ⚙️
- Paperclip: 📎
- Smile: 😊

Icon sizes:
- Navigation: 20px
- Sidebar items: 16px
- Buttons: 16-20px
- Message actions: 16px

## Responsive Behavior

### Desktop (>1024px)
- Sidebar: 320px fixed width (w-80)
- Main area: Flexible, fills remaining space
- Font sizes: Full, no scaling

### Tablet (768px - 1024px)
- Sidebar: 280px (adjusts if needed)
- Main area: Flexible
- Same layout, slightly compressed

### Mobile (<768px)
- Sidebar: Hidden or collapsed
- Full screen chat view
- Touch-friendly button sizes
- Larger padding for taps

## Dialog/Modal Styling

```
┌────────────────────────────────┐
│ New Conversation        [X]    │ Header with close
├────────────────────────────────┤
│                                │
│ [Direct Message] [Group Chat]  │ Type selector
│                                │
│ Email: [____________]          │ Input field
│                                │
├────────────────────────────────┤
│ [Cancel]           [Create]    │ Action buttons
└────────────────────────────────┘
```

Overlay: 50% black (bg-black/50)
Modal: White/Dark theme background
Max width: 448px (max-w-md)

## Action Buttons

### Primary Button (Send, Create)
```
┌──────────────┐
│    Create    │ ← Blue background, white text
└──────────────┘
Width: Full or flex
Height: 40px (py-2 px-4)
```

### Secondary Button (Cancel, Close)
```
┌──────────────┐
│    Cancel    │ ← Light background, dark text
└──────────────┘
```

### Icon Button (Menu, More, etc)
```
[⋮]  ← Hover background on dark/light color
```

## Status Indicators

### Unread Badge
```
┌─────────────┐
│ Chat  [12]  │ ← Red/blue small rounded badge
└─────────────┘
```

### Online Status
```
[🟢] User Online    ← Green dot indicator
[🔵] User Away      ← Blue dot indicator
[⚪] User Offline   ← Gray dot indicator
```

### Loading State
```
"Loading conversations..."  ← Gray text, centered
```

### Empty State
```
    💬
"No conversations yet"      ← Centered, icon + text
"Start the conversation!"   ← Secondary text
```

## Animations & Transitions

### Hover Effects
```
Background: 150ms ease
Color: 150ms ease
Transform: 150ms ease
```

### Scroll Behavior
```
Smooth scroll to bottom on message send
No scroll snap
Auto-scroll for new messages (prepared)
```

### Modal Transitions
```
Fade in/out: 200ms ease
Dialog: Scale + fade
Smooth open/close
```

## Accessibility Features

### Color Contrast
- Text on light: 4.5:1 contrast ratio (WCAG AA)
- Text on dark: 4.5:1 contrast ratio (WCAG AA)
- Interactive elements clearly visible

### Interactive Elements
- Minimum 44x44px touch targets
- Proper focus states with ring
- Keyboard navigation support
- ARIA labels on icon buttons

### Semantic HTML
```
<button> for interactive elements
<input> for text input
<div role="tablist"> for tab groups
<ul> for lists
Proper heading hierarchy
```

## Theme-Specific Adjustments

### Light Mode
- Text colors are darker (#37352F)
- Backgrounds are lighter (white, light grays)
- Shadows are subtle
- Borders are light gray

### Dark Mode
- Text colors are lighter (#E3E3E3)
- Backgrounds are very dark (#191919)
- Shadows are less visible
- Borders match dark theme (#2F2F2F)
- Blue accent slightly lighter for visibility

## Visual Hierarchy

1. **Most Important**: Selected conversation, current message
2. **Important**: Conversation names, message content
3. **Secondary**: Timestamps, author names
4. **Tertiary**: Unread counts, status indicators
5. **Least Important**: Timestamps, status text

## Edge Cases & States

### Empty Inbox
```
    💬
"Select a conversation
 to start chatting"
```

### Loading Messages
```
"Loading messages..." (spinning indicator)
```

### Network Error
```
❌ "Failed to send message"
   [Retry]
```

### Message Reactions
```
👍 😂 ❤️ 🔥 😭 🎉  [+]
Emojis show count below hover
```

## File Paths for Reference

- Colors: Tailwind config in `tailwind.config.js`
- Icons: `lucide-react` package
- Main component: `frontend/src/pages/InboxPage.tsx`
- Styles: Inline Tailwind classes
- Dark mode: Use `dark:` prefix utilities
