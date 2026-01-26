package com.lifeflow.backend.repository;

import com.lifeflow.backend.model.MessageReaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MessageReactionRepository extends JpaRepository<MessageReaction, String> {
    @Query("SELECT mr FROM MessageReaction mr WHERE mr.message.id = ?1 AND mr.userId = ?2 AND mr.emoji = ?3")
    Optional<MessageReaction> findByMessageIdAndUserIdAndEmoji(String messageId, Long userId, String emoji);
}
