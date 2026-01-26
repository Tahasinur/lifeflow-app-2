package com.lifeflow.backend.dto;

import java.time.LocalDateTime;
import java.util.List;

public class MessageDTO {
    private String id;
    private String conversationId;
    private String senderId;
    private ChatUserDTO sender;
    private String content;
    private List<AttachmentDTO> attachments;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Boolean isEdited;
    private List<MessageReactionDTO> reactions;

    public MessageDTO() {
    }

    public MessageDTO(String id, String conversationId, String senderId, String content) {
        this.id = id;
        this.conversationId = conversationId;
        this.senderId = senderId;
        this.content = content;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getConversationId() {
        return conversationId;
    }

    public void setConversationId(String conversationId) {
        this.conversationId = conversationId;
    }

    public String getSenderId() {
        return senderId;
    }

    public void setSenderId(String senderId) {
        this.senderId = senderId;
    }

    public ChatUserDTO getSender() {
        return sender;
    }

    public void setSender(ChatUserDTO sender) {
        this.sender = sender;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public List<AttachmentDTO> getAttachments() {
        return attachments;
    }

    public void setAttachments(List<AttachmentDTO> attachments) {
        this.attachments = attachments;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Boolean getIsEdited() {
        return isEdited;
    }

    public void setIsEdited(Boolean isEdited) {
        this.isEdited = isEdited;
    }

    public List<MessageReactionDTO> getReactions() {
        return reactions;
    }

    public void setReactions(List<MessageReactionDTO> reactions) {
        this.reactions = reactions;
    }
}
