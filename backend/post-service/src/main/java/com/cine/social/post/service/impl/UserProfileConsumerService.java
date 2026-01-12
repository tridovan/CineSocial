package com.cine.social.post.service.impl;

import com.cine.social.event.ProfileUpdatedEvent;
import com.cine.social.post.repository.UserProfileRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class UserProfileConsumerService {
    private final UserProfileRepository userProfileRepository;
    private final ObjectMapper objectMapper;

    @KafkaListener(
            topics = "PROFILE_UPDATED",
            groupId = "post-service-group",
            containerFactory = "debeziumListenerContainerFactory"
    )
    public void handleProfileUpdate(String message) {
        log.info("Receive message {} ", message);
        try {
            JsonNode rootNode = objectMapper.readTree(message);
            ProfileUpdatedEvent event;
            if(rootNode.has("payload") && rootNode.get("payload").isTextual()){
                String payloadJson = rootNode.get("payload").asText();
                event = objectMapper.readValue(payloadJson, ProfileUpdatedEvent.class);
            }else{
                event = objectMapper.readValue(message, ProfileUpdatedEvent.class);
            }
            int count = userProfileRepository.updateProfileIfExists(event);
            log.info("Update successfully  count: {} ", count);

        } catch (Exception e) {
            log.error("Error syncing profile", e);
        }
    }
}