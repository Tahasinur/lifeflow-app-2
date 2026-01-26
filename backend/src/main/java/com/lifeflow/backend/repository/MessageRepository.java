package com.lifeflow.backend.repository;

import com.lifeflow.backend.model.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, String> {
    Page<Message> findByConversationIdOrderByCreatedAtDesc(String conversationId, Pageable pageable);

    @Query("SELECT m FROM Message m WHERE m.conversation.id = ?1 AND (LOWER(m.content) LIKE LOWER(CONCAT('%', ?2, '%')))")
    List<Message> searchMessages(String conversationId, String query);

    @Query("SELECT m FROM Message m WHERE (LOWER(m.content) LIKE LOWER(CONCAT('%', ?1, '%')))")
    List<Message> searchAllMessages(String query);
}
