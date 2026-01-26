package com.lifeflow.backend.enums;

public enum NotificationType {
    NEW_FOLLOWER("new_follower"),
    NEW_POST_FROM_FOLLOWING("new_post_from_following"),
    POST_LIKED("post_liked"),
    POST_COMMENTED("post_commented"),
    COMMENT_REPLIED("comment_replied"),
    MESSAGE_RECEIVED("message_received"),
    FOLLOW_ACCEPTED("follow_accepted"),
    MENTION("mention"),
    ENGAGEMENT("engagement");
    
    private final String value;
    
    NotificationType(String value) {
        this.value = value;
    }
    
    public String getValue() {
        return value;
    }
}
