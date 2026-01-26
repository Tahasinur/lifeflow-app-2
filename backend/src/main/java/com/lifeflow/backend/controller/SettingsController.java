package com.lifeflow.backend.controller;

import com.lifeflow.backend.dto.*;
import com.lifeflow.backend.model.User;
import com.lifeflow.backend.model.UserPreferences;
import com.lifeflow.backend.model.WorkspaceSettings;
import com.lifeflow.backend.model.Teamspace;
import com.lifeflow.backend.repository.UserRepository;
import com.lifeflow.backend.repository.UserPreferencesRepository;
import com.lifeflow.backend.repository.WorkspaceSettingsRepository;
import com.lifeflow.backend.repository.TeamspaceRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/settings")
@CrossOrigin(origins = "http://localhost:3000")
public class SettingsController {

    private final UserRepository userRepository;
    private final UserPreferencesRepository userPreferencesRepository;
    private final WorkspaceSettingsRepository workspaceSettingsRepository;
    private final TeamspaceRepository teamspaceRepository;

    public SettingsController(
            UserRepository userRepository,
            UserPreferencesRepository userPreferencesRepository,
            WorkspaceSettingsRepository workspaceSettingsRepository,
            TeamspaceRepository teamspaceRepository) {
        this.userRepository = userRepository;
        this.userPreferencesRepository = userPreferencesRepository;
        this.workspaceSettingsRepository = workspaceSettingsRepository;
        this.teamspaceRepository = teamspaceRepository;
    }

    // ==================== ACCOUNT SETTINGS ====================

    @GetMapping("/account/{userId}")
    public ResponseEntity<?> getAccountSettings(@PathVariable String userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User user = userOpt.get();
        AccountSettingsDTO dto = AccountSettingsDTO.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .preferredName(user.getPreferredName())
                .avatar(user.getAvatar())
                .build();

        return ResponseEntity.ok(dto);
    }

    @PutMapping("/account/{userId}")
    public ResponseEntity<?> updateAccountSettings(
            @PathVariable String userId,
            @RequestBody AccountSettingsDTO dto) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User user = userOpt.get();
        
        if (dto.getPreferredName() != null && !dto.getPreferredName().isBlank()) {
            user.setPreferredName(dto.getPreferredName());
        }
        if (dto.getName() != null && !dto.getName().isBlank()) {
            user.setName(dto.getName());
        }
        if (dto.getAvatar() != null && !dto.getAvatar().isBlank()) {
            user.setAvatar(dto.getAvatar());
        }

        User updatedUser = userRepository.save(user);
        
        AccountSettingsDTO response = AccountSettingsDTO.builder()
                .id(updatedUser.getId())
                .email(updatedUser.getEmail())
                .name(updatedUser.getName())
                .preferredName(updatedUser.getPreferredName())
                .avatar(updatedUser.getAvatar())
                .build();

        return ResponseEntity.ok(response);
    }

    // ==================== USER PREFERENCES ====================

    @GetMapping("/preferences/{userId}")
    public ResponseEntity<?> getPreferences(@PathVariable String userId) {
        // Check user exists
        if (userRepository.findById(userId).isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Optional<UserPreferences> prefOpt = userPreferencesRepository.findByUserId(userId);
        
        if (prefOpt.isEmpty()) {
            // Create default preferences if they don't exist
            UserPreferences defaultPrefs = UserPreferences.builder()
                    .userId(userId)
                    .theme("light")
                    .language("en")
                    .spellcheckerLanguages("en")
                    .timezone("UTC")
                    .use24HourFormat(false)
                    .build();
            
            UserPreferences saved = userPreferencesRepository.save(defaultPrefs);
            return ResponseEntity.ok(convertToDTO(saved));
        }

        return ResponseEntity.ok(convertToDTO(prefOpt.get()));
    }

    @PutMapping("/preferences/{userId}")
    public ResponseEntity<?> updatePreferences(
            @PathVariable String userId,
            @RequestBody UserPreferencesDTO dto) {
        
        // Check user exists
        if (userRepository.findById(userId).isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Optional<UserPreferences> prefOpt = userPreferencesRepository.findByUserId(userId);
        
        UserPreferences prefs = prefOpt.orElseGet(() -> 
            UserPreferences.builder()
                .userId(userId)
                .build()
        );

        if (dto.getTheme() != null) prefs.setTheme(dto.getTheme());
        if (dto.getLanguage() != null) prefs.setLanguage(dto.getLanguage());
        if (dto.getSpellcheckerLanguages() != null) prefs.setSpellcheckerLanguages(dto.getSpellcheckerLanguages());
        if (dto.getTimezone() != null) prefs.setTimezone(dto.getTimezone());
        prefs.setUse24HourFormat(dto.isUse24HourFormat());

        UserPreferences updated = userPreferencesRepository.save(prefs);
        return ResponseEntity.ok(convertToDTO(updated));
    }

    // ==================== WORKSPACE SETTINGS ====================

    @GetMapping("/workspace/{userId}")
    public ResponseEntity<?> getWorkspaceSettings(@PathVariable String userId) {
        // Check user exists
        if (userRepository.findById(userId).isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Optional<WorkspaceSettings> wsOpt = workspaceSettingsRepository.findByUserId(userId);
        
        if (wsOpt.isEmpty()) {
            // Create default workspace settings if they don't exist
            User user = userRepository.findById(userId).get();
            WorkspaceSettings defaults = WorkspaceSettings.builder()
                    .userId(userId)
                    .workspaceName(user.getName() + "'s Workspace")
                    .workspaceIcon("📓")
                    .allowPublicAccess(false)
                    .enableNotifications(true)
                    .enableEmailNotifications(true)
                    .build();
            
            WorkspaceSettings saved = workspaceSettingsRepository.save(defaults);
            return ResponseEntity.ok(convertToWorkspaceDTO(saved));
        }

        return ResponseEntity.ok(convertToWorkspaceDTO(wsOpt.get()));
    }

    @PutMapping("/workspace/{userId}")
    public ResponseEntity<?> updateWorkspaceSettings(
            @PathVariable String userId,
            @RequestBody WorkspaceSettingsDTO dto) {
        
        // Check user exists
        if (userRepository.findById(userId).isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Optional<WorkspaceSettings> wsOpt = workspaceSettingsRepository.findByUserId(userId);
        
        WorkspaceSettings ws = wsOpt.orElseGet(() -> {
            User user = userRepository.findById(userId).get();
            return WorkspaceSettings.builder()
                .userId(userId)
                .workspaceName(user.getName() + "'s Workspace")
                .workspaceIcon("📓")
                .build();
        });

        if (dto.getWorkspaceName() != null) ws.setWorkspaceName(dto.getWorkspaceName());
        if (dto.getWorkspaceIcon() != null) ws.setWorkspaceIcon(dto.getWorkspaceIcon());
        if (dto.getCustomLandingPageJson() != null) ws.setCustomLandingPageJson(dto.getCustomLandingPageJson());
        ws.setAllowPublicAccess(dto.isAllowPublicAccess());
        ws.setEnableNotifications(dto.isEnableNotifications());
        ws.setEnableEmailNotifications(dto.isEnableEmailNotifications());

        WorkspaceSettings updated = workspaceSettingsRepository.save(ws);
        return ResponseEntity.ok(convertToWorkspaceDTO(updated));
    }

    // ==================== TEAMSPACE SETTINGS ====================

    @GetMapping("/teamspaces")
    public ResponseEntity<?> getTeamspaces() {
        List<Teamspace> teamspaces = teamspaceRepository.findAllByOrderByUpdatedAtDesc();
        List<TeamspaceDTO> dtos = teamspaces.stream()
                .map(this::convertToTeamspaceDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/teamspaces/{teamspaceId}")
    public ResponseEntity<?> getTeamspace(@PathVariable String teamspaceId) {
        Optional<Teamspace> tsOpt = teamspaceRepository.findById(teamspaceId);
        if (tsOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(convertToTeamspaceDTO(tsOpt.get()));
    }

    @PostMapping("/teamspaces")
    public ResponseEntity<?> createTeamspace(@RequestBody TeamspaceDTO dto) {
        Teamspace teamspace = Teamspace.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .owners(dto.getOwners())
                .accessLevel(dto.getAccessLevel() != null ? dto.getAccessLevel() : "private")
                .memberIds(dto.getMemberIds())
                .build();

        Teamspace saved = teamspaceRepository.save(teamspace);
        return ResponseEntity.status(HttpStatus.CREATED).body(convertToTeamspaceDTO(saved));
    }

    @PutMapping("/teamspaces/{teamspaceId}")
    public ResponseEntity<?> updateTeamspace(
            @PathVariable String teamspaceId,
            @RequestBody TeamspaceDTO dto) {
        
        Optional<Teamspace> tsOpt = teamspaceRepository.findById(teamspaceId);
        if (tsOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Teamspace ts = tsOpt.get();
        if (dto.getName() != null) ts.setName(dto.getName());
        if (dto.getDescription() != null) ts.setDescription(dto.getDescription());
        if (dto.getOwners() != null) ts.setOwners(dto.getOwners());
        if (dto.getAccessLevel() != null) ts.setAccessLevel(dto.getAccessLevel());
        if (dto.getMemberIds() != null) ts.setMemberIds(dto.getMemberIds());

        Teamspace updated = teamspaceRepository.save(ts);
        return ResponseEntity.ok(convertToTeamspaceDTO(updated));
    }

    @DeleteMapping("/teamspaces/{teamspaceId}")
    public ResponseEntity<?> deleteTeamspace(@PathVariable String teamspaceId) {
        if (teamspaceRepository.findById(teamspaceId).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        teamspaceRepository.deleteById(teamspaceId);
        return ResponseEntity.noContent().build();
    }

    // ==================== HELPER METHODS ====================

    private UserPreferencesDTO convertToDTO(UserPreferences prefs) {
        return UserPreferencesDTO.builder()
                .id(prefs.getId())
                .userId(prefs.getUserId())
                .theme(prefs.getTheme())
                .language(prefs.getLanguage())
                .spellcheckerLanguages(prefs.getSpellcheckerLanguages())
                .timezone(prefs.getTimezone())
                .use24HourFormat(prefs.isUse24HourFormat())
                .build();
    }

    private WorkspaceSettingsDTO convertToWorkspaceDTO(WorkspaceSettings ws) {
        return WorkspaceSettingsDTO.builder()
                .id(ws.getId())
                .userId(ws.getUserId())
                .workspaceName(ws.getWorkspaceName())
                .workspaceIcon(ws.getWorkspaceIcon())
                .customLandingPageJson(ws.getCustomLandingPageJson())
                .allowPublicAccess(ws.isAllowPublicAccess())
                .enableNotifications(ws.isEnableNotifications())
                .enableEmailNotifications(ws.isEnableEmailNotifications())
                .build();
    }

    private TeamspaceDTO convertToTeamspaceDTO(Teamspace ts) {
        return TeamspaceDTO.builder()
                .id(ts.getId())
                .name(ts.getName())
                .description(ts.getDescription())
                .owners(ts.getOwners())
                .accessLevel(ts.getAccessLevel())
                .memberIds(ts.getMemberIds())
                .updatedAt(ts.getUpdatedAt())
                .build();
    }
}
