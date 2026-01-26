# Chat & Messaging System Documentation

## Overview
A complete chat and messaging system for the Lifeflow application, enabling real-time communication between users and team members. The system includes direct messaging, group conversations, message reactions, search functionality, and conversation management.

## Architecture

### Frontend Structure

#### Components
- **InboxPage.tsx** - Main chat interface with conversation list and message view
  - Displays all user conversations in a sidebar
  - Shows selected conversation messages in main area
  - Includes message composition and send functionality
  - Supports conversation creation (direct and group)
  - Features: search, filtering, archive, pin conversations

- **Subcomponents within InboxPage**:
  - `ConversationItem` - Individual conversation preview in sidebar
  - `MessageBubble` - Renders individual messages with reactions
  - `CreateConversationDialog` - Modal for creating new conversations

#### Services
- **messagingService.ts** - API client for all messaging operations
  - 22 methods covering conversations, messages, and reactions
  - Handles Bearer token authentication
  - RESTful API calls to backend endpoints

#### Hooks
- **useMessaging.ts** - State management for messaging feature
  - Manages conversation list, selected conversation, messages
  - Provides callbacks for all messaging operations
  - Handles loading and error states

#### Types (in types.ts)
```typescript
ChatUser: User profile with status and last seen
Message: Individual message with reactions and attachments
Attachment: File attachments in messages
MessageReaction: Emoji reactions on messages
Conversation: Full conversation object with metadata
ConversationPreview: Lightweight conversation for list display
InboxStats: Inbox overview statistics
```

### Backend Integration

#### API Endpoints (RESTful)

**Conversations:**
- `GET /api/conversations` - List all conversations
- `GET /api/conversations/previews` - List conversations with preview data
- `GET /api/conversations/:id` - Get specific conversation
- `POST /api/conversations/direct/:userId` - Create direct conversation
- `POST /api/conversations/group` - Create group conversation
- `PATCH /api/conversations/:id` - Update conversation settings
- `POST /api/conversations/:id/archive` - Archive conversation
- `DELETE /api/conversations/:id` - Delete conversation

**Messages:**
- `GET /api/conversations/:id/messages` - Get messages (paginated)
- `POST /api/conversations/:id/messages` - Send message
- `PATCH /api/conversations/:id/messages/:messageId` - Edit message
- `DELETE /api/conversations/:id/messages/:messageId` - Delete message
- `POST /api/conversations/:id/messages/:messageId/read` - Mark as read

**Reactions:**
- `POST /api/conversations/:id/messages/:messageId/reactions` - Add emoji reaction
- `DELETE /api/conversations/:id/messages/:messageId/reactions/:emoji` - Remove reaction

**Search & Stats:**
- `GET /api/inbox/stats` - Get inbox statistics (unread count, online users)
- `GET /api/messages/search` - Search messages globally or in conversation

### Data Models

#### Message
```typescript
interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  sender: ChatUser;
  content: string;
  attachments?: Attachment[];
  createdAt: string;
  updatedAt: string;
  isEdited: boolean;
  reactions?: MessageReaction[];
}
```

#### Conversation
```typescript
interface Conversation {
  id: string;
  type: 'direct' | 'group';
  name: string;
  description?: string;
  avatar?: string;
  participants: ChatUser[];
  lastMessage?: Message;
  createdAt: string;
  unreadCount: number;
  muteNotifications: boolean;
  isPinned: boolean;
  isArchived: boolean;
}
```

#### ConversationPreview (for list display)
```typescript
interface ConversationPreview {
  id: string;
  name: string;
  avatar?: string;
  lastMessage?: string;
  lastMessageAuthor?: string;
  lastMessageTime: string;
  unreadCount: number;
  participantCount: number;
  isPinned: boolean;
}
```

## Feature Set

### Messaging Features
✅ **Direct Messaging** - One-to-one conversations
✅ **Group Chats** - Multi-participant group conversations
✅ **Message Reactions** - Emoji reactions on messages
✅ **Message Editing** - Edit sent messages
✅ **Message Deletion** - Delete own messages (soft delete on server)
✅ **Unread Tracking** - Track and display unread message counts
✅ **Message Search** - Search across all messages or within conversations
✅ **Attachments** - Support for file attachments (prepared in types)

### Conversation Management
✅ **Conversation Archiving** - Archive conversations without deleting
✅ **Conversation Pinning** - Pin important conversations to top
✅ **Conversation Muting** - Mute notifications from conversations
✅ **Conversation Search** - Search conversations by name
✅ **Unread Filtering** - Filter to show only unread conversations
✅ **Participant Management** - View and manage conversation participants

### UI Features
✅ **Dark Mode Support** - Full dark mode theming
✅ **Responsive Design** - Works on desktop and tablet
✅ **Online Status** - Visual indicators for user online status
✅ **Last Seen** - Show when users were last active
✅ **Typing Indicators** - Show when users are typing (prepared)
✅ **Read Receipts** - Mark messages as read (prepared)
✅ **Timestamps** - Show message send times
✅ **Conversation Avatars** - Group and user avatars

## Usage

### Basic Integration

#### In App Router
```typescript
import { InboxPage } from './pages/InboxPage';

<Route path="inbox" element={<InboxPage />} />
```

#### Using Messaging Hook
```typescript
import { useMessaging } from '../hooks/useMessaging';

function MyComponent() {
  const {
    conversations,
    selectedConversationId,
    messages,
    sendMessage,
    deleteMessage,
    archiveConversation,
  } = useMessaging();

  // Use these in your component
}
```

#### Using Messaging Service Directly
```typescript
import { messagingService } from '../services/messagingService';

// Get conversations
const convos = await messagingService.getConversationPreviews();

// Send message
const msg = await messagingService.sendMessage(conversationId, 'Hello!');

// Add reaction
await messagingService.addReaction(conversationId, messageId, '👍');
```

## UI Components Breakdown

### InboxPage Layout
```
┌─────────────────────────────────────────┐
│ Sidebar (w-80)        │ Chat Area       │
├───────────────────────┼─────────────────┤
│ Header + Create       │ Chat Header     │
├───────────────────────┼─────────────────┤
│ Search + Filters      │                 │
├───────────────────────┤ Messages        │
│ Conversations List    │                 │
│ (scrollable)          │                 │
├───────────────────────┼─────────────────┤
│                       │ Message Input   │
└───────────────────────┴─────────────────┘
```

### Color Scheme (Tailwind + Dark Mode)
- **Light Mode**: 
  - Background: white
  - Text: #37352F (dark gray)
  - Hover: gray-100
  - Accent: blue-600

- **Dark Mode**:
  - Background: #191919 (main), #202020 (secondary), #2F2F2F (tertiary)
  - Text: #E3E3E3 (light gray)
  - Hover: #2F2F2F, #3F3F3F
  - Accent: blue-600

## Performance Considerations

### Optimization Strategies
1. **Message Pagination** - Load messages in batches (limit, offset)
2. **Conversation Previews** - Lightweight data for list display
3. **Lazy Loading** - Load full messages only when conversation selected
4. **Memoization** - React memo for conversation and message items
5. **Virtual Scrolling** - For large message lists (future enhancement)

### Network Optimization
- Batch API calls where possible
- Use message.getMessages(limit: 50) to paginate large conversations
- Search API supports filtering by conversation to reduce data transfer

## Future Enhancements

### Real-time Features (WebSocket Integration)
- Live message delivery
- Typing indicators
- Online status updates
- Read receipts
- Message delivery confirmations

### Advanced Features
- Voice/video calling
- Message forwarding
- Message pinning
- Conversation threading/replies
- Rich text formatting (mentions, links, code blocks)
- File preview and download
- Message read status per user
- Custom emoji reactions with image upload

### UI Enhancements
- Message grouping by date
- Conversation categories/folders
- Advanced search filters
- Bulk conversation actions
- Message starring/bookmarking
- User presence sidebar (who's online)

## Styling Notes

All components follow Lifeflow's design system:
- **Font**: System fonts with fallback
- **Spacing**: Tailwind scale (px, 2px, 4px, 8px, 12px, etc.)
- **Radius**: 4px (rounded-lg) for primary, 0px for none
- **Shadows**: Standard Tailwind shadows for dropdowns
- **Transitions**: 150ms ease for hover states
- **Dark Mode**: Consistent with app's dark theme

## Authentication

All API requests include Bearer token:
```typescript
Authorization: Bearer {token from localStorage}
```

Token stored at: `localStorage.getItem('lifeflow-token')`

## Error Handling

All methods throw errors that should be caught:
```typescript
try {
  await messagingService.sendMessage(conversationId, content);
} catch (err) {
  console.error('Failed to send message:', err);
  toast.error('Failed to send message');
}
```

## Testing Checklist

- [ ] Create direct message conversation
- [ ] Create group conversation
- [ ] Send message in conversation
- [ ] Edit message
- [ ] Delete message
- [ ] Add emoji reaction
- [ ] Mark conversation as read
- [ ] Archive conversation
- [ ] Search conversations
- [ ] Search messages
- [ ] Dark mode switching
- [ ] Mobile responsiveness
- [ ] Network error handling

## File Structure

```
frontend/src/
├── pages/
│   └── InboxPage.tsx          # Main chat interface
├── services/
│   └── messagingService.ts     # API client
├── hooks/
│   └── useMessaging.ts         # State management
├── types.ts                     # Type definitions (updated)
└── App.tsx                      # Router (updated with /inbox)
```

## Notes

- The system is built to be extensible for future WebSocket integration
- Message pagination is prepared for large conversation histories
- Attachment types are defined but UI implementation is prepared for future enhancement
- Online status and typing indicators have type definitions ready for real-time integration
