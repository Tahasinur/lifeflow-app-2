package com.lifeflow.backend.event;

import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.security.Principal;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * WebSocket Event Handler
 * Manages user connection and disconnection events
 */
@Component
public class WebSocketEventHandler {
    
    private static final Logger logger = LoggerFactory.getLogger(WebSocketEventHandler.class);
    
    private final SimpMessagingTemplate messagingTemplate;
    
    // Track online users: userId -> sessionId
    private final Map<String, String> connectedUsers = new ConcurrentHashMap<>();

    public WebSocketEventHandler(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * Handle user connection event
     */
    @EventListener
    public void handleWebSocketConnectListener(SessionConnectedEvent event) {
        try {
            Principal principal = event.getUser();
            String sessionId = event.getMessage().getHeaders().get("simpSessionId", String.class);
            
            if (principal != null) {
                String userId = principal.getName();
                connectedUsers.put(userId, sessionId);
                logger.info("User connected: {} with session: {}", userId, sessionId);
                
                // Notify others that user is online
                broadcastUserStatus(userId, "online");
            }
        } catch (Exception e) {
            logger.error("Error handling WebSocket connect", e);
        }
    }

    /**
     * Handle user disconnection event
     */
    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        try {
            Principal principal = event.getUser();
            String sessionId = event.getMessage().getHeaders().get("simpSessionId", String.class);
            
            if (principal != null) {
                String userId = principal.getName();
                connectedUsers.remove(userId);
                logger.info("User disconnected: {} from session: {}", userId, sessionId);
                
                // Notify others that user is offline
                broadcastUserStatus(userId, "offline");
            }
        } catch (Exception e) {
            logger.error("Error handling WebSocket disconnect", e);
        }
    }

    /**
     * Check if a user is online
     */
    public boolean isUserOnline(String userId) {
        return connectedUsers.containsKey(userId);
    }

    /**
     * Get all connected users
     */
    public Map<String, String> getConnectedUsers() {
        return new ConcurrentHashMap<>(connectedUsers);
    }

    /**
     * Broadcast user status to all connected clients
     */
    private void broadcastUserStatus(String userId, String status) {
        try {
            Map<String, String> statusUpdate = new ConcurrentHashMap<>();
            statusUpdate.put("userId", userId);
            statusUpdate.put("status", status);
            
            messagingTemplate.convertAndSend("/topic/users/status", statusUpdate);
        } catch (Exception e) {
            logger.error("Error broadcasting user status", e);
        }
    }
}
