package com.lifeflow.backend.controller;

import com.lifeflow.backend.dto.NotificationDTO;
import com.lifeflow.backend.services.NotificationService;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * WebSocket Controller for real-time notifications
 * Handles STOMP messages for follow events and notifications
 */
@Controller
public class NotificationWebSocketController {
    
    private static final Logger logger = LoggerFactory.getLogger(NotificationWebSocketController.class);
    
    private final NotificationService notificationService;
    private final SimpMessagingTemplate messagingTemplate;

    public NotificationWebSocketController(
            NotificationService notificationService,
            SimpMessagingTemplate messagingTemplate) {
        this.notificationService = notificationService;
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * Handle follow event and broadcast to followers
     * Message from: /app/follow
     */
    @MessageMapping("/follow")
    public void handleFollowEvent(FollowEventMessage message, Principal principal) {
        try {
            if (principal == null) {
                logger.warn("Unauthorized follow event");
                return;
            }

            String followerId = principal.getName();
            logger.info("Follow event: {} following {}", followerId, message.getFollowingId());

            // Send notification to the followed user
            Map<String, Object> notification = new HashMap<>();
            notification.put("type", "FOLLOW");
            notification.put("followerId", followerId);
            notification.put("followerName", message.getFollowerName());
            notification.put("followerAvatar", message.getFollowerAvatar());
            notification.put("timestamp", System.currentTimeMillis());

            // Send to specific user's queue
            messagingTemplate.convertAndSendToUser(
                message.getFollowingId(),
                "/queue/notifications",
                notification
            );

            // Broadcast to topic for social feed updates
            messagingTemplate.convertAndSend(
                "/topic/social/follows",
                notification
            );

            logger.info("Follow notification sent to user: {}", message.getFollowingId());
        } catch (Exception e) {
            logger.error("Error handling follow event", e);
        }
    }

    /**
     * Handle unfollow event
     * Message from: /app/unfollow
     */
    @MessageMapping("/unfollow")
    public void handleUnfollowEvent(UnfollowEventMessage message, Principal principal) {
        try {
            if (principal == null) {
                logger.warn("Unauthorized unfollow event");
                return;
            }

            String followerId = principal.getName();
            logger.info("Unfollow event: {} unfollowing {}", followerId, message.getFollowingId());

            // Send notification to the unfollowed user
            Map<String, Object> notification = new HashMap<>();
            notification.put("type", "UNFOLLOW");
            notification.put("followerId", followerId);
            notification.put("followerName", message.getFollowerName());
            notification.put("timestamp", System.currentTimeMillis());

            // Send to specific user
            messagingTemplate.convertAndSendToUser(
                message.getFollowingId(),
                "/queue/notifications",
                notification
            );

            // Broadcast to topic
            messagingTemplate.convertAndSend(
                "/topic/social/unfollows",
                notification
            );

            logger.info("Unfollow notification sent to user: {}", message.getFollowingId());
        } catch (Exception e) {
            logger.error("Error handling unfollow event", e);
        }
    }

    /**
     * Get unread notifications for current user
     * Message from: /app/notifications/unread
     * Response sent to: /user/queue/unread
     */
    @MessageMapping("/notifications/unread")
    @SendToUser("/queue/unread")
    public Map<String, Object> getUnreadNotifications(Principal principal) {
        try {
            if (principal == null) {
                Map<String, Object> error = new HashMap<>();
                error.put("error", "Unauthorized");
                return error;
            }

            String userId = principal.getName();
            long unreadCount = notificationService.getUnreadCount(userId);

            Map<String, Object> response = new HashMap<>();
            response.put("userId", userId);
            response.put("unreadCount", unreadCount);
            response.put("timestamp", System.currentTimeMillis());

            logger.info("Unread notifications for user {}: {}", userId, unreadCount);
            return response;
        } catch (Exception e) {
            logger.error("Error getting unread notifications", e);
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            return error;
        }
    }

    /**
     * Subscribe to user notifications
     * Message from: /app/notifications/subscribe
     */
    @MessageMapping("/notifications/subscribe")
    @SendToUser("/queue/subscribed")
    public Map<String, String> subscribeToNotifications(Principal principal) {
        try {
            if (principal == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Unauthorized");
                return error;
            }

            String userId = principal.getName();
            Map<String, String> response = new HashMap<>();
            response.put("status", "subscribed");
            response.put("userId", userId);
            logger.info("User {} subscribed to notifications", userId);
            return response;
        } catch (Exception e) {
            logger.error("Error subscribing to notifications", e);
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return error;
        }
    }

    /**
     * DTO for follow events
     */
    public static class FollowEventMessage {
        private String followingId;
        private String followerName;
        private String followerAvatar;

        // Getters and Setters
        public String getFollowingId() {
            return followingId;
        }

        public void setFollowingId(String followingId) {
            this.followingId = followingId;
        }

        public String getFollowerName() {
            return followerName;
        }

        public void setFollowerName(String followerName) {
            this.followerName = followerName;
        }

        public String getFollowerAvatar() {
            return followerAvatar;
        }

        public void setFollowerAvatar(String followerAvatar) {
            this.followerAvatar = followerAvatar;
        }
    }

    /**
     * DTO for unfollow events
     */
    public static class UnfollowEventMessage {
        private String followingId;
        private String followerName;

        // Getters and Setters
        public String getFollowingId() {
            return followingId;
        }

        public void setFollowingId(String followingId) {
            this.followingId = followingId;
        }

        public String getFollowerName() {
            return followerName;
        }

        public void setFollowerName(String followerName) {
            this.followerName = followerName;
        }
    }
}
