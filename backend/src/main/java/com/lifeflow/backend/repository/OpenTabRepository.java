package com.lifeflow.backend.repository;

import com.lifeflow.backend.model.OpenTab;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OpenTabRepository extends JpaRepository<OpenTab, String> {

    List<OpenTab> findByUserIdOrderByTabOrderAsc(String userId);

    Optional<OpenTab> findByUserIdAndPageId(String userId, String pageId);

    void deleteByUserIdAndPageId(String userId, String pageId);

    void deleteByUserId(String userId);
}
