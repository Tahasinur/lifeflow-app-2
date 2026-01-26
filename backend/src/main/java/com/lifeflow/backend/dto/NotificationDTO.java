package com.lifeflow.backend.dto;

import com.lifeflow.backend.enums.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationDTO {
    private String id;
    private String recipientId;
    private String actorId;
    private String actorName;
    private String actorAvatar;
    private NotificationType type;
    private String message;
    private String relatedEntityId;
    private String relatedEntityType;
    private Boolean isRead;
    private String createdAt;
    private String readAt;
}
