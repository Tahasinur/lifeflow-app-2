package com.lifeflow.backend.services;

import com.lifeflow.backend.dto.AuthRequest;
import com.lifeflow.backend.dto.AuthResponse;
import com.lifeflow.backend.enums.Role;
import com.lifeflow.backend.model.User;
import com.lifeflow.backend.repository.UserRepository;
import com.lifeflow.backend.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public AuthResponse register(AuthRequest request) {
        // Check if user already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            return AuthResponse.builder()
                    .message("User already exists with this email")
                    .build();
        }

        // Create new user
        User user = User.builder()
                .email(request.getEmail())
                .name(request.getName())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        User savedUser = userRepository.save(user);

        // Generate token
        String token = jwtTokenProvider.generateToken(savedUser.getEmail(), savedUser.getRole().toString());

        return AuthResponse.builder()
                .token(token)
                .email(savedUser.getEmail())
                .name(savedUser.getName())
                .role(savedUser.getRole().toString())
                .userId((long) savedUser.getId().hashCode())
                .message("User registered successfully")
                .build();
    }

    public AuthResponse login(AuthRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());

        if (userOpt.isEmpty()) {
            return AuthResponse.builder()
                    .message("Invalid email or password")
                    .build();
        }

        User user = userOpt.get();

        // Verify password
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return AuthResponse.builder()
                    .message("Invalid email or password")
                    .build();
        }

        // Generate token
        String token = jwtTokenProvider.generateToken(user.getEmail(), user.getRole().toString());

        return AuthResponse.builder()
                .token(token)
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole().toString())
                .userId((long) user.getId().hashCode())
                .message("Login successful")
                .build();
    }

    public AuthResponse validateToken(String token) {
        if (!jwtTokenProvider.validateToken(token)) {
            return AuthResponse.builder()
                    .message("Invalid token")
                    .build();
        }

        String email = jwtTokenProvider.getEmailFromToken(token);

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return AuthResponse.builder()
                    .message("User not found")
                    .build();
        }

        User user = userOpt.get();
        return AuthResponse.builder()
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole().toString())
                .userId((long) user.getId().hashCode())
                .message("Token valid")
                .build();
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public AuthResponse promoteToAdmin(String userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return AuthResponse.builder()
                    .message("User not found")
                    .build();
        }

        User user = userOpt.get();
        user.setRole(Role.ADMIN);
        user.setUpdatedAt(LocalDateTime.now());
        User updatedUser = userRepository.save(user);

        return AuthResponse.builder()
                .email(updatedUser.getEmail())
                .name(updatedUser.getName())
                .role(updatedUser.getRole().toString())
                .userId((long) updatedUser.getId().hashCode())
                .message("User promoted to admin")
                .build();
    }

    public AuthResponse demoteToUser(String userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return AuthResponse.builder()
                    .message("User not found")
                    .build();
        }

        User user = userOpt.get();
        user.setRole(Role.USER);
        user.setUpdatedAt(LocalDateTime.now());
        User updatedUser = userRepository.save(user);

        return AuthResponse.builder()
                .email(updatedUser.getEmail())
                .name(updatedUser.getName())
                .role(updatedUser.getRole().toString())
                .userId((long) updatedUser.getId().hashCode())
                .message("User demoted to regular user")
                .build();
    }

    public AuthResponse deleteUser(String userId) {
        if (!userRepository.existsById(userId)) {
            return AuthResponse.builder()
                    .message("User not found")
                    .build();
        }

        userRepository.deleteById(userId);
        return AuthResponse.builder()
                .message("User deleted successfully")
                .build();
    }

    public Optional<User> getUserById(String id) {
        return userRepository.findById(id);
    }

    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }
}
