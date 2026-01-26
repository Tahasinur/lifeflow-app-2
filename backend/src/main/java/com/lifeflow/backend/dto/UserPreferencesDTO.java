package com.lifeflow.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserPreferencesDTO {
    private String id;
    private String userId;
    private String theme;
    private String language;
    private String spellcheckerLanguages;
    private String timezone;
    private boolean use24HourFormat;
}
