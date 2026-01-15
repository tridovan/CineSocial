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
    public void consumeChatMessage(String message) {
        try {
            log.info("Consuming message from Kafka: {}", message);
            ChatMessageResponse response = objectMapper.readValue(message, ChatMessageResponse.class);
            String destination = "/topic/room/" + response.getRoomId();
            messagingTemplate.convertAndSend(destination, response);

        } catch (Exception e) {
            log.error("Error consuming chat message", e);
        }
    }
}