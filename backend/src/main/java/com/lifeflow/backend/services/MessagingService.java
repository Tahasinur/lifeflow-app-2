package com.lifeflow.backend.services;

import com.lifeflow.backend.dto.*;
import com.lifeflow.backend.model.*;
import com.lifeflow.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class MessagingService {

    @Autowired
    private ConversationRepository conversationRepository;

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private ConversationParticipantRepository participantRepository;

    @Autowired
    private ConversationReadRepository readRepository;

    @Autowired
    private MessageReactionRepository reactionRepository;

    @Autowired
    private UserRepository userRepository;

    // CONVERSATION OPERATIONS

    public List<ConversationDTO> getConversations(String userId) {
        List<Conversation> conversations = conversationRepository.findByUserId(userId);
        return conversations.stream()
                .map(this::convertToConversationDTO)
                .collect(Collectors.toList());
    }

    public List<ConversationPreviewDTO> getConversationPreviews(String userId) {
        List<Conversation> conversations = conversationRepository.findByUserId(userId);
        return conversations.stream()
                .map(c -> convertToPreviewDTO(c, userId))
                .collect(Collectors.toList());
    }

    public ConversationDTO getConversation(String conversationId, String userId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));

        // Verify user is participant
        verifyUserIsParticipant(conversationId, userId);

        return convertToConversationDTO(conversation);
    }

    public ConversationDTO createDirectConversation(String userId, String targetUserId) {
        // Check if direct conversation already exists
        Conversation existing = conversationRepository.findDirectConversation(userId, targetUserId);
        if (existing != null) {
            return convertToConversationDTO(existing);
        }

        Conversation conversation = new Conversation("direct", userId);
        Conversation saved = conversationRepository.save(conversation);

        // Add participants
        participantRepository.save(new ConversationParticipant(saved, userId));
        participantRepository.save(new ConversationParticipant(saved, targetUserId));

        return convertToConversationDTO(saved);
    }

    public ConversationDTO createGroupConversation(String name, String description, List<String> participantIds,
            String creatorId) {
        Conversation conversation = new Conversation("group", creatorId);
        conversation.setName(name);
        conversation.setDescription(description);
        Conversation saved = conversationRepository.save(conversation);

        // Add all participants including creator
        Set<String> allParticipants = new HashSet<>(participantIds);
        allParticipants.add(creatorId);

        for (String participantId : allParticipants) {
            participantRepository.save(new ConversationParticipant(saved, participantId));
        }

        return convertToConversationDTO(saved);
    }

    public ConversationDTO updateConversation(String conversationId, String userId, ConversationDTO updates) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));

        // Only creator can update
        if (!conversation.getCreatorId().equals(userId)) {
            throw new RuntimeException("Only conversation creator can update");
        }

        if (updates.getName() != null) {
            conversation.setName(updates.getName());
        }
        if (updates.getDescription() != null) {
            conversation.setDescription(updates.getDescription());
        }
        if (updates.getAvatar() != null) {
            conversation.setAvatar(updates.getAvatar());
        }

        conversation.setUpdatedAt(LocalDateTime.now());
        Conversation saved = conversationRepository.save(conversation);

        return convertToConversationDTO(saved);
    }

    public void archiveConversation(String conversationId, String userId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));

        verifyUserIsParticipant(conversationId, userId);

        conversation.setIsArchived(true);
        conversation.setUpdatedAt(LocalDateTime.now());
        conversationRepository.save(conversation);
    }

    public void deleteConversation(String conversationId, String userId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));

        verifyUserIsParticipant(conversationId, userId);

        conversationRepository.delete(conversation);
    }

    // MESSAGE OPERATIONS

    public List<MessageDTO> getMessages(String conversationId, String userId, int limit, int offset) {
        verifyUserIsParticipant(conversationId, userId);

        Pageable pageable = PageRequest.of(offset / limit, limit);
        Page<Message> messages = messageRepository.findByConversationIdOrderByCreatedAtDesc(conversationId, pageable);

        return messages.getContent().stream()
                .map(this::convertToMessageDTO)
                .collect(Collectors.toList());
    }

    public MessageDTO sendMessage(String conversationId, String userId, String content) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));

        verifyUserIsParticipant(conversationId, userId);

        if (content == null || content.trim().isEmpty()) {
            throw new RuntimeException("Message content cannot be empty");
        }

        Message message = new Message();
        message.setConversation(conversation);
        message.setSenderId(userId);
        message.setContent(content);
        message.setCreatedAt(LocalDateTime.now());
        message.setUpdatedAt(LocalDateTime.now());

        Message saved = messageRepository.save(message);

        // Update conversation last message time
        conversation.setLastMessageAt(LocalDateTime.now());
        conversation.setUpdatedAt(LocalDateTime.now());
        conversationRepository.save(conversation);

        return convertToMessageDTO(saved);
    }

    public MessageDTO editMessage(String conversationId, String messageId, String userId, String newContent) {
        verifyUserIsParticipant(conversationId, userId);

        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));

        if (!message.getSenderId().equals(userId)) {
            throw new RuntimeException("Only message sender can edit");
        }

        message.setContent(newContent);
        message.setIsEdited(true);
        message.setUpdatedAt(LocalDateTime.now());

        Message updated = messageRepository.save(message);
        return convertToMessageDTO(updated);
    }

    public void deleteMessage(String conversationId, String messageId, String userId) {
        verifyUserIsParticipant(conversationId, userId);

        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));

        if (!message.getSenderId().equals(userId)) {
            throw new RuntimeException("Only message sender can delete");
        }

        messageRepository.delete(message);
    }

    public void markAsRead(String conversationId, String userId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));

        verifyUserIsParticipant(conversationId, userId);

        Optional<ConversationRead> existing = readRepository.findByConversationIdAndUserId(conversationId, userId);

        if (existing.isPresent()) {
            ConversationRead read = existing.get();
            read.setLastReadAt(LocalDateTime.now());
            readRepository.save(read);
        } else {
            ConversationRead read = new ConversationRead(conversation, userId);
            readRepository.save(read);
        }
    }

    // REACTION OPERATIONS

    public MessageDTO addReaction(String conversationId, String messageId, String userId, String emoji) {
        verifyUserIsParticipant(conversationId, userId);

        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));

        Optional<MessageReaction> existing = reactionRepository.findByMessageIdAndUserIdAndEmoji(messageId, userId,
                emoji);

        if (existing.isEmpty()) {
            MessageReaction reaction = new MessageReaction(message, userId, emoji);
            reactionRepository.save(reaction);
        }

        Message updated = messageRepository.findById(messageId).get();
        return convertToMessageDTO(updated);
    }

    public MessageDTO removeReaction(String conversationId, String messageId, String userId, String emoji) {
        verifyUserIsParticipant(conversationId, userId);

        Optional<MessageReaction> reaction = reactionRepository.findByMessageIdAndUserIdAndEmoji(messageId, userId,
                emoji);

        if (reaction.isPresent()) {
            reactionRepository.delete(reaction.get());
        }

        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));
        return convertToMessageDTO(message);
    }

    // SEARCH

    public List<MessageDTO> searchMessages(String userId, String query, String conversationId) {
        List<Message> results;

        if (conversationId != null && !conversationId.isEmpty()) {
            verifyUserIsParticipant(conversationId, userId);
            results = messageRepository.searchMessages(conversationId, query);
        } else {
            results = messageRepository.searchAllMessages(query);
        }

        return results.stream()
                .map(this::convertToMessageDTO)
                .collect(Collectors.toList());
    }

    // STATS

    public InboxStatsDTO getInboxStats(String userId) {
        List<Conversation> conversations = conversationRepository.findByUserId(userId);

        int totalUnread = 0;
        for (Conversation conv : conversations) {
            Optional<ConversationRead> read = readRepository.findByConversationIdAndUserId(conv.getId(), userId);
            if (read.isEmpty() && !conv.getMessages().isEmpty()) {
                totalUnread += conv.getMessages().size();
            }
        }

        return new InboxStatsDTO(totalUnread, conversations.size(), 0);
    }

    // HELPER METHODS

    private void verifyUserIsParticipant(String conversationId, String userId) {
        Optional<ConversationParticipant> participant = participantRepository
                .findByConversationIdAndUserId(conversationId, userId);
        if (participant.isEmpty()) {
            throw new RuntimeException("User is not a participant of this conversation");
        }
    }

    private ConversationDTO convertToConversationDTO(Conversation conversation) {
        ConversationDTO dto = new ConversationDTO();
        dto.setId(conversation.getId());
        dto.setType(conversation.getType());
        dto.setName(conversation.getName());
        dto.setDescription(conversation.getDescription());
        dto.setAvatar(conversation.getAvatar());
        dto.setCreatorId(conversation.getCreatorId());
        dto.setIsArchived(conversation.getIsArchived());
        dto.setCreatedAt(conversation.getCreatedAt());
        dto.setUpdatedAt(conversation.getUpdatedAt());
        dto.setLastMessageAt(conversation.getLastMessageAt());
        dto.setUnreadCount(0);

        // Set participants
        List<ChatUserDTO> participants = conversation.getParticipants().stream()
                .map(p -> convertToChatUserDTO(p.getUserId()))
                .collect(Collectors.toList());
        dto.setParticipants(participants);

        // Set last message
        if (!conversation.getMessages().isEmpty()) {
            Message lastMsg = conversation.getMessages().stream()
                    .max(Comparator.comparing(Message::getCreatedAt))
                    .orElse(null);
            if (lastMsg != null) {
                dto.setLastMessage(convertToMessageDTO(lastMsg));
            }
        }

        return dto;
    }

    private ConversationPreviewDTO convertToPreviewDTO(Conversation conversation, String currentUserId) {
        ConversationPreviewDTO dto = new ConversationPreviewDTO();
        dto.setId(conversation.getId());

        // Resolve conversation name
        if ("direct".equals(conversation.getType())) {
            // Find the other participant
            String partnerId = conversation.getParticipants().stream()
                    .map(ConversationParticipant::getUserId)
                    .filter(id -> !id.equals(currentUserId))
                    .findFirst()
                    .orElse(null);

            if (partnerId != null) {
                userRepository.findById(partnerId).ifPresent(user -> {
                    dto.setName(user.getName());
                    dto.setAvatar(user.getAvatar());
                });
            } else {
                dto.setName("Direct Message");
            }
        } else {
            dto.setName(conversation.getName() != null ? conversation.getName() : "Group Chat");
            dto.setAvatar(conversation.getAvatar());
        }

        dto.setParticipantCount(conversation.getParticipants().size());
        dto.setIsPinned(false);
        dto.setUnreadCount(0);

        if (!conversation.getMessages().isEmpty()) {
            Message lastMsg = conversation.getMessages().stream()
                    .max(Comparator.comparing(Message::getCreatedAt))
                    .orElse(null);
            if (lastMsg != null) {
                dto.setLastMessage(lastMsg.getContent());

                // Resolve last message author name
                String authorName = userRepository.findById(lastMsg.getSenderId())
                        .map(User::getName)
                        .orElse("Unknown");
                dto.setLastMessageAuthor(authorName);

                dto.setLastMessageTime(lastMsg.getCreatedAt().toString());
            }
        }

        return dto;
    }

    private MessageDTO convertToMessageDTO(Message message) {
        MessageDTO dto = new MessageDTO();
        dto.setId(message.getId());
        dto.setConversationId(message.getConversation().getId());
        dto.setSenderId(message.getSenderId());
        dto.setSender(convertToChatUserDTO(message.getSenderId()));
        dto.setContent(message.getContent());
        dto.setCreatedAt(message.getCreatedAt());
        dto.setUpdatedAt(message.getUpdatedAt());
        dto.setIsEdited(message.getIsEdited());

        // Convert reactions
        List<MessageReactionDTO> reactions = message.getReactions().stream()
                .map(r -> {
                    MessageReactionDTO rDto = new MessageReactionDTO();
                    rDto.setId(r.getId());
                    rDto.setMessageId(r.getMessage().getId());
                    rDto.setUserId(r.getUserId());
                    rDto.setEmoji(r.getEmoji());
                    rDto.setCreatedAt(r.getCreatedAt());
                    return rDto;
                })
                .collect(Collectors.toList());
        dto.setReactions(reactions);

        // Convert attachments
        List<AttachmentDTO> attachments = message.getAttachments().stream()
                .map(a -> {
                    AttachmentDTO aDto = new AttachmentDTO();
                    aDto.setId(a.getId());
                    aDto.setMessageId(a.getMessage().getId());
                    aDto.setFileName(a.getFileName());
                    aDto.setFileType(a.getFileType());
                    aDto.setFileSize(a.getFileSize());
                    aDto.setFileUrl(a.getFileUrl());
                    aDto.setUploadedAt(a.getUploadedAt());
                    return aDto;
                })
                .collect(Collectors.toList());
        dto.setAttachments(attachments);

        return dto;
    }

    private ChatUserDTO convertToChatUserDTO(String userId) {
        return userRepository.findById(userId)
                .map(user -> {
                    ChatUserDTO dto = new ChatUserDTO();
                    dto.setId(user.getId());
                    dto.setName(user.getName());
                    dto.setEmail(user.getEmail());
                    dto.setAvatar(user.getAvatar());
                    dto.setStatus("online");
                    return dto;
                })
                .orElseGet(() -> {
                    ChatUserDTO dto = new ChatUserDTO();
                    dto.setId(userId);
                    dto.setName("Unknown User");
                    dto.setStatus("offline");
                    return dto;
                });
    }
}
