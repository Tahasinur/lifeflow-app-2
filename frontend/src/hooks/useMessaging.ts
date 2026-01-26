import { useState, useCallback, useEffect } from 'react';
import { Conversation, ConversationPreview, Message } from '../types';
import { messagingService } from '../services/messagingService';

export function useMessaging() {
  const [conversations, setConversations] = useState<ConversationPreview[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load all conversations
  const loadConversations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await messagingService.getConversationPreviews();
      setConversations(data);
      if (data.length > 0 && !selectedConversationId) {
        setSelectedConversationId(data[0].id);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load conversations';
      setError(message);
      console.error('Failed to load conversations:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedConversationId]);

  // Load messages for selected conversation
  const loadMessages = useCallback(async (conversationId: string) => {
    if (!conversationId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await messagingService.getMessages(conversationId);
      setMessages(data);
      await messagingService.markAsRead(conversationId);
      
      // Update conversation unread count
      setConversations(prev =>
        prev.map(conv =>
          conv.id === conversationId
            ? { ...conv, unreadCount: 0 }
            : conv
        )
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load messages';
      setError(message);
      console.error('Failed to load messages:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Send message
  const sendMessage = useCallback(
    async (conversationId: string, content: string) => {
      try {
        const newMessage = await messagingService.sendMessage(conversationId, content);
        setMessages(prev => [...prev, newMessage]);
        return newMessage;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to send message';
        setError(message);
        throw err;
      }
    },
    []
  );

  // Delete message
  const deleteMessage = useCallback(
    async (conversationId: string, messageId: string) => {
      try {
        await messagingService.deleteMessage(conversationId, messageId);
        setMessages(prev => prev.filter(msg => msg.id !== messageId));
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete message';
        setError(message);
        throw err;
      }
    },
    []
  );

  // Edit message
  const editMessage = useCallback(
    async (conversationId: string, messageId: string, content: string) => {
      try {
        const updated = await messagingService.editMessage(conversationId, messageId, content);
        setMessages(prev =>
          prev.map(msg => (msg.id === messageId ? updated : msg))
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to edit message';
        setError(message);
        throw err;
      }
    },
    []
  );

  // Archive conversation
  const archiveConversation = useCallback(async (conversationId: string) => {
    try {
      await messagingService.archiveConversation(conversationId);
      setConversations(prev => prev.filter(conv => conv.id !== conversationId));
      if (selectedConversationId === conversationId) {
        const remaining = conversations.filter(c => c.id !== conversationId);
        setSelectedConversationId(remaining[0]?.id || null);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to archive conversation';
      setError(message);
      throw err;
    }
  }, [selectedConversationId, conversations]);

  // Create direct conversation
  const createDirectConversation = useCallback(async (userId: string) => {
    try {
      await messagingService.createDirectConversation(userId);
      await loadConversations();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create conversation';
      setError(message);
      throw err;
    }
  }, [loadConversations]);

  // Create group conversation
  const createGroupConversation = useCallback(
    async (name: string, description: string, participantIds: string[]) => {
      try {
        await messagingService.createGroupConversation(name, description, participantIds);
        await loadConversations();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create group';
        setError(message);
        throw err;
      }
    },
    [loadConversations]
  );

  // Add reaction
  const addReaction = useCallback(
    async (conversationId: string, messageId: string, emoji: string) => {
      try {
        await messagingService.addReaction(conversationId, messageId, emoji);
        // Optimistically update local state
        setMessages(prev =>
          prev.map(msg =>
            msg.id === messageId
              ? {
                  ...msg,
                  reactions: [
                    ...(msg.reactions || []),
                    {
                      id: `temp-${Date.now()}`,
                      messageId,
                      userId: 'current-user',
                      emoji,
                      createdAt: new Date().toISOString(),
                    },
                  ],
                }
              : msg
          )
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to add reaction';
        setError(message);
        throw err;
      }
    },
    []
  );

  // Search messages
  const searchMessages = useCallback(async (query: string, conversationId?: string) => {
    try {
      return await messagingService.searchMessages(query, conversationId);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to search messages';
      setError(message);
      throw err;
    }
  }, []);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  return {
    // State
    conversations,
    selectedConversationId,
    messages,
    loading,
    error,

    // Actions
    setSelectedConversationId,
    loadConversations,
    loadMessages,
    sendMessage,
    deleteMessage,
    editMessage,
    archiveConversation,
    createDirectConversation,
    createGroupConversation,
    addReaction,
    searchMessages,
  };
}
