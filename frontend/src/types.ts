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
  createdAt: string;
  updatedAt: string;
  isDeleted?: boolean;
  deletedAt?: string;
  parentId?: string | null;
  coverImage?: string | null;
  isFavorite?: boolean;
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
