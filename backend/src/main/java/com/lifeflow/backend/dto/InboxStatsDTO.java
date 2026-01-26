package com.lifeflow.backend.dto;

public class InboxStatsDTO {
    private Integer totalUnread;
    private Integer totalConversations;
    private Integer onlineUsers;

    public InboxStatsDTO() {
    }

    public InboxStatsDTO(Integer totalUnread, Integer totalConversations, Integer onlineUsers) {
        this.totalUnread = totalUnread;
        this.totalConversations = totalConversations;
        this.onlineUsers = onlineUsers;
    }

    // Getters and Setters
    public Integer getTotalUnread() {
        return totalUnread;
    }

    public void setTotalUnread(Integer totalUnread) {
        this.totalUnread = totalUnread;
    }

    public Integer getTotalConversations() {
        return totalConversations;
    }

    public void setTotalConversations(Integer totalConversations) {
        this.totalConversations = totalConversations;
    }

    public Integer getOnlineUsers() {
        return onlineUsers;
    }

    public void setOnlineUsers(Integer onlineUsers) {
        this.onlineUsers = onlineUsers;
    }
}
