import { useState, useEffect, useRef } from 'react';
import {
  Search,
  Plus,
  Send,
  MoreVertical,
  Archive,
  Trash2,
  Pin,
  Bell,
  X,
  MessageCircle,
  Users,
  Settings,
  Smile,
  Paperclip,
} from 'lucide-react';
import { toast } from 'sonner';
import { Conversation, ConversationPreview, Message, ChatUser } from '../types';
import { messagingService } from '../services/messagingService';

export function InboxPage() {
  const [conversations, setConversations] = useState<ConversationPreview[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'unread' | 'archived'>('all');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load conversations
  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const data = await messagingService.getConversationPreviews();
      setConversations(data);
      if (data.length > 0 && !selectedConversationId) {
        setSelectedConversationId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  // Load messages for selected conversation
  useEffect(() => {
    if (selectedConversationId) {
      loadMessages();
    }
  }, [selectedConversationId]);

  const loadMessages = async () => {
    if (!selectedConversationId) return;

    try {
      const data = await messagingService.getMessages(selectedConversationId);
      setMessages(data);
      await messagingService.markAsRead(selectedConversationId);
      // Update unread count
      setConversations(prev =>
        prev.map(conv =>
          conv.id === selectedConversationId
            ? { ...conv, unreadCount: 0 }
            : conv
        )
      );
      scrollToBottom();
    } catch (err) {
      console.error('Failed to load messages:', err);
      toast.error('Failed to load messages');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedConversationId) return;

    try {
      const newMessage = await messagingService.sendMessage(selectedConversationId, messageText);
      setMessages(prev => [...prev, newMessage]);
      setMessageText('');
      scrollToBottom();
    } catch (err) {
      console.error('Failed to send message:', err);
      toast.error('Failed to send message');
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!selectedConversationId) return;

    try {
      await messagingService.deleteMessage(selectedConversationId, messageId);
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      toast.success('Message deleted');
    } catch (err) {
      console.error('Failed to delete message:', err);
      toast.error('Failed to delete message');
    }
  };

  const handleArchiveConversation = async (conversationId: string) => {
    try {
      await messagingService.archiveConversation(conversationId);
      setConversations(prev => prev.filter(conv => conv.id !== conversationId));
      if (selectedConversationId === conversationId) {
        setSelectedConversationId(conversations[0]?.id || null);
      }
      toast.success('Conversation archived');
    } catch (err) {
      console.error('Failed to archive conversation:', err);
      toast.error('Failed to archive conversation');
    }
  };

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch =
      conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterTab === 'unread') return matchesSearch && conv.unreadCount > 0;
    if (filterTab === 'archived') return false; // Would need to add isArchived to preview
    return matchesSearch;
  });

  const selectedConversation = conversations.find(c => c.id === selectedConversationId);

  return (
    <div className="flex h-full gap-0 bg-white dark:bg-[#191919]">
      {/* Sidebar - Conversations List */}
      <div className="w-80 border-r border-gray-200 dark:border-[#2F2F2F] flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-[#2F2F2F]">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-2xl font-bold text-[#37352F] dark:text-[#E3E3E3] flex-1">
              Inbox
            </h2>
            <button
              onClick={() => setShowCreateDialog(true)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-[#2F2F2F] rounded-lg transition-colors"
              title="New conversation"
            >
              <Plus className="w-5 h-5 text-[#37352F] dark:text-[#E3E3E3]" />
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 dark:border-[#2F2F2F] rounded-lg bg-white dark:bg-[#191919] text-[#37352F] dark:text-[#E3E3E3] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 px-4 py-3 border-b border-gray-200 dark:border-[#2F2F2F]">
          {['all', 'unread', 'archived'].map(tab => (
            <button
              key={tab}
              onClick={() => setFilterTab(tab as any)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors capitalize ${
                filterTab === tab
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-[#2F2F2F] text-[#37352F] dark:text-[#E3E3E3] hover:bg-gray-200 dark:hover:bg-[#3F3F3F]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full text-gray-400">
              <p>Loading conversations...</p>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-400 p-4 text-center">
              <div>
                <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No conversations yet</p>
              </div>
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {filteredConversations.map(conv => (
                <ConversationItem
                  key={conv.id}
                  conversation={conv}
                  isSelected={selectedConversationId === conv.id}
                  onSelect={() => setSelectedConversationId(conv.id)}
                  onArchive={() => handleArchiveConversation(conv.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-[#2F2F2F] bg-white dark:bg-[#202020]">
              <div className="flex items-center gap-3">
                {selectedConversation.avatar ? (
                  <img
                    src={selectedConversation.avatar}
                    alt={selectedConversation.name}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                    {selectedConversation.name.charAt(0)}
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-[#37352F] dark:text-[#E3E3E3]">
                    {selectedConversation.name}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {selectedConversation.participantCount} participants
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-[#2F2F2F] rounded-lg transition-colors">
                  <Bell className="w-5 h-5 text-[#37352F] dark:text-[#E3E3E3]" />
                </button>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-[#2F2F2F] rounded-lg transition-colors">
                  <MoreVertical className="w-5 h-5 text-[#37352F] dark:text-[#E3E3E3]" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white dark:bg-[#191919]">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map(msg => (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    onDelete={() => handleDeleteMessage(msg.id)}
                  />
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form
              onSubmit={handleSendMessage}
              className="p-4 border-t border-gray-200 dark:border-[#2F2F2F] bg-white dark:bg-[#202020]"
            >
              <div className="flex items-end gap-3">
                <button
                  type="button"
                  className="p-2 hover:bg-gray-100 dark:hover:bg-[#2F2F2F] rounded-lg transition-colors"
                >
                  <Paperclip className="w-5 h-5 text-[#37352F] dark:text-[#E3E3E3]" />
                </button>

                <div className="flex-1 flex items-center gap-2 bg-gray-100 dark:bg-[#2F2F2F] rounded-lg px-3">
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 py-2 bg-transparent text-[#37352F] dark:text-[#E3E3E3] placeholder:text-gray-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    className="p-1.5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    <Smile className="w-5 h-5 text-[#37352F] dark:text-[#E3E3E3]" />
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={!messageText.trim()}
                  className="p-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Select a conversation to start chatting</p>
            </div>
          </div>
        )}
      </div>

      {/* Create Conversation Dialog */}
      {showCreateDialog && (
        <CreateConversationDialog
          onClose={() => setShowCreateDialog(false)}
          onSuccess={() => {
            setShowCreateDialog(false);
            loadConversations();
          }}
        />
      )}
    </div>
  );
}

interface ConversationItemProps {
  conversation: ConversationPreview;
  isSelected: boolean;
  onSelect: () => void;
  onArchive: () => void;
}

function ConversationItem({
  conversation,
  isSelected,
  onSelect,
  onArchive,
}: ConversationItemProps) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div
      onClick={onSelect}
      className={`group p-3 rounded-lg cursor-pointer transition-colors relative ${
        isSelected
          ? 'bg-blue-600 text-white'
          : 'hover:bg-gray-100 dark:hover:bg-[#2F2F2F] text-[#37352F] dark:text-[#E3E3E3]'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div
          className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-sm ${
            isSelected ? 'bg-white text-blue-600' : 'bg-gray-200 dark:bg-[#3F3F3F] text-gray-700 dark:text-gray-400'
          }`}
        >
          {conversation.avatar ? (
            <img
              src={conversation.avatar}
              alt={conversation.name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            conversation.name.charAt(0).toUpperCase()
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-semibold text-sm truncate">{conversation.name}</h4>
            {conversation.unreadCount > 0 && (
              <span className="flex-shrink-0 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                {conversation.unreadCount}
              </span>
            )}
          </div>
          <p className="text-xs opacity-75 truncate mt-0.5">
            {conversation.lastMessageAuthor && `${conversation.lastMessageAuthor}: `}
            {conversation.lastMessage || 'No messages yet'}
          </p>
          <p className="text-xs opacity-60 mt-1">{conversation.lastMessageTime}</p>
        </div>

        {/* Actions */}
        <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className={`p-1 rounded transition-colors ${
              isSelected
                ? 'hover:bg-blue-700'
                : 'hover:bg-gray-200 dark:hover:bg-[#3F3F3F]'
            }`}
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showMenu && (
            <div
              className="absolute right-0 top-full mt-1 bg-white dark:bg-[#2F2F2F] rounded-lg shadow-lg border border-gray-200 dark:border-[#3F3F3F] z-20"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => {
                  onArchive();
                  setShowMenu(false);
                }}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-[#3F3F3F] flex items-center gap-2 transition-colors"
              >
                <Archive className="w-4 h-4" />
                Archive
              </button>
              <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-[#3F3F3F] flex items-center gap-2 transition-colors">
                <Pin className="w-4 h-4" />
                Pin
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface MessageBubbleProps {
  message: Message;
  onDelete: () => void;
}

function MessageBubble({ message, onDelete }: MessageBubbleProps) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="group flex gap-3">
      <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
        {message.sender.name.charAt(0).toUpperCase()}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-sm text-[#37352F] dark:text-[#E3E3E3]">
            {message.sender.name}
          </span>
          <span className="text-xs text-gray-500">
            {new Date(message.createdAt).toLocaleTimeString()}
          </span>
        </div>

        <div className="bg-gray-100 dark:bg-[#2F2F2F] rounded-lg px-3 py-2 text-sm text-[#37352F] dark:text-[#E3E3E3] break-words">
          {message.content}
        </div>

        {message.reactions && message.reactions.length > 0 && (
          <div className="flex gap-1 mt-2 flex-wrap">
            {message.reactions.map(reaction => (
              <span key={reaction.id} className="text-lg">
                {reaction.emoji}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-1 hover:bg-gray-200 dark:hover:bg-[#3F3F3F] rounded transition-colors"
        >
          <MoreVertical className="w-4 h-4 text-gray-500" />
        </button>

        {showMenu && (
          <div className="absolute right-0 mt-1 bg-white dark:bg-[#2F2F2F] rounded-lg shadow-lg border border-gray-200 dark:border-[#3F3F3F] z-20">
            <button
              onClick={() => {
                onDelete();
                setShowMenu(false);
              }}
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-[#3F3F3F] flex items-center gap-2 transition-colors text-red-600"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

interface CreateConversationDialogProps {
  onClose: () => void;
  onSuccess: () => void;
}

function CreateConversationDialog({ onClose, onSuccess }: CreateConversationDialogProps) {
  const [conversationType, setConversationType] = useState<'direct' | 'group'>('direct');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateDirect = async () => {
    if (!recipientEmail.trim()) {
      toast.error('Please enter recipient email');
      return;
    }

    setLoading(true);
    try {
      await messagingService.createDirectConversation(recipientEmail);
      toast.success('Conversation created');
      onSuccess();
    } catch (err) {
      console.error('Failed to create conversation:', err);
      toast.error('Failed to create conversation');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      toast.error('Please enter group name');
      return;
    }

    setLoading(true);
    try {
      await messagingService.createGroupConversation(groupName, groupDescription, []);
      toast.success('Group created');
      onSuccess();
    } catch (err) {
      console.error('Failed to create group:', err);
      toast.error('Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-[#202020] rounded-lg w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-[#2F2F2F]">
          <h3 className="font-semibold text-[#37352F] dark:text-[#E3E3E3]">New Conversation</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-[#2F2F2F] rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Type Selection */}
          <div className="flex gap-4">
            {(['direct', 'group'] as const).map(type => (
              <button
                key={type}
                onClick={() => setConversationType(type)}
                className={`flex-1 py-2 px-3 rounded-lg font-medium text-sm transition-colors capitalize ${
                  conversationType === type
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-[#2F2F2F] text-[#37352F] dark:text-[#E3E3E3]'
                }`}
              >
                {type === 'direct' ? 'Direct Message' : 'Group Chat'}
              </button>
            ))}
          </div>

          {/* Forms */}
          {conversationType === 'direct' ? (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-[#37352F] dark:text-[#E3E3E3] mb-1">
                  Recipient Email
                </label>
                <input
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full px-3 py-2 border border-gray-200 dark:border-[#3F3F3F] rounded-lg bg-white dark:bg-[#191919] text-[#37352F] dark:text-[#E3E3E3] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-[#37352F] dark:text-[#E3E3E3] mb-1">
                  Group Name
                </label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Project Alpha"
                  className="w-full px-3 py-2 border border-gray-200 dark:border-[#3F3F3F] rounded-lg bg-white dark:bg-[#191919] text-[#37352F] dark:text-[#E3E3E3] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#37352F] dark:text-[#E3E3E3] mb-1">
                  Description
                </label>
                <textarea
                  value={groupDescription}
                  onChange={(e) => setGroupDescription(e.target.value)}
                  placeholder="Optional group description"
                  className="w-full px-3 py-2 border border-gray-200 dark:border-[#3F3F3F] rounded-lg bg-white dark:bg-[#191919] text-[#37352F] dark:text-[#E3E3E3] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-2 p-4 border-t border-gray-200 dark:border-[#2F2F2F]">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm font-medium text-[#37352F] dark:text-[#E3E3E3] hover:bg-gray-100 dark:hover:bg-[#2F2F2F] rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={conversationType === 'direct' ? handleCreateDirect : handleCreateGroup}
            disabled={loading}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition-colors"
          >
            {loading ? 'Creating...' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}
