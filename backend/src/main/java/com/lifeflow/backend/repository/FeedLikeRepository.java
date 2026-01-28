package com.lifeflow.backend.repository;

import com.lifeflow.backend.model.FeedLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FeedLikeRepository extends JpaRepository<FeedLike, String> {

    Optional<FeedLike> findByFeedItemIdAndUserId(String feedItemId, String userId);

    int countByFeedItemId(String feedItemId);

    void deleteByFeedItemIdAndUserId(String feedItemId, String userId);

    boolean existsByFeedItemIdAndUserId(String feedItemId, String userId);
}
