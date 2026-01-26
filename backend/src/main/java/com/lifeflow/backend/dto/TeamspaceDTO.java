package com.lifeflow.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeamspaceDTO {
    private String id;
    private String name;
    private String description;
    private String owners;
    private String accessLevel;
    private String memberIds;
    private LocalDateTime updatedAt;
}
