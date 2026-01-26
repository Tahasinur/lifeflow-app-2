package com.lifeflow.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FollowDTO {
    private String id;
    private String userId;
    private String userName;
    private String userEmail;
    private String userAvatar;
    private String userBio;
    private Boolean isMuted;
    private String createdAt;
}
