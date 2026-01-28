package com.lifeflow.backend.dto;

import com.lifeflow.backend.model.Page;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OpenTabDTO {
    private String id;
    private String userId;
    private String pageId;
    private Integer tabOrder;
    private LocalDateTime openedAt;
    private Page page;
}
