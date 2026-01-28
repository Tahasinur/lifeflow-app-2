package com.lifeflow.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "workspace_settings")
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkspaceSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, unique = true)
    private String userId;

    @Column(nullable = false)
    private String workspaceName;

    // Icon can be emoji or image URL
    private String workspaceIcon;

    // Custom landing page content/template
    @Column(columnDefinition = "TEXT")
    private String customLandingPageJson;

    // Publishing settings
    @Builder.Default
    private boolean allowPublicAccess = false;

    // Notification settings
    @Builder.Default
    private boolean enableNotifications = true;
    @Builder.Default
    private boolean enableEmailNotifications = true;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
