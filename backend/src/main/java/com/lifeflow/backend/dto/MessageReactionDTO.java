package com.lifeflow.backend.dto;

import java.time.LocalDateTime;

public class MessageReactionDTO {
    private String id;
    private String messageId;
    private String userId;
    private String emoji;
    private LocalDateTime createdAt;

    public MessageReactionDTO() {
    }

    public MessageReactionDTO(String id, String messageId, String userId, String emoji) {
        this.id = id;
        this.messageId = messageId;
        this.userId = userId;
        this.emoji = emoji;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getMessageId() {
        return messageId;
    }

    public void setMessageId(String messageId) {
        this.messageId = messageId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getEmoji() {
        return emoji;
    }

    public void setEmoji(String emoji) {
        this.emoji = emoji;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
