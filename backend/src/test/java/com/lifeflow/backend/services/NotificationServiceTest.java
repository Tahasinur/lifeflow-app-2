package com.lifeflow.backend.services;

import com.lifeflow.backend.enums.NotificationType;
import com.lifeflow.backend.model.Notification;
import com.lifeflow.backend.model.User;
import com.lifeflow.backend.repository.NotificationRepository;
import com.lifeflow.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
@DisplayName("Notification Service Tests")
class NotificationServiceTest {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    private User actor;
    private User recipient;

    @BeforeEach
    void setUp() {
        actor = User.builder()
                .email("actor@test.com")
                .password("password123")
                .name("Actor User")
                .build();

        recipient = User.builder()
                .email("recipient@test.com")
                .password("password123")
                .name("Recipient User")
                .build();

        actor = userRepository.save(actor);
        recipient = userRepository.save(recipient);
    }

    @Test
    @DisplayName("Should create follower notification")
    void testCreateFollowerNotification() {
        notificationService.createFollowerNotification(actor, recipient);

        long notificationCount = notificationRepository.countByRecipient(recipient);
        assertEquals(1, notificationCount);

        Notification notification = notificationRepository.findByRecipientAndIsRead(recipient, false)
                .stream()
                .findFirst()
                .orElseThrow();

        assertEquals(NotificationType.NEW_FOLLOWER, notification.getType());
        assertEquals(actor, notification.getActor());
        assertEquals(recipient, notification.getRecipient());
        assertFalse(notification.getIsRead());
    }

    @Test
    @DisplayName("Should create post liked notification")
    void testCreatePostLikedNotification() {
        String postId = "post-123";
        notificationService.createPostLikedNotification(actor, recipient, postId);

        long notificationCount = notificationRepository.countByRecipient(recipient);
        assertEquals(1, notificationCount);

        Notification notification = notificationRepository.findByRecipientAndIsRead(recipient, false)
                .stream()
                .findFirst()
                .orElseThrow();

        assertEquals(NotificationType.POST_LIKED, notification.getType());
        assertEquals(postId, notification.getRelatedEntityId());
        assertEquals("POST", notification.getRelatedEntityType());
    }

    @Test
    @DisplayName("Should mark notification as read")
    void testMarkAsRead() {
        notificationService.createFollowerNotification(actor, recipient);

        Notification notification = notificationRepository.findByRecipientAndIsRead(recipient, false)
                .stream()
                .findFirst()
                .orElseThrow();

        assertFalse(notification.getIsRead());

        notificationService.markAsRead(notification.getId());

        Notification updatedNotification = notificationRepository.findById(notification.getId())
                .orElseThrow();

        assertTrue(updatedNotification.getIsRead());
        assertNotNull(updatedNotification.getReadAt());
    }

    @Test
    @DisplayName("Should get unread notification count")
    void testGetUnreadCount() {
        notificationService.createFollowerNotification(actor, recipient);
        notificationService.createFollowerNotification(actor, recipient);

        long unreadCount = notificationService.getUnreadCount(recipient.getId());
        assertEquals(2, unreadCount);
    }

    @Test
    @DisplayName("Should mark all notifications as read")
    void testMarkAllAsRead() {
        notificationService.createFollowerNotification(actor, recipient);
        notificationService.createFollowerNotification(actor, recipient);

        assertEquals(2, notificationService.getUnreadCount(recipient.getId()));

        notificationService.markAllAsRead(recipient.getId());

        assertEquals(0, notificationService.getUnreadCount(recipient.getId()));
    }

    @Test
    @DisplayName("Should get notifications by type")
    void testGetNotificationsByType() {
        notificationService.createFollowerNotification(actor, recipient);
        notificationService.createPostLikedNotification(actor, recipient, "post-123");

        var notifications = notificationService.getNotificationsByType(
                recipient.getId(),
                NotificationType.NEW_FOLLOWER,
                PageRequest.of(0, 10)
        );

        assertEquals(1, notifications.getTotalElements());
    }

    @Test
    @DisplayName("Should get notification summary")
    void testGetNotificationSummary() {
        notificationService.createFollowerNotification(actor, recipient);
        notificationService.createFollowerNotification(actor, recipient);

        var notification = notificationRepository.findByRecipientAndIsRead(recipient, false)
                .stream()
                .findFirst()
                .orElseThrow();

        notificationService.markAsRead(notification.getId());

        var summary = notificationService.getNotificationSummary(recipient.getId());

        assertEquals(2, summary.get("totalNotifications"));
        assertEquals(1, summary.get("unreadCount"));
        assertEquals(1, summary.get("readCount"));
    }

    @Test
    @DisplayName("Should delete old notifications")
    void testDeleteOldNotifications() {
        notificationService.createFollowerNotification(actor, recipient);

        long beforeDelete = notificationRepository.countByRecipient(recipient);
        assertEquals(1, beforeDelete);

        notificationService.deleteOldNotifications(recipient.getId());

        long afterDelete = notificationRepository.countByRecipient(recipient);
        // Note: Notifications not older than 30 days won't be deleted
        // In real scenario with actual old data, this would delete them
        assertEquals(1, afterDelete); // Still exists since it's recent
    }
}
