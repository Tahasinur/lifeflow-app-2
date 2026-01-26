package com.lifeflow.backend.services;

import com.lifeflow.backend.model.FeedItem;
import com.lifeflow.backend.model.User;
import com.lifeflow.backend.repository.FollowRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service to handle notification triggers for user engagement
 */
@Service
@Transactional
public class NotificationTriggerService {
    
    private final NotificationService notificationService;
    private final FollowRepository followRepository;
    
    public NotificationTriggerService(NotificationService notificationService, FollowRepository followRepository) {
        this.notificationService = notificationService;
        this.followRepository = followRepository;
    }
    
    /**
     * Trigger notifications when a user creates a new post
     */
    public void triggerNewPostNotifications(User postAuthor, String postId) {
        // Get all users following this author
        List<User> followers = followRepository.findByFollowing(postAuthor)
                .stream()
                .filter(f -> !f.getIsMuted())
                .map(f -> f.getFollower())
                .toList();
        
        // Send notification to each follower
        for (User follower : followers) {
            notificationService.createNewPostNotification(postAuthor, postId, follower);
        }
    }
    
    /**
     * Trigger notification when a post is liked
     */
    public void triggerPostLikedNotification(User liker, User postAuthor, String postId) {
        if (!liker.getId().equals(postAuthor.getId())) {
            notificationService.createPostLikedNotification(liker, postAuthor, postId);
        }
    }
    
    /**
     * Trigger notification when a post is commented on
     */
    public void triggerPostCommentedNotification(User commenter, User postAuthor, String postId, String commentId) {
        if (!commenter.getId().equals(postAuthor.getId())) {
            notificationService.createPostCommentedNotification(commenter, postAuthor, postId, commentId);
        }
    }
    
    /**
     * Trigger notification when a comment is replied to
     */
    public void triggerCommentRepliedNotification(User replier, User commentAuthor, String postId, String commentId) {
        if (!replier.getId().equals(commentAuthor.getId())) {
            notificationService.createCommentRepliedNotification(replier, commentAuthor, postId, commentId);
        }
    }
    
    /**
     * Trigger notification when a user is mentioned
     */
    public void triggerMentionNotification(User mentioner, User mentionedUser, String postId) {
        if (!mentioner.getId().equals(mentionedUser.getId())) {
            notificationService.createMentionNotification(mentioner, mentionedUser, postId, "");
        }
    }
}
