package com.lifeflow.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "user_preferences")
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserPreferences {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, unique = true)
    private String userId;

    // Appearance preferences
    @Column(nullable = false)
    private String theme = "light"; // light, dark, auto

    // Language preferences
    @Column(nullable = false)
    private String language = "en"; // en, es, fr, etc.

    @Column(columnDefinition = "TEXT")
    private String spellcheckerLanguages = "en"; // comma-separated

    // Time and timezone
    private String timezone = "UTC";

    // 24-hour format preference
    private boolean use24HourFormat = false;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
