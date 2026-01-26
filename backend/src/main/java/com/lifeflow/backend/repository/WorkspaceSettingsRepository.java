package com.lifeflow.backend.repository;

import com.lifeflow.backend.model.WorkspaceSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface WorkspaceSettingsRepository extends JpaRepository<WorkspaceSettings, String> {
    Optional<WorkspaceSettings> findByUserId(String userId);
}
