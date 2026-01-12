package com.cine.social.chatservice.service.impl;

import com.cine.social.chatservice.dto.response.ChatMessageResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class ChatEventConsumerService {

    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = "chat-messages-topic",
                   groupId = "#{'chat-service-broadcast-' + T(java.util.UUID).randomUUID().toString()}")
    public void handleChatMessage(String message) {
        try {
            log.debug("Received message from Kafka: {}", message);

            ChatMessageResponse response = objectMapper.readValue(message, ChatMessageResponse.class);

            if (response.getRecipientIds() != null) {
                for (String recipientId : response.getRecipientIds()) {
                    messagingTemplate.convertAndSendToUser(
                            recipientId,
                            "/queue/messages",
                            response
                    );
                }
            }
            

        } catch (Exception e) {
            log.error("Error dispatching message to WebSocket", e);
        }
    }
}