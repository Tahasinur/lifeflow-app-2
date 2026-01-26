package com.lifeflow.backend.controller;

import com.lifeflow.backend.dto.*;
import com.lifeflow.backend.services.MessagingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5000", "http://localhost:5173"})
public class MessagingController {

    @Autowired
    private MessagingService messagingService;

    // Extract userId from JWT token (simplified)
    private Long getUserIdFromToken() {
        // In a real implementation, extract from JWT token
        return 1L; // Default for testing
    }

    // CONVERSATION ENDPOINTS (8 total)

    /**
     * Endpoint 1: GET /api/messages/conversations
     * Get all conversations for current user
     */
    @GetMapping("/conversations")
    public ResponseEntity<List<ConversationDTO>> getConversations() {
        Long userId = getUserIdFromToken();
        List<ConversationDTO> conversations = messagingService.getConversations(userId);
        return ResponseEntity.ok(conversations);
    }

    /**
     * Endpoint 2: GET /api/messages/conversations/preview
     * Get conversation previews
     */
    @GetMapping("/conversations/preview")
    public ResponseEntity<List<ConversationPreviewDTO>> getConversationPreviews() {
        Long userId = getUserIdFromToken();
        List<ConversationPreviewDTO> previews = messagingService.getConversationPreviews(userId);
        return ResponseEntity.ok(previews);
    }

    /**
     * Endpoint 3: GET /api/messages/conversations/:conversationId
     * Get specific conversation by ID
     */
    @GetMapping("/conversations/{conversationId}")
    public ResponseEntity<ConversationDTO> getConversation(@PathVariable String conversationId) {
        Long userId = getUserIdFromToken();
        ConversationDTO conversation = messagingService.getConversation(conversationId, userId);
        return ResponseEntity.ok(conversation);
    }

    /**
     * Endpoint 4: POST /api/messages/conversations/direct
     * Create direct conversation with another user
     */
    @PostMapping("/conversations/direct")
    public ResponseEntity<ConversationDTO> createDirectConversation(
            @RequestBody CreateDirectConversationRequest request) {
        Long userId = getUserIdFromToken();
        Long targetUserId = Long.parseLong(request.getUserId());
        ConversationDTO conversation = messagingService.createDirectConversation(userId, targetUserId);
        return ResponseEntity.status(HttpStatus.CREATED).body(conversation);
    }

    /**
     * Endpoint 5: POST /api/messages/conversations/group
     * Create group conversation
     */
    @PostMapping("/conversations/group")
    public ResponseEntity<ConversationDTO> createGroupConversation(
            @RequestBody CreateGroupConversationRequest request) {
        Long userId = getUserIdFromToken();
        List<Long> participantIds = request.getParticipantIds().stream()
                .map(Long::parseLong)
                .toList();
        ConversationDTO conversation = messagingService.createGroupConversation(
                request.getName(),
                request.getDescription(),
                participantIds,
                userId
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(conversation);
    }

    /**
     * Endpoint 6: PATCH /api/messages/conversations/:conversationId
     * Update conversation details
     */
    @PatchMapping("/conversations/{conversationId}")
    public ResponseEntity<ConversationDTO> updateConversation(
            @PathVariable String conversationId,
            @RequestBody ConversationDTO updates) {
        Long userId = getUserIdFromToken();
        ConversationDTO updated = messagingService.updateConversation(conversationId, userId, updates);
        return ResponseEntity.ok(updated);
    }

    /**
     * Endpoint 7: POST /api/messages/conversations/:conversationId/archive
     * Archive conversation
     */
    @PostMapping("/conversations/{conversationId}/archive")
    public ResponseEntity<Void> archiveConversation(@PathVariable String conversationId) {
        Long userId = getUserIdFromToken();
        messagingService.archiveConversation(conversationId, userId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Endpoint 8: DELETE /api/messages/conversations/:conversationId
     * Delete conversation
     */
    @DeleteMapping("/conversations/{conversationId}")
    public ResponseEntity<Void> deleteConversation(@PathVariable String conversationId) {
        Long userId = getUserIdFromToken();
        messagingService.deleteConversation(conversationId, userId);
        return ResponseEntity.noContent().build();
    }

    // MESSAGE ENDPOINTS (6 total)

    /**
     * Endpoint 9: GET /api/messages/conversations/:conversationId/messages
     * Get messages from a conversation
     */
    @GetMapping("/conversations/{conversationId}/messages")
    public ResponseEntity<List<MessageDTO>> getMessages(
            @PathVariable String conversationId,
            @RequestParam(defaultValue = "50") int limit,
            @RequestParam(defaultValue = "0") int offset) {
        Long userId = getUserIdFromToken();
        List<MessageDTO> messages = messagingService.getMessages(conversationId, userId, limit, offset);
        return ResponseEntity.ok(messages);
    }

    /**
     * Endpoint 10: POST /api/messages/conversations/:conversationId/messages
     * Send message
     */
    @PostMapping("/conversations/{conversationId}/messages")
    public ResponseEntity<MessageDTO> sendMessage(
            @PathVariable String conversationId,
            @RequestBody SendMessageRequest request) {
        Long userId = getUserIdFromToken();
        MessageDTO message = messagingService.sendMessage(conversationId, userId, request.getContent());
        return ResponseEntity.status(HttpStatus.CREATED).body(message);
    }

    /**
     * Endpoint 11: PATCH /api/messages/conversations/:conversationId/messages/:messageId
     * Edit message
     */
    @PatchMapping("/conversations/{conversationId}/messages/{messageId}")
    public ResponseEntity<MessageDTO> editMessage(
            @PathVariable String conversationId,
            @PathVariable String messageId,
            @RequestBody SendMessageRequest request) {
        Long userId = getUserIdFromToken();
        MessageDTO message = messagingService.editMessage(conversationId, messageId, userId, request.getContent());
        return ResponseEntity.ok(message);
    }

    /**
     * Endpoint 12: DELETE /api/messages/conversations/:conversationId/messages/:messageId
     * Delete message
     */
    @DeleteMapping("/conversations/{conversationId}/messages/{messageId}")
    public ResponseEntity<Void> deleteMessage(
            @PathVariable String conversationId,
            @PathVariable String messageId) {
        Long userId = getUserIdFromToken();
        messagingService.deleteMessage(conversationId, messageId, userId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Endpoint 13: POST /api/messages/conversations/:conversationId/read
     * Mark conversation as read
     */
    @PostMapping("/conversations/{conversationId}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable String conversationId) {
        Long userId = getUserIdFromToken();
        messagingService.markAsRead(conversationId, userId);
        return ResponseEntity.noContent().build();
    }

    // REACTION ENDPOINTS (2 total)

    /**
     * Endpoint 14: POST /api/messages/conversations/:conversationId/messages/:messageId/reactions
     * Add reaction to message
     */
    @PostMapping("/conversations/{conversationId}/messages/{messageId}/reactions")
    public ResponseEntity<MessageDTO> addReaction(
            @PathVariable String conversationId,
            @PathVariable String messageId,
            @RequestBody AddReactionRequest request) {
        Long userId = getUserIdFromToken();
        MessageDTO message = messagingService.addReaction(conversationId, messageId, userId, request.getEmoji());
        return ResponseEntity.status(HttpStatus.CREATED).body(message);
    }

    /**
     * Endpoint 15: DELETE /api/messages/conversations/:conversationId/messages/:messageId/reactions/:emoji
     * Remove reaction from message
     */
    @DeleteMapping("/conversations/{conversationId}/messages/{messageId}/reactions/{emoji}")
    public ResponseEntity<MessageDTO> removeReaction(
            @PathVariable String conversationId,
            @PathVariable String messageId,
            @PathVariable String emoji) {
        Long userId = getUserIdFromToken();
        MessageDTO message = messagingService.removeReaction(conversationId, messageId, userId, emoji);
        return ResponseEntity.ok(message);
    }

    // INBOX STATS ENDPOINT (1 total)

    /**
     * Endpoint 16: GET /api/messages/stats
     * Get inbox stats
     */
    @GetMapping("/stats")
    public ResponseEntity<InboxStatsDTO> getInboxStats() {
        Long userId = getUserIdFromToken();
        InboxStatsDTO stats = messagingService.getInboxStats(userId);
        return ResponseEntity.ok(stats);
    }

    // SEARCH ENDPOINT (1 total)

    /**
     * Endpoint 17: GET /api/messages/search
     * Search messages
     */
    @GetMapping("/search")
    public ResponseEntity<List<MessageDTO>> searchMessages(
            @RequestParam(name = "q") String query,
            @RequestParam(required = false) String conversationId) {
        Long userId = getUserIdFromToken();
        List<MessageDTO> results = messagingService.searchMessages(userId, query, conversationId);
        return ResponseEntity.ok(results);
    }
}
