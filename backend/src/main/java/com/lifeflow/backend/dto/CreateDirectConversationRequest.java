package com.lifeflow.backend.dto;

public class CreateDirectConversationRequest {
    private String userId;

    public CreateDirectConversationRequest() {
    }

    public CreateDirectConversationRequest(String userId) {
        this.userId = userId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }
}
