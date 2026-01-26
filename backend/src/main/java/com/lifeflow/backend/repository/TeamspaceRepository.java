package com.lifeflow.backend.repository;

import com.lifeflow.backend.model.Teamspace;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TeamspaceRepository extends JpaRepository<Teamspace, String> {
    List<Teamspace> findAllByOrderByUpdatedAtDesc();
    List<Teamspace> findByAccessLevel(String accessLevel);
}
