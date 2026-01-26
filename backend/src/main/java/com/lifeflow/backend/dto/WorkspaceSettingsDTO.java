package com.lifeflow.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkspaceSettingsDTO {
    private String id;
    private String userId;
    private String workspaceName;
    private String workspaceIcon;
    private String customLandingPageJson;
    private boolean allowPublicAccess;
    private boolean enableNotifications;
    private boolean enableEmailNotifications;
}
