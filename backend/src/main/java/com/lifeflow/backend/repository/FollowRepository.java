package com.lifeflow.backend.repository;

import com.lifeflow.backend.model.Follow;
import com.lifeflow.backend.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FollowRepository extends JpaRepository<Follow, String> {
    
    Optional<Follow> findByFollowerAndFollowing(User follower, User following);
    
    boolean existsByFollowerAndFollowing(User follower, User following);
    
    long countByFollowing(User following);
    
    long countByFollower(User follower);
    
    Page<Follow> findByFollowing(User following, Pageable pageable);
    
    Page<Follow> findByFollower(User follower, Pageable pageable);
    
    List<Follow> findByFollower(User follower);
    
    List<Follow> findByFollowing(User following);
    
    @Query("SELECT f.following FROM Follow f WHERE f.follower = :user AND f.isMuted = false")
    List<User> findActiveFollowingUsers(@Param("user") User user);
    
    @Query("SELECT f FROM Follow f WHERE f.follower = :user AND f.isMuted = true")
    List<Follow> findMutedFollows(@Param("user") User user);
    
    @Query("SELECT COUNT(f) FROM Follow f WHERE f.following IN (SELECT f2.following FROM Follow f2 WHERE f2.follower = :user)")
    long countMutualConnections(@Param("user") User user);
}
