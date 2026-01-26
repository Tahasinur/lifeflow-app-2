-- Follow System Migration Script
-- Executes after Hibernate creates the base schema

-- Create follows table if it doesn't exist
CREATE TABLE IF NOT EXISTS follows (
    id VARCHAR(36) PRIMARY KEY,
    follower_id VARCHAR(36) NOT NULL,
    following_id VARCHAR(36) NOT NULL,
    is_muted BOOLEAN DEFAULT FALSE NOT NULL,
    muted_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL,
    UNIQUE KEY unique_follow (follower_id, following_id),
    FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_follower (follower_id),
    INDEX idx_following (following_id),
    INDEX idx_muted (is_muted)
);

-- Create notifications table if it doesn't exist
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(36) PRIMARY KEY,
    recipient_id VARCHAR(36) NOT NULL,
    actor_id VARCHAR(36) NOT NULL,
    type VARCHAR(50) NOT NULL,
    message TEXT,
    related_entity_id VARCHAR(36),
    related_entity_type VARCHAR(50),
    is_read BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP NOT NULL,
    read_at TIMESTAMP NULL,
    FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_recipient (recipient_id),
    INDEX idx_actor (actor_id),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at),
    INDEX idx_type (type),
    INDEX idx_recipient_is_read (recipient_id, is_read)
);

-- Create compound index for efficient notification queries
CREATE INDEX idx_recipient_created_at ON notifications(recipient_id, created_at DESC);

-- Create index for notification cleanup queries
CREATE INDEX idx_recipient_created_at_is_read ON notifications(recipient_id, created_at, is_read);

-- Verify indexes exist
SHOW INDEX FROM follows;
SHOW INDEX FROM notifications;

-- Optional: Add sample data for testing (comment out in production)
-- INSERT INTO follows (id, follower_id, following_id, is_muted, created_at) 
-- VALUES (UUID(), 'user1-id', 'user2-id', FALSE, NOW());
