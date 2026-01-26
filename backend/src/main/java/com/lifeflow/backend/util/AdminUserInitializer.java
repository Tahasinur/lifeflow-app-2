package com.lifeflow.backend.util;

import com.lifeflow.backend.model.User;
import com.lifeflow.backend.repository.UserRepository;
import com.lifeflow.backend.enums.Role;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import java.time.LocalDateTime;

/**
 * Utility class to create an admin user
 * This is used during initial setup of the application
 */
public class AdminUserInitializer {

    public static void createAdminUser(UserRepository userRepository) {
        // Check if admin user already exists
        if (userRepository.existsByEmail("admin@lifeflow.com")) {
            System.out.println("✅ Admin user already exists");
            return;
        }

        // Create admin user
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        User adminUser = User.builder()
                .email("admin@lifeflow.com")
                .name("Admin")
                .password(encoder.encode("admin123"))
                .role(Role.ADMIN)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        userRepository.save(adminUser);
        System.out.println("✅ Admin user created successfully!");
        System.out.println("   Email: admin@lifeflow.com");
        System.out.println("   Password: admin123");
        System.out.println("   Role: ADMIN");
    }
}
