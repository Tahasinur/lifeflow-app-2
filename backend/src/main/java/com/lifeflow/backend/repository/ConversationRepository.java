package com.lifeflow.backend.repository;

import com.lifeflow.backend.model.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, String> {
    @Query("SELECT c FROM Conversation c JOIN c.participants p WHERE p.userId = ?1 AND c.isArchived = false ORDER BY c.updatedAt DESC")
    List<Conversation> findByUserId(Long userId);

    @Query("SELECT c FROM Conversation c JOIN c.participants p WHERE p.userId = ?1 AND c.type = 'direct' AND EXISTS (SELECT 1 FROM ConversationParticipant cp WHERE cp.conversation = c AND cp.userId = ?2)")
    Conversation findDirectConversation(Long userId1, Long userId2);
}
