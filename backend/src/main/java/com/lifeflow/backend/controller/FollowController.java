package com.lifeflow.backend.controller;

import com.lifeflow.backend.dto.FollowDTO;
import com.lifeflow.backend.model.Follow;
import com.lifeflow.backend.services.FollowService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/follows")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5000", "http://localhost:5173"})
public class FollowController {
    
    private final FollowService followService;
    
    public FollowController(FollowService followService) {
        this.followService = followService;
    }
    
    /**
     * Follow a user
     */
    @PostMapping("/{followerId}/follow/{followingId}")
    public ResponseEntity<?> followUser(
            @PathVariable String followerId,
            @PathVariable String followingId) {
        try {
            Follow follow = followService.followUser(followerId, followingId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Successfully followed user");
            response.put("follow", follow);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * Unfollow a user
     */
    @DeleteMapping("/{followerId}/unfollow/{followingId}")
    public ResponseEntity<?> unfollowUser(
            @PathVariable String followerId,
            @PathVariable String followingId) {
        try {
            followService.unfollowUser(followerId, followingId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Successfully unfollowed user");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * Mute a user
     */
    @PostMapping("/{followerId}/mute/{followingId}")
    public ResponseEntity<?> muteUser(
            @PathVariable String followerId,
            @PathVariable String followingId) {
        try {
            Follow follow = followService.muteUser(followerId, followingId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Successfully muted user");
            response.put("follow", follow);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * Unmute a user
     */
    @PostMapping("/{followerId}/unmute/{followingId}")
    public ResponseEntity<?> unmuteUser(
            @PathVariable String followerId,
            @PathVariable String followingId) {
        try {
            Follow follow = followService.unmuteUser(followerId, followingId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Successfully unmuted user");
            response.put("follow", follow);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * Check if user is following another user
     */
    @GetMapping("/{followerId}/is-following/{followingId}")
    public ResponseEntity<?> isFollowing(
            @PathVariable String followerId,
            @PathVariable String followingId) {
        boolean isFollowing = followService.isFollowing(followerId, followingId);
        Map<String, Object> response = new HashMap<>();
        response.put("isFollowing", isFollowing);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get followers of a user
     */
    @GetMapping("/{userId}/followers")
    public ResponseEntity<?> getFollowers(
            @PathVariable String userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<FollowDTO> followers = followService.getFollowers(userId, pageable);
            return ResponseEntity.ok(followers);
        } catch (IllegalArgumentException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * Get users that a user is following
     */
    @GetMapping("/{userId}/following")
    public ResponseEntity<?> getFollowing(
            @PathVariable String userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<FollowDTO> following = followService.getFollowing(userId, pageable);
            return ResponseEntity.ok(following);
        } catch (IllegalArgumentException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * Get follower count
     */
    @GetMapping("/{userId}/follower-count")
    public ResponseEntity<?> getFollowerCount(@PathVariable String userId) {
        try {
            long count = followService.getFollowerCount(userId);
            Map<String, Object> response = new HashMap<>();
            response.put("followerCount", count);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * Get following count
     */
    @GetMapping("/{userId}/following-count")
    public ResponseEntity<?> getFollowingCount(@PathVariable String userId) {
        try {
            long count = followService.getFollowingCount(userId);
            Map<String, Object> response = new HashMap<>();
            response.put("followingCount", count);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * Get muted follows
     */
    @GetMapping("/{userId}/muted")
    public ResponseEntity<?> getMutedFollows(@PathVariable String userId) {
        try {
            var mutedFollows = followService.getMutedFollows(userId);
            Map<String, Object> response = new HashMap<>();
            response.put("mutedFollows", mutedFollows);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}
