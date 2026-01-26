package com.lifeflow.backend.dto;

import java.util.List;

public class CreateGroupConversationRequest {
    private String name;
    private String description;
    private List<String> participantIds;

    public CreateGroupConversationRequest() {
    }

    public CreateGroupConversationRequest(String name, String description, List<String> participantIds) {
        this.name = name;
        this.description = description;
        this.participantIds = participantIds;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public List<String> getParticipantIds() {
        return participantIds;
    }

    public void setParticipantIds(List<String> participantIds) {
        this.participantIds = participantIds;
    }
}
