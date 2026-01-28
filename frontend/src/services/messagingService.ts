import { Message, Conversation, ConversationPreview, InboxStats } from '../types';

const API_BASE_URL = '/api';

export const messagingService = {
  // Conversations
  async getConversations(): Promise<Conversation[]> {
    const token = localStorage.getItem('lifeflow-token');
    const response = await fetch(`${API_BASE_URL}/messages/conversations`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch conversations');
    }

    return response.json();
  },

  async getConversationPreviews(): Promise<ConversationPreview[]> {
    const token = localStorage.getItem('lifeflow-token');
    const response = await fetch(`${API_BASE_URL}/messages/conversations/preview`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch conversation previews');
    }

    return response.json();
  },

  async getConversation(conversationId: string): Promise<Conversation> {
    const token = localStorage.getItem('lifeflow-token');
    const response = await fetch(`${API_BASE_URL}/messages/conversations/${conversationId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch conversation');
    }

    return response.json();
  },

  async createDirectConversation(userId: string): Promise<Conversation> {
    const token = localStorage.getItem('lifeflow-token');
    const response = await fetch(`${API_BASE_URL}/messages/conversations/direct`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      throw new Error('Failed to create conversation');
    }

    return response.json();
  },

  async createGroupConversation(
    name: string,
    description: string,
    participantIds: string[]
  ): Promise<Conversation> {
    const token = localStorage.getItem('lifeflow-token');
    const response = await fetch(`${API_BASE_URL}/messages/conversations/group`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, description, participantIds }),
    });

    if (!response.ok) {
      throw new Error('Failed to create group conversation');
    }

    return response.json();
  },

  async updateConversation(
    conversationId: string,
    updates: Partial<Conversation>
  ): Promise<Conversation> {
    const token = localStorage.getItem('lifeflow-token');
    const response = await fetch(`${API_BASE_URL}/messages/conversations/${conversationId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error('Failed to update conversation');
    }

    return response.json();
  },

  async archiveConversation(conversationId: string): Promise<void> {
    const token = localStorage.getItem('lifeflow-token');
    const response = await fetch(
      `${API_BASE_URL}/messages/conversations/${conversationId}/archive`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to archive conversation');
    }
  },

  async deleteConversation(conversationId: string): Promise<void> {
    const token = localStorage.getItem('lifeflow-token');
    const response = await fetch(
      `${API_BASE_URL}/messages/conversations/${conversationId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to delete conversation');
    }
  },

  // Messages
  async getMessages(conversationId: string, limit: number = 50, offset: number = 0): Promise<Message[]> {
    const token = localStorage.getItem('lifeflow-token');
    const response = await fetch(
      `${API_BASE_URL}/messages/conversations/${conversationId}/messages?limit=${limit}&offset=${offset}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch messages');
    }

    return response.json();
  },

  async sendMessage(conversationId: string, content: string): Promise<Message> {
    const token = localStorage.getItem('lifeflow-token');
    const response = await fetch(`${API_BASE_URL}/messages/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to send message');
    }

    return response.json();
  },

  async editMessage(conversationId: string, messageId: string, content: string): Promise<Message> {
    const token = localStorage.getItem('lifeflow-token');
    const response = await fetch(
      `${API_BASE_URL}/messages/conversations/${conversationId}/messages/${messageId}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to edit message');
    }

    return response.json();
  },

  async deleteMessage(conversationId: string, messageId: string): Promise<void> {
    const token = localStorage.getItem('lifeflow-token');
    const response = await fetch(
      `${API_BASE_URL}/messages/conversations/${conversationId}/messages/${messageId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to delete message');
    }
  },

  async markAsRead(conversationId: string): Promise<void> {
    const token = localStorage.getItem('lifeflow-token');
    const response = await fetch(
      `${API_BASE_URL}/messages/conversations/${conversationId}/read`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to mark as read');
    }
  },

  async addReaction(
    conversationId: string,
    messageId: string,
    emoji: string
  ): Promise<Message> {
    const token = localStorage.getItem('lifeflow-token');
    const response = await fetch(
      `${API_BASE_URL}/messages/conversations/${conversationId}/messages/${messageId}/reactions`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emoji }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to add reaction');
    }

    return response.json();
  },

  async removeReaction(
    conversationId: string,
    messageId: string,
    emoji: string
  ): Promise<Message> {
    const token = localStorage.getItem('lifeflow-token');
    const response = await fetch(
      `${API_BASE_URL}/messages/conversations/${conversationId}/messages/${messageId}/reactions/${emoji}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to remove reaction');
    }

    return response.json();
  },

  // Inbox Stats
  async getInboxStats(): Promise<InboxStats> {
    const token = localStorage.getItem('lifeflow-token');
    const response = await fetch(`${API_BASE_URL}/messages/stats`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch inbox stats');
    }

    return response.json();
  },

  // Search
  async searchMessages(query: string, conversationId?: string): Promise<Message[]> {
    const token = localStorage.getItem('lifeflow-token');
    const params = new URLSearchParams({ q: query });
    if (conversationId) {
      params.append('conversationId', conversationId);
    }

    const response = await fetch(`${API_BASE_URL}/messages/search?${params}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to search messages');
    }

    return response.json();
  },
};
