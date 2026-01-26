package com.lifeflow.backend.repository;

import com.lifeflow.backend.model.ConversationRead;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ConversationReadRepository extends JpaRepository<ConversationRead, String> {
    @Query("SELECT cr FROM ConversationRead cr WHERE cr.conversation.id = ?1 AND cr.userId = ?2")
    Optional<ConversationRead> findByConversationIdAndUserId(String conversationId, Long userId);
}
