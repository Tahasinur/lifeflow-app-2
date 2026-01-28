package com.lifeflow.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * WebSocket Configuration for real-time notifications
 * Enables STOMP protocol for messaging between clients and server
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    /**
     * Configure the message broker for distributing messages to clients
     */
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Enable a simple in-memory message broker
        // /user/ destination for user-specific messages (one-to-one)
        // /topic/ destination for broadcast messages
        config.enableSimpleBroker("/user", "/topic");

        // Configure the prefix for messages sent by clients
        // Messages sent to /app prefix will be routed to @MessageMapping handlers
        config.setApplicationDestinationPrefixes("/app");

        // Configure the prefix for messages sent to specific users
        config.setUserDestinationPrefix("/user");
    }

    /**
     * Register STOMP endpoints for clients to connect
     */
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // WebSocket endpoint for real-time notifications
        registry.addEndpoint("/ws/notifications")
                .setAllowedOriginPatterns("*")
                .withSockJS();

        // WebSocket endpoint for social updates (follows, unfollows)
        registry.addEndpoint("/ws/social")
                .setAllowedOriginPatterns("*")
                .withSockJS();

        // Generic WebSocket endpoint
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .withSockJS();

        // Chat WebSocket endpoint for real-time messaging
        registry.addEndpoint("/ws/chat")
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }
}
