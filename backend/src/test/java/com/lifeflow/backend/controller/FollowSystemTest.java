package com.lifeflow.backend.controller;

import com.lifeflow.backend.model.User;
import java.util.UUID;
import com.lifeflow.backend.repository.FollowRepository;
import com.lifeflow.backend.repository.UserRepository;
import com.lifeflow.backend.services.FollowService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;

import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@DisplayName("Follow System Tests")
class FollowSystemTest {

        @Autowired
        private MockMvc mockMvc;

        @Autowired
        private UserRepository userRepository;

        @Autowired
        private FollowRepository followRepository;

        @Autowired
        private FollowService followService;

        private User user1;
        private User user2;
        private User user3;

        @BeforeEach
        void setUp() {
                // Create test users
                String uniqueId = UUID.randomUUID().toString();
                user1 = User.builder()
                                .email("user1_" + uniqueId + "@test.com")
                                .password("password123")
                                .name("User One")
                                .avatar("avatar1.jpg")
                                .bio("First user")
                                .build();

                user2 = User.builder()
                                .email("user2_" + uniqueId + "@test.com")
                                .password("password123")
                                .name("User Two")
                                .avatar("avatar2.jpg")
                                .bio("Second user")
                                .build();

                user3 = User.builder()
                                .email("user3_" + uniqueId + "@test.com")
                                .password("password123")
                                .name("User Three")
                                .avatar("avatar3.jpg")
                                .bio("Third user")
                                .build();

                user1 = userRepository.save(user1);
                user2 = userRepository.save(user2);
                user3 = userRepository.save(user3);
        }

        @Test
        @DisplayName("Should follow a user successfully")
        void testFollowUser() throws Exception {
                mockMvc.perform(post("/api/follows/{followerId}/follow/{followingId}", user1.getId(), user2.getId()))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.success", is(true)))
                                .andExpect(jsonPath("$.message", containsString("Successfully followed user")));

                // Verify follow relationship exists
                assert followRepository.existsByFollowerAndFollowing(user1, user2);
        }

        @Test
        @DisplayName("Should prevent self-following")
        void testFollowSelfFails() throws Exception {
                mockMvc.perform(post("/api/follows/{followerId}/follow/{followingId}", user1.getId(), user1.getId()))
                                .andExpect(status().isBadRequest())
                                .andExpect(jsonPath("$.success", is(false)))
                                .andExpect(jsonPath("$.message", containsString("Cannot follow yourself")));
        }

        @Test
        @DisplayName("Should unfollow a user successfully")
        void testUnfollowUser() throws Exception {
                // First follow
                followService.followUser(user1.getId(), user2.getId());

                // Then unfollow
                mockMvc.perform(delete("/api/follows/{followerId}/unfollow/{followingId}", user1.getId(),
                                user2.getId()))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.success", is(true)))
                                .andExpect(jsonPath("$.message", containsString("Successfully unfollowed user")));

                // Verify follow relationship no longer exists
                assert !followRepository.existsByFollowerAndFollowing(user1, user2);
        }

        @Test
        @DisplayName("Should mute a user successfully")
        void testMuteUser() throws Exception {
                // First follow
                followService.followUser(user1.getId(), user2.getId());

                // Then mute
                mockMvc.perform(post("/api/follows/{followerId}/mute/{followingId}", user1.getId(), user2.getId()))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.success", is(true)))
                                .andExpect(jsonPath("$.message", containsString("Successfully muted user")))
                                .andExpect(jsonPath("$.follow.isMuted", is(true)));
        }

        @Test
        @DisplayName("Should get follower count correctly")
        void testGetFollowerCount() throws Exception {
                // Create follows
                followService.followUser(user1.getId(), user3.getId());
                followService.followUser(user2.getId(), user3.getId());

                mockMvc.perform(get("/api/follows/{userId}/follower-count", user3.getId()))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.followerCount", is(2)));
        }

        @Test
        @DisplayName("Should get following count correctly")
        void testGetFollowingCount() throws Exception {
                // User1 follows user2 and user3
                followService.followUser(user1.getId(), user2.getId());
                followService.followUser(user1.getId(), user3.getId());

                mockMvc.perform(get("/api/follows/{userId}/following-count", user1.getId()))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.followingCount", is(2)));
        }

        @Test
        @DisplayName("Should get followers paginated")
        void testGetFollowersPaginated() throws Exception {
                // Create multiple follows
                followService.followUser(user1.getId(), user3.getId());
                followService.followUser(user2.getId(), user3.getId());

                mockMvc.perform(get("/api/follows/{userId}/followers", user3.getId())
                                .param("page", "0")
                                .param("size", "10"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.content", hasSize(2)))
                                .andExpect(jsonPath("$.totalElements", is(2)));
        }

        @Test
        @DisplayName("Should check if user is following")
        void testIsFollowing() throws Exception {
                followService.followUser(user1.getId(), user2.getId());

                mockMvc.perform(get("/api/follows/{followerId}/is-following/{followingId}", user1.getId(),
                                user2.getId()))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.isFollowing", is(true)));

                mockMvc.perform(get("/api/follows/{followerId}/is-following/{followingId}", user2.getId(),
                                user1.getId()))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.isFollowing", is(false)));
        }
}
