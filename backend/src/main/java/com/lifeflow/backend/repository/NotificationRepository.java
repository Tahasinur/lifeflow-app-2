package com.lifeflow.backend.repository;

import com.lifeflow.backend.model.Notification;
import com.lifeflow.backend.model.User;
import com.lifeflow.backend.enums.NotificationType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, String> {
    
    Page<Notification> findByRecipientOrderByCreatedAtDesc(User recipient, Pageable pageable);
    
    Page<Notification> findByRecipientAndIsReadOrderByCreatedAtDesc(User recipient, Boolean isRead, Pageable pageable);
    
    Page<Notification> findByRecipientAndTypeOrderByCreatedAtDesc(User recipient, NotificationType type, Pageable pageable);
    
    long countByRecipientAndIsRead(User recipient, Boolean isRead);
    
    long countByRecipient(User recipient);
    
    List<Notification> findByRecipientAndIsRead(User recipient, Boolean isRead);
    
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true, n.readAt = CURRENT_TIMESTAMP WHERE n.recipient = :recipient AND n.isRead = false")
    void markAllAsRead(@Param("recipient") User recipient);
    
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true, n.readAt = CURRENT_TIMESTAMP WHERE n.id = :notificationId")
    void markAsRead(@Param("notificationId") String notificationId);
    
    @Modifying
    @Query("DELETE FROM Notification n WHERE n.recipient = :recipient AND n.createdAt < :beforeDate")
    void deleteOldNotifications(@Param("recipient") User recipient, @Param("beforeDate") LocalDateTime beforeDate);
    
    @Query("SELECT n FROM Notification n WHERE n.recipient = :recipient AND n.actor = :actor AND n.type = :type ORDER BY n.createdAt DESC")
    List<Notification> findRecentNotificationsByActorAndType(
        @Param("recipient") User recipient,
        @Param("actor") User actor,
        @Param("type") NotificationType type
    );
}
