package com.lifeflow.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "open_tabs")
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OpenTab {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String userId;

    @Column(nullable = false)
    private String pageId;

    @Column(nullable = false)
    private Integer tabOrder;

    @CreationTimestamp
    private LocalDateTime openedAt;

    @PrePersist
    protected void onCreate() {
        if (tabOrder == null) {
            tabOrder = 0;
        }
    }
}
