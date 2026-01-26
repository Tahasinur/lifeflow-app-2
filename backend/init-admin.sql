-- Create admin user if it doesn't exist
-- Password is hashed using bcrypt: admin123 hashes to $2a$10$slYQmyNdGzin7olVH0p1Be4DlH.PKZbv5H8KnzzVgXXbVxzy990qm

INSERT INTO users (id, email, password, name, role, created_at, updated_at)
SELECT 
    'admin-user-001', 
    'admin@lifeflow.com', 
    '$2a$10$slYQmyNdGzin7olVH0p1Be4DlH.PKZbv5H8KnzzVgXXbVxzy990qm',
    'Admin',
    'ADMIN',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE email = 'admin@lifeflow.com'
);

-- Print confirmation
SELECT 'Admin user created/verified' AS message;
