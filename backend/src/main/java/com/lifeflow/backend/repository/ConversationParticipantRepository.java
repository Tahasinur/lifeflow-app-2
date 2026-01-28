package com.lifeflow.backend.repository;

import com.lifeflow.backend.model.ConversationParticipant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationParticipantRepository extends JpaRepository<ConversationParticipant, String> {
    @Query("SELECT cp FROM ConversationParticipant cp WHERE cp.conversation.id = ?1")
    List<ConversationParticipant> findByConversationId(String conversationId);

    @Query("SELECT cp FROM ConversationParticipant cp WHERE cp.conversation.id = ?1 AND cp.userId = ?2")
    Optional<ConversationParticipant> findByConversationIdAndUserId(String conversationId, String userId);
}
