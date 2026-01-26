package com.lifeflow.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.Set;

@Data
@Entity
@Table(name = "teamspaces")
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Teamspace {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    // Comma-separated owner IDs
    @Column(nullable = false)
    private String owners;

    // Public, Private, Restricted
    @Column(nullable = false)
    private String accessLevel = "private";

    // For tracking team members
    @Column(columnDefinition = "TEXT")
    private String memberIds; // comma-separated

    // Workspace settings for this teamspace
    private String workspaceSettingsId;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
