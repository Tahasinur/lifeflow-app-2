package com.lifeflow.backend.services;

import com.lifeflow.backend.dto.FollowDTO;
import com.lifeflow.backend.model.Follow;
import com.lifeflow.backend.model.User;
import com.lifeflow.backend.repository.FollowRepository;
import com.lifeflow.backend.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class FollowService {
    
    private final FollowRepository followRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    
    public FollowService(FollowRepository followRepository, UserRepository userRepository, NotificationService notificationService) {
        this.followRepository = followRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }
    
    /**
     * Follow a user
     */
    public Follow followUser(String followerId, String followingId) {
        Optional<User> followerOpt = userRepository.findById(followerId);
        Optional<User> followingOpt = userRepository.findById(followingId);
        
        if (followerOpt.isEmpty() || followingOpt.isEmpty()) {
            throw new IllegalArgumentException("User not found");
        }
        
        if (followerId.equals(followingId)) {
            throw new IllegalArgumentException("Cannot follow yourself");
        }
        
        User follower = followerOpt.get();
        User following = followingOpt.get();
        
        // Check if already following
        if (followRepository.existsByFollowerAndFollowing(follower, following)) {
            throw new IllegalArgumentException("Already following this user");
        }
        
        Follow follow = Follow.builder()
                .follower(follower)
                .following(following)
                .isMuted(false)
                .build();
        
        Follow saved = followRepository.save(follow);
        
        // Trigger notification for new follower
        notificationService.createFollowerNotification(follower, following);
        
        return saved;
    }
    
    /**
     * Unfollow a user
     */
    public void unfollowUser(String followerId, String followingId) {
        Optional<User> followerOpt = userRepository.findById(followerId);
        Optional<User> followingOpt = userRepository.findById(followingId);
        
        if (followerOpt.isEmpty() || followingOpt.isEmpty()) {
            throw new IllegalArgumentException("User not found");
        }
        
        User follower = followerOpt.get();
        User following = followingOpt.get();
        
        Optional<Follow> followOpt = followRepository.findByFollowerAndFollowing(follower, following);
        if (followOpt.isPresent()) {
            followRepository.delete(followOpt.get());
        }
    }
    
    /**
     * Mute a user
     */
    public Follow muteUser(String followerId, String followingId) {
        Optional<User> followerOpt = userRepository.findById(followerId);
        Optional<User> followingOpt = userRepository.findById(followingId);
        
        if (followerOpt.isEmpty() || followingOpt.isEmpty()) {
            throw new IllegalArgumentException("User not found");
        }
        
        User follower = followerOpt.get();
        User following = followingOpt.get();
        
        Optional<Follow> followOpt = followRepository.findByFollowerAndFollowing(follower, following);
        if (followOpt.isEmpty()) {
            throw new IllegalArgumentException("Not following this user");
        }
        
        Follow follow = followOpt.get();
        follow.setIsMuted(true);
        follow.setMutedAt(LocalDateTime.now());
        
        return followRepository.save(follow);
    }
    
    /**
     * Unmute a user
     */
    public Follow unmuteUser(String followerId, String followingId) {
        Optional<User> followerOpt = userRepository.findById(followerId);
        Optional<User> followingOpt = userRepository.findById(followingId);
        
        if (followerOpt.isEmpty() || followingOpt.isEmpty()) {
            throw new IllegalArgumentException("User not found");
        }
        
        User follower = followerOpt.get();
        User following = followingOpt.get();
        
        Optional<Follow> followOpt = followRepository.findByFollowerAndFollowing(follower, following);
        if (followOpt.isEmpty()) {
            throw new IllegalArgumentException("Not following this user");
        }
        
        Follow follow = followOpt.get();
        follow.setIsMuted(false);
        follow.setMutedAt(null);
        
        return followRepository.save(follow);
    }
    
    /**
     * Check if user is following another user
     */
    public boolean isFollowing(String followerId, String followingId) {
        Optional<User> followerOpt = userRepository.findById(followerId);
        Optional<User> followingOpt = userRepository.findById(followingId);
        
        if (followerOpt.isEmpty() || followingOpt.isEmpty()) {
            return false;
        }
        
        return followRepository.existsByFollowerAndFollowing(followerOpt.get(), followingOpt.get());
    }
    
    /**
     * Get all followers of a user
     */
    public Page<FollowDTO> getFollowers(String userId, Pageable pageable) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("User not found");
        }
        
        User user = userOpt.get();
        Page<Follow> followers = followRepository.findByFollowing(user, pageable);
        
        return followers.map(this::convertToDTO);
    }
    
    /**
     * Get all users that a user is following
     */
    public Page<FollowDTO> getFollowing(String userId, Pageable pageable) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("User not found");
        }
        
        User user = userOpt.get();
        Page<Follow> following = followRepository.findByFollower(user, pageable);
        
        return following.map(this::convertToDTO);
    }
    
    /**
     * Get follower count
     */
    public long getFollowerCount(String userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("User not found");
        }
        
        return followRepository.countByFollowing(userOpt.get());
    }
    
    /**
     * Get following count
     */
    public long getFollowingCount(String userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("User not found");
        }
        
        return followRepository.countByFollower(userOpt.get());
    }
    
    /**
     * Get muted follows
     */
    public List<Follow> getMutedFollows(String userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("User not found");
        }
        
        return followRepository.findMutedFollows(userOpt.get());
    }
    
    /**
     * Get active following users (non-muted)
     */
    public List<User> getActiveFollowingUsers(String userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("User not found");
        }
        
        return followRepository.findActiveFollowingUsers(userOpt.get());
    }
    
    /**
     * Convert Follow entity to DTO
     */
    private FollowDTO convertToDTO(Follow follow) {
        User user = follow.getFollower().getId().equals(follow.getId()) ? follow.getFollowing() : follow.getFollower();
        
        return FollowDTO.builder()
                .id(follow.getId())
                .userId(user.getId())
                .userName(user.getName())
                .userEmail(user.getEmail())
                .userAvatar(user.getAvatar())
                .userBio(user.getBio())
                .isMuted(follow.getIsMuted())
                .createdAt(follow.getCreatedAt().toString())
                .build();
    }
}
