export interface Block {
  id: string;
  type: 'text' | 'heading1' | 'heading2' | 'heading3' | 'bulletList' | 'numberList' | 'todo' | 'quote' | 'toggle' | 'divider' | 'callout' | 'image' | 'code';
  content: string;
  checked?: boolean; // for todo items
  isOpen?: boolean; // for toggle items
  indent?: number; // for nested blocks
  language?: string; // for code blocks
}

export interface Page {
  id: string;
  title: string;
  icon: string;
  blocks: Block[];
  editorContent?: any;
  content?: string;
  createdAt: string;
  updatedAt: string;
  isDeleted?: boolean;
  deletedAt?: string;
  parentId?: string | null;
  coverImage?: string | null;
  isFavorite?: boolean;
  isLocked?: boolean;
}

export interface User {
  id: number;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token?: string;
  email: string;
  name: string;
  role: string;
  userId?: number;
  message: string;
}

export interface AuthRequest {
  email: string;
  password: string;
  name?: string;
}

export interface FeedUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

export interface FeedItem {
  id: string;
  title: string;
  description: string;
  author: FeedUser;
  type: 'template' | 'blog' | 'workspace_update';
  likes: number;
  tags: string[];
  sourcePageId?: string;
  commentCount: number;
  createdAt: string;
}

export interface Comment {
  id: string;
  text: string;
  author: FeedUser;
  createdAt: string;
}

// Chat/Messaging System Types
export interface ChatUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status: 'online' | 'offline' | 'away';
  lastSeen?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  sender: ChatUser;
  content: string;
  attachments?: Attachment[];
  createdAt: string;
  updatedAt: string;
  isEdited?: boolean;
  reactions?: MessageReaction[];
}

export interface Attachment {
  id: string;
  messageId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  uploadedAt: string;
}

export interface MessageReaction {
  id: string;
  messageId: string;
  userId: string;
  emoji: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  type: 'direct' | 'group' | 'team';
  name?: string; // For group/team conversations
  description?: string;
  avatar?: string;
  participants: ChatUser[];
  lastMessage?: Message;
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
  unreadCount: number;
  muteNotifications?: boolean;
  isPinned?: boolean;
  isArchived?: boolean;
  creatorId?: string;
}

export interface ConversationPreview {
  id: string;
  name: string;
  avatar?: string;
  lastMessage?: string;
  lastMessageAuthor?: string;
  lastMessageTime?: string;
  unreadCount: number;
  participantCount: number;
  isPinned: boolean;
}

export interface InboxStats {
  totalUnread: number;
  totalConversations: number;
  onlineUsers: number;
}
