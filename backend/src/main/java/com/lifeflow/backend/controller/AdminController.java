package com.lifeflow.backend.controller;

import com.lifeflow.backend.dto.AuthResponse;
import com.lifeflow.backend.model.User;
import com.lifeflow.backend.services.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private AuthService authService;

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers(@RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String token = authHeader.substring(7);
        AuthResponse validation = authService.validateToken(token);

        if (validation.getUserId() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        if (!"ADMIN".equals(validation.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        List<User> users = authService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @PostMapping("/users/{userId}/promote")
    public ResponseEntity<AuthResponse> promoteToAdmin(
            @PathVariable String userId,
            @RequestHeader("Authorization") String authHeader) {
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                AuthResponse.builder()
                    .message("Unauthorized")
                    .build()
            );
        }

        String token = authHeader.substring(7);
        AuthResponse validation = authService.validateToken(token);

        if (validation.getUserId() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                AuthResponse.builder()
                    .message("Unauthorized")
                    .build()
            );
        }

        if (!"ADMIN".equals(validation.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
                AuthResponse.builder()
                    .message("Only admins can promote users")
                    .build()
            );
        }

        AuthResponse response = authService.promoteToAdmin(userId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/users/{userId}/demote")
    public ResponseEntity<AuthResponse> demoteToUser(
            @PathVariable String userId,
            @RequestHeader("Authorization") String authHeader) {
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                AuthResponse.builder()
                    .message("Unauthorized")
                    .build()
            );
        }

        String token = authHeader.substring(7);
        AuthResponse validation = authService.validateToken(token);

        if (validation.getUserId() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                AuthResponse.builder()
                    .message("Unauthorized")
                    .build()
            );
        }

        if (!"ADMIN".equals(validation.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
                AuthResponse.builder()
                    .message("Only admins can demote users")
                    .build()
            );
        }

        AuthResponse response = authService.demoteToUser(userId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<AuthResponse> deleteUser(
            @PathVariable String userId,
            @RequestHeader("Authorization") String authHeader) {
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                AuthResponse.builder()
                    .message("Unauthorized")
                    .build()
            );
        }

        String token = authHeader.substring(7);
        AuthResponse validation = authService.validateToken(token);

        if (validation.getUserId() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                AuthResponse.builder()
                    .message("Unauthorized")
                    .build()
            );
        }

        if (!"ADMIN".equals(validation.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
                AuthResponse.builder()
                    .message("Only admins can delete users")
                    .build()
            );
        }

        AuthResponse response = authService.deleteUser(userId);
        return ResponseEntity.ok(response);
    }
}
