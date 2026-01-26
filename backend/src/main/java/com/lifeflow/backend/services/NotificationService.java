package com.lifeflow.backend.services;

import com.lifeflow.backend.dto.NotificationDTO;
import com.lifeflow.backend.model.Notification;
import com.lifeflow.backend.model.User;
import com.lifeflow.backend.repository.NotificationRepository;
import com.lifeflow.backend.repository.UserRepository;
import com.lifeflow.backend.enums.NotificationType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class NotificationService {
    
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    
    public NotificationService(NotificationRepository notificationRepository, UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }
    
    /**
     * Create a new follower notification
     */
    public void createFollowerNotification(User follower, User following) {
        Notification notification = Notification.builder()
                .recipient(following)
                .actor(follower)
                .type(NotificationType.NEW_FOLLOWER)
                .message(follower.getName() + " started following you")
                .relatedEntityId(follower.getId())
                .relatedEntityType("USER")
                .isRead(false)
                .build();
        
        notificationRepository.save(notification);
    }
    
    /**
     * Create a new post notification for all followers
     */
    public void createNewPostNotifications(User author, String postId) {
        // This will be triggered by feed service when a post is created
        // For now, we'll implement a placeholder
    }
    
    /**
     * Create a new post notification for a specific user
     */
    public void createNewPostNotification(User postAuthor, String postId, User follower) {
        Notification notification = Notification.builder()
                .recipient(follower)
                .actor(postAuthor)
                .type(NotificationType.NEW_POST_FROM_FOLLOWING)
                .message(postAuthor.getName() + " posted something new")
                .relatedEntityId(postId)
                .relatedEntityType("POST")
                .isRead(false)
                .build();
        
        notificationRepository.save(notification);
    }
    
    /**
     * Create a post liked notification
     */
    public void createPostLikedNotification(User liker, User postAuthor, String postId) {
        Notification notification = Notification.builder()
                .recipient(postAuthor)
                .actor(liker)
                .type(NotificationType.POST_LIKED)
                .message(liker.getName() + " liked your post")
                .relatedEntityId(postId)
                .relatedEntityType("POST")
                .isRead(false)
                .build();
        
        notificationRepository.save(notification);
    }
    
    /**
     * Create a post commented notification
     */
    public void createPostCommentedNotification(User commenter, User postAuthor, String postId, String commentId) {
        Notification notification = Notification.builder()
                .recipient(postAuthor)
                .actor(commenter)
                .type(NotificationType.POST_COMMENTED)
                .message(commenter.getName() + " commented on your post")
                .relatedEntityId(postId)
                .relatedEntityType("COMMENT")
                .isRead(false)
                .build();
        
        notificationRepository.save(notification);
    }
    
    /**
     * Create a comment replied notification
     */
    public void createCommentRepliedNotification(User replier, User commentAuthor, String postId, String commentId) {
        Notification notification = Notification.builder()
                .recipient(commentAuthor)
                .actor(replier)
                .type(NotificationType.COMMENT_REPLIED)
                .message(replier.getName() + " replied to your comment")
                .relatedEntityId(commentId)
                .relatedEntityType("COMMENT_REPLY")
                .isRead(false)
                .build();
        
        notificationRepository.save(notification);
    }
    
    /**
     * Create a mention notification
     */
    public void createMentionNotification(User mentioner, User mentionedUser, String postId, String context) {
        Notification notification = Notification.builder()
                .recipient(mentionedUser)
                .actor(mentioner)
                .type(NotificationType.MENTION)
                .message(mentioner.getName() + " mentioned you")
                .relatedEntityId(postId)
                .relatedEntityType("POST")
                .isRead(false)
                .build();
        
        notificationRepository.save(notification);
    }
    
    /**
     * Get all notifications for a user
     */
    public Page<NotificationDTO> getNotifications(String userId, Pageable pageable) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("User not found");
        }
        
        Page<Notification> notifications = notificationRepository.findByRecipientOrderByCreatedAtDesc(userOpt.get(), pageable);
        return notifications.map(this::convertToDTO);
    }
    
    /**
     * Get unread notifications for a user
     */
    public Page<NotificationDTO> getUnreadNotifications(String userId, Pageable pageable) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("User not found");
        }
        
        Page<Notification> notifications = notificationRepository.findByRecipientAndIsReadOrderByCreatedAtDesc(userOpt.get(), false, pageable);
        return notifications.map(this::convertToDTO);
    }
    
    /**
     * Get notifications by type
     */
    public Page<NotificationDTO> getNotificationsByType(String userId, NotificationType type, Pageable pageable) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("User not found");
        }
        
        Page<Notification> notifications = notificationRepository.findByRecipientAndTypeOrderByCreatedAtDesc(userOpt.get(), type, pageable);
        return notifications.map(this::convertToDTO);
    }
    
    /**
     * Get unread notification count
     */
    public long getUnreadCount(String userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("User not found");
        }
        
        return notificationRepository.countByRecipientAndIsRead(userOpt.get(), false);
    }
    
    /**
     * Mark notification as read
     */
    public void markAsRead(String notificationId) {
        Optional<Notification> notificationOpt = notificationRepository.findById(notificationId);
        if (notificationOpt.isPresent()) {
            Notification notification = notificationOpt.get();
            notification.setIsRead(true);
            notification.setReadAt(LocalDateTime.now());
            notificationRepository.save(notification);
        }
    }
    
    /**
     * Mark all notifications as read for a user
     */
    public void markAllAsRead(String userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            notificationRepository.markAllAsRead(userOpt.get());
        }
    }
    
    /**
     * Delete a notification
     */
    public void deleteNotification(String notificationId) {
        notificationRepository.deleteById(notificationId);
    }
    
    /**
     * Delete all old notifications for a user (older than 30 days)
     */
    public void deleteOldNotifications(String userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
            notificationRepository.deleteOldNotifications(userOpt.get(), thirtyDaysAgo);
        }
    }
    
    /**
     * Get notification summary for dashboard
     */
    public Map<String, Object> getNotificationSummary(String userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("User not found");
        }
        
        User user = userOpt.get();
        long totalNotifications = notificationRepository.countByRecipient(user);
        long unreadCount = notificationRepository.countByRecipientAndIsRead(user, false);
        
        return java.util.Map.of(
            "totalNotifications", totalNotifications,
            "unreadCount", unreadCount,
            "readCount", totalNotifications - unreadCount
        );
    }
    
    /**
     * Convert Notification entity to DTO
     */
    private NotificationDTO convertToDTO(Notification notification) {
        return NotificationDTO.builder()
                .id(notification.getId())
                .recipientId(notification.getRecipient().getId())
                .actorId(notification.getActor().getId())
                .actorName(notification.getActor().getName())
                .actorAvatar(notification.getActor().getAvatar())
                .type(notification.getType())
                .message(notification.getMessage())
                .relatedEntityId(notification.getRelatedEntityId())
                .relatedEntityType(notification.getRelatedEntityType())
                .isRead(notification.getIsRead())
                .createdAt(notification.getCreatedAt().toString())
                .readAt(notification.getReadAt() != null ? notification.getReadAt().toString() : null)
                .build();
    }
}
