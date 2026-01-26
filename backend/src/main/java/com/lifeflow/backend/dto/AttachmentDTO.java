package com.lifeflow.backend.dto;

import java.time.LocalDateTime;

public class AttachmentDTO {
    private String id;
    private String messageId;
    private String fileName;
    private String fileType;
    private Long fileSize;
    private String fileUrl;
    private LocalDateTime uploadedAt;

    public AttachmentDTO() {
    }

    public AttachmentDTO(String id, String messageId, String fileName, String fileType) {
        this.id = id;
        this.messageId = messageId;
        this.fileName = fileName;
        this.fileType = fileType;
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

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getFileType() {
        return fileType;
    }

    public void setFileType(String fileType) {
        this.fileType = fileType;
    }

    public Long getFileSize() {
        return fileSize;
    }

    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }

    public String getFileUrl() {
        return fileUrl;
    }

    public void setFileUrl(String fileUrl) {
        this.fileUrl = fileUrl;
    }

    public LocalDateTime getUploadedAt() {
        return uploadedAt;
    }

    public void setUploadedAt(LocalDateTime uploadedAt) {
        this.uploadedAt = uploadedAt;
    }
}
