package com.lifeflow.backend.dto;

public class AddReactionRequest {
    private String emoji;

    public AddReactionRequest() {
    }

    public AddReactionRequest(String emoji) {
        this.emoji = emoji;
    }

    public String getEmoji() {
        return emoji;
    }

    public void setEmoji(String emoji) {
        this.emoji = emoji;
    }
}
