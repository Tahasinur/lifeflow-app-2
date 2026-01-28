package com.lifeflow.backend.controller;

import com.lifeflow.backend.dto.MessageDTO;
import com.lifeflow.backend.dto.SendMessageRequest;
import com.lifeflow.backend.services.MessagingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;

/**
 * WebSocket controller for real-time chat messaging
 * Handles sending and receiving messages via WebSocket for instant delivery
 */
@Controller
public class ChatWebSocketController {

    @Autowired
    private MessagingService messagingService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    /**
     * Handle incoming chat messages via WebSocket
     * Message sent to /app/chat/send/{conversationId}
     * Broadcasts to /topic/conversation/{conversationId}
     */
    @MessageMapping("/chat/send/{conversationId}")
    public void sendMessage(
            @DestinationVariable String conversationId,
            @Payload SendMessageRequest request,
            Principal principal) {

        try {
            // Extract user ID (in production, extract from JWT in principal)
            String userId = "1"; // TODO: Extract from JWT token

            // Save message to database via existing service
            MessageDTO message = messagingService.sendMessage(conversationId, userId, request.getContent());

            // Broadcast to all participants in the conversation
            messagingTemplate.convertAndSend(
                    "/topic/conversation/" + conversationId,
                    message);

        } catch (Exception e) {
            // Log error and send error message back to sender
            System.err.println("Error sending message: " + e.getMessage());
        }
    }

    /**
     * Handle typing indicator
     * Message sent to /app/chat/typing/{conversationId}
     */
    @MessageMapping("/chat/typing/{conversationId}")
    public void userTyping(
            @DestinationVariable String conversationId,
            @Payload TypingIndicator indicator,
            Principal principal) {

        // Broadcast typing indicator to conversation participants
        messagingTemplate.convertAndSend(
                "/topic/conversation/" + conversationId + "/typing",
                indicator);
    }

    /**
     * Inner class for typing indicator payload
     */
    public static class TypingIndicator {
        private String userId;
        private String userName;
        private boolean isTyping;

        public TypingIndicator() {
        }

        public String getUserId() {
            return userId;
        }

        public void setUserId(String userId) {
            this.userId = userId;
        }

        public String getUserName() {
            return userName;
        }

        public void setUserName(String userName) {
            this.userName = userName;
        }

        public boolean isTyping() {
            return isTyping;
        }

        public void setTyping(boolean typing) {
            isTyping = typing;
        }
    }
}
